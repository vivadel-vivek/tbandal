# Vendors

You sell tea or teaware. We've reviewed something you make, or
we've onboarded you as an atlas-listed partner. You have a
dedicated portal where you can edit your storefront page, see
your affiliate clickout numbers, and manage your teaware
listings.

## Getting an account

You need an admin to invite you. The invite flow:

1. We email you a magic link from Supabase.
2. You click it and land on `/auth/reset` to pick a password.
3. We attach your user ID to the `vendors.owner_id` column for
   the row you control. From that point on, RLS gates your
   portal access to the slugs you own.

You can't self-register as a vendor. The `signup` form creates a
default `user` role; only an admin can promote you to `vendor`.

## Your portal landing (`/admin/vendor`)

For each vendor row you own, a card with:

- Your name, city, country, and live/draft status.
- A 5-tile metrics strip: teas reviewed, teaware listed, page
  views in the last 30 days, vendor clickouts in the last 30
  days (with all-time total), and click-through rate.
- A pair of 30-day mini line charts when there's data: page
  views on your detail page, and `/go/[vendor]` clickouts.
- An "Edit profile →" button.
- Quick links to "See teas" (read-only) and "Manage teaware".

The analytics are RLS-isolated to your own slug. You see your
own numbers; you can't see other vendors'. We can't share them
upstream either.

## Editing your storefront (`/admin/vendor/profile`)

What you can edit yourself:

- **City / Country / Continent** — atlas grouping.
- **Tagline** — the one-liner under your name on cards.
- **Body** — 1-2 paragraph editorial copy in Markdown
  (`**bold**`, `*italic*`, `[link](url)`, `## h2`, lists, blockquotes).
- **Founded year** — for the "est. 2014" line.
- **Specialties** — comma-separated chips like "Pu'er, Aged
  oolong, Single-origin".
- **Hero photo** — square aspect, uploaded via drag-drop or
  file-picker. Replaces the colored swatch tile on your detail
  page. JPEG, PNG, or WebP up to 5 MB. (Note: by default we may
  have seeded a placeholder Unsplash photo when you were added —
  swap it out for your own as soon as possible.)
- **Swatch (hex)** — the accent color used as a fallback when
  you don't have a photo. Pick one that matches your branding.

What you **can't** edit yourself:

- **Outbound URL** — the destination behind `/go/[your-slug]`.
  This is admin-only by design. If a vendor account is ever
  compromised, we don't want the affiliate redirect turning
  into a phishing destination. To change your URL, email
  hello@twobudsandaleaf.com and an admin will update it within
  a day or two.

## Managing teaware (`/admin/vendor/teaware`)

If you carry teaware (gaiwans, kettles, scales, pitchers), you
can list them here. The form takes:

- Slug + name + category (Gaiwan / Teapot / Kyusu / Pitcher /
  Cup / Kettle / Scale / Strainer / Other).
- Volume in ml, material, origin region.
- External URL (for off-catalog brands like Fellow Stagg or
  Acaia where the affiliate link goes elsewhere).
- Price (USD).
- Tagline + body (Markdown).
- "Good for" tea types — multi-select.
- Hero photo + gradient + swatch (same widget as your vendor
  hero).
- 0-5 our-rating (this is your own — contributor reviews are
  separate).

You can mark a teaware row as draft / published.

## Reviews

Tea reviews are written by James and Vivek — vendors don't
write their own reviews, and we don't accept paid placement.
That's a strict policy. If we publish a critical review of one
of your teas, you get a 48-hour pre-publish window with right
of reply on the same page. Email hello@ if you have a draft of
a response.

## Affiliate mechanics

Every "Visit shop" button on the site routes through
`/go/[your-slug]`, which:

1. Logs a row in `vendor_clicks` (timestamp, your slug,
   referring page, country, mobile/desktop class — no IP, no
   user identifier).
2. Adds UTM params: `utm_source=twobudsandaleaf`,
   `utm_medium=referral`, `utm_campaign=atlas`.
3. 302-redirects to your URL.

The UTM tags mean you can attribute referrals in your own
analytics. Your dashboard shows the total volume; the per-click
data isn't available to you (that would be too granular for
useful action — if you want it, ask).

## Privacy

We don't share your dashboard data with anyone, including other
vendors. We don't sell it. We may aggregate clickouts across all
vendors into a single number for our own roadmap (e.g.
"affiliate revenue this month"), but never per-vendor outside
your portal.
