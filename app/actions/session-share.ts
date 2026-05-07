"use server";

// Server actions for session sharing. The user toggles share_enabled
// from the tea-detail page; this writes through the SSR client (RLS
// gates on auth.uid() = user_id) and revalidates the tea page so the
// share status reflects on the next view.
//
// Token generation lives DB-side via the share_token uuid column —
// we set it to gen_random_uuid() on enable, null on disable. That
// way revoking + re-enabling rotates the link automatically.

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result =
  | { ok: true; token: string | null }
  | { ok: false; message: string };

/**
 * Toggle a session's share state. Looks up by (user_tea_id, owner) so
 * the caller can identify the session by the tea they rated rather
 * than by session uuid. RLS still enforces ownership via user_id.
 *
 * On enable: ensures share_token is non-null (rotates if currently null).
 * On disable: keeps the token but flips share_enabled=false. The
 *  partial unique index covers active shares only, so a disabled
 *  session still has its old token — but the public-read policy
 *  requires share_enabled=true so the link won't resolve until
 *  re-enabled.
 */
export async function setSessionShare(input: {
  userTeaId: string;
  enabled: boolean;
  /** When true, generate a fresh token even if one exists. Used to
   *  revoke a leaked share by rotating. */
  rotate?: boolean;
}): Promise<Result> {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false, message: "Sign in required." };

  // Find the session for this user+tea (one per pair, enforced by
  // sessions_user_tea_unique).
  const { data: session, error: lookupErr } = await sb
    .from("sessions")
    .select("id, share_token, share_enabled")
    .eq("user_id", user.id)
    .eq("user_tea_id", input.userTeaId)
    .maybeSingle();

  if (lookupErr) return { ok: false, message: lookupErr.message };
  if (!session) return { ok: false, message: "No session found for this tea." };

  // crypto.randomUUID is Node 20 native; matches the uuid format
  // Postgres expects.
  const newToken =
    input.rotate || (input.enabled && !session.share_token)
      ? crypto.randomUUID()
      : session.share_token;

  const { error } = await sb
    .from("sessions")
    .update({
      share_enabled: input.enabled,
      share_token: input.enabled ? newToken : session.share_token,
    })
    .eq("id", session.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/", "layout");
  return { ok: true, token: input.enabled ? newToken : null };
}
