// Staging-only "switch user" endpoint. Uses the Supabase admin SDK to
// mint a magic-link for one of the seeded test users
// (`<role>@tbal-tests.local`) and redirects the browser to it. The
// callback handler picks up the session cookies and lands the user
// back at `next` (defaults to `/`).
//
// Gating:
//   - `NEXT_PUBLIC_STAGING_ROLE_SWITCHER=1` toggles the *UI* (the
//     floating button only renders when this is set). This route also
//     refuses when the flag is unset, so even direct hits to the URL
//     in real production return 404.
//   - The admin SDK requires SUPABASE_SERVICE_ROLE_KEY which is
//     server-only; clients can't mint sessions themselves.
//   - The route only mints links for emails matching
//     `<role>@tbal-tests.local`. Any other input is rejected.

import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const ROLES = ["admin", "contributor", "vendor", "member", "user"] as const;
type Role = (typeof ROLES)[number];

function isRole(s: string): s is Role {
  return (ROLES as readonly string[]).includes(s);
}

function stagingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_STAGING_ROLE_SWITCHER === "1";
}

export async function GET(req: NextRequest) {
  if (!stagingEnabled()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const url = new URL(req.url);
  const role = url.searchParams.get("role") ?? "";
  const next = url.searchParams.get("next") ?? "/";

  // Anon: clear the session cookies inline. The /auth/signout route
  // is POST-only (CSRF posture); the role switcher is staging-gated
  // and the cookie write is what matters, not the method.
  if (role === "anon") {
    const sb = await createSupabaseServerClient();
    await sb.auth.signOut();
    return NextResponse.redirect(new URL(next, req.url), 303);
  }

  if (!isRole(role)) {
    return new NextResponse(`Unknown role: ${role}`, { status: 400 });
  }

  const email = `${role}@tbal-tests.local`;
  const admin = createSupabaseAdminClient();

  // generateLink mints a one-time auth link without sending an email.
  // The browser visits it, Supabase consumes the token, sets cookies,
  // and redirects to `redirectTo`. Same flow as a password sign-in
  // would produce, just initiated server-side.
  const redirectTo = new URL(
    `/auth/callback?next=${encodeURIComponent(next)}`,
    getSiteUrl(),
  ).toString();

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (error || !data.properties?.action_link) {
    return new NextResponse(
      `Could not mint magic link for ${email}: ${error?.message ?? "no action_link returned"}`,
      { status: 500 },
    );
  }

  return NextResponse.redirect(data.properties.action_link, 302);
}
