-- API keys for CLI publishing.
--
-- Use case: a staff member (admin/contributor) wants to push a tea
-- review from their editor + commit-message-style workflow instead of
-- the in-browser admin form. They generate a key once from
-- /member/settings, copy it into their environment, and `curl` (or a
-- thin Node script) hits POST /api/v1/teas|posts|vendors.
--
-- Storage shape:
--   id           uuid pk
--   user_id      who owns the key
--   name         human label ("MacBook", "GitHub Actions")
--   prefix       first 8 chars of the raw key — shown in lists so the
--                user can identify which key is which without ever
--                surfacing the full secret again
--   hashed_key   sha256 of the full raw key. The key is shown ONCE at
--                creation; after that this column is the only record.
--   created_at, last_used_at, revoked_at — audit metadata
--
-- The hash is over the raw key bytes (no salt). Salt would protect
-- against rainbow-table attacks if the database is ever exfiltrated,
-- but our keys are 256 bits of entropy — unsaltable at scale. Sha256
-- alone is sufficient against a stolen DB; full keys live only in the
-- caller's environment.
--
-- RLS:
--   - Users see their own keys in the listing (for revocation).
--   - Users can insert + delete (revoke) their own keys.
--   - Service-role bypasses RLS for the auth check on incoming
--     API calls (which doesn't know `auth.uid()` yet — it's
--     looking up the user FROM the key).

create table public.api_keys (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 64),
  prefix        text not null,
  hashed_key    text not null unique,
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz,
  revoked_at    timestamptz
);

create index api_keys_user_id_idx on public.api_keys(user_id);
create index api_keys_hashed_idx  on public.api_keys(hashed_key) where revoked_at is null;

alter table public.api_keys enable row level security;

create policy "api_keys_self_read" on public.api_keys
  for select using (user_id = auth.uid());

create policy "api_keys_self_insert" on public.api_keys
  for insert with check (user_id = auth.uid());

-- Revocation is an UPDATE of revoked_at, not a DELETE — we want the
-- row to stick around for audit. Allow update only of the revoked_at
-- column by enforcing in the application layer; RLS just gates owner.
create policy "api_keys_self_update" on public.api_keys
  for update using (user_id = auth.uid());

-- No public/anon read. The auth check on API calls runs as service-
-- role and bypasses these policies.
