// Affiliate / outbound redirect. Every "Visit shop" link on the site
// goes through here so the click can be logged + UTM-tagged before the
// 302 to the vendor's external URL.
//
// Status code: 302 Found (temporary) — vendor URLs change over time
// and we don't want them cached forever. The slug → URL map *is*
// stable enough for SEO; we don't want crawlers indexing /go/[vendor]
// as a canonical URL anyway.

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getVendorBySlug } from "@/lib/content";
import type { Database } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const BOT_RE = /bot|crawler|spider|preview|headless|phantom|google|bing|yandex|baidu/i;

function uaClass(ua: string | null): string {
  if (!ua) return "unknown";
  if (BOT_RE.test(ua)) return "bot";
  if (/Mobile|iPhone|iPad|Android/i.test(ua)) return "mobile";
  return "desktop";
}

function refererHost(referer: string | null): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).hostname || null;
  } catch {
    return null;
  }
}

function refererPath(referer: string | null): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).pathname || null;
  } catch {
    return null;
  }
}

async function logClick(
  vendorSlug: string,
  req: NextRequest,
  ua: string | null,
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  const cls = uaClass(ua);
  if (cls === "bot") return; // bots aren't conversions
  const sb = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const referer = req.headers.get("referer");
  const country = req.headers.get("x-vercel-ip-country");
  await sb.from("vendor_clicks").insert({
    vendor_slug: vendorSlug,
    source_path: refererPath(referer),
    referrer_host: refererHost(referer),
    ua_class: cls,
    country: country || null,
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { vendor: string } },
) {
  const vendor = await getVendorBySlug(params.vendor);
  if (!vendor || !vendor.url) {
    // Send unknown vendor to the atlas with a small flag for analytics.
    return NextResponse.redirect(
      new URL("/discover/vendors?bad=" + encodeURIComponent(params.vendor),
        req.url),
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

  // Best-effort log. Errors must never block the redirect — the user
  // came here to leave the site, not to wait on our analytics row.
  try {
    await logClick(vendor.slug, req, req.headers.get("user-agent"));
  } catch {
    /* swallow — analytics never gates the redirect */
  }

  return NextResponse.redirect(target.toString(), 302);
}
