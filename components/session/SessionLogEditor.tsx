"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type {
  FlavorProfile,
  MemberRating,
  Mouthfeel,
  SessionMode,
  SteepLog,
  Tea,
  WaterSource,
} from "@/lib/types";
import {
  BASIC_AXES,
  FLAVOR_AXES,
  meanMouthfeel,
  meanProfile,
  rollUpProfile,
} from "@/lib/flavor";
import { useMember } from "@/contexts/MemberContext";
import { vesselTeaware } from "@/lib/data";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { RadarChart } from "@/components/tea/RadarChart";
import { MouthfeelGrid } from "@/components/tea/MouthfeelGrid";
import { SteepTimer } from "@/components/session/SteepTimer";

type Scale = "basic" | "advanced";

type Props = {
  tea: Tea;
  /** Existing rating to edit. If omitted, the editor reads the
   *  current member's rating for this tea from MemberContext (so
   *  navigating from "Edit my rating" prefills automatically). */
  initial?: MemberRating;
};

const ZERO_PROFILE = (): FlavorProfile =>
  Object.fromEntries(FLAVOR_AXES.map((a) => [a.key, 4])) as FlavorProfile;

const ZERO_MOUTHFEEL = (): Mouthfeel => ({ astringent: 5, bodyFull: 5 });

