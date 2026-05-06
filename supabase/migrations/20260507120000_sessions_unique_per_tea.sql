-- =====================================================================
-- Add unique (user_id, user_tea_id) on sessions.
--
-- The existing MemberRating model in the app is one-rating-per-tea per
-- member — `upsertRating` replaces in-place when called with a slug
-- that already has a rating. To preserve that semantic during the
-- localStorage → Supabase sessions migration, we need a unique
-- constraint to upsert against.
--
-- Future-state: when we want a true session log (multiple brew
-- sessions for the same tea over time), drop this constraint and
-- promote sessions.id as the natural key. The Member shape stays
-- one-rating-per-tea via an aggregate view at that point.
-- =====================================================================

create unique index sessions_user_tea_unique
  on public.sessions(user_id, user_tea_id);
