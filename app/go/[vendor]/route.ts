// Affiliate / outbound redirect — every "Visit shop" link on the site
// goes through here so we can (eventually) log click-throughs and tag
// inbound traffic with our referral code.
//
// Today this just looks up the vendor's URL in lib/data.ts and 302s.
// Phase 6: insert a row into Postgres `referral_clicks` before the
// redirect (vendor, slug, ts, member-id-if-logged-in, UA, referer).
//
// Status code: 302 Found (temporary) — the destination URL may change
// per-vendor over time and we don't want it cached forever by browsers
// or proxies. The slug → URL map *is* stable enough for SEO; we don't
// want crawlers indexing /go/[vendor] as a canonical URL anyway.

import { NextResponse, type NextRequest } from "next/server";
import { vendorBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

export function GET(
  _req: NextRequest,
  { params }: { params: { vendor: string } },
) {
  const vendor = vendorBySlug(params.vendor);
  if (!vendor || !vendor.url) {
    // Send unknown vendor to the atlas with a small flag for analytics.
    return NextResponse.redirect(
      new URL("/discover/vendors?bad=" + encodeURIComponent(params.vendor),
        _req.url),
      302,
    );
  }

  // Append a UTM tag so vendors can attribute traffic back to us. Done
  // here rather than baked into vendor.url so the editorial table stays
  // clean.
  const target = new URL(vendor.url);
  if (!target.searchParams.has("utm_source")) {
    target.searchParams.set("utm_source", "twobudsandaleaf");
    target.searchParams.set("utm_medium", "referral");
    target.searchParams.set("utm_campaign", "atlas");
  }

  // Phase 6 hook: log the click here. For now no-op.
  // await db.insert(referral_clicks).values({ vendor: vendor.slug, ts: new Date() });

  return NextResponse.redirect(target.toString(), 302);
}
