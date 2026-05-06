import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// POST /auth/signout — clears the session cookie and redirects home.
// Wired to the "Sign out" button in the Header / member profile.
//
// Method = POST so the action requires a form submission (CSRF posture
// — a stray <a href="/auth/signout"> from another origin can't drop the
// session). The Header uses a hidden <form action="/auth/signout"
// method="POST"> with a <button> trigger.

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/`, { status: 303 });
}
