"use client";

import { useState } from "react";
import { teaAvg } from "@/lib/tea-helpers";
import type { Tea, TeaTypeName, Vendor } from "@/lib/types";
import { useMember } from "@/contexts/MemberContext";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TeaCard } from "@/components/tea/TeaCard";

type TypeFilter = "All" | TeaTypeName;
type SortKey = "rating" | "price" | "elev";
type ViewMode = "standard" | "beginner";

const TYPE_OPTIONS: TypeFilter[] = [
  "All",
  "Green",
  "White",
  "Oolong",
  "Black",
  "Sheng Pu'er",
  "Shou Pu'er",
  "Dark",
];

// One-liner shown in the filter-chip `title` (native tooltip) so a
// newcomer doesn't bounce when they see "Sheng Pu'er" and don't know
// which one to click. Lay-user audit flagged this as a top blocker.
const TYPE_HINTS: Record<TypeFilter, string> = {
  "All":         "Every tea in the catalog",
  "Green":       "Unoxidized — bright, grassy, vegetal. Sencha, Longjing, matcha.",
  "White":       "Minimally processed — soft, honeyed. Silver Needle, Bai Mu Dan.",
  "Yellow":      "Rare, gentler-than-green. Junshan Yinzhen.",
  "Oolong":      "Partially oxidized — orchid-cream to roasted-fruit. Tieguanyin, Yancha.",
  "Black":       "Fully oxidized — malty, sweet. Same as Chinese 红茶 / hong cha.",
  "Sheng Pu'er": "Raw pu'er — bright, fruity, ages over years. Pressed cakes from Yunnan.",
  "Shou Pu'er":  "Ripe pu'er — wet-pile fermented, earthy, drinks young.",
  "Dark":        "Heicha (黑茶) — Anhua, Liu Bao, Fu Zhuan. Post-fermented, mellow, ages well.",
  "Herbal":      "Not actually tea — chamomile, rooibos, mint. No caffeine.",
};
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "rating", label: "Highest rated" },
  { key: "price", label: "Price" },
  { key: "elev", label: "Elevation" },
];

// Beginner-mode buckets — friendlier groupings than tea-type names.
// Each bucket maps to one or more TeaTypeName values; "All" matches
// every tea (standard mode equivalent).
type BeginnerBucket = {
  key: string;
  label: string;
  hint: string;
  types: readonly TeaTypeName[] | "all";
};

const BEGINNER_BUCKETS: BeginnerBucket[] = [
  { key: "all",     label: "All teas",         hint: "Show me everything",                        types: "all" },
  { key: "light",   label: "Light & floral",   hint: "Bright, gentle, easy to like",              types: ["Green", "White", "Yellow"] },
  { key: "layered", label: "Layered & complex", hint: "Floral up front, depth underneath",        types: ["Oolong"] },
  { key: "bold",    label: "Bold & roasted",   hint: "Hearty, malty, breakfast-cup country",      types: ["Black"] },
  { key: "earthy",  label: "Earthy & aged",    hint: "Forest floor, mineral sweetness, depth",    types: ["Sheng Pu'er", "Shou Pu'er", "Dark"] },
  { key: "herbal",  label: "Herbal",           hint: "Caffeine-free, soothing, anytime",          types: ["Herbal"] },
];

type Props = {
  teas: Tea[];
  vendors: Vendor[];
};

/**
 * Interactive filter sidebar + result grid for /discover/teas.
 * Client island — the parent page stays RSC and passes the catalogue
 * + vendor list down as static JSON. Once Airtable lands the page
 * fetches both at build time and ISR-revalidates on tag change.
 */
