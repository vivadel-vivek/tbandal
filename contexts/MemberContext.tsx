"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type {
  ContributorKey,
  FlavorMode,
  Member,
  MemberRating,
  MemberSettings,
  UserLibrary,
  UserTea,
  UserTeaStatus,
  UserTeaware,
  UserTeawareStatus,
} from "@/lib/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSupabaseSession } from "@/lib/supabase/useSession";
import {
  loadMemberProfile,
  saveMemberProfile,
  type ProfilePatch,
} from "@/lib/member/profile-sync";
import {
  loadUserLibrary,
  upsertUserTea,
  upsertUserTeaware,
  deleteUserTea as deleteUserTeaRemote,
  deleteUserTeaware as deleteUserTeawareRemote,
  migrateLibraryToSupabase,
} from "@/lib/member/library-sync";

const STORAGE_KEY = "tbandal:member:v1";

const EMPTY_LIBRARY: UserLibrary = { teas: [], teaware: [] };

const DEFAULT_MEMBER: Member = {
  name: "You",
  // James is the tea lead — newcomers default to his palate alignment;
  // they can flip to Vivek's in /member/settings.
  aligned: "james",
  ratings: [],
  library: EMPTY_LIBRARY,
  settings: {
    email: "",
    displayName: "",
    contributorHandle: "",
    // Default to Basic so first-paint shows the 6-axis lay-term radar.
    // Newcomer audit was unambiguous about this — Advanced 12-axis with
    // "Marine?" on a tea page is the moment newcomers bounce. Existing
    // localStorage members keep whatever they previously chose.
    flavorMode: "basic",
    composite: false,
    theme: "auto",
    notifications: {
      weeklyDigest: true,
      newTeas: true,
      sampleRequests: false,
      replies: true,
    },
    tastedTeas: [],
  },
};

// ---- Validators -------------------------------------------------------
// localStorage is a hostile data source — a stale schema or hand-edited
// blob can poison `flavorMode` / `theme` / etc. with values that fall
// outside their union types. Validate every union field before we let
// it into state.

const FLAVOR_MODES: readonly FlavorMode[] = ["blind", "basic", "advanced"];
const THEMES: readonly MemberSettings["theme"][] = ["auto", "parchment", "cream", "dark"];
const ALIGNS: readonly ContributorKey[] = ["vivek", "james"];
const isOneOf = <T extends string>(opts: readonly T[], v: unknown): v is T =>
  typeof v === "string" && (opts as readonly string[]).includes(v);
const asBool = (v: unknown, fallback: boolean): boolean =>
  typeof v === "boolean" ? v : fallback;
const asString = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;
const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : [];

const TEA_STATUSES: readonly UserTeaStatus[] = ["wishlist", "owned", "tried", "retired"];
const TEAWARE_STATUSES: readonly UserTeawareStatus[] = ["wishlist", "owned"];

function safeParseLibrary(v: unknown): UserLibrary {
  const obj = (v as Record<string, unknown> | undefined) ?? {};
  const rawTeas = Array.isArray(obj.teas) ? obj.teas : [];
  const rawWare = Array.isArray(obj.teaware) ? obj.teaware : [];
  const teas: UserTea[] = rawTeas
    .map((row) => row as Record<string, unknown>)
    .filter((r) => typeof r.id === "string")
    .map((r) => ({
      id: r.id as string,
      addedAt: asString(r.addedAt, new Date().toISOString()),
      status: isOneOf(TEA_STATUSES, r.status) ? r.status : "tried",
      teaSlug: typeof r.teaSlug === "string" ? r.teaSlug : null,
      ...(typeof r.customName === "string" ? { customName: r.customName } : {}),
      ...(typeof r.customVendor === "string" ? { customVendor: r.customVendor } : {}),
      ...(typeof r.customYear === "string" ? { customYear: r.customYear } : {}),
      ...(typeof r.notes === "string" ? { notes: r.notes } : {}),
    }));
  const teaware: UserTeaware[] = rawWare
    .map((row) => row as Record<string, unknown>)
    .filter((r) => typeof r.id === "string")
    .map((r) => ({
      id: r.id as string,
      addedAt: asString(r.addedAt, new Date().toISOString()),
      status: isOneOf(TEAWARE_STATUSES, r.status) ? r.status : "owned",
      teawareSlug: typeof r.teawareSlug === "string" ? r.teawareSlug : null,
      ...(typeof r.customName === "string" ? { customName: r.customName } : {}),
      ...(typeof r.customMaterial === "string" ? { customMaterial: r.customMaterial } : {}),
      ...(typeof r.customVolumeMl === "number" ? { customVolumeMl: r.customVolumeMl } : {}),
      ...(typeof r.notes === "string" ? { notes: r.notes } : {}),
    }));
  return { teas, teaware };
}

