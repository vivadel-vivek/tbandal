import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// OAuth + email-confirmation callback. Supabase redirects here with a
// `code` query param after a successful auth flow; we exchange it for
// a session cookie via the SSR client and forward the user to their
// intended destination.
//
// Safe defaults: when the exchange fails (expired link, malformed
// code) we send the visitor to /login with an error flag so the
// client form can surface a friendly message.

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/member";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback`);
}
