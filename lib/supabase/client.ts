"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "./env";
import type { Database } from "./types";

// Browser-side Supabase client. Used inside client components and the
// session-aware MemberContext. The cookie storage @supabase/ssr wires
// up here is the same one the server-side client + middleware see, so
// the user's session refreshes survive navigation transparently.
//
// Singleton-ish: createBrowserClient internally caches the client per
// (url, key) pair so calling this function repeatedly is cheap, but we
// prefer to assign once at the module-eval site.
export function createSupabaseBrowserClient() {
  const { url, anon } = getSupabasePublicEnv();
  return createBrowserClient<Database>(url, anon);
}