function safeParseMember(raw: string): Partial<Member> | null {
  try {
    const obj = JSON.parse(raw) as unknown;
    if (!obj || typeof obj !== "object") return null;
    const o = obj as Record<string, unknown>;
    const settings = (o.settings as Record<string, unknown> | undefined) ?? {};
    const notif = (settings.notifications as Record<string, unknown> | undefined) ?? {};

    return {
      name: asString(o.name, DEFAULT_MEMBER.name),
      aligned: isOneOf(ALIGNS, o.aligned) ? o.aligned : DEFAULT_MEMBER.aligned,
      ratings: Array.isArray(o.ratings) ? (o.ratings as MemberRating[]) : [],
      library: safeParseLibrary(o.library),
      settings: {
        email: asString(settings.email),
        displayName: asString(settings.displayName),
        contributorHandle: asString(settings.contributorHandle),
        flavorMode: isOneOf(FLAVOR_MODES, settings.flavorMode)
          ? settings.flavorMode
          : DEFAULT_MEMBER.settings.flavorMode,
        composite: asBool(settings.composite, DEFAULT_MEMBER.settings.composite),
        theme: isOneOf(THEMES, settings.theme)
          ? settings.theme
          : DEFAULT_MEMBER.settings.theme,
        notifications: {
          weeklyDigest: asBool(notif.weeklyDigest, true),
          newTeas: asBool(notif.newTeas, true),
          sampleRequests: asBool(notif.sampleRequests, false),
          replies: asBool(notif.replies, true),
        },
        tastedTeas: asStringArray(settings.tastedTeas),
      },
    };
  } catch {
    return null;
  }
}

type MemberContextValue = {
  member: Member;
  setMember: Dispatch<SetStateAction<Member>>;
  /** Whether the given tea slug should hide its reviews/ratings */
  isBlindFor: (slug: string) => boolean;
  /** Mark a tea as tasted (un-blind it) */
  unblind: (slug: string) => void;
  /** Re-blind a previously revealed tea */
  reblind: (slug: string) => void;
  /** Convenience setter for the radar mode */
  setFlavorMode: (mode: FlavorMode) => void;
  /** Add or replace a member's rating */
  upsertRating: (rating: MemberRating) => void;
  // ---- Library helpers (Phase A — localStorage; Phase B — Supabase) ----
  /** Find a library entry for a catalog tea slug. */
  findUserTeaBySlug: (slug: string) => UserTea | undefined;
  /** Find a library entry for a catalog teaware slug. */
  findUserTeawareBySlug: (slug: string) => UserTeaware | undefined;
  /** Add a catalog tea to the library at the given status, or update
   *  the status if it's already there. Returns the (created or updated) row. */
  setTeaStatus: (slug: string, status: UserTeaStatus) => UserTea;
  /** Add a custom (off-catalog) tea. */
  addCustomTea: (input: Omit<UserTea, "id" | "addedAt" | "teaSlug">) => UserTea;
  /** Remove a tea from the library by id. */
  removeUserTea: (id: string) => void;
  /** Same trio for teaware. */
  setTeawareStatus: (slug: string, status: UserTeawareStatus) => UserTeaware;
  addCustomTeaware: (input: Omit<UserTeaware, "id" | "addedAt" | "teawareSlug">) => UserTeaware;
  removeUserTeaware: (id: string) => void;
};

