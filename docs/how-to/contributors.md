# Contributors

You're an editor on the site — James, or whoever Vivek brings
on next. You can write reviews, publish posts, edit any catalog
row, and trigger production rebuilds. You can't manage user
roles (admin-only) and you can't change a vendor's outbound URL
from the contributor portal alone (admin-side write requires
a contributor or admin session — works either way).

## Your portal landing (`/admin/contributor`)

The editorial overview. Top of the page:

- **Audience strip** — page views, sessions logged, vendor
  clickouts, click-through rate, all 30-day windows, plus a
  membership pulse strip (new today / week / month / total).
- **30-day line charts** — page views, vendor clickouts, new
  users, sessions logged.
- **Catalog tiles** — tea / post / vendor / teaware counts,
  each clickable to its index.
- **Recent drafts** — 8 most-recently-edited unpublished rows
  across every type, sorted by edit time. The fastest way back
  into in-flight work.
- **Engagement cards** — top pages, top vendor clickouts (bar
  lists), mobile vs desktop split, time on page, top journey
  (path → path) transitions.
- **Rebuild button** — top-right of the masthead. Fires a
  Vercel deploy hook to rebuild production. Use after you've
  saved a batch of edits and want them ISR-fresh now (or just
  wait an hour for revalidate).

## Editing teas (`/admin/contributor/teas`)

The catalog. Each row links to an editor with these fields:

- **Slug + path slug + vendor slug** — URL pieces. Slug is the
  legacy redirect target; path slug is the canonical
  `/tea/[vendor]/[pathSlug]` URL.
- **Name + Chinese script + type + subtype** — type is one of
  the 9 core values (Green / White / Yellow / Oolong / Black /
  Sheng Pu'er / Shou Pu'er / Dark / Herbal). Subtype is free
  text — vendor-faithful within-type label like "Yancha",
  "Longjing", "Anhua", "Bingdao". The glossary holds
  cross-references (Longjing ↔ Dragonwell etc.) — leave the
  subtype as whatever the vendor calls it.
- **Aged flag** — boolean. True for teas significantly aged
  from production date (5+ yrs white, 10+ sheng, 15+ liubao).
  False for everything else, including young white tea or
  young sheng. The recommendation engine uses this for the
  soft aged-status boundary.
- **Region / country / year / harvest / elevation / age** —
  catalog metadata. Age is human-readable ("3 years",
  "Spring 2023", "fresh").
- **Price (USD/g) + rarity (1-5)** — affordability flag and
  rarity score.
- **Hero photo** — drag-drop upload, replaces the gradient on
  cards and detail pages. JPEG/PNG/WebP up to 5 MB.
- **Gradient (CSS) + Swatch (hex)** — the fallback when no
  hero photo is set.
- **Subtitle** — optional plain-English one-liner on cards.
  Leave blank to auto-derive from type + age + top flavor
  axes.
- **Summary** — 1-2 paragraph editorial blurb. Markdown
  supported.
- **Brewing JSON** — `style`, `ratio`, `temp`, `first`, and
  optional `rinse` ("2x flash", "skip"). Only set rinse for
  shou pu'er, dark teas, and aged sheng — it's part of the
  recipe.
- **Mouthfeel JSON** — `astringent` and `bodyFull`, both 1-5.
- **Flavor JSON** — `vivek`, `james`, `members`, each a map
  of the 12 flavor axes to 0-10. Members is the
  rolling-aggregate of logged sessions; you don't usually
  edit it directly.
- **Reviews JSON (structured panels)** — Vivek and James
  each get a panel: rating (0-10 advanced, 0-5 basic), date,
  body (Markdown), session reference, scale.
- **Members review** — aggregate rating + count + date + body
  for the member-tab display.
- **Finish (comma-separated)** — descriptors like "honey,
  stone fruit, mineral".
- **Sessions count + peak steeps** — how many times someone
  has logged this, and which steep numbers tend to be best.
- **Published toggle** — flip to live.

### Markdown in editorial fields

Every body field (post body, tea summary, contributor review
body, vendor body, teaware body) supports a small Markdown
subset:

```
**bold**   *italic*   `code`   [link](url)
## h2      ### h3     > blockquote
- list item
```

The renderer is hand-rolled (`lib/markdown.tsx`) so it
integrates with `Glossarized` — every paragraph automatically
gets glossary popovers for terms in our taxonomy.

To preview before publish, use the `?preview=1` link in the
top action bar. It renders the page exactly as it will appear
to readers, including draft state.

## Editing posts (`/admin/contributor/posts`)

Same shape as teas. Form fields:

- Slug + title + category (Brewing / Culture / Origin /
  Vendor Spotlight) + author + date.
- Excerpt (1-2 sentence summary for cards + meta description).
- Read time (minutes).
- Hero image + gradient.
- Related tea slugs (comma-separated).
- Body (Markdown, long-form).
- Published + published_at.

The journal index (`/journal`) renders from this list.

## Editing vendors (`/admin/contributor/vendors`)

You can edit any vendor row, including the outbound URL. The
trigger that blocks vendor-owner URL edits explicitly allows
contributor and admin roles. If a vendor emails to update
their URL, do it here.

The form:

- Slug + name + city + country + continent.
- Tagline + body (Markdown).
- Rating (our 0-5 evaluation) + tea count + founded year.
- Specialties (comma-separated chips).
- Outbound URL (must be `https://`).
- Hero photo (square).
- Owner ID — the `auth.users.id` of the vendor user. Set
  this when onboarding a new vendor partner.
- Published.

## Editing teaware (`/admin/contributor/teaware`)

Same shape as the vendor-side teaware form, but you can edit
any teaware row regardless of which vendor owns it. Useful
for off-catalog brands (Fellow, Acaia) that don't have a
vendor user account.

## Drafting workflow

1. Create or edit a row with `published: false`.
2. Use the `?preview=1` link in the top action bar to render
   the live page as a draft.
3. Iterate.
4. Flip published to true.
5. Click Rebuild on the contributor overview if you want it
   to land fresh on the static cache immediately. Otherwise
   wait for the 1-hour ISR revalidate.

## What you can't do

- **Manage user roles.** That's `/admin/contributor/users`
  which is admin-only. Contributors can't promote themselves
  or others.
- **Promote yourself.** Even if you somehow gained access to
  the user-management UI, the database trigger blocks role
  changes for non-admin callers.
- **See another user's library or session log.** RLS gates
  reads to the row owner. Aggregate session counts on tea
  pages are fine; per-user data is not visible.
- **Bypass the privacy banner or the signup checkbox.** Both
  are frontend conveniences but the consent log + version
  pinning is a real audit trail; don't manually flip the
  acceptance dates in the database.