export function SessionLogEditor({ tea, initial: initialProp }: Props) {
  const router = useRouter();
  const { upsertRating, member } = useMember();
  // Fall back to the member's existing rating for this tea — turns this
  // page into "edit your session" automatically when one already exists.
  const initial: MemberRating | undefined =
    initialProp ?? member.ratings.find((r) => r.slug === tea.slug);

  // ---- session-level state ------------------------------------------
  const [scale, setScale] = useState<Scale>(
    initial?.scale ?? (member.settings.flavorMode === "advanced" ? "advanced" : "basic"),
  );
  const [mode, setMode] = useState<SessionMode>(initial?.mode ?? "quick");

  // Overall fields — used directly in Quick mode; auto-derived from
  // steeps in Per-steep mode but still settable as an override.
  const [score, setScore] = useState<number>(initial?.rating ?? 7.5);
  const [body, setBody] = useState<string>(initial?.body ?? "");
  const [profile, setProfile] = useState<FlavorProfile>(
    initial?.profile ?? ZERO_PROFILE(),
  );
  const [mouthfeel, setMouthfeel] = useState<Mouthfeel>(
    initial?.mouthfeel ?? ZERO_MOUTHFEEL(),
  );

  // Brewing meta — applies to the whole session
  const [vessel, setVessel] = useState<string>(
    initial?.vessel ?? defaultVessel(tea),
  );
  const [water, setWater] = useState<string>(initial?.water ?? "");
  const [leafG, setLeafG] = useState<string>(
    initial?.leafG !== undefined ? String(initial.leafG) : defaultLeafG(tea),
  );
  const [waterMl, setWaterMl] = useState<string>(
    initial?.waterMl !== undefined ? String(initial.waterMl) : defaultWaterMl(tea),
  );
  const [waterSource, setWaterSource] = useState<WaterSource | "">(
    initial?.waterSource ?? "",
  );
  const [waterTdsPpm, setWaterTdsPpm] = useState<string>(
    initial?.waterTdsPpm !== undefined ? String(initial.waterTdsPpm) : "",
  );
  const [brewStyleOverride, setBrewStyleOverride] = useState<string>(
    initial?.brewStyleOverride ?? "",
  );
  // Auto-expand the disclosure if the saved rating uses any of these
  // fields, so editing an advanced session shows them right away.
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(
    Boolean(
      initial?.waterSource ||
        initial?.waterTdsPpm !== undefined ||
        initial?.brewStyleOverride,
    ),
  );

  // Per-steep entries — initialised with one steep when entering
  // Per-steep mode for the first time.
  const [steeps, setSteeps] = useState<SteepLog[]>(initial?.steeps ?? []);

  // Whether the user has manually overridden the auto-averaged overall
  // values. Once they touch the overall flavor / score in Per-steep
  // mode we stop computing it from steeps.
  const [overallTouched, setOverallTouched] = useState(false);

  // ---- derived: per-steep auto-roll-up ------------------------------
  const aggregated = useMemo(() => {
    if (mode !== "per-steep" || steeps.length === 0) return null;
    const flavors = steeps
      .map((s) => s.flavor)
      .filter((f): f is FlavorProfile => Boolean(f));
    const mouths = steeps
      .map((s) => s.mouthfeel)
      .filter((m): m is Mouthfeel => Boolean(m));
    const ratings = steeps
      .map((s) => s.rating)
      .filter((r): r is number => typeof r === "number");
    return {
      flavor: flavors.length ? meanProfile(flavors) : null,
      mouthfeel: mouths.length ? meanMouthfeel(mouths) : null,
      rating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
    };
  }, [mode, steeps]);

  // The "live" profile used by the radar / save: aggregated when in
  // Per-steep mode and the user hasn't manually overridden, else the
  // direct overall state.
  const liveProfile: FlavorProfile =
    mode === "per-steep" && aggregated?.flavor && !overallTouched
      ? aggregated.flavor
      : profile;
  const liveMouthfeel: Mouthfeel =
    mode === "per-steep" && aggregated?.mouthfeel && !overallTouched
      ? aggregated.mouthfeel
      : mouthfeel;
  const liveScore: number =
    mode === "per-steep" && aggregated?.rating !== null && aggregated?.rating !== undefined && !overallTouched
      ? aggregated.rating
      : score;

  const isBasic = scale === "basic";
  const basicView = useMemo(() => rollUpProfile(liveProfile), [liveProfile]);

  // ---- save ---------------------------------------------------------
  const handleSave = () => {
    const finalProfile = liveProfile;
    const finalMouthfeel = liveMouthfeel;
    const finalScore = liveScore;
    const finalSteeps = mode === "per-steep" ? steeps : undefined;

    const rating: MemberRating = {
      slug: tea.slug,
      name: tea.name,
      rating: finalScore,
      body: body.trim() || "(no notes)",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      scale,
      profile: finalProfile,
      mouthfeel: finalMouthfeel,
      mode,
      steeps: finalSteeps,
      vessel: vessel.trim() || undefined,
      water: water.trim() || undefined,
      waterSource: waterSource || undefined,
      waterTdsPpm: waterTdsPpm.trim() ? Number(waterTdsPpm) : undefined,
      brewStyleOverride:
        brewStyleOverride && brewStyleOverride !== tea.brewing.style
          ? brewStyleOverride
          : undefined,
      leafG: leafG.trim() ? Number(leafG) : undefined,
      waterMl: waterMl.trim() ? Number(waterMl) : undefined,
    };
    upsertRating(rating);
    router.push(`/tea/${vendorSlug(tea)}/${tea.pathSlug}`);
  };

  return (
    <Container size="article">
      <Link
        href={`/tea/${vendorSlug(tea)}/${tea.pathSlug}`}
        className="back-link mt-8 mb-2"
      >
        ← Back to {tea.name}
      </Link>

      <div className="pt-2 pb-5 sm:pb-6">
        <Eyebrow>{initial ? "Edit your session" : "Log a session"}</Eyebrow>
        <h1 className="font-display italic text-burgundy font-medium tracking-tight leading-hero mt-2 mb-3 text-[36px] sm:text-hero-xl">
          {tea.name}
        </h1>
        <p className="text-base text-warm-700 max-w-[640px] m-0">
          {tea.region} · {tea.year} · sold by {tea.vendor}
        </p>
      </div>

      {/* ---- Mode toggles --------------------------------------------- */}
      <div className="flex flex-wrap gap-3 mb-6">
        <ToggleGroup
          label="Session"
          value={mode}
          onChange={(m) => {
            setMode(m);
            if (m === "per-steep" && steeps.length === 0) {
              // seed with one steep so the user has something to edit
              setSteeps([blankSteep(1, tea)]);
            }
          }}
          options={[
            { value: "quick", label: "Quick", sub: "One overall" },
            { value: "per-steep", label: "Per-steep", sub: "Log each pour" },
          ]}
        />
        <ToggleGroup
          label="Scale"
          value={scale}
          onChange={setScale}
          options={[
            { value: "basic", label: "Basic", sub: "6 axes / 5pt" },
            { value: "advanced", label: "Advanced", sub: "12 axes / 10pt" },
          ]}
        />
      </div>

      {/* ---- Brewing meta — session-level ----------------------------- */}
      <SessionMeta
        vessel={vessel}
        water={water}
        leafG={leafG}
        waterMl={waterMl}
        waterSource={waterSource}
        waterTdsPpm={waterTdsPpm}
        brewStyleOverride={brewStyleOverride}
        advancedOpen={advancedOpen}
        onVessel={setVessel}
        onWater={setWater}
        onLeafG={setLeafG}
        onWaterMl={setWaterMl}
        onWaterSource={setWaterSource}
        onWaterTdsPpm={setWaterTdsPpm}
        onBrewStyleOverride={setBrewStyleOverride}
        onToggleAdvanced={() => setAdvancedOpen((v) => !v)}
        defaultStyle={tea.brewing.style}
      />

      {/* ---- Overall score -------------------------------------------- */}
      <section className="card-surface p-6 mb-5">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <Eyebrow>Overall score</Eyebrow>
          {mode === "per-steep" && aggregated?.rating !== null && aggregated?.rating !== undefined && !overallTouched && (
            <span className="text-[11px] text-warm-600 italic">
              auto from {steeps.filter((s) => typeof s.rating === "number").length} steep score{steeps.filter((s) => typeof s.rating === "number").length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <ScoreSlider
          scale={scale}
          value={liveScore}
          onChange={(v) => {
            setOverallTouched(true);
            setScore(v);
          }}
        />
      </section>

      {/* ---- Quick mode: overall flavor + mouthfeel ------------------- */}
      {mode === "quick" && (
        <>
          <FlavorSection
            scale={scale}
            profile={profile}
            basicView={basicView}
            isBasic={isBasic}
            onChange={setProfile}
          />
          <MouthfeelSection
            mouthfeel={mouthfeel}
            onChange={setMouthfeel}
          />
        </>
      )}

      {/* ---- Per-steep mode: steep cards ------------------------------ */}
      {mode === "per-steep" && (
        <SteepList
          steeps={steeps}
          scale={scale}
          tea={tea}
          onChange={setSteeps}
        />
      )}

      {/* ---- Notes ---------------------------------------------------- */}
      <section className="card-surface p-6 mb-5">
        <Eyebrow>Notes</Eyebrow>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder={
            mode === "quick"
              ? "What did you taste? How did it evolve? What does it remind you of?"
              : "Anything that spans the whole session — context, weather, who you brewed it for, lasting impression."
          }
          className="w-full mt-2.5 px-4 py-3 font-serif italic text-base bg-cream border border-warm-200 rounded-md text-forest resize-y leading-relaxed outline-none"
        />
      </section>

      {/* ---- Live preview of overall radar + mouthfeel (Per-steep) ---- */}
      {mode === "per-steep" && (
        <section className="card-surface p-6 mb-5">
          <Eyebrow>Session preview</Eyebrow>
          <p className="text-[13px] text-warm-700 mt-2 mb-4">
            Auto-averaged from your {steeps.length} steep{steeps.length === 1 ? "" : "s"} —
            this is what gets saved as your overall.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_1fr] gap-5 sm:gap-6 items-center">
            <RadarChart
              profiles={[
                {
                  values: isBasic ? rollUpProfile(liveProfile) : liveProfile,
                  color: "var(--burgundy, #722F37)",
                },
              ]}
              axes={isBasic ? BASIC_AXES : FLAVOR_AXES}
              size={320}
              style="fill"
            />
            <MouthfeelGrid point={liveMouthfeel} size={220} />
          </div>
        </section>
      )}

      {/* ---- Footer: save / cancel ------------------------------------ */}
      <div className="flex justify-between items-center gap-3 py-6 border-t border-warm-200 flex-wrap">
        <span className="text-[12px] text-warm-600 max-w-[460px]">
          Saved sessions refine your flavor map and personalise the
          recommendations engine. Phase 6c will sync these to your account
          server-side; for now they live in this browser.
        </span>
        <div className="flex gap-2.5">
          <Link href={`/tea/${vendorSlug(tea)}/${tea.pathSlug}`}>
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button variant="primary" size="lg" onClick={handleSave}>
            {initial ? "Save changes" : "Save session"}
          </Button>
        </div>
      </div>

      <div className="h-16" />
    </Container>
  );
}

// =====================================================================
// Sub-components
// =====================================================================

const WATER_SOURCE_OPTIONS: { value: WaterSource; label: string }[] = [
  { value: "filtered", label: "Filtered" },
  { value: "spring", label: "Spring" },
  { value: "bottled", label: "Bottled" },
  { value: "ro", label: "Reverse osmosis" },
  { value: "distilled", label: "Distilled" },
  { value: "tap", label: "Tap" },
  { value: "well", label: "Well" },
  { value: "unknown", label: "Unknown" },
];

const BREW_STYLE_OPTIONS = [
  "Gongfu",
  "Western",
  "Glass / Grandpa",
  "Kyusu",
  "Cold brew",
];

function SessionMeta({
  vessel, water, leafG, waterMl,
  waterSource, waterTdsPpm, brewStyleOverride, advancedOpen, defaultStyle,
  onVessel, onWater, onLeafG, onWaterMl,
  onWaterSource, onWaterTdsPpm, onBrewStyleOverride, onToggleAdvanced,
}: {
  vessel: string; water: string; leafG: string; waterMl: string;
  waterSource: WaterSource | "";
  waterTdsPpm: string;
  brewStyleOverride: string;
  advancedOpen: boolean;
  defaultStyle: string;
  onVessel: (v: string) => void;
  onWater: (v: string) => void;
  onLeafG: (v: string) => void;
  onWaterMl: (v: string) => void;
  onWaterSource: (v: WaterSource | "") => void;
  onWaterTdsPpm: (v: string) => void;
  onBrewStyleOverride: (v: string) => void;
  onToggleAdvanced: () => void;
}) {
  // Vessel picker: rendered as a select sourced from /discover/teaware,
  // with "Custom" falling through to the inline text input. Selecting
  // a catalog item populates the vessel string with its display name —
  // we keep the field as freeform on save so old ratings stay valid.
  const vessels = vesselTeaware();
  const matched = vessels.find((v) => v.name === vessel);
  const [usingCustom, setUsingCustom] = useState<boolean>(
    vessel.length > 0 && !matched,
  );
  const isCustom = usingCustom || (!matched && vessel.length === 0);

  return (
    <section className="card-surface p-6 mb-5">
      <div className="flex justify-between items-baseline gap-4 flex-wrap">
        <Eyebrow>Brewing meta</Eyebrow>
        <Link
          href="/discover/teaware"
          className="text-[11px] text-burgundy font-bold no-underline"
        >
          Browse teaware →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <Field label="Vessel" hint="Pot / cup you brewed in.">
          <div className="flex flex-col gap-1.5">
            <select
              value={isCustom ? "__custom__" : (matched?.slug ?? "")}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "__custom__") {
                  setUsingCustom(true);
                  return;
                }
                setUsingCustom(false);
                const picked = vessels.find((x) => x.slug === v);
                onVessel(picked?.name ?? "");
              }}
              className={inputCls}
            >
              <option value="">— Pick from teaware —</option>
              {vessels.map((v) => (
                <option key={v.slug} value={v.slug}>
                  {v.name}
                </option>
              ))}
              <option value="__custom__">Other / custom…</option>
            </select>
            {isCustom && (
              <input
                value={vessel}
                onChange={(e) => onVessel(e.target.value)}
                placeholder={`e.g. 100ml porcelain ${defaultStyle.toLowerCase().includes("kyusu") ? "kyusu" : "gaiwan"}`}
                className={inputCls}
              />
            )}
          </div>
        </Field>
        <Field label="Water" hint='Type + TDS if you know it. "Filtered, 60 TDS"'>
          <input
            value={water}
            onChange={(e) => onWater(e.target.value)}
            placeholder="filtered (60 TDS)"
            className={inputCls}
          />
        </Field>
        <Field label="Leaf weight (g)">
          <input
            type="number"
            min={0}
            step={0.1}
            value={leafG}
            onChange={(e) => onLeafG(e.target.value)}
            placeholder="5"
            className={inputCls}
          />
        </Field>
        <Field label="Water volume (ml)">
          <input
            type="number"
            min={0}
            step={5}
            value={waterMl}
            onChange={(e) => onWaterMl(e.target.value)}
            placeholder="100"
            className={inputCls}
          />
        </Field>
      </div>

      <div className="mt-5 pt-4 border-t border-warm-200">
        <button
          type="button"
          onClick={onToggleAdvanced}
          aria-expanded={advancedOpen}
          className="inline-flex items-center gap-2 bg-transparent border-0 p-0 cursor-pointer font-sans text-[12px] font-bold tracking-wide text-burgundy"
        >
          <span
            aria-hidden
            className="text-[10px] transition-transform duration-fast ease-smooth"
            style={{ transform: advancedOpen ? "rotate(90deg)" : "rotate(0)" }}
          >
            ▶
          </span>
          {advancedOpen ? "Hide advanced details" : "Add advanced details"}
          <span className="text-warm-600 italic font-medium">
            · water source, TDS, brew override
          </span>
        </button>

        {advancedOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <Field
              label="Water source"
              hint="Helps spot when water is muting mid-range flavors."
            >
              <select
                value={waterSource}
                onChange={(e) =>
                  onWaterSource(
                    (e.target.value || "") as WaterSource | "",
                  )
                }
                className={inputCls}
              >
                <option value="">— Select —</option>
                {WATER_SOURCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="TDS (ppm)"
              hint="30–80 ppm for delicate teas; >150 flattens."
            >
              <input
                type="number"
                min={0}
                max={500}
                step={5}
                value={waterTdsPpm}
                onChange={(e) => onWaterTdsPpm(e.target.value)}
                placeholder="60"
                className={inputCls}
              />
            </Field>
            <Field
              label="Brew style"
              hint={`Recommended: ${defaultStyle}. Override only if you brewed off-spec.`}
            >
              <select
                value={brewStyleOverride || defaultStyle}
                onChange={(e) => onBrewStyleOverride(e.target.value)}
                className={inputCls}
              >
                {/* Ensure the tea's recommended style is always selectable
                    even if it's not in the canonical option list. */}
                {!BREW_STYLE_OPTIONS.includes(defaultStyle) && (
                  <option value={defaultStyle}>{defaultStyle}</option>
                )}
                {BREW_STYLE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                    {s === defaultStyle ? " (recommended)" : ""}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}
      </div>
    </section>
  );
}

function FlavorSection({
  scale, profile, basicView, isBasic, onChange,
}: {
  scale: Scale;
  profile: FlavorProfile;
  basicView: ReturnType<typeof rollUpProfile>;
  isBasic: boolean;
  onChange: (p: FlavorProfile) => void;
}) {
  const setAdv = (key: string, v: number) =>
    onChange({ ...profile, [key]: v });

  const setBasic = (basicKey: string, v5: number) => {
    const ax = BASIC_AXES.find((a) => a.key === basicKey);
    if (!ax) return;
    const v10 = v5 * 2;
    onChange({
      ...profile,
      ...Object.fromEntries(ax.members.map((k) => [k, v10])),
    } as FlavorProfile);
  };

  return (
    <section className="card-surface p-6 mb-5">
      <div className="flex justify-between items-baseline gap-4 flex-wrap mb-3">
        <Eyebrow>
          Flavor profile · {isBasic ? "6 simple axes" : "12 axes"}
        </Eyebrow>
        <span className="text-[11px] text-warm-600">{isBasic ? "0–5" : "0–10"}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.2fr] gap-5 sm:gap-6 items-center">
        <RadarChart
          profiles={[{ values: isBasic ? basicView : profile, color: "var(--burgundy, #722F37)" }]}
          axes={isBasic ? BASIC_AXES : FLAVOR_AXES}
          size={280}
          style="fill"
        />
        {isBasic ? (
          <div className="flex flex-col gap-3">
            {BASIC_AXES.map((ax) => {
              const v10 = basicView[ax.key] ?? 0;
              const v5 = Math.round(v10 / 2);
              return (
                <div key={ax.key}>
                  <div className="flex items-center gap-2">
                    <div className="min-w-[70px] text-xs font-bold text-forest">
                      {ax.label}
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={1}
                      value={v5}
                      onChange={(e) => setBasic(ax.key, Number(e.target.value))}
                      aria-label={`${ax.label} intensity, 0 to 5, currently ${v5}`}
                      className="flex-1"
                      style={{ accentColor: ax.color }}
                    />
                    <div className="min-w-[28px] text-[11px] text-warm-700 text-right font-mono font-semibold">
                      {v5}/5
                    </div>
                  </div>
                  <div className="text-[10px] text-warm-700 ml-[78px] mt-0.5 leading-snug italic">
                    {ax.lay}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            {FLAVOR_AXES.map((ax) => (
              <div key={ax.key} className="flex items-center gap-2">
                <div className="min-w-[64px] text-[11px] text-forest font-semibold">
                  {ax.label}
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={profile[ax.key] ?? 0}
                  onChange={(e) => setAdv(ax.key, Number(e.target.value))}
                  aria-label={`${ax.label} intensity, 0 to 10, currently ${profile[ax.key] ?? 0}`}
                  className="flex-1"
                  style={{ accentColor: ax.color }}
                />
                <div className="min-w-[14px] text-[11px] text-warm-700 text-right font-mono">
                  {profile[ax.key] ?? 0}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function MouthfeelSection({
  mouthfeel, onChange,
}: {
  mouthfeel: Mouthfeel;
  onChange: (m: Mouthfeel) => void;
}) {
  return (
    <section className="card-surface p-6 mb-5">
      <Eyebrow>Mouthfeel</Eyebrow>
      <p className="text-[13px] text-warm-700 mt-2 mb-3 max-w-[480px]">
        How does the cup sit on your tongue? Two axes — one for body
        (light to full), one for surface texture (oily to astringent).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-5 sm:gap-6 items-center">
        <MouthfeelGrid point={mouthfeel} size={240} />
        <div className="flex flex-col gap-4">
          <SliderRow
            label="Body"
            leftLabel="Light"
            rightLabel="Full"
            value={mouthfeel.bodyFull}
            onChange={(v) => onChange({ ...mouthfeel, bodyFull: v })}
          />
          <SliderRow
            label="Texture"
            leftLabel="Oily"
            rightLabel="Astringent"
            value={mouthfeel.astringent}
            onChange={(v) => onChange({ ...mouthfeel, astringent: v })}
          />
        </div>
      </div>
    </section>
  );
}

function SteepList({
  steeps, scale, tea, onChange,
}: {
  steeps: SteepLog[];
  scale: Scale;
  tea: Tea;
  onChange: (s: SteepLog[]) => void;
}) {
  const addSteep = () => {
    const next = blankSteep(steeps.length + 1, tea);
    // Carry forward the previous steep's flavor / mouthfeel as a
    // sensible starting point — most steeps drift gradually.
    const prev = steeps[steeps.length - 1];
    if (prev) {
      next.flavor = prev.flavor ? { ...prev.flavor } : undefined;
      next.mouthfeel = prev.mouthfeel ? { ...prev.mouthfeel } : undefined;
    }
    onChange([...steeps, next]);
  };

  const removeSteep = (index: number) => {
    onChange(
      steeps
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, index: i + 1 })),
    );
  };

  const updateSteep = (index: number, patch: Partial<SteepLog>) => {
    onChange(steeps.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  return (
    <section className="mb-5">
      <div className="flex justify-between items-baseline mb-3">
        <Eyebrow>Steeps · {steeps.length}</Eyebrow>
        <Button variant="secondary" size="sm" onClick={addSteep}>
          + Add steep
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        {steeps.map((steep, i) => (
          <SteepCard
            key={i}
            steep={steep}
            scale={scale}
            canRemove={steeps.length > 1}
            onRemove={() => removeSteep(i)}
            onChange={(patch) => updateSteep(i, patch)}
          />
        ))}
      </div>
    </section>
  );
}

function SteepCard({
  steep, scale, canRemove, onRemove, onChange,
}: {
  steep: SteepLog;
  scale: Scale;
  canRemove: boolean;
  onRemove: () => void;
  onChange: (patch: Partial<SteepLog>) => void;
}) {
  const isBasic = scale === "basic";
  const flavor = steep.flavor ?? ZERO_PROFILE();
  const mouthfeel = steep.mouthfeel ?? ZERO_MOUTHFEEL();
  const basicView = useMemo(() => rollUpProfile(flavor), [flavor]);
  const score = steep.rating ?? 7;

  const setAdv = (key: string, v: number) =>
    onChange({ flavor: { ...flavor, [key]: v } });

  const setBasic = (basicKey: string, v5: number) => {
    const ax = BASIC_AXES.find((a) => a.key === basicKey);
    if (!ax) return;
    const v10 = v5 * 2;
    onChange({
      flavor: { ...flavor, ...Object.fromEntries(ax.members.map((k) => [k, v10])) } as FlavorProfile,
    });
  };

  return (
    <article className="card-surface p-5">
      {/* Top row: # · time · temp · score · remove */}
      <div className="flex items-center gap-3 flex-wrap mb-4 pb-3 border-b border-warm-200">
        <div className="font-display italic text-burgundy font-medium text-2xl min-w-[40px]">
          #{steep.index}
        </div>
        <Field label="Time" compact>
          <div className="inline-flex items-center gap-1.5">
            <input
              value={steep.time ?? ""}
              onChange={(e) => onChange({ time: e.target.value })}
              placeholder="10s"
              className={`${inputCls} max-w-[80px]`}
            />
            <SteepTimer
              onCommit={(formatted) => onChange({ time: formatted })}
            />
          </div>
        </Field>
        <Field label="Temp °C" compact>
          <input
            type="number"
            value={steep.tempC ?? ""}
            onChange={(e) =>
              onChange({ tempC: e.target.value ? Number(e.target.value) : undefined })
            }
            placeholder="95"
            className={`${inputCls} max-w-[80px]`}
          />
        </Field>
        <div className="flex-1 min-w-[180px]">
          <div className="text-[10px] font-bold text-forest mb-1 tracking-wide">
            Score for this steep
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={isBasic ? 0.5 : 1}
              max={isBasic ? 5 : 10}
              step={isBasic ? 0.5 : 0.1}
              value={isBasic ? score / 2 : score}
              onChange={(e) =>
                onChange({ rating: isBasic ? Number(e.target.value) * 2 : Number(e.target.value) })
              }
              aria-label={`Score for steep ${steep.index}, ${isBasic ? `${(score / 2).toFixed(1)} out of 5` : `${score.toFixed(1)} out of 10`}`}
              className="flex-1 accent-burgundy"
            />
            <div className="min-w-[36px] text-right font-mono text-[12px] text-burgundy font-bold">
              {isBasic ? (score / 2).toFixed(1) + "/5" : score.toFixed(1) + "/10"}
            </div>
          </div>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove steep ${steep.index}`}
            className="w-8 h-8 rounded-full bg-cream border border-warm-300 cursor-pointer text-warm-700 leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Flavor sliders + mouthfeel side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-5 mb-3">
        <div>
          <Eyebrow>Flavor — this steep</Eyebrow>
          {isBasic ? (
            <div className="flex flex-col gap-1.5 mt-3">
              {BASIC_AXES.map((ax) => {
                const v5 = Math.round((basicView[ax.key] ?? 0) / 2);
                return (
                  <div key={ax.key} className="flex items-center gap-2">
                    <div className="min-w-[60px] text-[10px] font-bold text-forest">
                      {ax.label}
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={1}
                      value={v5}
                      onChange={(e) => setBasic(ax.key, Number(e.target.value))}
                      aria-label={`${ax.label} for this steep, 0 to 5, currently ${v5}`}
                      className="flex-1"
                      style={{ accentColor: ax.color }}
                    />
                    <div className="min-w-[20px] text-[10px] text-warm-700 text-right font-mono">
                      {v5}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 mt-3">
              {FLAVOR_AXES.map((ax) => (
                <div key={ax.key} className="flex items-center gap-1.5">
                  <div className="min-w-[52px] text-[10px] text-forest font-semibold">
                    {ax.label}
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={flavor[ax.key] ?? 0}
                    onChange={(e) => setAdv(ax.key, Number(e.target.value))}
                    aria-label={`${ax.label} for this steep, 0 to 10, currently ${flavor[ax.key] ?? 0}`}
                    className="flex-1"
                    style={{ accentColor: ax.color }}
                  />
                  <div className="min-w-[12px] text-[10px] text-warm-700 text-right font-mono">
                    {flavor[ax.key] ?? 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <Eyebrow>Mouthfeel — this steep</Eyebrow>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.1fr] gap-3 items-center mt-3">
            <MouthfeelGrid point={mouthfeel} size={160} />
            <div className="flex flex-col gap-2">
              <SliderRow
                label="Body"
                leftLabel="Light"
                rightLabel="Full"
                small
                value={mouthfeel.bodyFull}
                onChange={(v) => onChange({ mouthfeel: { ...mouthfeel, bodyFull: v } })}
              />
              <SliderRow
                label="Texture"
                leftLabel="Oily"
                rightLabel="Astringent"
                small
                value={mouthfeel.astringent}
                onChange={(v) => onChange({ mouthfeel: { ...mouthfeel, astringent: v } })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Per-steep notes */}
      <Field label={`Notes — steep ${steep.index}`}>
        <textarea
          value={steep.notes ?? ""}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={2}
          placeholder="Honey arrives. Front-end is sweeter than steep 1; the mineral picks up on the swallow."
          className={`${inputCls} font-serif italic resize-y leading-relaxed`}
        />
      </Field>
    </article>
  );
}

// =====================================================================
// Tiny shared bits
// =====================================================================

const inputCls =
  "w-full px-3 py-2 font-sans text-sm bg-cream border border-warm-200 rounded-md text-forest outline-none";

function Field({
  label, hint, children, compact,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  // Nest the label around the input(s) so the input/label association is
  // implicit (no need for matching for/id pairs). Satisfies WCAG 1.3.1
  // and Lighthouse's `label` audit.
  return (
    <label className={compact ? "block" : "block"}>
      <span className="block font-sans text-[10px] font-bold text-forest mb-1 tracking-wide">
        {label}
      </span>
      {hint && (
        <span className="block text-[11px] text-warm-700 mb-2 leading-snug">
          {hint}
        </span>
      )}
      {children}
    </label>
  );
}

function SliderRow({
  label, leftLabel, rightLabel, value, onChange, small,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (v: number) => void;
  small?: boolean;
}) {
  return (
    <div>
      <div
        className={`flex justify-between mb-1 ${small ? "text-[9px]" : "text-[10px]"} font-bold tracking-wide`}
      >
        <span className="text-forest">{label}</span>
        <span className="text-warm-700 font-mono">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={0.5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} (${leftLabel} to ${rightLabel}, current ${value.toFixed(1)})`}
        className="w-full accent-burgundy"
      />
      <div
        className={`flex justify-between ${small ? "text-[8px]" : "text-[9px]"} text-warm-700 tracking-wide`}
      >
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

function ScoreSlider({
  scale, value, onChange,
}: {
  scale: Scale;
  value: number;
  onChange: (v: number) => void;
}) {
  const isBasic = scale === "basic";
  return isBasic ? (
    <>
      <div className="flex items-baseline gap-3 mt-3 mb-3">
        <span className="font-display text-burgundy font-medium leading-none text-[56px]">
          {(value / 2).toFixed(1)}
        </span>
        <span className="text-sm text-warm-700">/ 5</span>
      </div>
      <input
        type="range"
        min={0.5}
        max={5}
        step={0.5}
        value={value / 2}
        onChange={(e) => onChange(Number(e.target.value) * 2)}
        aria-label={`Overall score, ${(value / 2).toFixed(1)} out of 5`}
        className="w-full accent-burgundy mb-1"
      />
      <div className="flex justify-between text-[10px] text-warm-700 tracking-wide uppercase font-bold">
        <span>Pass</span>
        <span>Solid</span>
        <span>Excellent</span>
      </div>
    </>
  ) : (
    <>
      <div className="flex items-baseline gap-3 mt-3 mb-3">
        <span className="font-display text-burgundy font-medium leading-none text-[56px]">
          {value.toFixed(1)}
        </span>
        <span className="text-sm text-warm-700">/ 10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={0.1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`Overall score, ${value.toFixed(1)} out of 10`}
        className="w-full accent-burgundy"
      />
    </>
  );
}

function ToggleGroup<T extends string>({
  label, value, onChange, options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; sub: string }[];
}) {
  return (
    <div>
      <div className="text-[10px] font-bold tracking-widest uppercase text-warm-700 mb-1.5">
        {label}
      </div>
      <div className="inline-flex p-[3px] bg-cream rounded-pill border border-warm-200 gap-[2px]">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              aria-pressed={active}
              className={[
                "px-3.5 py-1.5 rounded-pill border-0 font-sans font-bold text-[12px] cursor-pointer tracking-wide",
                "transition-colors duration-200 ease-smooth inline-flex items-center gap-1.5",
                active ? "bg-burgundy text-cream" : "bg-transparent text-forest",
              ].join(" ")}
            >
              {o.label}
              <span className="text-[10px] font-semibold opacity-90">
                {o.sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================================
// Helpers
// =====================================================================

function vendorSlug(tea: Tea): string {
  // The data layer's vendorSlugForTea would import lib/data and pull in
  // the whole vendor list — overkill from this client component. The
  // page wrapper passes the slug directly via the URL we navigate to.
  // Re-derive here from tea.vendor by lowercasing + simple substitution.
  const map: Record<string, string> = {
    "Tea Drunk": "tea-drunk",
    "white2tea": "white2tea",
    "Yunnan Sourcing": "yunnan-sourcing",
    "Ippodo Tea": "ippodo",
  };
  return map[tea.vendor] ?? tea.vendor.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function blankSteep(index: number, tea: Tea): SteepLog {
  // First steep takes its time / temp from the recommended brewing
  // params — gives the user a sensible default to confirm or tweak.
  if (index === 1) {
    const tempC = parseTemp(tea.brewing.temp);
    return {
      index,
      time: tea.brewing.first || "",
      tempC: tempC ?? undefined,
    };
  }
  return { index };
}

function parseTemp(s: string): number | null {
  const m = s.match(/(\d+)/);
  return m && m[1] ? Number(m[1]) : null;
}

function defaultVessel(tea: Tea): string {
  const style = tea.brewing.style.toLowerCase();
  if (style.includes("kyusu")) return "60ml porcelain kyusu";
  if (style.includes("glass") || style.includes("grandpa")) return "200ml glass";
  if (style.includes("western")) return "300ml mug";
  return "100ml porcelain gaiwan";
}

function defaultLeafG(tea: Tea): string {
  const m = tea.brewing.ratio.match(/(\d+(?:\.\d+)?)/);
  return m && m[1] ? m[1] : "5";
}

function defaultWaterMl(tea: Tea): string {
  const m = tea.brewing.ratio.match(/\/(\d+)/);
  return m && m[1] ? m[1] : "100";
}