export function TeaBrowser({ teas, vendors }: Props) {
  const [view, setView] = useState<ViewMode>("standard");
  const [type, setType] = useState<TypeFilter>("All");
  const [bucket, setBucket] = useState<string>("all");
  const [region, setRegion] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("rating");
  const { isBlindFor } = useMember();
  const hide = (slug: string) => isBlindFor(slug);

  const regions: string[] = [
    "All",
    ...Array.from(new Set(teas.map((t) => t.country))),
  ];

  // Type filter behaves differently per view: standard uses TYPE_OPTIONS;
  // beginner uses the friendlier bucket grouping that maps each bucket
  // to one or more tea-type values.
  const matchesTypeFilter = (t: Tea): boolean => {
    if (view === "standard") {
      return type === "All" || t.type === type;
    }
    const b = BEGINNER_BUCKETS.find((x) => x.key === bucket);
    if (!b || b.types === "all") return true;
    return (b.types as readonly TeaTypeName[]).includes(t.type);
  };

  let filtered = teas.filter(
    (t) =>
      matchesTypeFilter(t) &&
      (region === "All" || t.country === region),
  );
  if (sort === "rating") {
    filtered = [...filtered].sort((a, b) => teaAvg(b) - teaAvg(a));
  } else if (sort === "price") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sort === "elev") {
    filtered = [...filtered].sort((a, b) => b.elev - a.elev);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-5 sm:gap-8 items-start">
      <aside className="card-surface p-5 sm:sticky sm:top-24">
        {/* View toggle: switches between tea-type filter (standard)
            and friendlier bucket grouping (beginner). Sticky toggle
            so the choice doesn't get lost on scroll. */}
        <div className="mb-5">
          <Eyebrow color="var(--warm-600, #6B6560)">View</Eyebrow>
          <div className="flex gap-1 p-1 bg-cream rounded-pill mt-2 border border-warm-200">
            {(["standard", "beginner"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={[
                  "flex-1 px-2.5 py-1 rounded-pill text-[11px] font-bold tracking-wide transition-colors cursor-pointer border-0",
                  view === v
                    ? "bg-burgundy text-cream"
                    : "bg-transparent text-warm-700",
                ].join(" ")}
              >
                {v === "standard" ? "Standard" : "New to tea"}
              </button>
            ))}
          </div>
        </div>

        {view === "standard" ? (
          <FilterGroup
            label="Type"
            options={TYPE_OPTIONS}
            value={type}
            onChange={(v) => setType(v as TypeFilter)}
            hints={TYPE_HINTS}
          />
        ) : (
          // Beginner buckets render as wider buttons with a hint line —
          // "Light & floral" + "Bright, gentle, easy to like" reads
          // better than a bare "Green" radio.
          <div className="mb-4">
            <Eyebrow color="var(--warm-600, #6B6560)">What kind of cup?</Eyebrow>
            <div className="flex flex-col gap-2 mt-2.5">
              {BEGINNER_BUCKETS.map((b) => {
                const active = bucket === b.key;
                return (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => setBucket(b.key)}
                    className={[
                      "w-full text-left px-3 py-2.5 rounded-md transition-colors cursor-pointer border",
                      active
                        ? "bg-burgundy-muted border-burgundy text-burgundy"
                        : "bg-transparent border-warm-200 hover:bg-cream text-forest",
                    ].join(" ")}
                  >
                    <div className="text-[13px] font-bold leading-tight">
                      {b.label}
                    </div>
                    <div className="text-[11px] text-warm-600 leading-snug mt-0.5">
                      {b.hint}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <FilterGroup
          label="Origin"
          options={regions}
          value={region}
          onChange={setRegion}
        />
        <div className="mt-4">
          <Eyebrow color="var(--warm-600, #6B6560)">Vendor</Eyebrow>
          <div className="flex flex-col gap-1.5 mt-2.5">
            {vendors.map((v) => (
              <label
                key={v.slug}
                className="flex items-center gap-2 text-[13px] text-warm-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  defaultChecked
                  className="accent-burgundy"
                />
                {v.name}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <Eyebrow color="var(--warm-600, #6B6560)">Elevation</Eyebrow>
          <div className="mt-3">
            <input
              type="range"
              min={0}
              max={3000}
              defaultValue={3000}
              className="w-full accent-burgundy"
            />
            <div className="flex justify-between text-[11px] text-warm-600 mt-1">
              <span>0m</span>
              <span>3000m+</span>
            </div>
          </div>
        </div>
      </aside>

      <div>
        <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
          <span className="text-[13px] text-warm-600">
            {filtered.length} teas
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {SORT_OPTIONS.map((o) => {
              const active = sort === o.key;
              return (
                <button
                  key={o.key}
                  onClick={() => setSort(o.key)}
                  className={[
                    "px-3 py-1.5 rounded-pill font-sans text-[11px] font-bold cursor-pointer",
                    active
                      ? "border-1.5 border-burgundy bg-burgundy-muted text-burgundy"
                      : "border border-warm-300 bg-transparent text-forest",
                  ].join(" ")}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {filtered.map((t, i) => (
            <TeaCard
              key={t.slug}
              tea={t}
              density="cozy"
              hideReviews={hide(t.slug)}
              // First two cards are above-the-fold on every viewport
              // and one of them is the LCP element on /discover/teas
              // — eager-load to avoid lcp-lazy-loaded.
              priority={i < 2}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
  hints,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  /** Optional per-option tooltip — newcomer-friendly definitions
   *  shown on hover/long-press so unfamiliar terms (Sheng Pu'er,
   *  Yancha) aren't a dead-end. */
  hints?: Record<string, string>;
}) {
  return (
    <div className="mb-4">
      <Eyebrow color="var(--warm-600, #6B6560)">{label}</Eyebrow>
      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {options.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              onClick={() => onChange(o)}
              title={hints?.[o]}
              aria-label={hints?.[o] ? `${o} — ${hints[o]}` : o}
              className={[
                "px-2.5 py-1 rounded-pill font-sans text-[11px] font-semibold cursor-pointer",
                active
                  ? "border-1.5 border-burgundy bg-burgundy text-cream"
                  : "border border-warm-300 bg-transparent text-forest",
              ].join(" ")}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
