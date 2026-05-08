"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Cookieless page-view beacon. Fires once per pathname change with
// navigator.sendBeacon (best-effort, non-blocking) to /api/track. The
// route handler stores a row in page_views; we never set a cookie or
// touch sessionStorage here.
//
// Skips admin/auth surfaces and bots — operator views aren't readership,
// and the route handler also drops bot UA strings server-side.
//
// Mounted in the root layout below the <body> so every navigation in
// the App Router fires the effect.

const SKIP_PREFIXES = ["/admin", "/auth", "/api", "/_next"];

export function PageViewBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return;

    const payload = JSON.stringify({ path: pathname });

    // sendBeacon is fire-and-forget; the browser delivers it even if
    // the page unloads mid-flight. Modern browsers all support it,
    // but fall back to fetch{keepalive:true} just in case.
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/track", blob);
        return;
      }
    } catch {
      /* fall through */
    }
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
