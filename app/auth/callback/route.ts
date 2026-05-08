import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// OAuth + email-confirmation callback. Supabase redirects here with a
// `code` query param after a successful auth flow; we exchange it for
// a session cookie via the SSR client and forward the user to their
// intended destination.
//
// Recovery + invite emails carry `type=recovery|invite|signup`. Those
// flows need to land on /auth/reset so the user can set a password
// before continuing — we forward there carrying the original `next`
// onward, regardless of whether the code exchange happened here or
// happens client-side via the URL hash.
//
// Safe defaults: when the exchange fails (expired link, malformed
// code) we send the visitor to /login with an error flag so the
// client form can surface a friendly message.

const PASSWORD_TYPES = new Set(["recovery", "invite", "signup"]);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const tokenHash = searchParams.get("token_hash");
  const next = searchParams.get("next") ?? "/member";

  // Recovery / invite — funnel through the password-set page. Pass
  // through any token params so /auth/reset can finalize the session
  // client-side if needed.
  if (type && PASSWORD_TYPES.has(type)) {
    const target = new URL("/auth/reset", origin);
    target.searchParams.set("next", next);
    if (code) target.searchParams.set("code", code);
    if (tokenHash) target.searchParams.set("token_hash", tokenHash);
    target.searchParams.set("type", type);
    return NextResponse.redirect(target);
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback`);
}
