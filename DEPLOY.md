# Deployment

This document describes how Two Buds and a Leaf deploys to Vercel and
how the build pipeline behaves. Phases 6b (Airtable) and 6c (auth +
Postgres) extend this — see the Phase 6 section at the bottom.

## Stack

- **Hosting:** Vercel (free tier; edge + serverless)
- **Framework:** Next.js 14 (App Router)
- **CI:** GitHub Actions — typecheck + lint + production build on every push and PR
- **Source control:** GitHub repo `vivadel-vivek/tbandal`
- **Domain:** `twobudsandaleaf.com` (registered separately; Cloudflare → Vercel CNAME)

## Local development

```bash
npm install
npm run dev          # Next.js dev server on :3000
npm run prototype    # the original CDN-React prototype on :3001 (reference)
npm run typecheck    # tsc --noEmit
npm run build        # production build
npm run lint         # next lint
```

`http://localhost:3000` is the active site; `http://localhost:3001` is
the legacy CDN-React prototype kept under `/prototype/` for visual
reference.

## Environment variables

See `.env.example` for the canonical list. The most important one for
deploy is `NEXT_PUBLIC_SITE_URL` — it drives:

- `app/layout.tsx` `metadataBase` (so OG / canonical URLs resolve correctly)
- `app/sitemap.ts` (every URL emitted)
- `app/robots.ts` (the `Sitemap:` line)
- `/go/[vendor]` UTM source

On Vercel set this in **Project Settings → Environment Variables**:

| Key                     | Production              | Preview                | Development            |
|-------------------------|-------------------------|------------------------|------------------------|
| `NEXT_PUBLIC_SITE_URL`  | `https://twobudsandaleaf.com` | (leave unset; Vercel falls back to `VERCEL_URL`) | `http://localhost:3000` |

Phase-6b and 6c env vars (`AIRTABLE_*`, `AUTH_*`, `DATABASE_URL`) come later.

## CI (`.github/workflows/ci.yml`)

Every push and PR runs:

1. **typecheck** — `npm run typecheck` (`tsc --noEmit`)
2. **lint** — `npm run lint` (`next lint`)
3. **build** — `npm run build` (depends on the previous two passing)

The build job exports `NEXT_PUBLIC_SITE_URL=https://twobudsandaleaf.com`
so `metadataBase` resolves cleanly. Vercel runs its own production build
using the Vercel project settings.

## Vercel project settings

When you link the repo via the Vercel dashboard:

- **Framework preset:** Next.js (auto-detected from `vercel.json`)
- **Build command:** `npm run build` (also pinned in `vercel.json`)
- **Install command:** `npm ci` (pinned)
- **Output directory:** `.next` (auto)
- **Node version:** 20.x (auto from Vercel default)
- **Branch:** `main` is production. All other branches → preview deploys
  with their own URLs (`<branch>-<project>.vercel.app`).

`vercel.json` adds:

- security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`)
- 1-year immutable cache on `/_next/static/*`

## Per-route generation strategy

| Route | Strategy | Revalidate |
|---|---|---|
| `/` | static + ISR | 3600s |
| `/about` | static + ISR | 1 week |
| `/discover` | static + ISR | 1 week |
| `/discover/teas` | static + ISR | 3600s |
| `/discover/vendors` | static + ISR | 3600s |
| `/discover/vendors/[slug]` | `generateStaticParams` + ISR | 3600s, dynamicParams: true |
| `/discover/glossary` | static + ISR | 1 week |
| `/tea/[vendor]/[slug]` | `generateStaticParams` + ISR | 3600s, dynamicParams: true |
| `/tea/[vendor]` (legacy redirect) | dynamic | n/a |
| `/journal` | static + ISR | 3600s |
| `/journal/[slug]` | `generateStaticParams` + ISR | 3600s, dynamicParams: true |
| `/recommendations` | force-dynamic | n/a (member-driven) |
| `/member`, `/member/settings` | force-dynamic | n/a (session) |
| `/request-review` | force-dynamic | n/a (form + query params) |
| `/for-vendors` | static + ISR | 1 week |
| `/go/[vendor]` | dynamic route handler | n/a |
| `/sitemap.xml`, `/robots.txt` | static + ISR | 3600s |

Phase 6b adds `revalidateTag()` calls inside the Airtable webhook
handler so editorial changes propagate without a full rebuild.

## First-time deploy checklist

1. **Code is on the `main` branch** of `vivadel-vivek/tbandal`.
2. **Vercel account is connected to GitHub.**
3. In Vercel dashboard → **Add New → Project → import `tbandal`**.
4. **Environment variables**: add `NEXT_PUBLIC_SITE_URL` for Production.
5. **Deploy.** First build takes 1-2 minutes.
6. **Set custom domain** in Project Settings → Domains.
7. **Verify**:
    - `/sitemap.xml` returns the production domain
    - `/robots.txt` references the same
    - `/icon.svg` serves
    - `/go/white2tea` → 302 → `https://white2tea.com/?utm_source=twobudsandaleaf...`
    - A tea-detail page loads with the radar SVG

## Phase 6 roadmap (forthcoming)

### 6b — Airtable (editorial content)
- `lib/airtable/` typed fetchers per table (Teas, Vendors, Posts, Contributors)
- `unstable_cache` with cache tags per record
- `/api/revalidate` route handler — Airtable webhook posts here on edit
- `next/draft-mode` for unpublished entries (button in Airtable hits a
  `/api/preview?secret=...` endpoint)
- Removes `lib/data.ts` literal arrays in favor of fetchers

### 6c — Auth + Postgres (user data)
- NextAuth (Auth.js) with Google OAuth
- Postgres (Supabase or Vercel Postgres) tables: `users`, `ratings`,
  `tasted_teas`, `member_settings`, `review_requests`, `referral_clicks`
- `/member`, `/member/settings`, `/request-review` move from
  client-state → server-action backed
- `/go/[vendor]/route.ts` logs each click

### 6d — Domain + email
- Custom domain `twobudsandaleaf.com` → Vercel
- Email forwarding `hello@twobudsandaleaf.com` → owner inbox via
  Cloudflare Email Routing
- Resend (or similar) for transactional email — review-request
  acknowledgements, weekly digest opt-in
