"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FlavorMode, Member, MemberRating } from "@/lib/types";

const STORAGE_KEY = "tbandal:member:v1";

const DEFAULT_MEMBER: Member = {
  name: "You",
  aligned: "vivek",
  ratings: [],
  settings: {
    email: "",
    displayName: "",
    contributorHandle: "",
    flavorMode: "advanced",
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

type MemberContextValue = {
  member: Member;
  setMember: React.Dispatch<React.SetStateAction<Member>>;
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

  // Hydrate from localStorage on mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Member>;
        setMember((prev) => ({
          ...prev,
          ...parsed,
          settings: {
            ...prev.settings,
            ...(parsed.settings ?? {}),
            notifications: {
              ...prev.settings.notifications,
              ...(parsed.settings?.notifications ?? {}),
            },
          },
        }));
      }
    } catch {
      /* ignore — corrupt localStorage just resets to default */
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
