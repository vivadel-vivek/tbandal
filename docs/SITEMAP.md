# Sitemap

Every route the site exposes, what it does, and who can see it.
Frozen as of 2026-05-08 — see `docs/SPEC.md` for the feature inventory.

Five access tiers in increasing privilege:

- **Public** — no auth, anyone can hit the URL.
- **Member** — any signed-in account (`profiles.role IN any`).
- **Vendor** — accounts with `profiles.role = 'vendor'` who own a vendor row.
- **Contributor** — accounts with `profiles.role = 'contributor'` (editors).
- **Admin** — accounts with `profiles.role = 'admin'` (full access).

Server actions and route handlers enforce these gates via
`requireRole`, `requireStaff`, and `requireVendorOrAdmin` from
`lib/auth/`. Database RLS enforces the same boundaries on direct
PostgREST hits.

---

## Public surfaces

| Route | What it is |
|---|---|
| `/` | Home — editorial hero, recent reviews, methodology pitch. |
| `/about` | Two-person team page — Vivek + James bios, palate signatures. |
| `/start` | Guided brewing flow — 4 questions → tailored recipe + timer. No account needed. |
| `/how-we-rate` | Methodology — 6/12 axis flavor wheel, mouthfeel grid, rating scale, recommendation engine boundaries. |
| `/journal` | Editorial post index — long reads, brewing notes, vendor spotlights. |
| `/journal/[slug]` | Single post detail — Markdown body, related teas, byline. |
| `/discover` | Discover hub — entry points to teas / vendors / teaware / glossary. |
| `/discover/teas` | Tea catalog — type filter chips with definitions, beginner-mode buckets, vendor + region + sort. |
| `/discover/teas` (beginner mode) | Same data, friendly buckets ("Light & floral", "Bold & roasted") instead of type names. |
| `/discover/vendors` | Vendor atlas — grouped by continent, with affiliate disclosure. |
| `/discover/vendors/[slug]` | Vendor detail — body copy, hero photo, reviewed teas, "Visit shop" via `/go/[slug]`. |
| `/discover/teaware` | Teaware catalog — gaiwans, kyusu, teapots, kettles, scales. |
| `/discover/teaware/[slug]` | Teaware detail. |
| `/discover/glossary` | Tea types, brewing methods, vessels, flavor terms, mouthfeel — with cross-references between East/West naming pairs (longjing↔dragonwell, tieguanyin↔iron-goddess, red↔black, hei-cha↔dark, etc). |
| `/tea/[vendor]/[slug]` | Tea detail — server-rendered hero, radar chart, mouthfeel grid, contributor reviews + member rating, brewing parameters, related teas. |
| `/recommendations` | Personalized recommendations — three modes (Likely matches / Try something different / Blind tasting). Cold-start uses aligned contributor's palate signature. |
| `/for-vendors` | Pitch + submission process — "send us a tea for review" with sample size, embargo, queue policy. |
| `/request-review` | Member-facing form — request a tea we don't have yet. |
| `/privacy` | Privacy policy. Versioned in `lib/policy.ts`. |
| `/terms` | Terms of use. Versioned in `lib/policy.ts`. |

---

## Auth surfaces

| Route | What it is |
|---|---|
| `/login` | Email + password sign-in. `?next=...` for return-to. |
| `/signup` | Email + password signup with required privacy + terms checkbox. Captures `terms_version` and `privacy_version` into `profiles` and `consent_log` via the `handle_new_user` trigger. |
| `/auth/callback` | Generic OAuth/email-confirmation handler. Forwards `recovery` / `invite` / `signup` types to `/auth/reset`. |
| `/auth/reset` | Set-new-password form. Handles all three Supabase recovery URL variants (PKCE code, OTP token_hash, implicit access_token hash). |
| `/auth/signout` | Server-side signout. POST only. |

---

## Member surfaces

Anything a signed-in user can see, including vendors / contributors / admins (those tiers see these same surfaces plus their privileged ones below).

| Route | Tier | What it is |
|---|---|---|
| `/member` | Member | Profile dashboard — palate radar, alignment switch, ratings list. Shows "Editor →" for staff and "Vendor portal →" for vendors. |
| `/member/library` | Member | Personal tea + teaware library. Wishlist / owned / tried / retired. |
| `/member/settings` | Member | Identity (display name, avatar upload), notifications, display options (basic/advanced flavor, theme), policy acceptance log, account actions. |
| `/account` | Member | Top-level account redirect → settings. |
| `/account/password` | Member | Change password (signed-in path, separate from `/auth/reset`). |
| `/tea/[vendor]/[slug]/log` | Member | Session log editor — leaf weight, water volume, water source, brewing ramp, mouthfeel, flavor profile, score, body, share toggle. |
| `/s/[token]` | Public via token | Public-read share of a single logged session. Token can be rotated by owner. |

