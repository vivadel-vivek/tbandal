// /tea/[vendor]/ — handles two shapes at the same Next.js routing level:
//
//   1. A legacy bare slug like /tea/gaba-shen → 308 permanent-redirect to
//      the canonical /tea/[vendor]/[pathSlug] using teaUrl().
//   2. A vendor slug like /tea/white2tea → 308 permanent-redirect to the
//      vendor profile at /discover/vendors/[slug] (the canonical home for
//      a vendor).
//
// Anything else 404s. We can't have a sibling `[slug]/` folder because
// Next.js enforces a single dynamic param name per route level, so both
// behaviours live here and dispatch on the data.

import { notFound, permanentRedirect } from "next/navigation";
import { teaBySlug, teaUrl, vendorBySlug } from "@/lib/data";

// Default dynamic rendering — `force-static` would zero out searchParams
// and break the ?blind=1 (and any future) query-string forwarding. The
// redirect itself is cheap; we just need real searchParams in the handler.

export default function TeaVendorOrLegacySlug({
  params,
  searchParams,
}: {
  params: { vendor: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // Legacy tea slug? Redirect to the canonical /tea/[vendor]/[pathSlug],
  // preserving any inbound query string (e.g. ?blind=1).
  const legacyTea = teaBySlug(params.vendor);
  if (legacyTea) {
    const dest = teaUrl(legacyTea);
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (typeof v === "string") qs.set(k, v);
      else if (Array.isArray(v)) qs.set(k, v[0] ?? "");
    }
    const tail = qs.toString();
    permanentRedirect(tail ? `${dest}?${tail}` : dest);
  }

  // Real vendor slug? Send to the vendor profile.
  const vendor = vendorBySlug(params.vendor);
  if (vendor) {
    permanentRedirect(`/discover/vendors/${vendor.slug}`);
  }

  notFound();
}
