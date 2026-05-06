import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "./env";
import type { Database } from "./types";

// Server-side Supabase client for use in Server Components, Route
// Handlers, and Server Actions. Reads + writes the auth-session cookie
// via Next.js's cookies() store. The middleware refreshes the session
// before each request reaches a route, so calls here see fresh state.
//
// IMPORTANT: in Server Components the cookies() store is read-only —
// any cookie writes the SSR client tries silently no-op. That's fine
// for SELECT queries; for any flow that needs to refresh tokens (e.g.
// Server Actions, Route Handlers, the OAuth callback) you'll see the
// writes succeed because those contexts get a writable store.
export async function createSupabaseServerClient() {
  const { url, anon } = getSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component context — cookies() is read-only here.
          // The middleware will pick the session up on the next request.
        }
      },
    },
  });
}
