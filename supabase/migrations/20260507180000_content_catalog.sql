-- =====================================================================
-- Two Buds and a Leaf — content catalog (Phase C)
--
-- Moves the editorial catalog (teas, vendors, posts, teaware,
-- contributors) out of lib/data.ts and into Postgres so the contributor
-- portal can edit it and Studio is the day-to-day CRM. Site pages still
-- render statically — Next builds them by awaiting these tables at
-- build time.
--
-- Schema notes:
--   - jsonb for tightly-coupled nested shapes (brewing, mouthfeel,
--     12-axis flavor bundle, reviews bundle). Keeping them inline lets
--     the contributor portal save a tea row in one transaction.
--   - vendor_slug FK on teas. teaware.vendor stays freeform because
--     some items come from external brands (Fellow kettles, Acaia
--     scales) that aren't tea vendors and never will be.
--   - `published` flag on every catalog table so contributors can draft
--     without leaking to anonymous visitors. Public RLS gates on it;
--     staff RLS sees drafts too.
-- =====================================================================

-- ---- enums --------------------------------------------------------
create type public.tea_type as enum (
  'Green', 'White', 'Yellow', 'Oolong', 'Black', 'Pu''er', 'Herbal'
);

create type public.teaware_category as enum (
  'Gaiwan', 'Teapot', 'Kyusu', 'Pitcher', 'Cup',
  'Kettle', 'Scale', 'Strainer', 'Other'
);

create type public.post_category as enum (
  'Brewing', 'Culture', 'Origin', 'Vendor Spotlight'
);

-- ---- contributors -------------------------------------------------
-- Display catalog for the bylines / about page. Decoupled from
-- profiles so we can publish vivek + james before either has signed
-- up; once a profile lands with the matching contributor_handle we
-- can join on it.
create table public.contributors (
  handle        text primary key,
  display_name  text not null,
  initials      text not null,
  color         text not null,
  bio           text not null,
  palate        text not null,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---- vendors ------------------------------------------------------
create table public.vendors (
  slug         text primary key,
  name         text not null unique,
  city         text not null,
  country      text not null,
  continent    text not null,
  tagline      text not null,
  body         text not null,
  rating       numeric(2,1) not null check (rating >= 0 and rating <= 5),
  swatch       text not null,
  tea_count    integer not null default 0,
  founded      integer not null,
  specialties  text[] not null default '{}',
  url          text not null,
  -- Phase E: link to the vendor portal user once they claim the row.
  owner_id     uuid references public.profiles(id) on delete set null,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index vendors_continent_idx on public.vendors(continent);

-- ---- teas ---------------------------------------------------------
create table public.teas (
  slug            text primary key,
  -- Second segment of /tea/[vendor]/[path_slug]. Unique within vendor.
  path_slug       text not null,
  vendor_slug     text not null references public.vendors(slug) on delete restrict,
  name            text not null,
  chinese         text,
  type            public.tea_type not null,
  region          text not null,
  country         text not null,
  year            text not null,
  harvest         text not null,
  elev            integer not null,
  age             text not null,
  price           numeric(8,4) not null,
  rarity          integer not null check (rarity >= 1 and rarity <= 5),
  gradient        text not null,
  swatch          text not null,
  summary         text not null,
  brewing         jsonb   not null,
  mouthfeel       jsonb   not null,
  finish          text[]  not null default '{}',
  sessions_count  integer not null default 0,
  peak_steeps     integer[] not null default '{}',
  flavor          jsonb   not null,
  reviews         jsonb   not null,
  published       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create unique index teas_vendor_path_unique on public.teas(vendor_slug, path_slug);
create index teas_type_idx on public.teas(type);

-- ---- teaware ------------------------------------------------------
create table public.teaware (
  slug          text primary key,
  name          text not null,
  category      public.teaware_category not null,
  volume_ml     integer,
  material      text not null,
  origin        text,
  vendor        text not null,
  external_url  text,
  price         numeric(8,2) not null,
  gradient      text not null,
  swatch        text not null,
  tagline       text not null,
  body          text not null,
  good_for      text[] not null default '{}',
  rating        integer not null check (rating >= 1 and rating <= 5),
  published     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index teaware_category_idx on public.teaware(category);

-- ---- posts --------------------------------------------------------
create table public.posts (
  slug          text primary key,
  cat           public.post_category not null,
  title         text not null,
  excerpt       text not null,
  author        text not null,
  -- Display date stored as the original "Mar 14, 2026" string. We keep
  -- the freeform form for back-compat with rendered copy; for sort
  -- order use published_at below.
  date          text not null,
  read_time     integer not null,
  grad          text not null,
  related       text[] not null default '{}',
  body          text,
  published     boolean not null default true,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index posts_cat_idx on public.posts(cat);
create index posts_published_at_idx on public.posts(published_at desc);

-- ---- updated_at triggers (reuses fn from initial migration) -------
create trigger contributors_touch before update on public.contributors
  for each row execute function public.touch_updated_at();
create trigger vendors_touch       before update on public.vendors
  for each row execute function public.touch_updated_at();
create trigger teas_touch          before update on public.teas
  for each row execute function public.touch_updated_at();
create trigger teaware_touch       before update on public.teaware
  for each row execute function public.touch_updated_at();
create trigger posts_touch         before update on public.posts
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- RLS — public reads of published rows; admin/contributor writes;
-- vendor owners can edit their own vendor row.
-- =====================================================================
alter table public.contributors enable row level security;
alter table public.vendors      enable row level security;
alter table public.teas         enable row level security;
alter table public.teaware      enable row level security;
alter table public.posts        enable row level security;

-- Helper: caller is staff (admin or contributor)?
create function public.is_staff(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(
    select 1 from public.profiles
    where id = uid and role in ('admin', 'contributor')
  );
$$;

-- Contributors are always public-readable (no draft state).
create policy "contributors_public_read"
  on public.contributors for select using (true);
create policy "contributors_staff_write"
  on public.contributors for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- Vendors / teas / teaware / posts: public sees only published rows.
create policy "vendors_public_read" on public.vendors  for select using (published);
create policy "teas_public_read"    on public.teas     for select using (published);
create policy "teaware_public_read" on public.teaware  for select using (published);
create policy "posts_public_read"   on public.posts    for select using (published);

-- Staff (admin + contributor) sees drafts and can write.
create policy "vendors_staff_all"  on public.vendors  for all
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "teas_staff_all"     on public.teas     for all
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "teaware_staff_all"  on public.teaware  for all
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "posts_staff_all"    on public.posts    for all
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- Vendor owners can read + update their own vendor row (Phase E).
create policy "vendors_owner_select"
  on public.vendors for select using (auth.uid() = owner_id);
create policy "vendors_owner_update"
  on public.vendors for update
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ---- grants ------------------------------------------------------
grant select on
  public.contributors, public.vendors, public.teas, public.teaware, public.posts
  to anon, authenticated;
grant insert, update, delete on
  public.contributors, public.vendors, public.teas, public.teaware, public.posts
  to authenticated;
