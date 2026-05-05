"use client";

import type { ReactNode } from "react";
import { MemberProvider } from "@/contexts/MemberContext";
import { TweaksProvider } from "@/contexts/TweaksContext";

/**
 * Thin client island that mounts the persistent provider tree (Member,
 * Tweaks) and renders its children verbatim. Children passed in are RSC
 * payload from the parent server component, so they keep all SSG / RSC
 * benefits — only the providers themselves are in the client bundle.
 *
 * Used inside the server-side <Shell> in app/layout.tsx so we don't
 * push the entire app into the client component graph.
 */
export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <TweaksProvider>
      <MemberProvider>{children}</MemberProvider>
    </TweaksProvider>
  );
}
