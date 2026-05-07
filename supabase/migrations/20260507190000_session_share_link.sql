-- =====================================================================
-- Session sharing — public link per session
--
-- Members can opt-in to share a single session via a URL. The token is
-- a random uuid stored on the session row; presence of the token plus
-- a `share_enabled` flag is what makes the row publicly readable.
--
-- Why a separate flag *and* a token: rotating the token (regenerate
-- to revoke a leaked link) shouldn't require deleting the session. We
-- toggle share_enabled to disable; the row stays.
-- =====================================================================

alter table public.sessions
  add column share_enabled boolean not null default false,
  add column share_token   uuid unique;

-- Backfill not needed — column is non-null with default false.

-- One unique index already enforced by `unique` above; add a partial
-- index for fast lookup of active shares.
create index sessions_share_token_active_idx
  on public.sessions(share_token)
  where share_enabled = true;

-- Public read of shared sessions. Owner policy from the initial
-- migration still applies; this adds an additional read path keyed on
-- the token + flag pair. The route handler will fetch by token and
-- the policy lets it through anonymously.
--
-- Note: this is permissive READ only — no insert/update/delete from
-- anonymous. Members continue to own their rows.
create policy "sessions_shared_public_read"
  on public.sessions for select
  using (share_enabled = true and share_token is not null);

-- Mirror policy on the joined user_teas table — when fetching a shared
-- session we also need to read its parent user_tea row to render the
-- tea name / catalog link. Without this, the join in the share view
-- would 0-row even though the session itself was readable.
--
-- Restricted to user_tea rows that are referenced by an active share.
create policy "user_teas_shared_session_read"
  on public.user_teas for select
  using (
    exists (
      select 1 from public.sessions s
      where s.user_tea_id = user_teas.id
        and s.share_enabled = true
        and s.share_token is not null
    )
  );
