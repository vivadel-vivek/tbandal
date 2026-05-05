"use client";

import Link from "next/link";
import { useState } from "react";
import { TEAS, VENDORS, teaAvg } from "@/lib/data";
import { useMember } from "@/contexts/MemberContext";
import { useTweaks } from "@/contexts/TweaksContext";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TeaCard } from "@/components/tea/TeaCard";
import type { TeaTypeName } from "@/lib/types";

type TypeFilter = "All" | TeaTypeName;
type SortKey = "rating" | "price" | "elev";

const TYPE_OPTIONS: TypeFilter[] = ["All", "Green", "White", "Oolong", "Black", "Pu'er"];
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "rating", label: "Highest rated" },
  { key: "price",  label: "Price" },
  { key: "elev",   label: "Elevation" },
];

export default function TeasPage() {
  const [type, setType] = useState<TypeFilter>("All");
  const [region, setRegion] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("rating");
  const { isBlindFor } = useMember();
  const { tweaks } = useTweaks();
  const hide = (slug: string) => tweaks.hideReviews || isBlindFor(slug);

  const regions: string[] = ["All", ...Array.from(new Set(TEAS.map((t) => t.country)))];

  let filtered = TEAS.filter(
    (t) =>
      (type === "All" || t.type === type) &&
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
    <main className="relative">
      <Container>
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-warm-600 text-[13px] font-sans no-underline mt-8"
        >
          ← Discover
        </Link>

        <div className="pt-3 pb-8">
          <Eyebrow>Discover · Teas</Eyebrow>
          <h1 className="font-display text-burgundy font-medium tracking-tight leading-[1.05] mt-2 mb-4 text-[64px]">
            <span className="italic">Every leaf,</span> recorded.
          </h1>
          <p className="max-w-[560px] text-warm-700 text-base mb-8">
            A working catalogue of {TEAS.length}+ teas we&apos;ve brewed, with
            notes from gongfu sessions, vendor pointers, and the occasional
            confession of a bad pour.
          </p>
        </div>

        <div className="grid grid-cols-[240px_1fr] gap-8 items-start">
          {/* Filter sidebar */}
          <aside className="bg-[var(--bg-elevated)] rounded-xl p-5 border border-warm-200 shadow-card sticky top-24">
            <FilterGroup
              label="Type"
              options={TYPE_OPTIONS}
              value={type}
              onChange={(v) => setType(v as TypeFilter)}
            />
            <FilterGroup
              label="Origin"
              options={regions}
              value={region}
              onChange={setRegion}
            />
            <div className="mt-4">
              <Eyebrow color="var(--warm-500, #857F79)">Vendor</Eyebrow>
              <div className="flex flex-col gap-1.5 mt-2.5">
                {VENDORS.map((v) => (
                  <label
                    key={v.slug}
                    className="flex items-center gap-2 text-[13px] text-warm-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      style={{ accentColor: "var(--burgundy, #722F37)" }}
                    />
                    {v.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <Eyebrow color="var(--warm-500, #857F79)">Elevation</Eyebrow>
              <div className="mt-3">
                <input
                  type="range"
                  min={0}
                  max={3000}
                  defaultValue={3000}
                  className="w-full"
                  style={{ accentColor: "var(--burgundy, #722F37)" }}
                />
                <div className="flex justify-between text-[11px] text-warm-500 mt-1">
                  <span>0m</span>
                  <span>3000m+</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="flex justify-between items-center mb-5">
              <span className="text-[13px] text-warm-600">
                {filtered.length} teas
              </span>
              <div className="flex gap-1.5">
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
            <div
              className={
                tweaks.density === "compact"
                  ? "grid grid-cols-3 gap-5"
                  : "grid grid-cols-2 gap-5"
              }
            >
              {filtered.map((t) => (
                <TeaCard
                  key={t.slug}
                  tea={t}
                  density={tweaks.density}
                  hideReviews={hide(t.slug)}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
      <div className="h-16" />
    </main>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-4">
      <Eyebrow color="var(--warm-500, #857F79)">{label}</Eyebrow>
      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {options.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              onClick={() => onChange(o)}
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
