"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { newApiKey } from "@/lib/api/auth";

// Server actions for the API-key management panel. Both gated by an
// auth check + a staff-role check (admin or contributor) because the
// API only accepts keys belonging to staff. Members can't create
// keys — the API doesn't grant non-staff writes anyway.
//
// The raw key is returned ONLY by createApiKey, and only once. It's
// not persisted in any form the server can re-derive; we store the
// sha256 hash plus the first 8 chars of the body for display.

type Result<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; message: string };

async function requireStaff() {
  const sb = await createSupabaseServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) throw new Error("Sign in required.");
  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();
  const role = profile?.role;
  if (role !== "admin" && role !== "contributor") {
    throw new Error("Only admins and contributors can create API keys.");
  }
  return { sb, userId: auth.user.id, role };
}

export async function createApiKey(
  name: string,
): Promise<Result<{ raw: string; prefix: string; id: string }>> {
  let ctx;
  try {
    ctx = await requireStaff();
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
  const { sb, userId } = ctx;

  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 64) {
    return { ok: false, message: "Name must be 1–64 characters." };
  }

  const { raw, hashed, prefix } = newApiKey();
  const { data, error } = await sb
    .from("api_keys")
    .insert({
      user_id: userId,
      name: trimmed,
      prefix,
      hashed_key: hashed,
    })
    .select("id")
    .maybeSingle();
  if (error || !data) {
    return { ok: false, message: error?.message ?? "Insert failed." };
  }

  revalidatePath("/member/settings");
  return { ok: true, data: { raw, prefix, id: data.id } };
}

export async function revokeApiKey(id: string): Promise<Result> {
  let ctx;
  try {
    ctx = await requireStaff();
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
  const { sb, userId } = ctx;

  // RLS already restricts to user_id = auth.uid(), but belt-and-
  // suspenders the WHERE clause.
  const { error } = await sb
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/member/settings");
  return { ok: true };
}
