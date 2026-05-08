-- Image upload pipeline.
--
-- Adds image_url columns across editorial rows, avatar_url on
-- profiles + contributors, and creates two public Storage buckets:
--   - editorial: vendor / tea / teaware / post heroes (staff write)
--   - avatars: user + contributor profile pictures (user-self write)
--
-- Display layer falls back to the existing CSS gradient when
-- image_url is null, so this migration is non-breaking — existing
-- pages keep rendering until an editor actually uploads something.
--
-- We don't store blur placeholders yet. next/image lazy-loads with
-- a transparent shimmer by default; if we want LQIP later we'll add
-- an image_blur column and generate at upload time via sharp.

-- ---- editorial image columns ---------------------------------------
alter table public.vendors      add column image_url text;
alter table public.teas         add column image_url text;
alter table public.teaware      add column image_url text;
alter table public.posts        add column image_url text;
alter table public.profiles     add column avatar_url text;
alter table public.contributors add column avatar_url text;

-- ---- storage buckets -----------------------------------------------
-- public=true so getPublicUrl() returns a permanently-resolvable URL
-- (next/image will optimize-and-cache from there). RLS still gates
-- writes via the policies below.
insert into storage.buckets (id, name, public)
values
  ('editorial', 'editorial', true),
  ('avatars',   'avatars',   true)
on conflict (id) do nothing;

-- ---- storage RLS ---------------------------------------------------
-- Public read on both buckets — the URLs are baked into HTML and
-- served to anonymous visitors.
create policy "editorial_public_read" on storage.objects
  for select using (bucket_id = 'editorial');

create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

-- Editorial writes — staff only. Vendors get to upload too because
-- they edit their own vendor profile from /admin/vendor.
create policy "editorial_staff_write" on storage.objects
  for insert with check (
    bucket_id = 'editorial'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('admin', 'contributor', 'vendor')
    )
  );

create policy "editorial_staff_update" on storage.objects
  for update using (
    bucket_id = 'editorial'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('admin', 'contributor', 'vendor')
    )
  );

create policy "editorial_staff_delete" on storage.objects
  for delete using (
    bucket_id = 'editorial'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('admin', 'contributor', 'vendor')
    )
  );

-- Avatar writes — users edit their own folder (avatars/{user_id}/…),
-- staff can additionally write to avatars/contributors/{handle}/… for
-- the editorial byline avatars.
create policy "avatars_self_write" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        (storage.foldername(name))[1] = 'contributors'
        and exists (
          select 1 from public.profiles
          where id = auth.uid()
            and role in ('admin', 'contributor')
        )
      )
    )
  );

create policy "avatars_self_update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        (storage.foldername(name))[1] = 'contributors'
        and exists (
          select 1 from public.profiles
          where id = auth.uid()
            and role in ('admin', 'contributor')
        )
      )
    )
  );

create policy "avatars_self_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        (storage.foldername(name))[1] = 'contributors'
        and exists (
          select 1 from public.profiles
          where id = auth.uid()
            and role in ('admin', 'contributor')
        )
      )
    )
  );
