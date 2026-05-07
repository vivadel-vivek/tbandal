// Server component — no "use client" so any RSC pages rendered as
// {children} keep their SSG / RSC payload. The provider tree lives in
// <ClientProviders>, the only client boundary in the chrome.

import type { ReactNode } from "react";
import { ClientProviders } from "./ClientProviders";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SessionLogLauncher } from "@/components/session/SessionLogLauncher";
import { getTeas } from "@/lib/content";

export async function Shell({ children }: { children: ReactNode }) {
  // Catalog teas fed to the floating launcher's picker. React.cache()
  // dedupes if the page also fetches teas — the SSG payload pays once.
  const teas = await getTeas();

  // Auth state is intentionally NOT read here. If we awaited the
  // Supabase session in this server component, every page that wraps
  // its content in <Shell> would render a build-time snapshot of
  // "no session" into the static HTML — which then sticks even after
  // the user signs in. Instead, the Header reads the session via a
  // client-side hook, so SSG stays cheap and the chip updates on
  // hydration.
  return (
    <ClientProviders>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
      {/* Floating "Log a session" launcher — pathname-aware contextual
          prefill, gated to members. */}
      <SessionLogLauncher teas={teas} />
    </ClientProviders>
  );
}
