import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Cookieless page-view beacon endpoint. The PageViewBeacon client
// component fires `navigator.sendBeacon('/api/track', { path })` on
// every pathname change; this handler turns that into a row in
// public.page_views.
//
// Writes go through the service-role client so RLS doesn't block
// anonymous visitors. We log no PII — just the path, a referrer
// hostname (without the query string), a coarse UA class, and the
// Vercel country header (network metadata).
//
// Filtering happens in two places: client-side (admin paths skip the
// beacon) and here (we ignore obviously bot-y user agents). The route
// is best-effort and never throws to the client; analytics failures
// must never break a page load.

export const runtime = "nodejs";
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

function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: Request) {
  let body: { path?: string } = {};
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  const path = (body.path ?? "/").slice(0, 200);

  // Skip non-page paths and admin surfaces — those are operator views.
  if (
    path.startsWith("/admin") ||
    path.startsWith("/api") ||
    path.startsWith("/auth") ||
    path.startsWith("/_next")
  ) {
    return new NextResponse(null, { status: 204 });
  }

  const ua = request.headers.get("user-agent");
  const ref = request.headers.get("referer");
  const country = request.headers.get("x-vercel-ip-country");

  const ua_class = uaClass(ua);
  if (ua_class === "bot") {
    // Drop bot traffic at the front door — we never want it in the
    // dashboard charts or in storage.
    return new NextResponse(null, { status: 204 });
  }

  const sb = svc();
  if (!sb) return new NextResponse(null, { status: 204 });

  // Fire and forget. We don't await the network round-trip from the
  // client's perspective — the response goes back as 204 either way.
  await sb.from("page_views").insert({
    path,
    referrer_host: refererHost(ref),
    ua_class,
    country: country || null,
  });

  return new NextResponse(null, { status: 204 });
}
