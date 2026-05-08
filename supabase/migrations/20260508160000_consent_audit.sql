-- Consent audit trail.
--
-- Two surfaces:
--   profiles.{terms,privacy}_{version,accepted_at} — the LATEST
--     accepted version per user. Cheap to query: "is this user
--     current on the privacy policy?".
--   consent_log — full history of every acceptance event. One row
--     per (user, document, version) acceptance. Never deleted on
--     re-acceptance; only removed via cascade if the user is.
--
-- Versioning is a manually-bumped string in lib/policy.ts (date stamp
-- works fine; "2026-05-08", etc). When you change a policy you bump
-- that constant, and the existing user_id list to notify is just
--   select id from profiles where privacy_version != '<new version>';
--
-- The signup trigger already auto-creates a profiles row from
-- auth.users insert. We extend it to ALSO read raw_user_meta_data
-- for `terms_version` and `privacy_version` (passed via signUp's
-- options.data) and populate the profile + consent_log rows. The
-- client side stays a single signUp call; no extra round-trips.

-- ---- profile columns ----------------------------------------------
alter table public.profiles
  add column terms_version       text,
  add column terms_accepted_at   timestamptz,
  add column privacy_version     text,
  add column privacy_accepted_at timestamptz;

-- ---- consent_log table --------------------------------------------
create table public.consent_log (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  document    text not null check (document in ('privacy', 'terms')),
  version     text not null,
  accepted_at timestamptz not null default now()
);
create index consent_log_user_id_idx on public.consent_log(user_id, accepted_at desc);
create index consent_log_doc_ver_idx on public.consent_log(document, version);

alter table public.consent_log enable row level security;

-- The user can read their own consent history (e.g. on /member/settings).
create policy "consent_log_self_read" on public.consent_log
  for select using (user_id = auth.uid());
-- Admins read everything for audits + policy-rev notifications.
create policy "consent_log_admin_read" on public.consent_log
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
-- Writes go through the trigger (security definer) or a future server
-- action that uses the service role; no anon-write policy.

-- ---- trigger update ------------------------------------------------
-- Replace handle_new_user to capture consent in addition to creating
-- the profile row. We read raw_user_meta_data; if the values are
-- absent (e.g. an admin-created user via the dashboard), we skip
-- consent tracking — the profile still creates with NULL versions
-- and the user shows up in the "needs to re-accept" query.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_terms   text := new.raw_user_meta_data->>'terms_version';
  v_privacy text := new.raw_user_meta_data->>'privacy_version';
  v_now     timestamptz := now();
begin
  insert into public.profiles (
    id, email,
    terms_version,   terms_accepted_at,
    privacy_version, privacy_accepted_at
  )
  values (
    new.id, new.email,
    v_terms,   case when v_terms   is not null then v_now end,
    v_privacy, case when v_privacy is not null then v_now end
  );

  if v_terms is not null then
    insert into public.consent_log (user_id, document, version, accepted_at)
    values (new.id, 'terms', v_terms, v_now);
  end if;
  if v_privacy is not null then
    insert into public.consent_log (user_id, document, version, accepted_at)
    values (new.id, 'privacy', v_privacy, v_now);
  end if;

  return new;
end;
$$;
