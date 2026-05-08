-- Two security guards from the May audit:
--
--   1. profiles.role is RLS-writable by self because the
--      profiles_self_update policy is column-blind (Postgres has no
--      column policies). A signed-in `user` can hit PATCH on
--      /rest/v1/profiles?id=eq.<self> with {"role":"admin"} and bypass
--      the application-side `setUserRole` self-edit guard. Trigger
--      below enforces "role changes require admin or service role".
--
--   2. vendors.url is RLS-writable by the vendor owner. The /go/[vendor]
--      redirect 302s to whatever's in that column. A vendor can replace
--      it with a phishing destination served under our trusted domain.
--      Trigger blocks vendor-owner edits to url; admins/contributors
--      retain the ability via the contributor portal (their session
--      DOES match the admin/contributor role check).
--
-- Both triggers are SECURITY DEFINER so the policy lookup against
-- public.profiles inside the trigger runs with elevated privilege.
-- auth.uid() returning NULL means "service role / no JWT" — we allow
-- those through (service role intentionally bypasses).

-- ---- profiles.role escalation guard --------------------------------
create or replace function public.profiles_prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.role is distinct from old.role then
    if auth.uid() is null then
      return new; -- service role / SQL session — trust by definition
    end if;
    if not exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    ) then
      raise exception 'role changes require admin privileges'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.profiles_prevent_role_escalation();

-- ---- vendors.url phishing guard ------------------------------------
create or replace function public.vendors_prevent_url_owner_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.url is distinct from old.url then
    if auth.uid() is null then
      return new; -- service role
    end if;
    -- Admin OR contributor can flip the URL through the editorial
    -- portal. Vendor owners cannot — they need an admin to approve
    -- destination changes.
    if not exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'contributor')
    ) then
      raise exception 'vendor URL changes require admin approval'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger vendors_prevent_url_owner_change
  before update on public.vendors
  for each row execute function public.vendors_prevent_url_owner_change();

-- ---- defense-in-depth: scheme constraint on the URL itself ---------
-- Any path that lands a non-https value (manual SQL, bug in a future
-- form, etc.) gets rejected at the database. /go/[vendor] is the
-- only consumer; if it's not https, the redirect is a phish.
alter table public.vendors
  add constraint vendors_url_https
  check (url like 'https://%');
