// Affiliate / outbound redirect for teaware items. Mirrors
// /go/[vendor]/route.ts but resolves through the Teaware catalog —
// when the item is sold by a known internal Vendor, we route through
// that vendor's URL with utm_campaign=teaware so referrals are
// correctly attributed; when it's an external brand (kettles, scales)
// we use the item's externalUrl directly.

import { NextResponse, type NextRequest } from "next/server";
import { teawareBySlug, vendorByName } from "@/lib/data";

export const dynamic = "force-dynamic";

export function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const item = teawareBySlug(params.slug);
  if (!item) {
    return NextResponse.redirect(
      new URL(
        "/discover/teaware?bad=" + encodeURIComponent(params.slug),
        req.url,
      ),
      302,
    );
  }

  // Prefer the internal Vendor URL (so we keep one affiliate path) and
  // fall back to the item's externalUrl when the brand is outside the
  // vendor atlas.
  const internal = vendorByName(item.vendor);
  const dest = internal?.url ?? item.externalUrl;
  if (!dest) {
    return NextResponse.redirect(
      new URL("/discover/teaware/" + item.slug, req.url),
      302,
    );
  }

  const target = new URL(dest);
  if (!target.searchParams.has("utm_source")) {
    target.searchParams.set("utm_source", "twobudsandaleaf");
    target.searchParams.set("utm_medium", "referral");
    target.searchParams.set("utm_campaign", "teaware");
    // Per-item attribution so vendors can see which catalog page drove
    // a click — flagged by the experienced-drinker audit.
    target.searchParams.set("utm_content", item.slug);
  }

  return NextResponse.redirect(target.toString(), 302);
}
