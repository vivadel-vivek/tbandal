// Translation between the in-app library shape (UserTea / UserTeaware
// from lib/types) and the Supabase rows. Same pattern as profile-sync:
// the rest of the app keeps using the camelCase, nested-object shape;
// this module is the only place that knows about snake_case columns.

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  UserLibrary,
  UserTea,
  UserTeaStatus,
  UserTeaware,
  UserTeawareStatus,
} from "@/lib/types";
import type { Database } from "@/lib/supabase/types";

type Sb = SupabaseClient<Database>;
type UserTeaInsert = Database["public"]["Tables"]["user_teas"]["Insert"];
type UserTeawareInsert =
  Database["public"]["Tables"]["user_teaware"]["Insert"];

type UserTeaRow = Database["public"]["Tables"]["user_teas"]["Row"];
type UserTeawareRow = Database["public"]["Tables"]["user_teaware"]["Row"];

// =====================================================================
// Read — fetch the user's full library on sign-in.
// =====================================================================

/** Returns the signed-in user's library. RLS guarantees we only get
 *  rows where user_id = auth.uid(); no extra filter needed. */
export async function loadUserLibrary(
  supabase: Sb,
  userId: string,
): Promise<UserLibrary> {
  const [teasRes, teawareRes] = await Promise.all([
    supabase
      .from("user_teas")
      .select("*")
      .eq("user_id", userId)
      .order("added_at", { ascending: false }),
    supabase
      .from("user_teaware")
      .select("*")
      .eq("user_id", userId)
      .order("added_at", { ascending: false }),
  ]);

  const teas = (teasRes.data ?? []).map(rowToUserTea);
  const teaware = (teawareRes.data ?? []).map(rowToUserTeaware);
  return { teas, teaware };
}

// =====================================================================
// Write — single-row upserts/deletes. Each public helper in MemberContext
// (setTeaStatus, addCustomTea, removeUserTea, …) calls one of these
// after updating local state. Failures are logged but don't roll back —
// the next user action will retry the new authoritative state.
// =====================================================================

export async function upsertUserTea(
  supabase: Sb,
  userId: string,
  row: UserTea,
) {
  const insert: UserTeaInsert = {
    id: row.id,
    user_id: userId,
    status: row.status,
    tea_slug: row.teaSlug,
    custom_name: row.customName ?? null,
    custom_vendor: row.customVendor ?? null,
    custom_year: row.customYear ?? null,
    custom_type: row.customType ?? null,
    notes: row.notes ?? null,
    added_at: row.addedAt,
  };
  return supabase.from("user_teas").upsert(insert, { onConflict: "id" });
}

export async function deleteUserTea(supabase: Sb, id: string) {
  return supabase.from("user_teas").delete().eq("id", id);
}

export async function upsertUserTeaware(
  supabase: Sb,
  userId: string,
  row: UserTeaware,
) {
  const insert: UserTeawareInsert = {
    id: row.id,
    user_id: userId,
    status: row.status,
    teaware_slug: row.teawareSlug,
    custom_name: row.customName ?? null,
    custom_material: row.customMaterial ?? null,
    custom_volume_ml: row.customVolumeMl ?? null,
    notes: row.notes ?? null,
    added_at: row.addedAt,
  };
  return supabase.from("user_teaware").upsert(insert, { onConflict: "id" });
}

export async function deleteUserTeaware(supabase: Sb, id: string) {
  return supabase.from("user_teaware").delete().eq("id", id);
}

// =====================================================================
// First-sign-in migration — push localStorage library rows up to
// Supabase the first time a guest signs in. Skipped if Supabase already
// has rows (assume the cloud is authoritative once it has data).
// =====================================================================

/** If the remote library is empty AND `local` has rows, copies them
 *  up. Returns the count migrated; caller can clear localStorage of
 *  the now-redundant data afterwards. */
export async function migrateLibraryToSupabase(
  supabase: Sb,
  userId: string,
  local: UserLibrary,
): Promise<{ teasMigrated: number; teawareMigrated: number }> {
  const remote = await loadUserLibrary(supabase, userId);
  const teasMigrated =
    remote.teas.length === 0 && local.teas.length > 0
      ? await bulkUpsertTeas(supabase, userId, local.teas)
      : 0;
  const teawareMigrated =
    remote.teaware.length === 0 && local.teaware.length > 0
      ? await bulkUpsertTeaware(supabase, userId, local.teaware)
      : 0;
  return { teasMigrated, teawareMigrated };
}

async function bulkUpsertTeas(sb: Sb, userId: string, rows: UserTea[]) {
  const inserts: UserTeaInsert[] = rows.map((r) => ({
    id: r.id,
    user_id: userId,
    status: r.status,
    tea_slug: r.teaSlug,
    custom_name: r.customName ?? null,
    custom_vendor: r.customVendor ?? null,
    custom_year: r.customYear ?? null,
    custom_type: r.customType ?? null,
    notes: r.notes ?? null,
    added_at: r.addedAt,
  }));
  const { error } = await sb
    .from("user_teas")
    .upsert(inserts, { onConflict: "id" });
  return error ? 0 : inserts.length;
}

async function bulkUpsertTeaware(
  sb: Sb,
  userId: string,
  rows: UserTeaware[],
) {
  const inserts: UserTeawareInsert[] = rows.map((r) => ({
    id: r.id,
    user_id: userId,
    status: r.status,
    teaware_slug: r.teawareSlug,
    custom_name: r.customName ?? null,
    custom_material: r.customMaterial ?? null,
    custom_volume_ml: r.customVolumeMl ?? null,
    notes: r.notes ?? null,
    added_at: r.addedAt,
  }));
  const { error } = await sb
    .from("user_teaware")
    .upsert(inserts, { onConflict: "id" });
  return error ? 0 : inserts.length;
}

// =====================================================================
// Row → in-app shape mappers. Trim nullable optional fields so the
// Member object has only present-when-set keys (matches the
// localStorage spread pattern in MemberContext).
// =====================================================================

function rowToUserTea(r: UserTeaRow): UserTea {
  const status = (r.status as UserTeaStatus) ?? "tried";
  return {
    id: r.id,
    addedAt: r.added_at,
    status,
    teaSlug: r.tea_slug,
    ...(r.custom_name ? { customName: r.custom_name } : {}),
    ...(r.custom_vendor ? { customVendor: r.custom_vendor } : {}),
    ...(r.custom_year ? { customYear: r.custom_year } : {}),
    ...(r.custom_type
      ? { customType: r.custom_type as UserTea["customType"] }
      : {}),
    ...(r.notes ? { notes: r.notes } : {}),
  };
}

function rowToUserTeaware(r: UserTeawareRow): UserTeaware {
  const status = (r.status as UserTeawareStatus) ?? "owned";
  return {
    id: r.id,
    addedAt: r.added_at,
    status,
    teawareSlug: r.teaware_slug,
    ...(r.custom_name ? { customName: r.custom_name } : {}),
    ...(r.custom_material ? { customMaterial: r.custom_material } : {}),
    ...(r.custom_volume_ml !== null
      ? { customVolumeMl: r.custom_volume_ml }
      : {}),
    ...(r.notes ? { notes: r.notes } : {}),
  };
}
