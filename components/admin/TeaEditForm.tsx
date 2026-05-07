"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Database } from "@/lib/supabase/types";
import { saveTea } from "@/app/admin/contributor/actions";

type TeaRow = Database["public"]["Tables"]["teas"]["Row"];

const labelCls = "block text-[10px] tracking-widest uppercase font-bold text-warm-600 mb-1.5";
const inputCls =
  "w-full px-3 py-2 rounded-md border border-warm-300 bg-cream text-[14px] font-sans focus:outline-none focus:border-burgundy";

const TEA_TYPES = ["Green", "White", "Yellow", "Oolong", "Black", "Pu'er", "Herbal"] as const;

const DEFAULT_BREWING = { style: "Gongfu", ratio: "5g/100ml", temp: "95°C", first: "5s" };
const DEFAULT_MOUTHFEEL = { astringent: 3, bodyFull: 5 };
const DEFAULT_FLAVOR = {
  vivek:   { floral: 0, fruity: 0, sweet: 0, honey: 0, nutty: 0, roasted: 0, woody: 0, earthy: 0, mineral: 0, marine: 0, vegetal: 0, spicy: 0 },
  james:   { floral: 0, fruity: 0, sweet: 0, honey: 0, nutty: 0, roasted: 0, woody: 0, earthy: 0, mineral: 0, marine: 0, vegetal: 0, spicy: 0 },
  members: { floral: 0, fruity: 0, sweet: 0, honey: 0, nutty: 0, roasted: 0, woody: 0, earthy: 0, mineral: 0, marine: 0, vegetal: 0, spicy: 0 },
};
const DEFAULT_REVIEWS = {
  vivek: null,
  james: null,
  members: { rating: 0, count: 0, body: "", date: "" },
};

