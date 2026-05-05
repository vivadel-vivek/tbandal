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
} from "@/lib/types";

const STORAGE_KEY = "tbandal:member:v1";

const DEFAULT_MEMBER: Member = {
  name: "You",
  aligned: "vivek",
  ratings: [],
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
};

const MemberContext = createContext<MemberContextValue | null>(null);

export function MemberProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member>(DEFAULT_MEMBER);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (avoids SSR mismatch). All values
  // are validated against their union types before being merged in.
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

  // Persist on change (after hydration so we don't overwrite with defaults)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(member));
    } catch {
      /* quota / private mode — ignore */
    }
  }, [member, hydrated]);

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

  const value = useMemo<MemberContextValue>(
    () => ({
      member,
      setMember,
      isBlindFor,
      unblind,
      reblind,
      setFlavorMode,
      upsertRating,
    }),
    [member, isBlindFor, unblind, reblind, setFlavorMode, upsertRating],
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
