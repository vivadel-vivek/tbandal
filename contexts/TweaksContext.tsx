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
import type { CardDensity, HeroVariant, RadarStyle, Tweaks } from "@/lib/types";

const STORAGE_KEY = "tbandal:tweaks:v1";

const DEFAULT_TWEAKS: Tweaks = {
  theme: "parchment",
  radarStyle: "fill",
  density: "cozy",
  heroVariant: "stain",
  showComposite: false,
  hideReviews: false,
};

// ---- Validators -------------------------------------------------------

const THEMES: readonly Tweaks["theme"][] = ["parchment", "cream", "dark"];
const RADAR_STYLES: readonly RadarStyle[] = ["fill", "outline", "dotted"];
const DENSITIES: readonly CardDensity[] = ["cozy", "compact"];
const HERO_VARIANTS: readonly HeroVariant[] = ["split", "stain", "editorial"];

const isOneOf = <T extends string>(opts: readonly T[], v: unknown): v is T =>
  typeof v === "string" && (opts as readonly string[]).includes(v);

function safeParseTweaks(raw: string): Partial<Tweaks> | null {
  try {
    const obj = JSON.parse(raw) as unknown;
    if (!obj || typeof obj !== "object") return null;
    const o = obj as Record<string, unknown>;
    return {
      ...(isOneOf(THEMES, o.theme) ? { theme: o.theme } : null),
      ...(isOneOf(RADAR_STYLES, o.radarStyle) ? { radarStyle: o.radarStyle } : null),
      ...(isOneOf(DENSITIES, o.density) ? { density: o.density } : null),
      ...(isOneOf(HERO_VARIANTS, o.heroVariant) ? { heroVariant: o.heroVariant } : null),
      ...(typeof o.showComposite === "boolean" ? { showComposite: o.showComposite } : null),
      ...(typeof o.hideReviews === "boolean" ? { hideReviews: o.hideReviews } : null),
    };
  } catch {
    return null;
  }
}

type TweaksContextValue = {
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void;
};

const TweaksContext = createContext<TweaksContextValue | null>(null);

export function TweaksProvider({ children }: { children: ReactNode }) {
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULT_TWEAKS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = (() => {
      try { return localStorage.getItem(STORAGE_KEY); }
      catch { return null; }
    })();
    if (raw) {
      const parsed = safeParseTweaks(raw);
      if (parsed) setTweaks((prev) => ({ ...prev, ...parsed }));
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