export function TeaEditForm({
  tea,
  vendors,
}: {
  tea: TeaRow | null;
  vendors: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [slug,        setSlug]        = useState(tea?.slug ?? "");
  const [pathSlug,    setPathSlug]    = useState(tea?.path_slug ?? "");
  const [vendorSlug,  setVendorSlug]  = useState(tea?.vendor_slug ?? vendors[0]?.slug ?? "");
  const [name,        setName]        = useState(tea?.name ?? "");
  const [chinese,     setChinese]     = useState(tea?.chinese ?? "");
  const [type,        setType]        = useState<string>(tea?.type ?? "Pu'er");
  const [region,      setRegion]      = useState(tea?.region ?? "");
  const [country,     setCountry]     = useState(tea?.country ?? "");
  const [year,        setYear]        = useState(tea?.year ?? "");
  const [harvest,     setHarvest]     = useState(tea?.harvest ?? "Spring");
  const [elev,        setElev]        = useState<number>(tea?.elev ?? 1000);
  const [age,         setAge]         = useState(tea?.age ?? "fresh");
  const [price,       setPrice]       = useState<number>(tea ? Number(tea.price) : 0);
  const [rarity,      setRarity]      = useState<number>(tea?.rarity ?? 3);
  const [gradient,    setGradient]    = useState(
    tea?.gradient ?? "linear-gradient(135deg,#8B7355 0%,#5C4033 100%)"
  );
  const [swatch,      setSwatch]      = useState(tea?.swatch ?? "#5C4033");
  const [summary,     setSummary]     = useState(tea?.summary ?? "");
  const [finish,      setFinish]      = useState((tea?.finish ?? []).join(", "));
  const [sessionsCount, setSessionsCount] = useState<number>(tea?.sessions_count ?? 0);
  const [peakSteeps,  setPeakSteeps]  = useState((tea?.peak_steeps ?? []).join(", "));
  const [published,   setPublished]   = useState(tea?.published ?? false);

  // JSON-edited blocks. The shape of these is large enough that we
  // expose them as JSON textareas for the MVP — Studio remains the
  // power-user editor, this gets you 80% there.
  const [brewing,   setBrewing]   = useState(JSON.stringify(tea?.brewing ?? DEFAULT_BREWING, null, 2));
  const [mouthfeel, setMouthfeel] = useState(JSON.stringify(tea?.mouthfeel ?? DEFAULT_MOUTHFEEL, null, 2));
  const [flavor,    setFlavor]    = useState(JSON.stringify(tea?.flavor ?? DEFAULT_FLAVOR, null, 2));
  const [reviews,   setReviews]   = useState(JSON.stringify(tea?.reviews ?? DEFAULT_REVIEWS, null, 2));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let parsedBrewing, parsedMouthfeel, parsedFlavor, parsedReviews;
    try {
      parsedBrewing   = JSON.parse(brewing);
      parsedMouthfeel = JSON.parse(mouthfeel);
      parsedFlavor    = JSON.parse(flavor);
      parsedReviews   = JSON.parse(reviews);
    } catch (err) {
      setError("Invalid JSON in one of the structured fields. " + (err instanceof Error ? err.message : ""));
      return;
    }

    startTransition(async () => {
      const result = await saveTea({
        originalSlug: tea?.slug,
        slug,
        path_slug:   pathSlug,
        vendor_slug: vendorSlug,
        name,
        chinese:     chinese || null,
        type,
        region, country, year, harvest, elev, age, price, rarity,
        gradient, swatch, summary,
        brewing:    parsedBrewing,
        mouthfeel:  parsedMouthfeel,
        finish:     finish.split(",").map((s) => s.trim()).filter(Boolean),
        sessions_count: sessionsCount,
        peak_steeps:    peakSteeps.split(",").map((s) => Number(s.trim())).filter((n) => Number.isFinite(n)),
        flavor:     parsedFlavor,
        reviews:    parsedReviews,
        published,
      });
      if (!result.ok) { setError(result.message); return; }
      router.push("/admin/contributor/teas");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-[840px]">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-4">
        <div>
          <label className={labelCls} htmlFor="name">Name</label>
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="slug">Slug (legacy short)</label>
          <input id="slug" required pattern="[a-z0-9][a-z0-9-]*" value={slug} onChange={(e) => setSlug(e.target.value)} className={inputCls + " font-mono"} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="pathSlug">Path slug (URL segment)</label>
          <input id="pathSlug" required value={pathSlug} onChange={(e) => setPathSlug(e.target.value)} className={inputCls + " font-mono"} />
        </div>
        <div>
          <label className={labelCls} htmlFor="vendorSlug">Vendor</label>
          <select id="vendorSlug" value={vendorSlug} onChange={(e) => setVendorSlug(e.target.value)} className={inputCls}>
            {vendors.map((v) => <option key={v.slug} value={v.slug}>{v.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls} htmlFor="chinese">Chinese / native script</label>
          <input id="chinese" value={chinese} onChange={(e) => setChinese(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="type">Type</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
            {TEA_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="rarity">Rarity (1–5)</label>
          <input id="rarity" type="number" min={1} max={5} value={rarity} onChange={(e) => setRarity(Number(e.target.value))} className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls} htmlFor="region">Region</label>
          <input id="region" required value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="country">Country</label>
          <input id="country" required value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="elev">Elevation (m)</label>
          <input id="elev" type="number" min={0} value={elev} onChange={(e) => setElev(Number(e.target.value))} className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className={labelCls} htmlFor="year">Year</label>
          <input id="year" required value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="harvest">Harvest</label>
          <input id="harvest" required value={harvest} onChange={(e) => setHarvest(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="age">Age</label>
          <input id="age" required value={age} onChange={(e) => setAge(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="price">Price (USD/g)</label>
          <input id="price" type="number" step="0.01" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="summary">Summary (1–2 paragraphs)</label>
        <textarea id="summary" rows={4} required value={summary} onChange={(e) => setSummary(e.target.value)} className={inputCls + " font-serif text-[15px] leading-relaxed"} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="gradient">Gradient (CSS)</label>
          <input id="gradient" required value={gradient} onChange={(e) => setGradient(e.target.value)} className={inputCls + " font-mono text-[12px]"} />
        </div>
        <div>
          <label className={labelCls} htmlFor="swatch">Swatch (hex)</label>
          <input id="swatch" required value={swatch} onChange={(e) => setSwatch(e.target.value)} className={inputCls + " font-mono"} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls} htmlFor="finish">Finish (comma-separated)</label>
          <input id="finish" value={finish} onChange={(e) => setFinish(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="sessionsCount">Sessions logged</label>
          <input id="sessionsCount" type="number" min={0} value={sessionsCount} onChange={(e) => setSessionsCount(Number(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="peakSteeps">Peak steeps (e.g. 3, 4, 5)</label>
          <input id="peakSteeps" value={peakSteeps} onChange={(e) => setPeakSteeps(e.target.value)} className={inputCls + " font-mono"} />
        </div>
      </div>

      <details className="border border-warm-200 rounded-lg p-3">
        <summary className="cursor-pointer text-[11px] tracking-widest uppercase font-bold text-warm-700">
          Structured JSON · brewing / mouthfeel / flavor / reviews
        </summary>
        <p className="text-[11px] text-warm-600 mt-2 mb-3">
          These four fields back the radar + reviews UI. Edit as JSON for now;
          a structured editor lands in a follow-up.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls} htmlFor="brewing">brewing</label>
            <textarea id="brewing" rows={6} value={brewing} onChange={(e) => setBrewing(e.target.value)} className={inputCls + " font-mono text-[12px]"} />
          </div>
          <div>
            <label className={labelCls} htmlFor="mouthfeel">mouthfeel</label>
            <textarea id="mouthfeel" rows={6} value={mouthfeel} onChange={(e) => setMouthfeel(e.target.value)} className={inputCls + " font-mono text-[12px]"} />
          </div>
          <div>
            <label className={labelCls} htmlFor="flavor">flavor (vivek / james / members × 12 axes)</label>
            <textarea id="flavor" rows={14} value={flavor} onChange={(e) => setFlavor(e.target.value)} className={inputCls + " font-mono text-[11px]"} />
          </div>
          <div>
            <label className={labelCls} htmlFor="reviews">reviews</label>
            <textarea id="reviews" rows={14} value={reviews} onChange={(e) => setReviews(e.target.value)} className={inputCls + " font-mono text-[11px]"} />
          </div>
        </div>
      </details>

      <label className="inline-flex items-center gap-2 text-[12px] font-bold text-warm-700">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Published
      </label>

      {error && (
        <div className="text-[12px] text-burgundy bg-burgundy/5 border border-burgundy/20 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="px-4 py-2 rounded-pill bg-burgundy text-cream text-[12px] font-bold tracking-widest uppercase disabled:opacity-60">
          {pending ? "Saving…" : tea ? "Save changes" : "Create tea"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-pill border border-warm-300 text-warm-700 text-[12px] font-bold tracking-widest uppercase">
          Cancel
        </button>
      </div>
    </form>
  );
}
