# Admins

You're Vivek (or whoever inherits the admin role). You have
everything a contributor can do plus user role management,
infrastructure access, and a small set of out-of-band scripts
for day-to-day operations.

## What's admin-only

Strictly speaking, the difference between contributor and admin
is enforced in three places:

1. **The user-management UI** (`/admin/contributor/users`). The
   page is gated by `requireRole(["admin"])` — contributors
   can't reach it.
2. **The `setUserRole` server action.** Same gate, plus it
   refuses self-edits ("you can't change your own role; ask
   another admin").
3. **The `profiles_prevent_role_escalation` database trigger.**
   The defence-in-depth layer. Even if a contributor crafted a
   raw PostgREST PATCH against `profiles.role`, the trigger
   rejects it. Only the service role or an admin caller can
   change a role.

Everything else (catalog edits, posts, vendor URL changes,
publishing, rebuild trigger) is open to both contributors and
admins.

## Managing users (`/admin/contributor/users`)

The list of every signed-up profile. Each row has:

- Display name + email + contributor handle.
- Role dropdown — admin / contributor / vendor / member / user.
- Created date.

Promoting someone to vendor: also remember to set
`vendors.owner_id` on the vendor row they should control. The
admin-side vendor edit form
(`/admin/contributor/vendors/[slug]`) has an owner picker.

## Inviting staff (script)

`scripts/invite-staff.mjs` is the canonical onboarding script
for new contributors and admins. Run with:

```
node scripts/invite-staff.mjs
```

The script reads `.env.production` for the Supabase URL +
service-role key, then for each entry in the inline `STAFF`
array:

- If no `auth.users` row exists for the email →
  `inviteUserByEmail` (creates the account + emails a magic
  link).
- If an account exists →
  `resetPasswordForEmail` (queues a recovery email so they can
  pick a new password).

After either path, it writes the role + display name +
contributor handle to the `profiles` row.

The redirect destination is `${SITE_URL}/auth/reset?next=/admin`
which lands them on the set-new-password form, then forwards to
`/admin` (which dispatches by role).

To onboard a new contributor: edit the `STAFF` array in the
script and run it. Idempotent — already-existing users just
get a fresh password reset.

## Vendor URL changes

When a vendor emails to change their outbound URL (the
destination behind `/go/[slug]`):

1. Confirm via a known channel (the email on file or a known
   phone number). This is the most attractive target on the
   site for phishing — somebody compromising a vendor account
   would want to flip their URL to a phish destination, which
   is exactly why the vendor self-edit form blocks it.
2. Edit the vendor row at
   `/admin/contributor/vendors/[slug]` — the URL field is
   open to admin and contributor. Must start with `https://`
   (the form validates, the database has a CHECK constraint).
3. Save. The new URL is live on the next ISR revalidation.

If the change is suspicious, do not proceed. The vendor's
existing URL keeps working until you act.

## Image management

Two scripts for bulk image operations:

- `scripts/seed-images.mjs` — seeds Unsplash hero photos
  across vendors / teas / teaware / posts. Idempotent: only
  fills rows where `image_url` is null. Pass `--force` to
  overwrite. Use after adding a new vendor or tea row when
  you don't have your own photography ready.
- `scripts/seed-liubao.mjs` — example one-shot seed for a
  single tea row. Pattern to copy when you want to insert a
  catalog row from script rather than the admin form.

For per-row uploads, use the `ImageUpload` widget in the
appropriate edit form. All uploads land in Supabase Storage
under the `editorial` bucket; avatars use the `avatars`
bucket. RLS gates writes to staff/vendor for editorial and to
the user themselves for avatars.

## Triggering a rebuild

Two options:

- **The Rebuild button** at the top of `/admin/contributor`.
  Calls the `triggerRebuild` server action, which POSTs to
  the Vercel deploy hook. The new content goes live in 1-3
  minutes.
- Setting `revalidate: 60` on most fetches means content
  drifts in within 60s of an edit anyway. Rebuild is for
  "I want this NOW".

## CLI publishing API

Two endpoints accept content via `POST` with a bearer-token API key:

- `POST /api/v1/teas` — upsert a tea row by slug.
- `POST /api/v1/posts` — upsert a journal post by slug.

### Getting a key

`/member/settings` → "API keys" card (only visible to admin and
contributor accounts). Name the key (e.g. "MacBook", "CI"),
click Create. The raw key is shown **once** in the format
`tbl_<32-byte-base64url>`. Copy it into a password manager or
shell env immediately — there's no way to recover it later.

### Example: push a tea

```bash
curl -X POST https://two-buds-and-a-leaf.vercel.app/api/v1/teas \
  -H "Authorization: Bearer $TBL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "mengku-2018-shen",
    "path_slug": "mengku-2018-shen-puer",
    "vendor_slug": "yunnan-sourcing",
    "name": "Mengku 2018 Sheng",
    "type": "Sheng Pu'\''er",
    "subtype": "Mengku",
    "aged": false,
    "region": "Mengku, Yunnan",
    "country": "China",
    "year": "Spring 2018",
    "harvest": "Spring",
    "elev": 1800,
    "age": "7 years",
    "price": 0.55,
    "rarity": 3,
    "gradient": "linear-gradient(135deg,#9c8458,#3f2d1a)",
    "swatch": "#3f2d1a",
    "summary": "Body text. Markdown supported.",
    "brewing": {"style":"Gongfu","ratio":"5g/100ml","temp":"95°C","first":"10s"},
    "mouthfeel": {"astringent": 3, "bodyFull": 6},
    "flavor": {
      "vivek":   {"floral":2,"fruity":5,"sweet":4,"honey":3,"nutty":1,"roasted":0,"woody":4,"earthy":3,"mineral":5,"marine":0,"vegetal":2,"spicy":1},
      "james":   {"floral":1,"fruity":4,"sweet":3,"honey":2,"nutty":1,"roasted":0,"woody":5,"earthy":4,"mineral":6,"marine":0,"vegetal":1,"spicy":2},
      "members": {"floral":0,"fruity":0,"sweet":0,"honey":0,"nutty":0,"roasted":0,"woody":0,"earthy":0,"mineral":0,"marine":0,"vegetal":0,"spicy":0}
    },
    "reviews": {
      "vivek":   {"rating":8.4,"body":"Body text. Markdown.","date":"2026-05-11","scale":"advanced"},
      "james":   {"rating":8.1,"body":"Body text.","date":"2026-05-11","scale":"advanced"},
      "members": {"rating":0,"count":0,"body":"","date":""}
    },
    "finish": ["honey", "mineral", "long"],
    "published": true
  }'
```

The endpoint upserts by `slug` — if the row exists, the call
updates it in place; otherwise creates fresh. On success:
`200 {"ok":true,"slug":"…"}`. On bad data: `422` with the
Postgres error string in `message`.

### Example: push a journal post

```bash
curl -X POST https://two-buds-and-a-leaf.vercel.app/api/v1/posts \
  -H "Authorization: Bearer $TBL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "third-steep",
    "cat": "Brewing",
    "title": "On the third steep",
    "excerpt": "Where the tea finally settles in.",
    "author": "Vivek",
    "date": "May 11, 2026",
    "read_time": 7,
    "grad": "linear-gradient(135deg,#722F37 0%,#A68B3D 100%)",
    "related": ["gaba-shen", "tieguanyin"],
    "body": "Long-form Markdown body…",
    "published": true
  }'
```

### Revoking a key

Same settings panel. The Revoke button sets `revoked_at` on the
row (no delete — kept for audit). Any subsequent API call with
that key gets `401`. Revoked keys appear in a collapsed
"Revoked" section in the panel.

### Security notes

- Keys are 256 bits of entropy and hashed (sha256) at rest. The
  database stores `hashed_key` + the first 8 chars of the body
  (`prefix`) only.
- The auth check runs as service-role to look up the key by
  hash. It then verifies the owner's `profiles.role` is admin
  or contributor — non-staff keys get 401 even if otherwise
  valid.
- Each successful call bumps `last_used_at` on the key row, so
  the settings panel can tell you which keys are actually in
  use (and which to clean up).
- No rate limiting yet — see the operational gaps section
  below.

## Database operations

Migrations live in `supabase/migrations/`. To apply a new
migration to production:

```
npx supabase db push
```

You'll be prompted to confirm. The script reads `.env` and
the linked `supabase/.temp/project-ref` to know which project
to push to.

For one-off SQL queries, use the Supabase Studio at
https://supabase.com/dashboard/project/[ref]. Service-role
queries should never be run from the browser studio against
production unless you know exactly what you're doing — every
RLS policy is bypassable from there.

## Policy version bumps

When you materially edit `/privacy` or `/terms`:

1. Edit the page content (`app/privacy/page.tsx` or
   `app/terms/page.tsx`).
2. Bump the corresponding constant in `lib/policy.ts` —
   date-stamp form, `2026-XX-XX`. Bump only one, both, or
   neither based on which page changed.
3. Find users on the old version:

   ```sql
   select id, email
   from profiles
   where privacy_version != '2026-XX-XX';
   ```

4. Send them a re-acceptance email through whatever email
   service you've wired up by then (we don't have one yet —
   noted as a gap).
