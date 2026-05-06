import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Refreshes the Supabase auth cookie on every request before the route
// handler runs, so server components / route handlers always see a
// fresh session. Uses the @supabase/ssr middleware pattern verbatim
// (see https://supabase.com/docs/guides/auth/server-side/nextjs).
//
// We intentionally keep this middleware feather-light: no auth gating
// happens here. Pages that require auth (e.g. /account, /member/*)
// resolve their own gates in the server component or route handler,
// which gives us better error messages and per-page redirect targets
// than a blanket middleware redirect.

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // No env yet (e.g. CI build w/o secrets, or first-run dev) — pass
  // through. The page-level Supabase calls will throw their own
  // explanatory error if they need a session.
  if (!url || !anon) return supabaseResponse;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touching getUser refreshes the access token if it's near expiry.
  await supabase.auth.getUser();

  return supabaseResponse;
}

// Match every request that isn't a Next.js asset, image, or favicon.
// Tuned to skip _next/* + the static-asset extensions so middleware
// doesn't run on every JS chunk fetch.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|sw.js|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
