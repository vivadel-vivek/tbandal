"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Cookieless analytics beacon. Two calls per visit:
//
//   1. on mount: { id, path, referrer_path } → server inserts a row
//      in page_views with duration_ms NULL.
//   2. on cleanup OR pagehide: { id, duration_ms } → server updates
//      the same row by id with how long the visitor stayed.
//
// `id` is a per-page UUID generated client-side. It never persists
// — once the visit ends and the duration is patched in, the id has
// done its job. No cookies, no sessionStorage; if the visitor opens
// two tabs they're two independent rows.
//
// Skips admin/auth surfaces (operator views aren't readership) and
// the route handler also drops bot UA strings server-side.

const SKIP_PREFIXES = ["/admin", "/auth", "/api", "/_next"];

function shouldSkip(path: string | null): boolean {
  if (!path) return true;
  return SKIP_PREFIXES.some((p) => path.startsWith(p));
}

function send(payload: object) {
  const body = JSON.stringify(payload);
  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon("/api/track", blob)) return;
    }
  } catch {
    /* fall through to fetch */
  }
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function PageViewBeacon() {
  const pathname = usePathname();
  // Hold the previous within-site pathname across navigations so we
  // can record it as referrer_path on the next view. Document.referrer
  // doesn't update on App Router transitions, so we track it ourselves.
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (shouldSkip(pathname)) {
      lastPathRef.current = pathname; // still update so a hidden→public hop sets referrer
      return;
    }

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const start =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const referrerPath = lastPathRef.current;
    lastPathRef.current = pathname;

    // Initial insert.
    send({ id, path: pathname, referrer_path: referrerPath });

    // Patch duration on exit. Guard so we don't double-fire when both
    // pagehide AND React cleanup run (tab close + StrictMode).
    let sent = false;
    const sendDuration = () => {
      if (sent) return;
      sent = true;
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const duration = Math.max(0, Math.floor(now - start));
      send({ id, duration_ms: duration });
    };

    const onPagehide = () => sendDuration();
    window.addEventListener("pagehide", onPagehide);
    // visibilitychange fires when the tab is backgrounded — most
    // beacons consider that "exit" since the visitor might never come
    // back. We piggyback on it for accurate duration reporting.
    const onVisibility = () => {
      if (document.visibilityState === "hidden") sendDuration();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pagehide", onPagehide);
      document.removeEventListener("visibilitychange", onVisibility);
      sendDuration();
    };
  }, [pathname]);

  return null;
}
