import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Bearer-token auth for the CLI publishing API. The shape:
//
//   1. Caller sends `Authorization: Bearer tbl_<32-byte-base64url>`.
//   2. We sha256-hash the bytes after the `tbl_` prefix.
//   3. Look up an unrevoked row in api_keys by hashed_key.
//   4. Confirm the owning profile has role admin or contributor.
//   5. Bump last_used_at and return the user_id.
//
// All reads run as service-role because we don't yet have an
// auth.uid() — the key IS the auth.
//
// Raw keys are shown to the user exactly once at creation time. Lost
// keys must be regenerated; the server can't recover them.

const KEY_PREFIX = "tbl_";
const KEY_BYTES = 32; // 256 bits

export type AuthedKey = {
  userId: string;
  role: "admin" | "contributor";
  keyId: string;
};

/** Generate a fresh raw key + its hash + the display prefix.
 *  Caller persists hashed + prefix and shows raw exactly once. */
export function newApiKey(): { raw: string; hashed: string; prefix: string } {
  const buf = randomBytes(KEY_BYTES);
  const body = buf.toString("base64url");
  const raw = `${KEY_PREFIX}${body}`;
  const hashed = sha256(raw);
  // Prefix shown in UI listings — first 8 chars of the body so the
  // user can identify which key is which without re-exposing the
  // whole secret.
  const prefix = body.slice(0, 8);
  return { raw, hashed, prefix };
}

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function svc(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Pulls the bearer token from the request, looks it up, and returns
 *  the authed user + role. Returns null on any failure — callers
 *  should respond with 401 without echoing details to the client. */
export async function authenticateBearer(
  request: Request,
): Promise<AuthedKey | null> {
  const auth = request.headers.get("authorization");
  if (!auth) return null;
  const m = /^Bearer\s+(.+)$/.exec(auth);
  if (!m) return null;
  const raw = m[1]!.trim();
  if (!raw.startsWith(KEY_PREFIX)) return null;
  if (raw.length < KEY_PREFIX.length + 16) return null;

  const sb = svc();
  if (!sb) return null;

  const hashed = sha256(raw);
  const { data: key, error } = await sb
    .from("api_keys")
    .select("id, user_id, revoked_at")
    .eq("hashed_key", hashed)
    .is("revoked_at", null)
    .maybeSingle();
  if (error || !key) return null;

  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", key.user_id)
    .maybeSingle();
  if (!profile) return null;
  const role = profile.role;
  if (role !== "admin" && role !== "contributor") return null;

  // Best-effort last-used bump. Don't fail the auth on write error —
  // the call should still go through.
  void sb
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", key.id);

  return { userId: key.user_id, role, keyId: key.id };
}
