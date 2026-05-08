# Two Buds and a Leaf — System spec

A living catalog of pages, features, and infrastructure. Edit when
shipping anything that changes the surface area; future agents and
audits read this to understand the system without re-deriving it
from the codebase.

Last updated: 2026-05-07.

---

## 1 · Routes

Legend: **○** static · **●** SSG (prerendered with ISR) · **ƒ** dynamic.
Auth tiers: `public` · `member` (any signed-in user) · `staff`
(admin/contributor) · `admin`.

### Public surfaces

| Route | Type | Auth | File | Notes |
|---|---|---|---|---|
| `/` | ● | public | `app/page.tsx` | Home: hero, recently brewed, two contributors, methodology section (with live example radar + mouthfeel), journal feed |
| `/about` | ● | public | `app/about/page.tsx` | Editorial story, methodology summary, affiliate disclosure |
| `/how-we-rate` | ● | public | `app/how-we-rate/page.tsx` | Full methodology — flavor wheel, composite ratings, mouthfeel, member logging, recommendations math, scale |
| `/start` | ● | public | `app/start/page.tsx` | "Are you new here?" guided brew flow (5 steps, live timer, save-prompts signup) |
| `/discover` | ● | public | `app/discover/page.tsx` | Hub linking the four discover surfaces |
| `/discover/teas` | ● | public | `app/discover/teas/page.tsx` | Catalog grid; client island `TeaBrowser` with type/origin/vendor filters + Standard/Beginner view toggle |
| `/discover/vendors` | ● | public | `app/discover/vendors/page.tsx` | Vendor atlas grouped by continent |
| `/discover/vendors/[slug]` | ● | public | `app/discover/vendors/[slug]/page.tsx` | Per-vendor profile with attributed teas |
| `/discover/teaware` | ● | public | `app/discover/teaware/page.tsx` | Teaware grouped by category |
| `/discover/teaware/[slug]` | ● | public | `app/discover/teaware/[slug]/page.tsx` | Per-teaware detail with paired teas |
| `/discover/glossary` | ● | public | `app/discover/glossary/page.tsx` | Reference for tea types, brewing basics, vessels, flavor terms, mouthfeel |
| `/journal` | ● | public | `app/journal/page.tsx` | Editorial feed |
| `/journal/[slug]` | ● | public | `app/journal/[slug]/page.tsx` | Long-form post |
| `/recommendations` | ○ | public (member-aware) | `app/recommendations/page.tsx` | Server shell + `RecommendationsView` client. Anon cold-start uses aligned contributor's palate signature |
| `/tea/[vendor]/[slug]` | ● | public | `app/tea/[vendor]/[slug]/page.tsx` | Tea detail. Hero (incl. LCP) is **server-rendered**; review tabs/radar are client island `TeaDetailView`. ISR via `revalidate: 60` on the supabase fetcher |
| `/tea/[vendor]/[slug]/log` | ƒ | member-only (anon → join page) | `app/tea/[vendor]/[slug]/log/page.tsx` | Session log editor. Anon visitors get a "Join to log" CTA with `?next=` preserved |
| `/tea/[vendor]` | ƒ | public | `app/tea/[vendor]/page.tsx` | Legacy-slug + vendor-slug redirect handler |
| `/s/[token]` | ƒ | public | `app/s/[token]/page.tsx` | Member's shared session via token |
| `/for-vendors` | ● | public | `app/for-vendors/page.tsx` | Vendor submission template |
| `/request-review` | ƒ | public | `app/request-review/page.tsx` | Tea-suggestion form |
| `/privacy` | ● | public | `app/privacy/page.tsx` | Privacy policy |
| `/terms` | ● | public | `app/terms/page.tsx` | Terms of use |
| `/sitemap.xml` | ● | public | `app/sitemap.ts` | Auto-generated; reads catalog from Supabase |
| `/robots.txt` | ○ | public | `app/robots.ts` | Allows everything except `/admin/*` |
| `/manifest.webmanifest` | ○ | public | `app/manifest.ts` | PWA manifest |
| `/opengraph-image` | ƒ | public | `app/opengraph-image.tsx` | Default OG card |

