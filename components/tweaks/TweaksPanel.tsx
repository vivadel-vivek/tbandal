"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useMember } from "@/contexts/MemberContext";
import { useTweaks } from "@/contexts/TweaksContext";
import type {
  CardDensity,
  FlavorMode,
  HeroVariant,
  RadarStyle,
  Tweaks,
} from "@/lib/types";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * Floating design-time control panel. Lives bottom-right, collapses to a
 * pill, persists open/closed in sessionStorage. Reads/writes both
 * TweaksContext (design overrides) and MemberContext (the radar mode is
 * a member preference, not a tweak).
 *
 * Hidden on /member/settings since the member is editing the same state
 * there directly.
 */
export function TweaksPanel() {
  const { tweaks, setTweak } = useTweaks();
  const { member, setFlavorMode } = useMember();
  const [open, setOpen] = useState(false);

  // Restore expanded state across reloads
  useEffect(() => {
    try {
      const v = sessionStorage.getItem("tbandal:tweaks-open");
      if (v === "1") setOpen(true);
    } catch {
      /* private mode etc. */
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("tbandal:tweaks-open", open ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Tweaks panel"
        className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-pill bg-burgundy text-cream shadow-elevated font-sans text-xs font-bold tracking-wide cursor-pointer flex items-center gap-2 hover:bg-burgundy-dark transition-colors duration-200 ease-smooth"
      >
        <span aria-hidden>⚙</span> Tweaks
      </button>
    );
  }

  return (
    <aside
      role="region"
      aria-label="Tweaks panel"
      className="fixed bottom-5 right-5 z-50 w-[280px] max-h-[80vh] overflow-y-auto card-surface p-4"
    >
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-warm-200">
        <div>
          <Eyebrow>Tweaks</Eyebrow>
          <div className="text-[11px] text-warm-600 mt-0.5">
            Design-time controls. State persists locally.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close Tweaks panel"
          className="w-7 h-7 rounded-full bg-cream border border-warm-200 cursor-pointer text-warm-700 text-base leading-none shrink-0"
        >
          ×
        </button>
      </div>

      <Section title="Look & feel">
        <Radio
          label="Background"
          value={tweaks.theme}
          onChange={(v) => setTweak("theme", v)}
          options={[
            { value: "parchment", label: "Parchment" },
            { value: "cream",     label: "Cream" },
            { value: "dark",      label: "Dark" },
          ]}
        />
        <Radio
          label="Card density"
          value={tweaks.density}
          onChange={(v) => setTweak("density", v)}
          options={[
            { value: "cozy",    label: "Cozy" },
            { value: "compact", label: "Compact" },
          ]}
        />
      </Section>

      <Section title="Tea detail">
        <Select
          label="Hero treatment"
          value={tweaks.heroVariant}
          onChange={(v) => setTweak("heroVariant", v)}
          options={[
            { value: "split",      label: "Split — image + meta" },
            { value: "stain",      label: "Stain — centered editorial" },
            { value: "editorial",  label: "Editorial — magazine masthead" },
          ]}
        />
        <Toggle
          label="Show all 3 radars at once"
          value={tweaks.showComposite}
          onChange={(v) => setTweak("showComposite", v)}
        />
      </Section>

      <Section title="Radar">
        <Radio
          label="Member flavor mode (writes to settings)"
          value={member.settings.flavorMode}
          onChange={setFlavorMode}
          options={[
            { value: "blind",    label: "Blind — hide ratings" },
            { value: "basic",    label: "Basic — 6 axes / 5 pt" },
            { value: "advanced", label: "Advanced — 12 axes / 10 pt" },
          ]}
        />
        <Radio
          label="Style"
          value={tweaks.radarStyle}
          onChange={(v) => setTweak("radarStyle", v)}
          options={[
            { value: "fill",    label: "Filled" },
            { value: "outline", label: "Outlined" },
            { value: "dotted",  label: "Dotted" },
          ]}
        />
      </Section>

      <Section title="Browse mode">
        <Toggle
          label="Hide all reviews & ratings (site-wide blind preview)"
          value={tweaks.hideReviews}
          onChange={(v) => setTweak("hideReviews", v)}
        />
      </Section>

      <Section title="Jump to a page">
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: "Home",                 href: "/" },
            { label: "Discover hub",         href: "/discover" },
            { label: "Discover › Teas",      href: "/discover/teas" },
            { label: "Discover › Vendors",   href: "/discover/vendors" },
            { label: "Discover › Glossary",  href: "/discover/glossary" },
            { label: "Recommendations",      href: "/recommendations" },
            { label: "Journal",              href: "/journal" },
            { label: "About",                href: "/about" },
            { label: "Member profile",       href: "/member" },
            { label: "Member settings",      href: "/member/settings" },
            { label: "Sample tea",           href: "/tea/white2tea/gaba-shen-pu-er-spring-2023" },
            { label: "Tea w/ missing review", href: "/tea/yunnan-sourcing/silver-needle-fuding-2024" },
          ].map((b) => (
            <Link
              key={b.label}
              href={b.href}
              className="px-2 py-1.5 rounded-md border border-warm-200 bg-cream text-[11px] font-bold text-forest no-underline text-center hover:bg-warm-100 transition-colors"
            >
              {b.label}
            </Link>
          ))}
        </div>
      </Section>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-3 pb-3 border-b border-warm-200 last:border-b-0 last:pb-0 last:mb-0">
      <div className="text-[10px] font-bold tracking-widest uppercase text-warm-600 mb-2.5">
        {title}
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function Radio<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div>
      <div className="text-[11px] text-forest font-semibold mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={[
                "px-2 py-1 rounded-pill text-[10px] font-semibold cursor-pointer flex-grow",
                active
                  ? "border-1.5 border-burgundy bg-burgundy text-cream"
                  : "border border-warm-300 bg-transparent text-forest",
              ].join(" ")}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div>
      <div className="text-[11px] text-forest font-semibold mb-1.5">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full px-2 py-1.5 rounded-md border border-warm-300 bg-cream text-[11px] text-forest font-sans"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-3.5 h-3.5 cursor-pointer accent-burgundy shrink-0"
      />
      <span className="text-[11px] text-forest font-medium leading-snug">
        {label}
      </span>
    </label>
  );
}

// Suppress unused-imports warning for the type imports — they're used
// transitively via the `as T` casts in the generic helpers.
type _UsedTypes = Tweaks | RadarStyle | CardDensity | HeroVariant | FlavorMode;
