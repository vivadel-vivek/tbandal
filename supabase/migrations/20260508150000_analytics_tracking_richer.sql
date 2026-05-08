-- Richer analytics tracking — phase B.
--
-- Adds two columns to page_views:
--   referrer_path  the previous within-site path the visitor came
--                  from. Drives the journey list ("home → discover/teas").
--   duration_ms    how long the visitor stayed on the page. Updated
--                  via a second beacon at SPA-navigation / pagehide,
--                  so most rows insert with NULL and get patched on
--                  exit. Powers the "time on page" leaderboard.
--
-- We don't index referrer_path or duration_ms — the dashboard queries
-- pull a 30-day window into JS and aggregate there, same as the
-- existing helpers in lib/analytics.ts.

alter table public.page_views add column referrer_path text;
alter table public.page_views add column duration_ms   integer;
