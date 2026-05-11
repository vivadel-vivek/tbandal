import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/me/export — returns the caller's personal data as JSON.
//
// GDPR Art. 20 (right to data portability) compliance — every
// signed-in user can download a complete dump of their account.
// Auth via the standard session cookie (no service-role needed; RLS
// already gates each table to the row owner).
//
// Payload shape:
//   {
//     exported_at: ISO timestamp,
//     profile:     profiles row (excluding raw email if absent),
//     library:     { teas: [...], teaware: [...] },
//     sessions:    [...],   // session log entries
//     consent_log: [...],   // policy acceptance history
//     api_keys:    [...]    // metadata only, no hashed secrets
//   }
//
// Streamed as a Content-Disposition attachment so browsers offer a
// download instead of rendering JSON in the tab.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sb = await createSupabaseServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) {
    return NextResponse.json(
      { ok: false, message: "Sign in to export your data." },
      { status: 401 },
    );
  }
  const userId = auth.user.id;

  // Parallel reads — RLS gates each one to the row owner so even if
  // the queries accidentally over-fetched, the user only sees their
  // own rows.
  const [profile, userTeas, userTeaware, sessions, consent, apiKeys] =
    await Promise.all([
      sb.from("profiles").select("*").eq("id", userId).maybeSingle(),
      sb.from("user_teas").select("*").eq("user_id", userId),
      sb.from("user_teaware").select("*").eq("user_id", userId),
      sb.from("sessions").select("*").eq("user_id", userId),
      sb.from("consent_log").select("*").eq("user_id", userId),
      sb
        .from("api_keys")
        .select("id, name, prefix, created_at, last_used_at, revoked_at")
        .eq("user_id", userId),
    ]);

  const payload = {
    exported_at: new Date().toISOString(),
    profile: profile.data ?? null,
    library: {
      teas: userTeas.data ?? [],
      teaware: userTeaware.data ?? [],
    },
    sessions: sessions.data ?? [],
    consent_log: consent.data ?? [],
    api_keys: apiKeys.data ?? [],
  };

  const filename = `tbandal-export-${userId.slice(0, 8)}-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
