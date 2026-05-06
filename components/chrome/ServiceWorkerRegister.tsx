"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js once on first paint. Mounted from app/layout.tsx so
 * every route shares the same registration. We keep this in its own
 * tiny client component so the layout itself can stay an RSC.
 *
 * Only runs in production — dev mode would constantly re-register on
 * fast-refresh and the SW's static-asset cache would mask Next's HMR.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Defer registration past first paint so it doesn't compete with
    // hydration for main-thread time.
    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {
          // Swallow — a failed SW registration shouldn't break the page.
          // Most failures here are localhost / non-HTTPS / private mode.
        });
    };

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
