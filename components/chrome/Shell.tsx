// Server component — no "use client" so any RSC pages rendered as
// {children} keep their SSG / RSC payload. The provider tree lives in
// <ClientProviders>, the only client boundary in the chrome.

import type { ReactNode } from "react";
import { ClientProviders } from "./ClientProviders";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SessionLogLauncher } from "@/components/session/SessionLogLauncher";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
      {/* Floating "Log a session" launcher — replaces the old tweaks
          panel. Reads the current pathname for contextual prefill,
          gated to members (currently localStorage-backed; Phase B
          flips to Supabase auth). */}
      <SessionLogLauncher />
    </ClientProviders>
  );
}
