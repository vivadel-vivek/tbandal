"use client";

import type { ReactNode } from "react";
import { MemberProvider } from "@/contexts/MemberContext";

/**
 * Thin client island that mounts the persistent provider tree and
 * renders its children verbatim. Children passed in are RSC payload
 * from the parent server component, so they keep all SSG / RSC
 * benefits — only the provider itself is in the client bundle.
 *
 * The Tweaks design-preview provider was removed in Phase A: the only
 * meaningful runtime setting it exposed (composite radar overlay) now
 * lives on MemberSettings.composite; the rest were stylistic toggles
 * that have been baked into sensible defaults at the call sites.
 */
export function ClientProviders({ children }: { children: ReactNode }) {
  return <MemberProvider>{children}</MemberProvider>;
}
