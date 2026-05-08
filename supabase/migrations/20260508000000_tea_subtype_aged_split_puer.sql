-- Tea taxonomy refactor.
--
-- Three changes in one pass:
--   1. Split 'Pu''er' into 'Sheng Pu''er' + 'Shou Pu''er' (radically
--      different teas — fruity raw vs earthy fermented). Add 'Dark'
--      for heicha (anhua, fu, liubao, tianjian, liu'an).
--   2. Add `subtype` (free text — Yancha, Longjing, Anhua, Bingdao)
--      so the within-type distinctions are queryable.
--   3. Add `aged` boolean — an aged white tea is its own beast.
--
-- Existing 'Pu''er' rows default to 'Sheng Pu''er'. If any happen to
-- be shou, an editor flips them via the admin form post-migration.
-- The current catalog has exactly one Pu'er row (Menghai shen) and
-- it's already raw, so the default is correct out of the box.
--
-- Postgres can't add an enum value mid-transaction in older
-- versions, but we're on 17. Still, the rename-and-recreate dance
-- below is the standard idempotent pattern for editing enums:
-- rename the old type, create the new one, alter the column with
-- a USING clause that maps old → new, drop the old.

-- 1. Move the existing enum out of the way.
alter type public.tea_type rename to tea_type_old;

-- 2. Create the new enum with the post-split values.
create type public.tea_type as enum (
  'Green',
  'White',
  'Yellow',
  'Oolong',
  'Black',
  'Sheng Pu''er',
  'Shou Pu''er',
  'Dark',
  'Herbal'
);

-- 3. Add the new columns BEFORE the type cast so the table is in
-- its final shape after the migration.
alter table public.teas
  add column subtype text,
  add column aged    boolean not null default false;

-- 4. Migrate the column to the new enum, mapping old values
-- through. Anything that was 'Pu''er' becomes 'Sheng Pu''er' (the
-- only Pu'er row in the seed catalog is raw); everything else
-- maps 1:1 by name.
alter table public.teas
  alter column type type public.tea_type
  using (
    case type::text
      when 'Pu''er' then 'Sheng Pu''er'::public.tea_type
      else type::text::public.tea_type
    end
  );

-- 5. Drop the old enum now that nothing references it.
drop type public.tea_type_old;

-- 6. Index the subtype for browse-by-subtype queries (cheap; the
-- column will rarely be filtered against but the catalog stays
-- small enough that a btree on a text col is no-op overhead).
create index teas_subtype_idx on public.teas(subtype) where subtype is not null;
create index teas_aged_idx    on public.teas(aged)    where aged = true;