### Auth surfaces

| Route | Type | Auth | File | Notes |
|---|---|---|---|---|
| `/login` | ƒ | public | `app/login/page.tsx` | Email + password. Honors `?next=` |
| `/signup` | ƒ | public | `app/signup/page.tsx` | Honors `?next=` (e.g., from /start, library toggle) |
| `/auth/callback` | ƒ | public | `app/auth/callback/route.ts` | OAuth + email-confirm exchange-code flow |
| `/auth/signout` | ƒ | member | `app/auth/signout/route.ts` | POST-only |

### Member surfaces

| Route | Type | Auth | File | Notes |
|---|---|---|---|---|
| `/member` | ƒ | member | `app/member/page.tsx` | Profile, alignment, ratings list |
| `/member/library` | ƒ | member | `app/member/library/page.tsx` | Wishlist / owned / tried teas + teaware |
| `/member/settings` | ƒ | member | `app/member/settings/page.tsx` | Display name, palate alignment, flavor mode, theme, blind teas |
| `/account` | ƒ | member | `app/account/page.tsx` | Email, contributor handle |
| `/account/password` | ƒ | member | `app/account/password/page.tsx` | Password change |

### Admin / contributor portal (`requireStaff`)

| Route | Type | Auth | File | Notes |
|---|---|---|---|---|
| `/admin/contributor` | ƒ | staff | `app/admin/contributor/page.tsx` | Overview: counts, draft tally, Trigger Rebuild button |
| `/admin/contributor/teas` | ƒ | staff | `app/admin/contributor/teas/page.tsx` | List + publish toggle |
| `/admin/contributor/teas/[slug]` | ƒ | staff | `app/admin/contributor/teas/[slug]/page.tsx` | Edit form (subtitle override, summary, brewing/mouthfeel/flavor/reviews JSON) |
| `/admin/contributor/teas/new` | ƒ | staff | `app/admin/contributor/teas/new/page.tsx` | Create |
| `/admin/contributor/posts` | ƒ | staff | … | List + edit + new |
| `/admin/contributor/vendors` | ƒ | staff | … | List + edit + new (admin can set `owner_id` linking to a vendor user) |
| `/admin/contributor/teaware` | ƒ | staff | … | List + edit + new |
| `/admin/contributor/users` | ƒ | staff (admin-only writes) | `app/admin/contributor/users/page.tsx` | Role management; admin only can change roles, contributor reads |

### Vendor portal (`requireVendorOrAdmin`)

| Route | Type | Auth | File | Notes |
|---|---|---|---|---|
| `/admin/vendor` | ƒ | vendor or admin | `app/admin/vendor/page.tsx` | Overview of owned vendor row(s), counts, public-page link |
| `/admin/vendor/profile` | ƒ | vendor or admin | … | Edit storefront fields (slug/rating/tea-count are admin-managed) |
| `/admin/vendor/teas` | ƒ | vendor or admin | … | Read-only list of teas attributed to vendor |
| `/admin/vendor/teaware` | ƒ | vendor or admin | … | Full CRUD for teaware vendor sells |

### Outbound + API

| Route | File | Notes |
|---|---|---|
| `/go/[vendor]` | `app/go/[vendor]/route.ts` | Affiliate redirect with UTM tags |
| `/go/teaware/[slug]` | `app/go/teaware/[slug]/route.ts` | Per-teaware redirect (internal vendor or external brand) |
| `/api/staging/switch` | `app/api/staging/switch/route.ts` | Test-user role switcher (gated on `NEXT_PUBLIC_STAGING_ROLE_SWITCHER=1`) |

---

## 2 · Components — major