---

## Contributor + admin surfaces (`requireStaff`)

| Route | Tier | What it is |
|---|---|---|
| `/admin` | Member | Role-aware redirect — admin/contributor → `/admin/contributor`; vendor → `/admin/vendor`; member → `/member`. |
| `/admin/contributor` | Contributor+ | Editorial overview. KPI strip (page views, sessions logged, vendor clickouts, click-through), 30-day trend charts, top pages, top vendor clickouts, device mix, time-on-page, journey list, draft queue, Rebuild button. |
| `/admin/contributor/teas` | Contributor+ | Tea catalog — filterable list with publish toggles. |
| `/admin/contributor/teas/new` | Contributor+ | New tea form — full catalog row including hero image, subtype, aged flag, mouthfeel/flavor JSON. |
| `/admin/contributor/teas/[slug]` | Contributor+ | Edit existing tea — same form with structured review panels for Vivek + James. |
| `/admin/contributor/posts` | Contributor+ | Journal post list with publish toggles. |
| `/admin/contributor/posts/new` | Contributor+ | New post form — title, excerpt, body (Markdown), hero image, related tea slugs. |
| `/admin/contributor/posts/[slug]` | Contributor+ | Edit existing post. |
| `/admin/contributor/vendors` | Contributor+ | Vendor list. |
| `/admin/contributor/vendors/new` | Contributor+ | New vendor — admin-side. URL is editable from this side (not from the vendor self-edit form). |
| `/admin/contributor/vendors/[slug]` | Contributor+ | Edit vendor (full access including URL). |
| `/admin/contributor/teaware` | Contributor+ | Teaware list. |
| `/admin/contributor/teaware/new` | Contributor+ | New teaware. |
| `/admin/contributor/teaware/[slug]` | Contributor+ | Edit teaware. |
| `/admin/contributor/users` | **Admin** | User list with role dropdowns. Admin-only — contributors can't manage roles. |

---

## Vendor portal (`requireVendorOrAdmin`)

| Route | Tier | What it is |
|---|---|---|
| `/admin/vendor` | Vendor+ | Vendor portal overview. Per-owned-vendor stats: teas reviewed, teaware listed, 30-day page views + clickouts + click-through. 30-day mini line charts. RLS gates the analytics to the caller's owned slugs only. |
| `/admin/vendor/profile` | Vendor+ | Self-edit vendor profile (city / country / continent / tagline / body / specialties / hero photo / swatch). **URL is read-only** — the redirect destination behind `/go/[slug]` can only be changed by an admin (security trigger). |
| `/admin/vendor/teas` | Vendor+ | Read-only list of teas in your catalog. Reviews are written by contributors. |
| `/admin/vendor/teaware` | Vendor+ | Self-managed teaware listings tied to your vendor. |
| `/admin/vendor/teaware/new` | Vendor+ | New owned teaware. |
| `/admin/vendor/teaware/[slug]` | Vendor+ | Edit owned teaware. |

---

## Outbound + API

| Route | Tier | What it is |
|---|---|---|
| `/go/[vendor]` | Public | Affiliate redirect — 302s to `vendors.url` with UTM tagging. Logs a `vendor_clicks` row. |
| `/go/teaware/[slug]` | Public | Affiliate redirect for off-catalog teaware (kettles, scales). |
| `/api/track` | Public | POST endpoint for the cookieless `PageViewBeacon`. Two-call protocol: `{id, path, referrer_path}` to insert, `{id, duration_ms}` to patch. |
| `/api/staging/switch` | Staging only | Role switcher for the staging environment (env-gated, no-op in prod). |
| `/sitemap.xml` | Public | Generated from published rows. |
| `/robots.txt` | Public | Disallows admin paths. |
| `/manifest.webmanifest` | Public | PWA manifest. |
| `/opengraph-image` | Public | OG image generator. |

---

## Surfaces explicitly not exposed

- No public user index (no "browse all members"). RLS forbids enumerating profiles.
- No public session feed (sessions are private by default; share-link is the only public path).
- No third-party tracking — no GA, Meta pixel, Hotjar, Mixpanel, Vercel Analytics. Verified clean as of 2026-05-08 audit.
