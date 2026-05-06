# Testing

End-to-end Playwright suite that verifies role-based access control
across every meaningful route. Each tier (admin, contributor, vendor,
member, user) plus the anonymous case visits the route manifest and
asserts allowed / redirected / forbidden behavior.

## One-time setup

```bash
# 1. Local stack must be up.
npm run supabase:start

# 2. Env vars in .env.local — copy from .env.local.example and paste
#    the values `supabase status` printed.

# 3. Seed the five test users into the local Supabase project. They
#    bypass email confirmation (admin SDK creates them with
#    email_confirm=true) and roles are upserted to match each tier.
npm run test:seed
```

The seed script writes `tests/.test-users.json` with credentials —
gitignored, regenerated on every run.

## Running

```bash
npm run test:e2e          # headless, full matrix
npm run test:e2e:ui       # Playwright UI mode for debugging
```

The runner boots the dev server automatically (`reuseExistingServer`
so an already-running `npm run dev` is preferred). Reports land in
`audit-artifacts/playwright-report/` after each run.

## What's covered

| Route                                 | Anonymous | user / member / vendor / contributor | admin |
|---------------------------------------|-----------|--------------------------------------|-------|
| `/`, `/discover/*`, `/journal/*`, `/about` | ok        | ok                                   | ok    |
| `/account`, `/member`, `/member/*`    | redirect /login | ok                                   | ok    |
| `/admin/contributor` (Phase D)        | redirect / | forbidden (except contributor)       | ok    |
| `/admin/vendor` (Phase E)             | redirect / | forbidden (except vendor)            | ok    |

Routes that don't exist yet are marked `notImplemented: true` in
`tests/access-control.spec.ts` and skipped — flip that flag when each
phase lands and the suite enforces the gate immediately.

## Adding a new route

1. Add the path to the `ROUTES` array in `access-control.spec.ts` with
   the appropriate `allow` tier.
2. If it's a future-phase route, set `notImplemented: true` so the
   test is skipped until the route exists.
3. Re-run `npm run test:e2e` — every tier × route combo runs.

## Troubleshooting

- **`Couldn't read tests/.test-users.json`** — run `npm run test:seed`.
- **Tests time out on sign-in** — make sure the dev server can reach
  Supabase (check `.env.local` is set and the local stack is up).
- **Wrong outcomes on Phase D/E routes** — those gates are stubbed
  with `notImplemented: true`. Don't enable until the routes ship.
