# Members

Free signed-in tier. Everything a reader can see plus a personal
library, session logs, recommendations that learn your palate, and
session sharing.

## Signing up

`/signup`. Email and password (8+ characters), plus a required
checkbox confirming you've read the privacy policy and terms of
use. Both link out so you can read them in a new tab without
losing the form.

What gets recorded the moment you click Sign up:

- A `profiles` row with your default member preferences (palate
  alignment defaults to James, theme to "auto", flavor mode to
  "basic").
- A pair of `consent_log` entries pinning the version of `/privacy`
  and `/terms` you accepted (currently `2026-05-08`).
- An auth session in your browser (a single first-party cookie,
  required for sign-in to work).

If we ever materially change either policy we'll email you and ask
you to re-accept.

## Your profile (`/member`)

The dashboard. Three things live here:

- Your **palate radar** — built from teas you've rated. Falls back
  to your aligned contributor's palate signature if you haven't
  rated anything yet.
- An **alignment switch** to flip between James's and Vivek's
  palate as your cold-start signal.
- Your **ratings list** — every tea you've logged a session for.

Three buttons at the top: **Library**, **Settings**, and (if
you're staff or a vendor) **Editor →** or **Vendor portal →**.

## Library (`/member/library`)

Your saved teas and teaware. Each row has a status:

- **Wishlist** — teas you want to try.
- **Owned** — teas you have at home now.
- **Tried** — teas you've drunk through.
- **Retired** — teas you've finished or given away.

You can also add **custom rows** for teas we don't have in the
catalog. They live in your library only and don't show up to other
users.

Adding a tea: click "Add to library" on any tea-detail page, or
use the floating "Log a session" button to pick a tea from the
catalog with a search-as-you-type picker.

## Logging a session (`/tea/[vendor]/[slug]/log`)

The serious feature. For any tea (catalog or custom) you can log:

- Date, vessel, water source, leaf weight, water volume.
- Brewing ramp (start time + per-steep increment + temperature
  per steep).
- Mouthfeel (astringency 1-5, body 1-5).
- Flavor profile across the 6 or 12 axes.
- A 0-10 (Advanced) or 0-5 (Basic) overall rating.
- A free-form body in Markdown.

Sessions feed back into the recommendation engine. Five sessions
in and your radar starts replacing your contributor alignment.

### Sharing a session

Each session has a Share toggle. Flipping it on generates a token
under `/s/[token]` that you can paste into a message, email, or
journal entry. Anyone with the link can read the session — public
read via the token, no authentication needed. You can rotate the
token at any time, which invalidates the previous link.

## Recommendations (`/recommendations`)

Three modes:

- **Likely matches** — the engine's primary recommendation. High
  cosine overlap between the tea's flavor profile and your target
  palate, blended 65/35 with the tea's quality signal. Soft type
  boundary: teas of types you haven't rated take a 40% haircut.
  Soft aged-status nudge: when >70% of your rating weight leans
  one way, opposite-aged candidates get a 15% haircut.
- **Try something different** — the inverse list. Surfaces unseen
  types and unfamiliar flavor shapes. Useful when you want to
  widen the map.
- **Blind tasting** — picks 4 candidates and hides their reviews
  + ratings until you've rated each one yourself. Disables the
  reviews tab on tea-detail pages until you opt back in.

## Settings (`/member/settings`)

Six cards:

- **Identity** — display name, contributor handle (for
  collaborators), profile photo upload (replaces the letter chip
  in the header), email.
- **Notifications** — weekly digest, new teas, sample requests,
  replies. Stored in `profiles.notifications` JSONB.
- **Display options** — flavor mode (Blind / Basic / Advanced),
  composite palate toggle, theme.
- **Tasted teas** — the un-blind list when you're in Blind mode.
- **Policy acceptance** — read-only audit of which versions of
  `/privacy` and `/terms` you accepted, with dates.
- **Account** — sign out, delete account.

Avatar upload uses the same image pipeline as the rest of the
site — JPEG, PNG, or WebP up to 5 MB. Uploaded immediately to
Supabase Storage; you'll see the new photo in the header on the
next render.

## What you can't do

- See other members' libraries or session logs (RLS blocks reads
  to anyone but the row owner).
- Edit catalog rows. That's the contributor portal's job.
- Edit a vendor's profile, even if you have a relationship with
  them. Vendor self-edit requires the `vendor` role.

## When you've outgrown the free tier

You haven't. There's no paid tier yet. The "Member" tier in the
codebase (`role = 'member'`) is reserved for a future paid
feature set we haven't built — for now, free signup gets you
everything documented above (`role = 'user'`).
