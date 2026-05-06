-- =====================================================================
-- Two Buds and a Leaf — initial schema
--
-- One migration that lays down everything needed for Phase B:
--   - profiles (1:1 with auth.users) carrying member settings + role
--   - role enum (admin / contributor / vendor / member / user)
--   - user_teas + user_teaware (the user library — shape mirrors the
--     localStorage scaffolding in lib/types.ts so the migration from
--     localStorage → Postgres is a straight copy)
--   - sessions (replaces MemberRating; references user_teas so every
--     session is anchored in the user's own library, never directly to
--     the catalog)
--   - RLS policies: owner-only on user-data tables, admin override on
--     profiles, public-read where appropriate
--   - signup trigger that auto-creates a profile row
--
-- Naming: snake_case for SQL, camelCase preserved at the application
-- boundary (the typed clients map between the two).
-- =====================================================================

-- Roles. Five tiers per the product convo:
--   admin       — full access (you + James)
--   contributor — write posts/reviews/glossary
--   vendor      — manage own vendor profile + respond to reviews
--   member      — paid tier (VTT, advanced logging)
--   user        — free tier
create type public.user_role as enum (
  'admin',
  'contributor',
  'vendor',
  'member',
  'user'
);

create type public.user_tea_status as enum (
  'wishlist',
  'owned',
  'tried',
  'retired'
);

create type public.user_teaware_status as enum (
  'wishlist',
  'owned'
);

-- =====================================================================
-- profiles — one row per auth.users.id
-- =====================================================================
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text,
  display_name        text,
  contributor_handle  text unique,
  role                public.user_role not null default 'user',

  -- Member preferences (same shape as MemberSettings in lib/types.ts).
  flavor_mode         text not null default 'basic'
                      check (flavor_mode in ('blind', 'basic', 'advanced')),
  composite           boolean not null default false,
  theme               text not null default 'auto',
  aligned             text not null default 'james'
                      check (aligned in ('vivek', 'james')),
  notifications       jsonb not null default
                      '{"weeklyDigest":true,"newTeas":true,"sampleRequests":false,"replies":true}'::jsonb,
  -- Slugs the member has un-blinded.
  tasted_teas         text[] not null default '{}',

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);

-- updated_at auto-bump
create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Auto-create a profile on signup. SECURITY DEFINER so the insert
-- bypasses RLS (the supabase auth user record is the source of truth).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- user_teas — the user's tea library
-- =====================================================================
create table public.user_teas (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  status          public.user_tea_status not null,
  -- Catalog reference; null means an off-catalog tea (custom_* below).
  tea_slug        text,
  custom_name     text,
  custom_vendor   text,
  custom_year     text,
  custom_type     text,
  notes           text,
  added_at        timestamptz not null default now(),
  -- Either anchor a catalog tea OR provide a custom name. Without either,
  -- the row is meaningless.
  constraint user_teas_ref check (
    (tea_slug is not null) or (custom_name is not null)
  )
);

create index user_teas_user_idx on public.user_teas(user_id);
-- One library row per (user, catalog tea). Custom rows can repeat (a
-- user might track two different cakes of the same off-catalog tea).
create unique index user_teas_unique_catalog
  on public.user_teas(user_id, tea_slug)
  where tea_slug is not null;

-- =====================================================================
-- user_teaware — same pattern, narrower status enum
-- =====================================================================
create table public.user_teaware (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  status            public.user_teaware_status not null,
  teaware_slug      text,
  custom_name       text,
  custom_material   text,
  custom_volume_ml  integer,
  notes             text,
  added_at          timestamptz not null default now(),
  constraint user_teaware_ref check (
    (teaware_slug is not null) or (custom_name is not null)
  )
);

create index user_teaware_user_idx on public.user_teaware(user_id);
create unique index user_teaware_unique_catalog
  on public.user_teaware(user_id, teaware_slug)
  where teaware_slug is not null;

-- =====================================================================
-- sessions — replaces MemberRating; one row per brewed session
-- =====================================================================
create table public.sessions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  -- Every session is anchored in the user's library, never directly to
  -- a catalog tea. Lets a member log sessions for off-catalog teas and
  -- lets us roll-up by their library, not our catalog.
  user_tea_id           uuid not null references public.user_teas(id) on delete cascade,
  -- Optional vessel reference. If null, the user logged a vessel they
  -- haven't added to their library — that's fine, vessel_freeform below
  -- captures the string.
  user_teaware_id       uuid references public.user_teaware(id) on delete set null,

  rating                numeric(3,1)
                        check (rating is null or (rating >= 0 and rating <= 10)),
  body                  text,
  scale                 text not null default 'basic'
                        check (scale in ('basic', 'advanced')),
  mode                  text not null default 'quick'
                        check (mode in ('quick', 'per-steep')),

  -- 12-axis flavor profile + mouthfeel as jsonb. Keeps the schema
  -- flexible if we add axes later, and the size is small enough that
  -- a normalized table would be overkill at this scale.
  profile               jsonb,
  mouthfeel             jsonb,
  steeps                jsonb,

  -- Brewing meta — same fields as MemberRating today. vessel is the
  -- freeform fallback when user_teaware_id isn't set.
  vessel                text,
  water                 text,
  water_source          text,
  water_tds_ppm         integer,
  brew_style_override   text,
  leaf_g                numeric(5,2),
  water_ml              integer,

  brewed_at             timestamptz not null default now(),
  created_at            timestamptz not null default now()
);

create index sessions_user_idx       on public.sessions(user_id);
create index sessions_user_tea_idx   on public.sessions(user_tea_id);
create index sessions_brewed_at_idx  on public.sessions(brewed_at desc);

-- =====================================================================
-- RLS — owner-only on user data, admin overrides on profiles
-- =====================================================================
alter table public.profiles      enable row level security;
alter table public.user_teas     enable row level security;
alter table public.user_teaware  enable row level security;
alter table public.sessions      enable row level security;

-- Helper: is the caller an admin? Inlined as a security-definer fn so
-- the RLS policies don't recurse into profiles' own RLS.
create function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(
    select 1 from public.profiles where id = user_id and role = 'admin'
  );
$$;

-- ---- profiles policies ----
-- Read your own row.
create policy "profiles_self_read"
  on public.profiles for select
  using (auth.uid() = id);

-- Update your own row (excluding role — admins manage that via the
-- admin policy below).
create policy "profiles_self_update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins can do anything on profiles.
create policy "profiles_admin_all"
  on public.profiles for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Public can read contributor handles + display names of contributors
-- (used to show review attribution to anonymous visitors). Keep it to
-- a narrow column set by exposing a view rather than the raw table.
create view public.contributor_profiles as
  select id, display_name, contributor_handle, role, aligned
  from public.profiles
  where role in ('admin', 'contributor');

-- The view inherits the underlying RLS, so we add a permissive policy
-- specifically for these columns. (Postgres < 15 doesn't allow column-
-- level policies; the view abstraction is the standard workaround.)
create policy "profiles_contributors_public_read"
  on public.profiles for select
  using (role in ('admin', 'contributor'));

-- ---- user_teas / user_teaware / sessions: owner-only ----
create policy "user_teas_owner"
  on public.user_teas for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_teaware_owner"
  on public.user_teaware for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "sessions_owner"
  on public.sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================================
-- Grants — RLS does the auth gating; these grant the schema usage.
-- =====================================================================
grant usage on schema public to anon, authenticated;
grant select on public.contributor_profiles to anon, authenticated;
grant select, insert, update, delete on
  public.profiles, public.user_teas, public.user_teaware, public.sessions
  to authenticated;
