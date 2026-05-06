# Supabase setup

This is the operational walkthrough for the Supabase backend that powers
auth + member data on Two Buds and a Leaf. Read top-to-bottom on first
setup; thereafter you'll mostly hit the **Daily commands** section.

## What lives where

| Concern | Where it lives |
|---|---|
| Frontend hosting | Vercel (`two-buds-and-a-leaf.vercel.app`) |
| Source of truth | GitHub (`vivadel-vivek/two-buds-and-a-leaf`) |
| Auth + user data + storage + edge functions | Supabase (project ref `dnfejeqvolirzepkuncv`) |
| Schema migrations | `supabase/migrations/*.sql` (committed to git) |
| Local stack | Docker via `supabase start` (Postgres + GoTrue + Storage on localhost) |

## One-time setup

### 1. Install the Supabase CLI
```bash
npm i -g supabase
# or, on macOS:
# brew install supabase/tap/supabase
```

### 2. Link the local repo to the hosted project
```bash
supabase login          # opens a browser, signs you in
supabase link --project-ref dnfejeqvolirzepkuncv
```
Both commands write to `~/.supabase/`; safe to run on multiple machines.

### 3. Start the local stack
```bash
docker --version        # confirm Docker is installed + running
npm run supabase:start  # boots Postgres + Auth + Storage on localhost
```
First run takes 2-3 min while Docker pulls images. Subsequent starts are
seconds.

When `supabase start` finishes it prints the local URL and keys:
```
API URL:        http://127.0.0.1:54321
GraphQL URL:    http://127.0.0.1:54321/graphql/v1
DB URL:         postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL:     http://127.0.0.1:54323
Inbucket URL:   http://127.0.0.1:54324
JWT secret:     ...
anon key:       eyJ...
service_role:   eyJ...
```

### 4. Wire env vars
```bash
cp .env.local.example .env.local
```
Open `.env.local`, paste the local **API URL**, **anon key**, and
**service_role** from the previous step. Restart `npm run dev`.

### 5. Apply migrations to your local DB
```bash
npm run supabase:reset   # wipes local DB and re-applies all migrations
```

### 6. Generate typed schema (optional but recommended)
```bash
npm run supabase:gen-types
```
Overwrites `lib/supabase/types.ts` with a precise TypeScript schema
generated from the live database. Until you run this, the typed clients
fall back to a hand-written placeholder.

### 7. Smoke test
```bash
npm run dev
# visit http://localhost:3000/signup
# create an account; the trigger auto-creates a profile row
# visit http://localhost:3000/account
# the form should pre-fill with your email
```
Confirmation emails get caught by **Inbucket** at
`http://127.0.0.1:54324` — useful for testing password resets without
a real SMTP.

## Daily commands

```bash
npm run dev                 # next.js dev server
npm run supabase:start      # boots local Postgres if it's stopped
npm run supabase:status     # check what's running
npm run supabase:stop       # stop the local stack (frees Docker)
```

When you change schema:

```bash
# edit a SQL migration in supabase/migrations/, then:
npm run supabase:reset      # apply locally
npm run supabase:gen-types  # refresh TypeScript types
# commit + push; the GitHub integration applies the migration to the
# hosted project on merge.
```

Or if you prefer schema-as-diff:

```bash
# edit the local DB freely (via Studio or psql), then:
npm run supabase:diff       # writes the diff to a new migration file
```

## Hosted project — env vars on Vercel

Set these three in Vercel project Settings → Environment Variables for
**Production** + **Preview**:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dnfejeqvolirzepkuncv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (Settings → API → publishable key) |
| `SUPABASE_SERVICE_ROLE_KEY` | (Settings → API → service_role key) |

Trigger a redeploy after setting them so the Edge Functions / route
handlers see the values.

## CI/CD — GitHub ↔ Supabase

Two ways to keep migrations in sync between git and the hosted project:

**A. Manual** (default): after merging a PR, run
```bash
npm run supabase:push
```
locally on a machine that's `supabase login`-ed.

**B. Automated** (recommended once stable): connect the project via
the [Supabase GitHub Integration](https://supabase.com/dashboard/project/dnfejeqvolirzepkuncv/settings/integrations).
On a successful push to `main`, Supabase auto-applies any new
`supabase/migrations/*.sql` files to the hosted DB. Enable once the
schema settles and PR migrations have been reviewed.

## What's currently in the schema

Phase B (this commit):
- `profiles` — 1:1 with `auth.users`, holds member preferences + role
- `user_role` enum: admin / contributor / vendor / member / user
- `user_teas` — wishlist / owned / tried / retired (with optional custom_*)
- `user_teaware` — wishlist / owned (with optional custom_*)
- `sessions` — replaces MemberRating; rooted in user_teas

Future phases:
- Phase C: `teas`, `vendors`, `teaware`, `posts`, `glossary` content tables
- Phase D: contributor CMS surfaces
- Phase E: `subscriptions` for Stripe paywall
- Phase F: `audio_uploads` for VTT pipeline (uses Supabase Storage)
