// Server component — no "use client" so any RSC pages rendered as
// {children} keep their SSG / RSC payload. The provider tree lives in
// <ClientProviders>, the only client boundary in the chrome.

import type { ReactNode } from "react";
import { ClientProviders } from "./ClientProviders";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SessionLogLauncher } from "@/components/session/SessionLogLauncher";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function Shell({ children }: { children: ReactNode }) {
  // Fetch the auth-state server-side so the Header doesn't need its own
  // round-trip + flicker. We read the lighter `getUser()` rather than
  // joining to profiles here because (a) most pages don't need the
  // role; (b) /account already pulls the profile row when needed; (c)
  // it keeps the global Shell fast for the 99% logged-out case.
  //
  // When env vars aren't set yet (first dev boot before .env.local
  // exists), createSupabaseServerClient throws — catch and treat as
  // signed-out so the rest of the site keeps rendering.
  let session: { email: string | null; userId: string } | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      session = { email: user.email ?? null, userId: user.id };
    }
  } catch {
    // No env / no Supabase reachable — render the signed-out chrome.
  }

  return (
    <ClientProviders>
      <div className="min-h-screen flex flex-col">
        <Header session={session} />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
      {/* Floating "Log a session" launcher — pathname-aware contextual
          prefill, gated to members. */}
      <SessionLogLauncher />
    </ClientProviders>
  );
}
