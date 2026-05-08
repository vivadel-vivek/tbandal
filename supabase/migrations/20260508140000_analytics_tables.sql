-- Self-hosted analytics — cookieless.
--
-- Two tables:
--   page_views     — every page load (logged from /api/track via the
--                    PageViewBeacon client component).
--   vendor_clicks  — every /go/[vendor] redirect, the affiliate
--                    clickthrough we monetise.
--
-- We deliberately don't track sessions or unique users — no cookies,
-- no fingerprinting, no client storage. Just raw events with a path,
-- a coarse UA class, and a country header (Vercel sets it
-- automatically; we treat it as observable network metadata, not PII).
--
-- Writes happen server-side via the service role (which bypasses RLS),
-- so the policies below only gate reads. Admin/contributor sees
-- everything; vendor users see only rows for slugs they own.
--
-- Retention: nothing yet. When the tables get large we'll add a daily
-- aggregator + a delete-older-than-90-days job. For a small editorial
-- site this can stay raw for years.

create table public.page_views (
  id            uuid primary key default gen_random_uuid(),
  viewed_at     timestamptz not null default now(),
  path          text not null,
  referrer_host text,
  ua_class      text,
  country       text
);
create index page_views_viewed_at_idx on public.page_views(viewed_at desc);
create index page_views_path_idx       on public.page_views(path);

create table public.vendor_clicks (
  id            uuid primary key default gen_random_uuid(),
  vendor_slug   text not null,
  clicked_at    timestamptz not null default now(),
  source_path   text,
  referrer_host text,
  ua_class      text,
  country       text
);
create index vendor_clicks_slug_idx       on public.vendor_clicks(vendor_slug, clicked_at desc);
create index vendor_clicks_clicked_at_idx on public.vendor_clicks(clicked_at desc);

-- ---- RLS ----------------------------------------------------------
alter table public.page_views    enable row level security;
alter table public.vendor_clicks enable row level security;

-- Reads — staff see everything.
create policy "page_views_staff_read" on public.page_views
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('admin', 'contributor')
    )
  );

create policy "vendor_clicks_staff_read" on public.vendor_clicks
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('admin', 'contributor')
    )
  );

-- Reads — vendor users see only rows for vendors they own.
-- Admins fall back to the staff policy above (PostgreSQL OR-merges
-- policies for SELECT, so any matching policy lets the row through).
create policy "vendor_clicks_owner_read" on public.vendor_clicks
  for select using (
    exists (
      select 1 from public.vendors v
      where v.slug = vendor_clicks.vendor_slug
        and v.owner_id = auth.uid()
    )
  );
