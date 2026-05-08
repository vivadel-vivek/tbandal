// Translation layer between the Member shape (Phase A's localStorage
// model) and the Supabase `profiles` row. Keeps the API of MemberContext
// stable so the rest of the app doesn't care which storage layer is
// active.
//
// The mapping is mostly mechanical — column names are snake_case, the
// in-app shape is camelCase + nested. JSON columns (`notifications`)
// pass through verbatim.

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ContributorKey,
  FlavorMode,
  Member,
  MemberNotifications,
  MemberSettings,
} from "@/lib/types";
import type { Database } from "@/lib/supabase/types";

type Sb = SupabaseClient<Database>;

// Subset of the profiles row we care about for the in-app Member.
type ProfileRow = {
  email: string | null;
  display_name: string | null;
  contributor_handle: string | null;
  avatar_url: string | null;
  flavor_mode: string;
  composite: boolean;
  theme: string;
  aligned: string;
  notifications: unknown;
  tasted_teas: string[];
};

// =====================================================================
// Read — Supabase row → Member shape
// =====================================================================

/** Fetches the signed-in user's profile and returns just the slice
 *  that maps onto the Member type. Returns null if the row doesn't
 *  exist (the signup trigger should have created it; if it didn't,
 *  caller should fall back to localStorage / defaults). */
export async function loadMemberProfile(
  supabase: Sb,
  userId: string,
): Promise<Partial<Member> | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "email, display_name, contributor_handle, avatar_url, flavor_mode, composite, theme, aligned, notifications, tasted_teas",
    )
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return profileToMember(data as ProfileRow);
}

function profileToMember(row: ProfileRow): Partial<Member> {
  return {
    name: row.display_name ?? "You",
    aligned: normaliseAligned(row.aligned),
    avatarUrl: row.avatar_url,
    settings: {
      email: row.email ?? "",
      displayName: row.display_name ?? "",
      contributorHandle: row.contributor_handle ?? "",
      flavorMode: normaliseFlavorMode(row.flavor_mode),
      composite: !!row.composite,
      theme: normaliseTheme(row.theme),
      notifications: normaliseNotifications(row.notifications),
      tastedTeas: Array.isArray(row.tasted_teas) ? row.tasted_teas : [],
    },
  };
}

// =====================================================================
// Write — Member shape → Supabase row patch
// =====================================================================

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

/** Upserts the profile fields we let users edit. The `id` PK is
 *  always provided so this works for both update and insert (the
 *  signup trigger normally created the row, but a manual restore or
 *  a Supabase Studio delete could leave it empty). */
export async function saveMemberProfile(
  supabase: Sb,
  userId: string,
  patch: ProfilePatch,
) {
  const row: ProfileInsert = { id: userId };
  if (patch.name !== undefined) row.display_name = patch.name;
  if (patch.aligned !== undefined) row.aligned = patch.aligned;
  if (patch.settings) {
    const s = patch.settings;
    if (s.displayName !== undefined) row.display_name = s.displayName;
    if (s.contributorHandle !== undefined)
      row.contributor_handle = s.contributorHandle;
    if (s.flavorMode !== undefined) row.flavor_mode = s.flavorMode;
    if (s.composite !== undefined) row.composite = s.composite;
    if (s.theme !== undefined) row.theme = s.theme;
    // notifications is jsonb in Postgres — pass through verbatim.
    if (s.notifications !== undefined)
      row.notifications = s.notifications as unknown as ProfileInsert["notifications"];
    if (s.tastedTeas !== undefined) row.tasted_teas = s.tastedTeas;
  }
  return supabase.from("profiles").upsert(row, { onConflict: "id" });
}

export type ProfilePatch = {
  name?: string;
  aligned?: ContributorKey;
  settings?: Partial<MemberSettings>;
};

// =====================================================================
// Helpers — narrow string columns into the union types we use in TS.
// Falls back to sensible defaults rather than throwing on bad data.
// =====================================================================

function normaliseAligned(v: string): ContributorKey {
  return v === "vivek" || v === "james" ? v : "james";
}

function normaliseFlavorMode(v: string): FlavorMode {
  return v === "blind" || v === "basic" || v === "advanced" ? v : "basic";
}

function normaliseTheme(v: string): MemberSettings["theme"] {
  return v === "auto" || v === "parchment" || v === "cream" || v === "dark"
    ? v
    : "auto";
}

function normaliseNotifications(v: unknown): MemberNotifications {
  const o = (v as Record<string, unknown> | null) ?? {};
  const b = (k: string, def: boolean): boolean =>
    typeof o[k] === "boolean" ? (o[k] as boolean) : def;
  return {
    weeklyDigest: b("weeklyDigest", true),
    newTeas: b("newTeas", true),
    sampleRequests: b("sampleRequests", false),
    replies: b("replies", true),
  };
}
