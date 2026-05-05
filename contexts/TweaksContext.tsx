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
import type { Tweaks } from "@/lib/types";

const STORAGE_KEY = "tbandal:tweaks:v1";

const DEFAULT_TWEAKS: Tweaks = {
  theme: "parchment",
  radarStyle: "fill",
  density: "cozy",
  heroVariant: "stain",
  showComposite: false,
  hideReviews: false,
};

type TweaksContextValue = {
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void;
};

const TweaksContext = createContext<TweaksContextValue | null>(null);

export function TweaksProvider({ children }: { children: ReactNode }) {
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULT_TWEAKS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Tweaks>;
        setTweaks((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Sync data-theme on body
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.dataset.theme = tweaks.theme;
    }
  }, [tweaks.theme]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tweaks));
    } catch {
      /* ignore */
    }
  }, [tweaks, hydrated]);

  const setTweak = useCallback(
    <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => {
      setTweaks((t) => ({ ...t, [key]: value }));
    },
    [],
  );

  const value = useMemo(() => ({ tweaks, setTweak }), [tweaks, setTweak]);

  return (
    <TweaksContext.Provider value={value}>{children}</TweaksContext.Provider>
  );
}

export function useTweaks(): TweaksContextValue {
  const ctx = useContext(TweaksContext);
  if (!ctx) throw new Error("useTweaks must be used inside <TweaksProvider>");
  return ctx;
}
