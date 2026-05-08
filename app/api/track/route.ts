import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Cookieless page-view beacon endpoint. Two-call protocol:
//
//   POST { id, path, referrer_path }     → insert a new page_views row
//   POST { id, duration_ms }             → update that row with the
//                                           time the visitor spent on
//                                           the page
//
// Writes go through the service-role client so RLS doesn't block
// anonymous visitors. We log no PII — just the path, a referrer
// hostname / within-site path, a coarse UA class, and the Vercel
// country header.
//
// The route is best-effort: it always returns 204 to the client so a
// failed insert/update never breaks a page transition or visitor
// journey. Errors are swallowed; observability lives in the dashboards.

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

type Payload = {
  id?: string;
  path?: string;
  referrer_path?: string | null;
  duration_ms?: number;
};

export async function POST(request: Request) {
  let body: Payload = {};
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  if (!body.id || typeof body.id !== "string") {
    return new NextResponse(null, { status: 204 });
  }
  // UUID-ish guard so a malicious sender can't churn arbitrary keys.
  if (body.id.length > 64) return new NextResponse(null, { status: 204 });

  const sb = svc();
  if (!sb) return new NextResponse(null, { status: 204 });

  // Duration update — second call. Patch the existing row by id.
  if (typeof body.duration_ms === "number") {
    const dur = Math.max(0, Math.min(60 * 60 * 1000, Math.floor(body.duration_ms)));
    await sb
      .from("page_views")
      .update({ duration_ms: dur })
      .eq("id", body.id);
    return new NextResponse(null, { status: 204 });
  }

  // Initial view insert.
  const path = (body.path ?? "/").slice(0, 200);
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
    return new NextResponse(null, { status: 204 });
  }

  const referrerPath =
    typeof body.referrer_path === "string"
      ? body.referrer_path.slice(0, 200)
      : null;

  await sb.from("page_views").insert({
    id: body.id,
    path,
    referrer_host: refererHost(ref),
    referrer_path: referrerPath,
    ua_class,
    country: country || null,
  });

  return new NextResponse(null, { status: 204 });
}