5. Optionally implement a "re-accept on next sign-in" gate
   that blocks the member dashboard until they tick the new
   acceptance checkbox. (Not yet implemented.)

The `consent_log` table is append-only and indexed on
`(document, version)`, so historical accepts are queryable
even after the policy revision.

## Operational gaps to know about

These are noted in the SPEC's roadmap but worth flagging here:

- **No admin audit log.** When you flip someone's role,
  trigger a rebuild, or unpublish a tea, nothing is written
  to a separate audit table. The `profiles.updated_at`
  timestamp is the only trail.
- **No automatic email service.** Supabase sends auth emails
  (signup confirmation, password reset). For policy-revision
  notifications and member emails, you'd need to wire up
  Resend or similar.
- **`/api/track` has no rate limiting.** Anyone can pump
  rows into `page_views` if they want to. Cheap to fix when
  it matters.
- **`consent_log` cascades on user deletion.** If a member
  deletes their account, their consent records vanish. To
  retain a pseudonymized audit trail post-deletion, switch
  the FK to `set null`.
- **Next.js has 1 high-severity CVE.** `npm audit` flags
  it; fix is `next@16.2.6` (semver-major). Test before
  shipping.

## Frozen state (2026-05-08)

This documentation is frozen as of 2026-05-08. The site
shipped a substantial run of features and is intentionally on
a one-month build pause to focus on writing reviews. When the
freeze lifts, the natural priority order is:

1. Pruning audit's three cuts (StagingRoleSwitcher,
   journey/time-on-page dashboard cards, session sharing) if
   the editorial brain is being distracted by them.
2. Privacy policy "two cookies" copy update to disclose
   localStorage and the analytics tables accurately.
3. Vendor portal proof-of-audience screenshot on
   `/for-vendors` once you have a real case study to
   anonymize.
4. Email-on-policy-change notification flow.
5. Next.js upgrade.

But none of those move until after the content velocity
problem is solved.