const MemberContext = createContext<MemberContextValue | null>(null);

export function MemberProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member>(DEFAULT_MEMBER);
  const [hydrated, setHydrated] = useState(false);
  const session = useSupabaseSession();
  const userId = session?.userId ?? null;

  // Hydrate from localStorage on mount (avoids SSR mismatch). All values
  // are validated against their union types before being merged in.
  // When the user is authed, the next effect overrides profile fields
  // with the Supabase row — localStorage is the guest-mode + offline
  // cache, not the source of truth.
  useEffect(() => {
    const raw = (() => {
      try { return localStorage.getItem(STORAGE_KEY); }
      catch { return null; }
    })();
    if (raw) {
      const parsed = safeParseMember(raw);
      if (parsed) setMember((prev) => ({ ...prev, ...parsed }));
    }
    setHydrated(true);
  }, []);

  // Authed: load profile/settings from Supabase on every sign-in. If the
  // hosted row has data we replace those Member fields; library + sessions
  // still come from localStorage (Phase B-final.2 + .3 will move them).
  // On sign-out we don't reset state — the user keeps whatever they had,
  // and the next sign-in re-hydrates.
  useEffect(() => {
    if (!hydrated || !userId) return;
    let cancelled = false;
    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const remote = await loadMemberProfile(supabase, userId);
        if (cancelled || !remote) return;
        setMember((prev) => ({
          ...prev,
          name: remote.name ?? prev.name,
          aligned: remote.aligned ?? prev.aligned,
          settings: { ...prev.settings, ...(remote.settings ?? {}) },
        }));
      } catch {
        // No env, network blip, or RLS denial — stay on localStorage.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, userId]);

  // Persist on change. Always write to localStorage (cheap; useful as
  // offline cache for the next visit). When authed, ALSO write the
  // profile fields to Supabase via the helper. Library/sessions
  // currently only round-trip localStorage; the next two commits move
  // them onto Supabase too.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(member));
    } catch {
      /* quota / private mode — ignore */
    }
  }, [member, hydrated]);

  // Debounced profile write-through. Settings update → ~400ms later we
  // upsert to Supabase. Ignores the very first render (post-hydration
  // settle) so we don't write defaults.
  useEffect(() => {
    if (!hydrated || !userId) return;
    const t = setTimeout(() => {
      const supabase = supabaseOrNull();
      if (!supabase) return;
      const patch: ProfilePatch = {
        name: member.name,
        aligned: member.aligned,
        settings: member.settings,
      };
      saveMemberProfile(supabase, userId, patch).catch(() => {
        // RLS denial / offline / etc. — silent. localStorage holds the
        // pending change; next mutation tries again.
      });
    }, 400);
    return () => clearTimeout(t);
  }, [
    hydrated,
    userId,
    member.name,
    member.aligned,
    member.settings,
  ]);

  // Authed: load library from Supabase on sign-in, falling back to
  // localStorage if the remote is empty AND we have local rows
  // (one-time guest → cloud migration). After this effect settles,
  // the per-helper write-through pattern below keeps things in sync.
  useEffect(() => {
    if (!hydrated || !userId) return;
    let cancelled = false;
    (async () => {
      const supabase = supabaseOrNull();
      if (!supabase) return;
      try {
        // Snapshot the local library BEFORE the load — if Supabase
        // returns rows we use those; otherwise we push local up.
        const localLib = member.library;
        const remote = await loadUserLibrary(supabase, userId);
        if (cancelled) return;
        if (remote.teas.length > 0 || remote.teaware.length > 0) {
          // Cloud is authoritative.
          setMember((prev) => ({ ...prev, library: remote }));
        } else if (
          localLib.teas.length > 0 ||
          localLib.teaware.length > 0
        ) {
          // First-time sign-in with localStorage data — migrate up.
          await migrateLibraryToSupabase(supabase, userId, localLib);
        }
      } catch {
        // Silent: keep whatever localStorage gave us.
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally do NOT depend on member.library — that would loop
    // (load → setMember → effect → load …). Re-fetching on user change
    // is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, userId]);

  const isBlindFor = useCallback(
    (slug: string) => {
      const mode = member.settings.flavorMode;
      const tasted = member.settings.tastedTeas ?? [];
      return mode === "blind" && !tasted.includes(slug);
    },
    [member.settings.flavorMode, member.settings.tastedTeas],
  );

  const unblind = useCallback((slug: string) => {
    setMember((m) => {
      const tasted = m.settings.tastedTeas ?? [];
      if (tasted.includes(slug)) return m;
      return {
        ...m,
        settings: { ...m.settings, tastedTeas: [...tasted, slug] },
      };
    });
  }, []);

  const reblind = useCallback((slug: string) => {
    setMember((m) => ({
      ...m,
      settings: {
        ...m.settings,
        tastedTeas: (m.settings.tastedTeas ?? []).filter((s) => s !== slug),
      },
    }));
  }, []);

  const setFlavorMode = useCallback((mode: FlavorMode) => {
    setMember((m) => ({ ...m, settings: { ...m.settings, flavorMode: mode } }));
  }, []);

  const upsertRating = useCallback((rating: MemberRating) => {
    setMember((m) => {
      const others = m.ratings.filter((r) => r.slug !== rating.slug);
      return { ...m, ratings: [...others, rating] };
    });
  }, []);

  // ---- Library helpers ----
  // crypto.randomUUID is the simple path; falls back to a timestamp-based
  // id for environments that don't expose it. Phase B replaces these
  // ids with Postgres uuids on first sync.
  const newId = () => {
    try {
      return crypto.randomUUID();
    } catch {
      return `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }
  };

  // Single-line "get a supabase client or null when env is missing".
  // Used inside library mutation helpers to fire-and-forget the
  // Supabase write without crashing on guests / unconfigured envs.
  const supabaseOrNull = () => {
    try { return createSupabaseBrowserClient(); }
    catch { return null; }
  };

  const findUserTeaBySlug = useCallback(
    (slug: string) => member.library.teas.find((t) => t.teaSlug === slug),
    [member.library.teas],
  );
  const findUserTeawareBySlug = useCallback(
    (slug: string) =>
      member.library.teaware.find((t) => t.teawareSlug === slug),
    [member.library.teaware],
  );

  // Each helper does the same dance now:
  //   1. optimistic local state mutation (immediate)
  //   2. capture the resulting row via closure
  //   3. fire-and-forget Supabase write when authed
  // Local-first means the UI updates without latency; failures fall
  // back to localStorage as the source of truth.

  const setTeaStatus = useCallback(
    (slug: string, status: UserTeaStatus): UserTea => {
      let result: UserTea | undefined;
      setMember((m) => {
        const existing = m.library.teas.find((t) => t.teaSlug === slug);
        if (existing) {
          result = { ...existing, status };
          const next = m.library.teas.map((t) =>
            t.teaSlug === slug ? result! : t,
          );
          return { ...m, library: { ...m.library, teas: next } };
        }
        result = {
          id: newId(),
          addedAt: new Date().toISOString(),
          status,
          teaSlug: slug,
        };
        return {
          ...m,
          library: { ...m.library, teas: [...m.library.teas, result!] },
        };
      });
      if (userId && result) {
        const sb = supabaseOrNull();
        if (sb) upsertUserTea(sb, userId, result).catch(() => {});
      }
      return result!;
    },
    [userId],
  );

  const addCustomTea = useCallback(
    (input: Omit<UserTea, "id" | "addedAt" | "teaSlug">): UserTea => {
      const row: UserTea = {
        ...input,
        id: newId(),
        addedAt: new Date().toISOString(),
        teaSlug: null,
      };
      setMember((m) => ({
        ...m,
        library: { ...m.library, teas: [...m.library.teas, row] },
      }));
      if (userId) {
        const sb = supabaseOrNull();
        if (sb) upsertUserTea(sb, userId, row).catch(() => {});
      }
      return row;
    },
    [userId],
  );

  const removeUserTea = useCallback(
    (id: string) => {
      setMember((m) => ({
        ...m,
        library: {
          ...m.library,
          teas: m.library.teas.filter((t) => t.id !== id),
        },
      }));
      if (userId) {
        const sb = supabaseOrNull();
        if (sb) deleteUserTeaRemote(sb, id).catch(() => {});
      }
    },
    [userId],
  );

  const setTeawareStatus = useCallback(
    (slug: string, status: UserTeawareStatus): UserTeaware => {
      let result: UserTeaware | undefined;
      setMember((m) => {
        const existing = m.library.teaware.find(
          (t) => t.teawareSlug === slug,
        );
        if (existing) {
          result = { ...existing, status };
          const next = m.library.teaware.map((t) =>
            t.teawareSlug === slug ? result! : t,
          );
          return { ...m, library: { ...m.library, teaware: next } };
        }
        result = {
          id: newId(),
          addedAt: new Date().toISOString(),
          status,
          teawareSlug: slug,
        };
        return {
          ...m,
          library: { ...m.library, teaware: [...m.library.teaware, result!] },
        };
      });
      if (userId && result) {
        const sb = supabaseOrNull();
        if (sb) upsertUserTeaware(sb, userId, result).catch(() => {});
      }
      return result!;
    },
    [userId],
  );

  const addCustomTeaware = useCallback(
    (input: Omit<UserTeaware, "id" | "addedAt" | "teawareSlug">): UserTeaware => {
      const row: UserTeaware = {
        ...input,
        id: newId(),
        addedAt: new Date().toISOString(),
        teawareSlug: null,
      };
      setMember((m) => ({
        ...m,
        library: { ...m.library, teaware: [...m.library.teaware, row] },
      }));
      if (userId) {
        const sb = supabaseOrNull();
        if (sb) upsertUserTeaware(sb, userId, row).catch(() => {});
      }
      return row;
    },
    [userId],
  );

  const removeUserTeaware = useCallback(
    (id: string) => {
      setMember((m) => ({
        ...m,
        library: {
          ...m.library,
          teaware: m.library.teaware.filter((t) => t.id !== id),
        },
      }));
      if (userId) {
        const sb = supabaseOrNull();
        if (sb) deleteUserTeawareRemote(sb, id).catch(() => {});
      }
    },
    [userId],
  );

  const value = useMemo<MemberContextValue>(
    () => ({
      member,
      setMember,
      isBlindFor,
      unblind,
      reblind,
      setFlavorMode,
      upsertRating,
      findUserTeaBySlug,
      findUserTeawareBySlug,
      setTeaStatus,
      addCustomTea,
      removeUserTea,
      setTeawareStatus,
      addCustomTeaware,
      removeUserTeaware,
    }),
    [
      member, isBlindFor, unblind, reblind, setFlavorMode, upsertRating,
      findUserTeaBySlug, findUserTeawareBySlug, setTeaStatus,
      addCustomTea, removeUserTea, setTeawareStatus, addCustomTeaware,
      removeUserTeaware,
    ],
  );

  return (
    <MemberContext.Provider value={value}>{children}</MemberContext.Provider>
  );
}

export function useMember(): MemberContextValue {
  const ctx = useContext(MemberContext);
  if (!ctx) throw new Error("useMember must be used inside <MemberProvider>");
  return ctx;
}
