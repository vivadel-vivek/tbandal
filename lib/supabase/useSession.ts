"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "./client";

// Reads the current Supabase session client-side and subscribes to
// auth-state changes. Returns null when:
//   - the user isn't signed in
//   - Supabase env vars aren't configured (no client could be built)
//   - the SDK is still loading the initial session (briefly, on first
//     render). Consumers should handle null as "show signed-out chrome
//     until we know otherwise" rather than as a hard "logged out" state.
//
// Used by the Header AuthChip to show "Sign in" vs the avatar pill
// without forcing every wrapping page to be dynamic.

export type ClientSession = {
  userId: string;
  email: string | null;
} | null;

export function useSupabaseSession(): ClientSession {
  const [session, setSession] = useState<ClientSession>(null);

  useEffect(() => {
    let supabase: ReturnType<typeof createSupabaseBrowserClient>;
    try {
      supabase = createSupabaseBrowserClient();
    } catch {
      // No env configured — stay signed-out forever. The auth pages
      // will surface their own configure-the-stack notice.
      return;
    }

    let cancelled = false;

    // Read once on mount. The SDK already restored any existing
    // session from cookies before this effect ran, so getSession is
    // synchronous-ish and cheap.
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) {
        setSession({
          userId: data.session.user.id,
          email: data.session.user.email ?? null,
        });
      }
    });

    // Subscribe to subsequent changes (sign-in, sign-out, refresh).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (cancelled) return;
      setSession(
        s
          ? { userId: s.user.id, email: s.user.email ?? null }
          : null,
      );
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return session;
}
