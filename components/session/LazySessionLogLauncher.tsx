"use client";

import dynamic from "next/dynamic";
import type { Tea } from "@/lib/types";

// Tiny client wrapper that defers the SessionLogLauncher bundle off
// the critical path. The launcher is a floating CTA (never the LCP
// element, not interactive until clicked), so its ~10 KB of member-
// context + picker code shouldn't ship in the initial payload of
// every page.
//
// `ssr: false` is required from a client boundary in Next.js 14 App
// Router — server components can't use it. The wrapper exists solely
// to give us that boundary; Shell stays a server component.

const SessionLogLauncher = dynamic(
  () =>
    import("@/components/session/SessionLogLauncher").then(
      (m) => m.SessionLogLauncher,
    ),
  { ssr: false, loading: () => null },
);

export function LazySessionLogLauncher({ teas }: { teas: Tea[] }) {
  return <SessionLogLauncher teas={teas} />;
}
