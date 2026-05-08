-- =====================================================================
-- Tea card subtitles
--
-- Adds an optional `subtitle` column the contributor portal can use
-- to set a one-line plain-English tag under each tea name on the
-- discover/teas grid. When null, the app derives a default from
-- type + age + dominant flavor (lib/tea-helpers.ts: teaSubtitle).
--
-- Why null-default + compute: keeps the card useful even before any
-- contributor has written a custom subtitle, while letting them
-- override when the auto-derived line misses.
-- =====================================================================

alter table public.teas add column subtitle text;
