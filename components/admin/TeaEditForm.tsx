"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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
const DEFAULT_MEMBERS_REVIEW = { rating: 0, count: 0, body: "", date: "" };

// Structured contributor-review panel state.
type ReviewPanel = {
  hasReview: boolean;
  rating: number;
  body: string;
  date: string;
  session: string;
  scale: "basic" | "advanced";
};

const EMPTY_PANEL: ReviewPanel = {
  hasReview: false,
  rating: 8,
  body: "",
  date: "",
  session: "",
  scale: "advanced",
};

function panelFromReview(r: unknown): ReviewPanel {
  if (!r || typeof r !== "object") return EMPTY_PANEL;
  const v = r as Record<string, unknown>;
  return {
    hasReview: true,
    rating: typeof v.rating === "number" ? v.rating : 8,
    body: typeof v.body === "string" ? v.body : "",
    date: typeof v.date === "string" ? v.date : "",
    session: typeof v.session === "string" ? v.session : "",
    scale: v.scale === "basic" ? "basic" : "advanced",
  };
}

function panelToReview(p: ReviewPanel) {
  if (!p.hasReview) return null;
  return {
    rating: p.rating,
    body: p.body,
    date: p.date,
    session: p.session || undefined,
    scale: p.scale,
  };
}

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
  const [subtitle,    setSubtitle]    = useState(tea?.subtitle ?? "");
  const [summary,     setSummary]     = useState(tea?.summary ?? "");
  const [finish,      setFinish]      = useState((tea?.finish ?? []).join(", "));
  const [sessionsCount, setSessionsCount] = useState<number>(tea?.sessions_count ?? 0);
  const [peakSteeps,  setPeakSteeps]  = useState((tea?.peak_steeps ?? []).join(", "));
  const [published,   setPublished]   = useState(tea?.published ?? false);

  // Structured panels for the two contributor reviews — pulled out of
  // the reviews jsonb because raw-JSON editing was the rough edge in
  // the previous form. Members aggregate + flavor radar stay as JSON
  // (less frequently touched, harder to surface as flat fields).
  const seedReviews = (tea?.reviews ?? null) as
    | { vivek?: unknown; james?: unknown; members?: unknown }
    | null;
  const [vivekReview, setVivekReview] = useState<ReviewPanel>(
    seedReviews?.vivek ? panelFromReview(seedReviews.vivek) : EMPTY_PANEL,
  );
  const [jamesReview, setJamesReview] = useState<ReviewPanel>(
    seedReviews?.james ? panelFromReview(seedReviews.james) : EMPTY_PANEL,
  );
  const [membersJson, setMembersJson] = useState(
    JSON.stringify(seedReviews?.members ?? DEFAULT_MEMBERS_REVIEW, null, 2),
  );
  // JSON-edited blocks for the rest — shape is large enough that flat
  // fields don't pay off.
  const [brewing,   setBrewing]   = useState(JSON.stringify(tea?.brewing ?? DEFAULT_BREWING, null, 2));
  const [mouthfeel, setMouthfeel] = useState(JSON.stringify(tea?.mouthfeel ?? DEFAULT_MOUTHFEEL, null, 2));
  const [flavor,    setFlavor]    = useState(JSON.stringify(tea?.flavor ?? DEFAULT_FLAVOR, null, 2));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let parsedBrewing, parsedMouthfeel, parsedFlavor, parsedMembers;
    try {
      parsedBrewing   = JSON.parse(brewing);
      parsedMouthfeel = JSON.parse(mouthfeel);
      parsedFlavor    = JSON.parse(flavor);
      parsedMembers   = JSON.parse(membersJson);
    } catch (err) {
      setError("Invalid JSON in one of the structured fields. " + (err instanceof Error ? err.message : ""));
      return;
    }
    const parsedReviews = {
      vivek: panelToReview(vivekReview),
      james: panelToReview(jamesReview),
      members: parsedMembers,
    };

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
        gradient, swatch,
        subtitle: subtitle.trim() || null,
        summary,
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

  // Existing-row preview link. New (unsaved) rows have no preview
  // target yet — show a disabled hint. After first save the page
  // re-renders with the new tea row and the link works.
  const previewHref = tea
    ? `/tea/${vendorSlug || tea.vendor_slug}/${pathSlug || tea.path_slug}?preview=1`
    : null;
  const wasPublished = tea?.published ?? false;

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-[840px]">
      {/* Top action bar — WordPress-lite status + preview + draft toggle. */}
      <div className="flex items-center justify-between gap-3 flex-wrap p-3 bg-cream rounded-lg border border-warm-200">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={[
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[10px] font-bold tracking-widest uppercase border",
              published
                ? "bg-sage-soft border-sage text-forest"
                : "bg-warm-100 border-warm-300 text-warm-600",
            ].join(" ")}
          >
            <span aria-hidden className={`w-1.5 h-1.5 rounded-full ${published ? "bg-forest" : "bg-warm-400"}`} />
            {published ? "Published" : "Draft"}
          </span>
          {previewHref ? (
            <a
              href={previewHref}
              target="_blank"
              rel="noopener"
              className="text-[12px] font-bold text-burgundy no-underline hover:underline"
            >
              Preview {published ? "live page" : "draft"} ↗
            </a>
          ) : (
            <span className="text-[11px] text-warm-600 italic">
              Preview available after the first save
            </span>
          )}
        </div>
        <label className="inline-flex items-center gap-2 text-[12px] font-bold text-warm-700">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          {wasPublished && !published
            ? "Will unpublish on save"
            : !wasPublished && published
              ? "Will publish on save"
              : "Published"}
        </label>
      </div>

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
        <label className={labelCls} htmlFor="subtitle">
          Card subtitle (optional)
        </label>
        <input
          id="subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Auto-derived from type + age + flavor when blank"
          className={inputCls}
        />
        <p className="text-[11px] text-warm-600 leading-snug mt-1">
          One-line plain-English tag shown under the tea name on cards.
          Keep it newcomer-friendly. Leave blank to auto-derive from
          type, age, and dominant flavor axes.
        </p>
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

      {/* === Reviews — structured panels for the two contributors === */}
      <fieldset className="border border-warm-200 rounded-lg p-4 space-y-4">
        <legend className="px-2 text-[10px] tracking-widest uppercase font-bold text-warm-600">
          Contributor reviews
        </legend>
        <p className="text-[12px] text-warm-700 leading-snug">
          Each of you can mark whether you&apos;ve reviewed this tea and
          fill in the structured fields. Saved into{" "}
          <code className="font-mono text-[11px]">reviews.vivek</code> /{" "}
          <code className="font-mono text-[11px]">reviews.james</code>.
          Members aggregate + the 12-axis flavor radar are still JSON
          below.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ReviewPanelEditor who="James" panel={jamesReview} onChange={setJamesReview} />
          <ReviewPanelEditor who="Vivek" panel={vivekReview} onChange={setVivekReview} />
        </div>
      </fieldset>

      <details className="border border-warm-200 rounded-lg p-3">
        <summary className="cursor-pointer text-[11px] tracking-widest uppercase font-bold text-warm-700">
          Structured JSON · brewing / mouthfeel / flavor / members aggregate
        </summary>
        <p className="text-[11px] text-warm-600 mt-2 mb-3">
          The radar shape (12 axes per contributor + members) and brewing
          parameters live as JSON for now — there&apos;s no flat-form gain
          on shapes this dense.
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
            <label className={labelCls} htmlFor="membersJson">reviews.members (aggregate)</label>
            <textarea id="membersJson" rows={6} value={membersJson} onChange={(e) => setMembersJson(e.target.value)} className={inputCls + " font-mono text-[12px]"} />
          </div>
        </div>
      </details>

      {/* Published toggle now lives in the top action bar. */}

      {error && (
        <div className="text-[12px] text-burgundy bg-burgundy/5 border border-burgundy/20 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex gap-3 sticky bottom-0 bg-[var(--bg)] py-3 -mx-4 px-4 border-t border-warm-200">
        <button type="submit" disabled={pending} className="px-4 py-2 rounded-pill bg-burgundy text-cream text-[12px] font-bold tracking-widest uppercase disabled:opacity-60">
          {pending
            ? "Saving…"
            : !tea
              ? (published ? "Publish" : "Save as draft")
              : wasPublished && !published
                ? "Save & unpublish"
                : !wasPublished && published
                  ? "Save & publish"
                  : "Save changes"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-pill border border-warm-300 text-warm-700 text-[12px] font-bold tracking-widest uppercase">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------
// ReviewPanelEditor — structured editor for one contributor's review.
// "Has reviewed" toggle gates the rest of the fields; when off, the
// review serializes to null in the reviews jsonb.
// ---------------------------------------------------------------------
function ReviewPanelEditor({
  who,
  panel,
  onChange,
}: {
  who: "Vivek" | "James";
  panel: ReviewPanel;
  onChange: (next: ReviewPanel) => void;
}) {
  const set = <K extends keyof ReviewPanel>(key: K, value: ReviewPanel[K]) =>
    onChange({ ...panel, [key]: value });

  return (
    <div className="border border-warm-200 rounded-lg p-3.5 bg-[var(--bg-elevated)]">
      <label className="inline-flex items-center gap-2 text-[13px] font-bold text-forest mb-3">
        <input
          type="checkbox"
          checked={panel.hasReview}
          onChange={(e) => set("hasReview", e.target.checked)}
        />
        {who} has reviewed this tea
      </label>

      {panel.hasReview && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor={`${who}-rating`}>
                Rating ({panel.scale === "basic" ? "0–5" : "0–10"})
              </label>
              <input
                id={`${who}-rating`}
                type="number"
                step="0.1"
                min={0}
                max={panel.scale === "basic" ? 5 : 10}
                value={panel.rating}
                onChange={(e) => set("rating", Number(e.target.value))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor={`${who}-scale`}>
                Scale
              </label>
              <select
                id={`${who}-scale`}
                value={panel.scale}
                onChange={(e) => set("scale", e.target.value as "basic" | "advanced")}
                className={inputCls}
              >
                <option value="advanced">Advanced (0–10)</option>
                <option value="basic">Basic (0–5)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor={`${who}-body`}>Review</label>
            <textarea
              id={`${who}-body`}
              rows={5}
              value={panel.body}
              onChange={(e) => set("body", e.target.value)}
              className={inputCls + " font-serif text-[14px] leading-relaxed"}
              placeholder="What did you taste? How did it brew? Would you buy it again?"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor={`${who}-date`}>Date</label>
              <input
                id={`${who}-date`}
                value={panel.date}
                onChange={(e) => set("date", e.target.value)}
                placeholder="Mar 8, 2026"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor={`${who}-session`}>Session string</label>
              <input
                id={`${who}-session`}
                value={panel.session}
                onChange={(e) => set("session", e.target.value)}
                placeholder="5g · 100ml gaiwan · 95°C"
                className={inputCls + " font-mono text-[12px]"}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
