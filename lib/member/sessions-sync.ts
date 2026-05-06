// Translation between MemberRating (the in-app shape, unchanged from
// the localStorage era) and the Supabase `sessions` table. The
// schema-level difference: every session row references a
// user_teas.id FK rather than the catalog slug directly. That makes
// off-catalog teas first-class and lets us roll up sessions by the
// member's library, but it means save-time we have to ensure the
// user_teas row exists before inserting the session.

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FlavorProfile,
  MemberRating,
  Mouthfeel,
  SessionMode,
  SteepLog,
  UserTea,
  WaterSource,
} from "@/lib/types";
import type { Database } from "@/lib/supabase/types";
import { upsertUserTea } from "@/lib/member/library-sync";

type Sb = SupabaseClient<Database>;
type SessionInsert = Database["public"]["Tables"]["sessions"]["Insert"];
type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];

// =====================================================================
// Read — fetch the user's sessions on sign-in. Joined with user_teas
// to recover the catalog slug + name; the in-app MemberRating shape
// keeps `slug` + `name` so existing UI doesn't need to learn FK ids.
// =====================================================================

type SessionWithTea = SessionRow & {
  user_teas: {
    tea_slug: string | null;
    custom_name: string | null;
  } | null;
};

export async function loadUserSessions(
  supabase: Sb,
  userId: string,
): Promise<MemberRating[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*, user_teas!inner(tea_slug, custom_name)")
    .eq("user_id", userId)
    .order("brewed_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as SessionWithTea[]).map(rowToMemberRating);
}

// =====================================================================
// Write — upsert a single session. Must ensure user_teas exists first;
// MemberRating only knows the catalog slug, so we look up the
// matching user_teas row (or create one with status='tried' if it's
// the user's first sip).
// =====================================================================

/** Save a session. `userTeaForSlug` is the user_teas row already in
 *  local state for this rating's slug — passed in so we don't have
 *  to re-fetch. Caller (MemberContext.upsertRating) ensures it
 *  exists by calling setTeaStatus before this; if it doesn't, we
 *  create one as a defensive fallback. */
export async function saveSession(
  supabase: Sb,
  userId: string,
  rating: MemberRating,
  userTeaForSlug: UserTea | undefined,
) {
  // Resolve the user_tea_id FK. If the local library doesn't have a
  // row for this slug yet (shouldn't happen given the add-to-library
  // prompt, but paranoia) we synthesise one and upsert it.
  let userTeaId = userTeaForSlug?.id;
  if (!userTeaId) {
    const synthesised: UserTea = {
      id: makeId(),
      addedAt: new Date().toISOString(),
      status: "tried",
      teaSlug: rating.slug,
    };
    const r = await upsertUserTea(supabase, userId, synthesised);
    if (r.error) return r;
    userTeaId = synthesised.id;
  }

  const insert: SessionInsert = {
    user_id: userId,
    user_tea_id: userTeaId,
    rating: rating.rating,
    body: rating.body || null,
    scale: rating.scale,
    mode: (rating.mode as SessionMode | undefined) ?? "quick",
    profile: rating.profile as unknown as SessionInsert["profile"],
    mouthfeel: rating.mouthfeel as unknown as SessionInsert["mouthfeel"],
    steeps: (rating.steeps as unknown as SessionInsert["steeps"]) ?? null,
    vessel: rating.vessel ?? null,
    water: rating.water ?? null,
    water_source: rating.waterSource ?? null,
    water_tds_ppm: rating.waterTdsPpm ?? null,
    brew_style_override: rating.brewStyleOverride ?? null,
    leaf_g: rating.leafG ?? null,
    water_ml: rating.waterMl ?? null,
    brewed_at: parseDateOrNow(rating.date),
  };

  // No natural unique key to upsert on — the user can log multiple
  // sessions for the same tea — so this is always an insert. If we
  // later want "edit your most recent session for tea X" we'd add a
  // session_id round-trip; for now MemberRating is one-per-tea so
  // we can use a (user_id, user_tea_id) onConflict to overwrite.
  return supabase
    .from("sessions")
    .upsert(insert, { onConflict: "user_id,user_tea_id" });
}

export async function deleteSessionsForTea(
  supabase: Sb,
  userId: string,
  userTeaId: string,
) {
  return supabase
    .from("sessions")
    .delete()
    .eq("user_id", userId)
    .eq("user_tea_id", userTeaId);
}

// =====================================================================
// First-sign-in migration — push localStorage MemberRatings up to
// `sessions` if the cloud has none yet. Only the catalog-anchored
// ratings (those whose slug matches a user_teas row) get migrated;
// off-catalog ratings stay local until the user explicitly logs them.
// =====================================================================

export async function migrateSessionsToSupabase(
  supabase: Sb,
  userId: string,
  ratings: MemberRating[],
  library: UserTea[],
): Promise<number> {
  if (ratings.length === 0) return 0;
  // Skip if the user already has any sessions in Supabase.
  const { count } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if ((count ?? 0) > 0) return 0;

  let migrated = 0;
  for (const r of ratings) {
    const userTea = library.find((t) => t.teaSlug === r.slug);
    const result = await saveSession(supabase, userId, r, userTea);
    if (!result.error) migrated += 1;
  }
  return migrated;
}

// =====================================================================
// Helpers
// =====================================================================

function rowToMemberRating(r: SessionWithTea): MemberRating {
  // Recover the slug for the rating from the joined user_teas row.
  // For off-catalog teas the slug is null; we synthesise a stable-ish
  // pseudo-slug from custom_name so the existing dedupe logic in the
  // app (find rating by slug) still works.
  const slug = r.user_teas?.tea_slug ?? `custom:${r.user_tea_id}`;
  const name =
    r.user_teas?.tea_slug ??
    r.user_teas?.custom_name ??
    "Tea";

  return {
    slug,
    name,
    rating: typeof r.rating === "number" ? r.rating : 0,
    body: r.body ?? "",
    date: formatDate(r.brewed_at),
    scale: (r.scale as "basic" | "advanced") ?? "basic",
    profile: (r.profile as FlavorProfile | null) ?? ({} as FlavorProfile),
    ...(r.mouthfeel ? { mouthfeel: r.mouthfeel as Mouthfeel } : {}),
    mode: (r.mode as SessionMode) ?? "quick",
    ...(r.steeps ? { steeps: r.steeps as SteepLog[] } : {}),
    ...(r.vessel ? { vessel: r.vessel } : {}),
    ...(r.water ? { water: r.water } : {}),
    ...(r.water_source
      ? { waterSource: r.water_source as WaterSource }
      : {}),
    ...(r.water_tds_ppm !== null ? { waterTdsPpm: r.water_tds_ppm } : {}),
    ...(r.brew_style_override
      ? { brewStyleOverride: r.brew_style_override }
      : {}),
    ...(r.leaf_g !== null ? { leafG: r.leaf_g } : {}),
    ...(r.water_ml !== null ? { waterMl: r.water_ml } : {}),
  };
}

function makeId(): string {
  try { return crypto.randomUUID(); }
  catch { return `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
}

function parseDateOrNow(s: string): string {
  // MemberRating.date was formatted human-readable ("Mar 8, 2026") in
  // the localStorage era. The sessions table wants ISO. Try parsing;
  // fall back to now() if it isn't recognisable.
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function formatDate(iso: string): string {
  // Round-trip the human-readable date the existing UI expects.
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