| Component | File | Type | Notes |
|---|---|---|---|
| `Shell` | `components/chrome/Shell.tsx` | server | Root layout shell. Awaits `getTeas()` for the SessionLogLauncher; mounts StagingRoleSwitcher when env-flagged |
| `Header` | `components/chrome/Header.tsx` | client | Desktop nav + mobile drawer (Home / Start brewing / Journal / Teas / Vendors / Teaware / Glossary / How we rate / About). "Join" is the primary CTA |
| `Footer` | `components/chrome/Footer.tsx` | server | Three columns + bottom strip with privacy/terms/affiliate disclosure |
| `TeaHero` | `components/tea/TeaHero.tsx` | server | LCP-critical. Three variants (split / stain / editorial). Buttons are real Links/anchors so the hero is fully server-renderable |
| `TeaDetailView` | `components/tea/TeaDetailView.tsx` | client | Below-the-fold interactive shell — review tabs, radar mode toggle, blind banners, brewing card, vendor banner, similar teas |
| `TeaCard` | `components/tea/TeaCard.tsx` | server | Grid card. Renders `teaSubtitle()` plain-English line under the name |
| `TeaBrowser` | `components/tea/TeaBrowser.tsx` | client | Filter + grid. Standard / Beginner view toggle (beginner uses friendly buckets) |
| `RadarChart` | `components/tea/RadarChart.tsx` | server | SSR-safe SVG radar. 6-axis (basic) or 12-axis (advanced) |
| `MouthfeelGrid` | `components/tea/MouthfeelGrid.tsx` | server | 2D astringent×body grid with quadrant labels |
| `Glossarized` | `components/glossary/Glossarized.tsx` | server | Wraps body prose; auto-detects glossary terms and renders each as a hover/focus popover (CSS-only) with the lay definition |
| `LibraryStatusToggle` | `components/library/LibraryStatusToggle.tsx` | client | Wishlist/owned/tried popover. Anonymous users get a "Join to keep your library" prompt instead of saving |
| `SessionLogLauncher` | `components/session/SessionLogLauncher.tsx` | client | Floating bottom-right CTA. Pathname-aware: deep link on tea pages, picker elsewhere |
| `SessionLogEditor` | `components/session/SessionLogEditor.tsx` | client | Quick + per-steep modes; vessel picker pulls from owned teaware + catalog |
| `SessionShareButton` | `components/session/SessionShareButton.tsx` | client | Toggle public link, copy URL, rotate token |
| `RecommendationsView` | `components/recommendations/RecommendationsView.tsx` | client | Three modes: Likely matches / Try different / Blind tasting. 65/35 overlap×quality blend |
| `GuidedBrew` | `components/start/GuidedBrew.tsx` | client | 5-step brewing flow: welcome → tea → gear → style → recipe + live timer |
| `StagingRoleSwitcher` | `components/staging/RoleSwitcher.tsx` | client | Floating bottom-left role-switch dropdown; only mounted in staging |
| `RebuildButton` | `components/admin/RebuildButton.tsx` | client | Hits `triggerRebuild()` server action which POSTs to Vercel deploy hook |

---

## 3 · Server actions

`requireStaff()` and `requireVendorOrAdmin()` enforce role at the
action layer in addition to RLS.

| Action | Caller role | File |
|---|---|---|
| `triggerRebuild()` | staff | `app/admin/contributor/actions.ts` |
| `setPublished({table, slug, published})` | staff | … |
| `savePost(...)` | staff | … |
| `saveVendor(...)` | staff | … |
| `saveTeaware(...)` | staff | … |
| `saveTea(...)` | staff | … |
| `setUserRole({userId, role})` | admin | … |
| `saveVendorProfile(...)` | vendor or admin | `app/admin/vendor/actions.ts` |
| `saveOwnedTeaware(...)` | vendor or admin | … |
| `deleteOwnedTeaware(...)` | vendor or admin | … |
| `setSessionShare({userTeaId, enabled, rotate})` | session owner | `app/actions/session-share.ts` |

---

## 4 · Data — Supabase tables

All in schema `public`. RLS enabled on every table. Migrations live
in `supabase/migrations/*.sql`; types regenerated to `lib/supabase/types.ts`.

### Identity

| Table | Notes |
|---|---|
| `auth.users` | Supabase-managed |
| `profiles` | 1:1 with `auth.users.id`. Fields: email, display_name, contributor_handle, role, flavor_mode, composite, theme, aligned (vivek/james), notifications (jsonb), tasted_teas (text[]). Created via `handle_new_user` trigger |

**RLS:**
- `profiles_self_read`, `profiles_self_update` — own row only
- `profiles_admin_all` — admin can do anything (uses `is_admin(uid)` security-definer fn)
- `profiles_contributors_public_read` — admin/contributor rows visible to anon

### Catalog (editor-managed)

| Table | Notes |
|---|---|
| `vendors` | slug PK, name, city, country, continent, tagline, body, rating, swatch, tea_count, founded, specialties[], url, owner_id (→ profiles), published |
| `contributors` | handle PK (vivek/james), display_name, initials, color, bio, palate, sort_order |
| `teas` | slug PK, path_slug, vendor_slug FK, name, chinese, type (enum), region, country, year, harvest, elev, age, price, rarity, gradient, swatch, **subtitle (nullable)**, summary, brewing/mouthfeel/flavor/reviews (jsonb), finish[], peak_steeps[], sessions_count, published |
| `teaware` | slug PK, name, category (enum), volume_ml, material, origin, vendor (display name; freeform), external_url, price, gradient, swatch, tagline, body, good_for[], rating, published |
| `posts` | slug PK, cat (enum), title, excerpt, author, date (display string), read_time, grad, related[] (tea slugs), body (nullable Markdown), published, published_at |

**RLS:**
- `*_public_read` — published rows readable by anon
- `*_staff_all` — admin/contributor read drafts + write
- `vendors_owner_select`/`vendors_owner_update` — vendor owner manages own row
- `teaware_vendor_owner_all` — vendor owner manages teaware where `teaware.vendor` matches owned vendor's `name`

### Member data

| Table | Notes |
|---|---|
| `user_teas` | id, user_id FK, status (enum), tea_slug (catalog ref) OR custom_name/vendor/year/type, notes, added_at. Unique (user_id, tea_slug) when catalog-linked |
| `user_teaware` | Same shape, narrower status enum |
| `sessions` | One row per brewed session. user_tea_id FK (member's library is the anchor — never raw catalog). rating, body, scale, mode (quick/per-steep), profile/mouthfeel/steeps (jsonb), brewing meta, **share_enabled + share_token** for public links |

**RLS:** owner-only via `auth.uid() = user_id`. Sessions also have
`sessions_shared_public_read` (anon read when `share_enabled = true
and share_token is not null`); the joined `user_teas` row is
readable through `user_teas_shared_session_read` for the same case.

---

## 5 · Auth + role gates

| Helper | Where | Behavior |
|---|---|---|
| `requireStaff()` | `lib/auth/require-role.ts` | Redirect to `/login?next=...` if anon; `/?msg=forbidden` if non-staff |
| `requireVendorOrAdmin()` | … | Same shape, vendor-or-admin only |
| `requireRole(roles[])` | … | Configurable |

Layout-level enforcement: `app/admin/contributor/layout.tsx` calls
`requireStaff()`; `app/admin/vendor/layout.tsx` calls
`requireVendorOrAdmin()`. Server actions defense-in-depth re-check.

Test users (seeded by `npm run test:seed:remote`): `admin@`, `contributor@`,
`vendor@`, `member@`, `user@` at `tbal-tests.local`. Credentials in
`tests/.test-users.json` (gitignored). Seed rotates passwords on every run.

---

## 6 · Content fetching

`lib/content.ts` — server-only async getters wrapping a stateless
anon Supabase client:

- `getVendors()`, `getVendorBySlug(slug)`, `getVendorByName(name)`
- `getTeas()`, `getTeaBySlug(slug)`, `getTeaByVendorAndPath(v, p)`
- `getTeaware()`, `getTeawareBySlug(slug)`
- `getPosts()`, `getPostBySlug(slug)`
- `getContributors()` (with static fallback when env unset)
- `featuredTea()` / `latestPost()` (return null when catalog empty)
- `groupVendorsByGeography()`, `groupTeawareByCategory()`, `vesselTeaware()`

**Cache strategy:** every supabase fetch passes `next: { revalidate: 60 }`
via the global fetch override on the anon client. Static routes
build with current data; ISR re-fetches every 60s. Contributor-portal
save actions also call `revalidatePath()` for instant invalidation
on edited routes. Studio / direct-DB edits show within 60 seconds.

`lib/tea-helpers.ts` — pure helpers safe in client and server:
- `teaAvg(tea)` — composite of vivek + james + members fallback
- `teaUrl(tea)` — `/tea/{vendorSlug}/{pathSlug}`
- `vendorSlugForTea(tea)` — denormalized; throws if missing
- `teaSubtitle(tea)` — newcomer-friendly tag, override-aware fallback
- `CONTINENT_ORDER`, `TEAWARE_CATEGORY_ORDER` — display constants

---

## 7 · Glossary

`lib/glossary.ts` (static) — five sections:
1. Tea types (Green / White / Yellow / Oolong / Black / Pu'er + sheng/shou/heicha / Herbal)
2. **Brewing basics** (steep, flash-pour, leaf-to-water, tannins, aromatics, extraction) — added to fix lay-user audit's #1 newcomer trap
3. Brewing methods (gongfu, western, grandpa, cold brew, kyusu)
4. Brewing vessels (gaiwan, yixing, kyusu, hohin, shiboridashi, glass teapot, mug)
5. Flavor terms + mouthfeel

`Glossarized` server-renders body prose with hover/focus popovers
on every detected term — lay definition + "Tap for full entry →".
CSS-only; no client island per term.

---

## 8 · Infrastructure

### Supabase
- Project ref: `dnfejeqvolirzepkuncv`
- Postgres 17 (matches local + hosted)
- Storage bucket: not yet wired (image pipeline open item)
- Realtime: not used (we shim `globalThis.WebSocket` in seed scripts only because the supabase-js constructor breaks without it)

### Vercel
- Team: `vivadelviveks-projects` (id `team_rNL4gdGlCq400Pge20DuJnd2`)
- Project: `two-buds-and-a-leaf` (id `prj_s8qmJ1kmcWho9PvBc50Xnfbse8pY`)
- Canonical alias: `two-buds-and-a-leaf.vercel.app`
- Build: `npm ci && npm run build`
- Auto-deploy on `main` push

### Environments
| Env var | Production | Preview | Local | Notes |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | ✓ | ✓ | Hosted project URL (or localhost in dev) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | ✓ | ✓ | Anon JWT |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | ✓ | ✓ | Server-only |
| `NEXT_PUBLIC_SITE_URL` | ✓ | ✓ | ✓ | Canonical host |
| `NEXT_PUBLIC_STAGING_ROLE_SWITCHER` | ✗ | ✓ (=1) | ✓ (=1) | **Deliberately not in production** — gates floating role switcher + `/api/staging/switch` |
| `VERCEL_DEPLOY_HOOK_URL` | (open item) | (open item) | (n/a) | Powers contributor portal "Trigger rebuild" button |

### Migrations — applied in order

| File | What it adds |
|---|---|
| `20260507000000_init_profiles_library_sessions.sql` | profiles, user_teas, user_teaware, sessions, role enum, status enums, signup trigger, RLS |
| `20260507120000_sessions_unique_per_tea.sql` | sessions(user_id, user_tea_id) unique index — for upsert |
| `20260507180000_content_catalog.sql` | vendors, contributors, teas, teaware, posts + enums + RLS |
| `20260507190000_session_share_link.sql` | sessions.share_token + share_enabled + public-read policy |
| `20260507200000_vendor_teaware_self_write.sql` | `owns_teaware_vendor()` helper + `teaware_vendor_owner_all` policy |
| `20260507210000_tea_subtitle.sql` | teas.subtitle (nullable) |

### Seeding
- `npm run seed:content` — local stack
- `npm run seed:content:remote` — hosted (reads `.env.production`)
- `npm run test:seed` — five RBAC users locally
- `npm run test:seed:remote` — five RBAC users on hosted

`scripts/seed-data.json` — frozen snapshot of original `lib/data.ts`
arrays. The seed-content script reads from it; once content lives in
the DB, edits flow through the contributor portal or Studio.

### Testing
- Playwright access-control matrix: `tests/access-control.spec.ts`
  - Routes × roles × outcome (ok / redirect-login / redirect-home / forbidden)
  - `/admin/contributor` and `/admin/vendor` both enforced
- Run: `npm run test:e2e` (requires `npm run test:seed` first)

---

## 9 · Recently shipped

Most recent first.

- **Markdown everywhere in editorial copy** — `lib/markdown.tsx` server-renders `**bold** *italic* \`code\` [link](url) ## h2 ### h3 > quote - list` for journal post body, tea hero summary, tea review body, vendor body, teaware body. `<Glossarized>` accepts `ReactNode` so term tooltips wrap each rendered paragraph. Editors get a `MarkdownHint` line under each body/summary textarea — preview is the existing `?preview=1` link in the top bar.
- **Hosted Supabase Site URL fix** — invite/reset emails now point to `two-buds-and-a-leaf.vercel.app`, not localhost (`supabase config push`)
- **Tea-detail client/server split** — hero now SSR (audit item #5)
- **Tea-card subtitles** — auto-derived plain-English tags
- **Beginner-mode toggle** on `/discover/teas`
- **Admin user management** at `/admin/contributor/users`
- **`/start` guided brewing flow** with live timer
- **Brewing-basics glossary** — the words newcomers trip on
- **`/recommendations` intro** for anon users
- **Journal heading-order** a11y fix
- **`/how-we-rate`** methodology page + home explainer with example charts
- **`/privacy` + `/terms`** + footer links
- **Multi-agent prod review** (Lighthouse + 3 personas) with prioritized punch list
- **Glossary hover popovers**
- **Plain-English homepage hero**
- **Force-dynamic + 60s revalidate** fix for stale tea pages (post-DB-edit visibility)
- **Production env vars wired** via Vercel API (token-based, non-interactive)
- **Phase E** — vendor portal at `/admin/vendor`
- **Phase D** — contributor portal at `/admin/contributor`
- **Phase C** — content catalog → Supabase, replacing static `lib/data.ts`
- **Session sharing** — public `/s/[token]` links
- **Auth gates** — library + rating writes member-only

---

## 10 · Roadmap (open items)

### Editorial / content
- Vendor body-copy depth (white2tea pressed cakes, Tea Drunk Wuyi yancha)
- 5-star vendor monoculture — publish rubric or drop the stars
- Aged-sheng storage/age annotation + brewing-ramp variation
- Sheng vs shou separation in recommendation engine (drinker audit)
- Publish a critical review (validate the "we don't suppress unflattering coverage" promise)
- `/for-vendors` accept farmer/cooperative pitches without public URL; add backlog/turnaround

### Engineering
- Drop legacy-JS polyfills (~11KiB, audit #13) — bump browserslist
- Vendor invite-link flow (admin-emailed magic link with pre-attached `owner_id`)
- Image upload pipeline (replace CSS gradient placeholders)

### Operational
- Create Vercel deploy hook → set `VERCEL_DEPLOY_HOOK_URL` env var

### Decided against
- **Category-aware radar axes** (umami/marine for Japanese green, etc.) — user direction: keep 6/12 split uniform; advanced view exists for the obsessed
