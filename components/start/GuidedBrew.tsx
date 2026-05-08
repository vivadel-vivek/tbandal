"use client";

// Guided-brewing onboarding flow. Five-step state machine:
//   1. Welcome
//   2. Tea pick (catalog tea / a category I have / nothing yet)
//   3. Gear pick (gaiwan / teapot / mug / kyusu / nothing)
//   4. Style preference (light & quick / strong & full / multi-steep)
//   5. Brew result with live first-steep timer + save-session CTA
//
// State stays in component memory — refreshes restart the flow.
// The "Save this session" CTA at the end either deep-links to the
// authenticated log page (signed in) or routes through signup with
// a `?next=` so the user lands back on the log page after auth.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Tea, TeaTypeName } from "@/lib/types";
import { useSupabaseSession } from "@/lib/supabase/useSession";
import { teaUrl } from "@/lib/tea-helpers";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Glossarized } from "@/components/glossary/Glossarized";

// =====================================================================
// Recipe engine
// =====================================================================

type Gear = "gaiwan" | "teapot" | "kyusu" | "mug" | "none";
type Style = "light" | "strong" | "exploratory";

type Recipe = {
  method: "Gongfu" | "Western" | "Kyusu" | "Grandpa" | "Improvise";
  leafG: number;
  waterMl: number;
  tempC: number;
  firstSec: number;
  steeps: number;
  ramp: string;
  notes: string;
};

type TeaCategory =
  | "Green"
  | "White"
  | "Yellow"
  | "Oolong"
  | "Black"
  | "Sheng Pu'er"
  | "Shou Pu'er"
  | "Dark"
  | "Herbal";

const CATEGORIES: { key: TeaCategory; label: string; hint: string }[] = [
  { key: "Green",        label: "Green tea",      hint: "Sencha, Longjing, gunpowder, matcha" },
  { key: "Black",        label: "Black tea",      hint: "Breakfast, Assam, Darjeeling, Yunnan red" },
  { key: "Oolong",       label: "Oolong",         hint: "Tieguanyin, Wuyi yancha, dancong, milk oolong" },
  { key: "Sheng Pu'er",  label: "Sheng pu'er",    hint: "Raw pu'er — bright, fruity, ages slowly" },
  { key: "Shou Pu'er",   label: "Shou pu'er",     hint: "Ripe pu'er — earthy, dark, drinks young" },
  { key: "Dark",         label: "Dark tea",       hint: "Heicha — Anhua, Fu, Liubao. Post-fermented, smooth, ages well" },
  { key: "White",        label: "White tea",      hint: "Silver Needle, white peony, shou mei" },
  { key: "Herbal",       label: "Herbal",         hint: "Chamomile, rooibos, mint — not technically tea" },
];

const GEAR_OPTIONS: { key: Gear; label: string; hint: string }[] = [
  { key: "gaiwan", label: "A gaiwan",   hint: "Lidded bowl with a saucer — most precise gongfu vessel" },
  { key: "teapot", label: "A teapot",   hint: "Ceramic, glass, or yixing — anything with a spout and a strainer" },
  { key: "kyusu",  label: "A kyusu",    hint: "Side-handle Japanese pot — best for green teas" },
  { key: "mug",    label: "A mug + strainer", hint: "Or a basket/ball infuser; the everyday setup" },
  { key: "none",   label: "Nothing yet", hint: "We'll point you at a starter setup" },
];

const STYLES: { key: Style; label: string; hint: string }[] = [
  { key: "light",       label: "Light & quick",       hint: "One cup, soft and gentle. The everyday workday pour." },
  { key: "strong",      label: "Strong & full-bodied", hint: "More leaf, longer steep, hearty cup." },
  { key: "exploratory", label: "Multi-steep deep dive", hint: "Many short pours, watching the tea change. Gongfu shape." },
];

function recommend(category: TeaCategory, gear: Gear, style: Style): Recipe {
  // Default per category — will get adjusted by gear + style after.
  const base = (() => {
    switch (category) {
      case "Green":
        return { tempC: 75, leafPer100: 1.0, firstSec: 120, steeps: 2 };
      case "White":
        return { tempC: 85, leafPer100: 1.5, firstSec: 180, steeps: 3 };
      case "Yellow":
        return { tempC: 80, leafPer100: 1.5, firstSec: 120, steeps: 3 };
      case "Oolong":
        return { tempC: 92, leafPer100: 2.0, firstSec: 60, steeps: 4 };
      case "Black":
        return { tempC: 95, leafPer100: 1.5, firstSec: 180, steeps: 2 };
      case "Sheng Pu'er":
        return { tempC: 95, leafPer100: 2.0, firstSec: 20, steeps: 8 };
      case "Shou Pu'er":
        return { tempC: 100, leafPer100: 2.0, firstSec: 30, steeps: 6 };
      case "Dark":
        return { tempC: 100, leafPer100: 2.0, firstSec: 30, steeps: 5 };
      case "Herbal":
        return { tempC: 100, leafPer100: 1.5, firstSec: 300, steeps: 1 };
    }
  })();

  // Gear → method + vessel volume
  const gearProfile = (() => {
    switch (gear) {
      case "gaiwan":
        return { method: "Gongfu" as const, vessel: 100 };
      case "kyusu":
        return { method: "Kyusu" as const, vessel: 80 };
      case "teapot":
        return { method: "Western" as const, vessel: 350 };
      case "mug":
        return { method: "Western" as const, vessel: 300 };
      case "none":
        return { method: "Improvise" as const, vessel: 250 };
    }
  })();

  // Gongfu / kyusu shapes are concentrated + many short pours.
  // Western shapes are dilute + one long pour.
  const isShortPour = gearProfile.method === "Gongfu" || gearProfile.method === "Kyusu";

  // Style modifiers
  let leafMult = 1;
  let timeMult = 1;
  let steepsMult = 1;
  if (style === "light") {
    leafMult = 0.8;
    timeMult = isShortPour ? 0.7 : 0.9;
  } else if (style === "strong") {
    leafMult = 1.2;
    timeMult = isShortPour ? 1.4 : 1.1;
  } else if (style === "exploratory") {
    if (isShortPour) {
      leafMult = 1.3;
      timeMult = 0.5;
      steepsMult = 1.5;
    } else {
      // Force gongfu-shape even with a teapot/mug — encourage exploration
      // by halving the time and inviting a second steep.
      leafMult = 1.2;
      timeMult = 0.7;
      steepsMult = 1.5;
    }
  }

  // Concentrated brewing uses 4-5x the leaf per ml
  const leafConcentration = isShortPour ? base.leafPer100 * 4 : base.leafPer100;
  const leafG = Math.max(1, Math.round(leafConcentration * (gearProfile.vessel / 100) * leafMult * 10) / 10);
  const firstSec = Math.max(3, Math.round((isShortPour ? 8 : base.firstSec) * timeMult));
  const steeps = Math.max(1, Math.round(base.steeps * steepsMult));

  // Special case: kyusu + green = the classic low-temp shape
  let tempC = base.tempC;
  if (gear === "kyusu" && (category === "Green" || category === "Yellow")) {
    tempC = 60;
  }

  const ramp = isShortPour
    ? "+3-5 seconds each steep, +1°C every 2 steeps"
    : "Re-steep once with +30s if you like";

  const notes = (() => {
    if (gear === "none") {
      return "Without dedicated gear: a sturdy mug with a removable strainer or a cheap basket infuser will brew most teas reasonably. We've ranked starter vessels in the teaware section if you want to upgrade — start with a 100ml gaiwan; it's the most flexible single piece you can own.";
    }
    if (category === "Shou Pu'er" || category === "Dark") {
      return "Rinse first: pour boiling water over the leaves, swirl 5 seconds, discard. The first proper steep then opens cleanly without the storage notes. Pressed cakes need a second rinse if dense.";
    }
    if (category === "Sheng Pu'er") {
      return "Young sheng is bright and astringent — short pours, lots of them. A 5–10 second rinse is optional but cleans dust. Aged sheng (10+ yrs) wants longer steeps and rewards patience across 12+ pours.";
    }
    if (isShortPour) {
      return "Short pours, repeated. The first cup is often closed; the second and third are where the tea opens. Keep a kettle nearby — re-steeps want hot water on standby.";
    }
    if (category === "Green" && gear !== "kyusu") {
      return "Green tea punishes hot water. If you can't measure 75°C exactly, boil and let it cool for 90 seconds before pouring. A second steep with +30s rarely matches the first but is still pleasant.";
    }
    return "One long steep, drink, optionally re-steep. Western brewing is forgiving; if it tastes weak, more leaf next time. If it tastes harsh, less time.";
  })();

  return {
    method: gearProfile.method,
    leafG,
    waterMl: gearProfile.vessel,
    tempC,
    firstSec,
    steeps,
    ramp,
    notes,
  };
}

// =====================================================================
// Component
// =====================================================================

type TeaPick =
  | { kind: "catalog"; tea: Tea }
  | { kind: "category"; cat: TeaCategory }
  | { kind: "none" };

export function GuidedBrew({ teas }: { teas: Tea[] }) {
  const session = useSupabaseSession();
  const isAuthed = session !== null;
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [tea, setTea] = useState<TeaPick | null>(null);
  const [gear, setGear] = useState<Gear | null>(null);
  const [style, setStyle] = useState<Style | null>(null);

  const teaCategory: TeaCategory | null = useMemo(() => {
    if (!tea) return null;
    if (tea.kind === "catalog") return tea.tea.type;
    if (tea.kind === "category") return tea.cat;
    return null;
  }, [tea]);

  const recipe = useMemo(() => {
    if (!teaCategory || !gear || !style) return null;
    return recommend(teaCategory, gear, style);
  }, [teaCategory, gear, style]);

  const reset = () => {
    setStep(1);
    setTea(null);
    setGear(null);
    setStyle(null);
  };

  return (
    <Container size="article">
      <div className="pt-10 sm:pt-12 pb-6">
        <Eyebrow>Are you new here?</Eyebrow>
        <h1 className="font-display text-burgundy font-medium tracking-tightest leading-tighter mt-3 mb-3 text-[40px] sm:text-[58px]">
          <span className="italic">Let&apos;s brew</span> your first cup.
        </h1>
        <p className="text-base text-warm-700 leading-relaxed max-w-[620px] m-0">
          Three quick questions and we&apos;ll hand you a brewing recipe
          you can follow with a timer. No account needed to use it; you
          only need one if you want to save the session.
        </p>

        {/* Progress */}
        <div className="mt-7 mb-5 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={[
                "h-1 flex-1 rounded-full transition-colors duration-300",
                step >= n ? "bg-burgundy" : "bg-warm-200",
              ].join(" ")}
            />
          ))}
        </div>
      </div>

      {/* Step 1: welcome */}
      {step === 1 && (
        <section>
          <div className="card-surface p-6 sm:p-8 mb-5">
            <Eyebrow>Step 1 of 4</Eyebrow>
            <h2 className="font-display italic text-burgundy text-[26px] sm:text-[34px] m-0 mt-2 mb-3 leading-tight">
              Three questions, one recipe.
            </h2>
            <p className="text-[15px] text-warm-700 leading-relaxed mb-3 max-w-[560px]">
              We&apos;ll ask what tea you have (or whether you have nothing
              yet — that&apos;s fine), what you&apos;re going to brew it
              in, and what kind of cup you&apos;re after. The result is a
              brewing recipe with the right leaf weight, water
              temperature, time, and how to read what comes out of it.
            </p>
            <p className="text-[15px] text-warm-700 leading-relaxed mb-5 max-w-[560px] m-0">
              <Glossarized>
                If you&apos;ve never done this with intention before, the
                vocabulary on the recipe page (steep, leaf-to-water ratio,
                flash pour) will hover with a definition when you mouse
                over them.
              </Glossarized>
            </p>
            <Button variant="primary" size="lg" onClick={() => setStep(2)}>
              Start →
            </Button>
          </div>
        </section>
      )}

      {/* Step 2: tea pick */}
      {step === 2 && (
        <Step
          number={2}
          title="What are you going to brew?"
          back={() => setStep(1)}
        >
          {/* Catalog teas */}
          <Eyebrow>From our catalog</Eyebrow>
          <p className="text-[13px] text-warm-700 leading-snug mb-3 mt-1">
            Picked one of these up? Choose it for the most accurate recipe.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
            {teas.slice(0, 6).map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => {
                  setTea({ kind: "catalog", tea: t });
                  setStep(3);
                }}
                className="text-left card-surface card-surface-hover p-3.5"
              >
                <div className="font-display text-burgundy text-[16px] leading-tight">
                  {t.name}
                </div>
                <div className="text-[11px] text-warm-600 mt-0.5">
                  {t.type} · {t.region}
                </div>
              </button>
            ))}
          </div>

          {/* Categories */}
          <Eyebrow>Or a category you have at home</Eyebrow>
          <p className="text-[13px] text-warm-700 leading-snug mb-3 mt-1">
            Bagged tea, loose tea you bought elsewhere, or a tin from a
            grocery store — pick the closest type.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => {
                  setTea({ kind: "category", cat: c.key });
                  setStep(3);
                }}
                className="text-left card-surface card-surface-hover p-3.5"
              >
                <div className="font-display text-burgundy text-[16px] leading-tight">
                  {c.label}
                </div>
                <div className="text-[11px] text-warm-600 mt-0.5">{c.hint}</div>
              </button>
            ))}
          </div>

          {/* None */}
          <button
            type="button"
            onClick={() => {
              setTea({ kind: "none" });
              setStep(3);
            }}
            className="block w-full text-left bg-cream rounded-xl border border-dashed border-warm-300 p-4"
          >
            <div className="text-[10px] tracking-widest uppercase font-bold text-warm-600">
              I don&apos;t have any tea yet
            </div>
            <div className="font-display italic text-burgundy text-[18px] mt-1">
              That&apos;s alright. We&apos;ll suggest something.
            </div>
          </button>
        </Step>
      )}

      {/* Step 3: gear pick */}
      {step === 3 && tea && (
        <Step
          number={3}
          title="What are you brewing it in?"
          back={() => setStep(2)}
        >
          <div className="space-y-2.5">
            {GEAR_OPTIONS.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => {
                  setGear(g.key);
                  setStep(4);
                }}
                className="w-full text-left card-surface card-surface-hover p-4"
              >
                <div className="font-display text-burgundy text-[18px] leading-tight">
                  {g.label}
                </div>
                <div className="text-[12px] text-warm-700 mt-1">{g.hint}</div>
              </button>
            ))}
          </div>
        </Step>
      )}

      {/* Step 4: style */}
      {step === 4 && tea && gear && (
        <Step
          number={4}
          title="What kind of cup are you after?"
          back={() => setStep(3)}
        >
          <div className="space-y-2.5">
            {STYLES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => {
                  setStyle(s.key);
                  setStep(5);
                }}
                className="w-full text-left card-surface card-surface-hover p-4"
              >
                <div className="font-display text-burgundy text-[18px] leading-tight">
                  {s.label}
                </div>
                <div className="text-[12px] text-warm-700 mt-1">{s.hint}</div>
              </button>
            ))}
          </div>
        </Step>
      )}

      {/* Step 5: result */}
      {step === 5 && tea && gear && style && recipe && teaCategory && (
        <BrewResult
          tea={tea}
          gear={gear}
          style={style}
          recipe={recipe}
          teaCategory={teaCategory}
          isAuthed={isAuthed}
          onReset={reset}
        />
      )}

      <div className="h-16" />
    </Container>
  );
}

// =====================================================================
// Sub-components
// =====================================================================

function Step({
  number,
  title,
  back,
  children,
}: {
  number: number;
  title: string;
  back: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="card-surface p-5 sm:p-7">
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <Eyebrow>Step {number} of 4</Eyebrow>
          <button
            type="button"
            onClick={back}
            className="text-[12px] font-bold text-warm-600 hover:text-burgundy bg-transparent border-0 cursor-pointer"
          >
            ← Back
          </button>
        </div>
        <h2 className="font-display italic text-burgundy text-[26px] sm:text-[32px] m-0 mt-1 mb-5 leading-tight">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

function BrewResult({
  tea, gear, style, recipe, teaCategory, isAuthed, onReset,
}: {
  tea: TeaPick;
  gear: Gear;
  style: Style;
  recipe: Recipe;
  teaCategory: TeaCategory;
  isAuthed: boolean;
  onReset: () => void;
}) {
  const teaLabel = tea.kind === "catalog"
    ? tea.tea.name
    : tea.kind === "category"
      ? `your ${tea.cat.toLowerCase()}`
      : "tea";

  const startLogHref = tea.kind === "catalog"
    ? `/tea/${tea.tea.vendorSlug}/${tea.tea.pathSlug}/log`
    : "/discover/teas";

  return (
    <section className="space-y-5">
      <div className="card-surface p-5 sm:p-7">
        <div className="flex items-baseline justify-between gap-3 mb-1 flex-wrap">
          <Eyebrow>Your recipe</Eyebrow>
          <button
            type="button"
            onClick={onReset}
            className="text-[12px] font-bold text-warm-600 hover:text-burgundy bg-transparent border-0 cursor-pointer"
          >
            Start over ↺
          </button>
        </div>
        <h2 className="font-display italic text-burgundy text-[28px] sm:text-[36px] m-0 mt-1 mb-4 leading-tight">
          Brew {teaLabel}, {recipe.method.toLowerCase()}.
        </h2>

        {/* Recipe params */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <Param label="Leaf"        value={`${recipe.leafG}g`} />
          <Param label="Water"       value={`${recipe.waterMl}ml`} />
          <Param label="Temperature" value={`${recipe.tempC}°C`} />
          <Param label="First steep" value={`${recipe.firstSec}s`} />
        </div>

        <div className="bg-cream rounded-md px-4 py-3 mb-4 text-[13px] text-warm-700 leading-relaxed">
          <strong className="text-forest">After the first steep:</strong>{" "}
          {recipe.ramp}. Plan on about {recipe.steeps} steep
          {recipe.steeps === 1 ? "" : "s"} total.
        </div>

        <p className="text-[14px] text-warm-700 leading-relaxed mb-0 max-w-[640px]">
          <Glossarized>{recipe.notes}</Glossarized>
        </p>
      </div>

      {/* No-gear branch */}
      {gear === "none" && (
        <div className="card-surface p-5 sm:p-7 bg-cream">
          <Eyebrow>Starter setup</Eyebrow>
          <h3 className="font-display italic text-burgundy text-[22px] m-0 mt-1.5 mb-3">
            What we&apos;d buy first.
          </h3>
          <p className="text-[14px] text-warm-700 leading-relaxed mb-4">
            If you&apos;re going to do this regularly, a 100ml porcelain
            gaiwan is the most flexible single piece — works for every tea
            type and lets you do gongfu when you&apos;re ready. A variable-
            temperature electric kettle is the second purchase.
          </p>
          <Link href="/discover/teaware" className="inline-flex">
            <Button variant="secondary">See teaware →</Button>
          </Link>
        </div>
      )}

      {/* No-tea branch */}
      {tea.kind === "none" && (
        <div className="card-surface p-5 sm:p-7 bg-cream">
          <Eyebrow>Where to start</Eyebrow>
          <h3 className="font-display italic text-burgundy text-[22px] m-0 mt-1.5 mb-3">
            Three forgiving teas for newcomers.
          </h3>
          <p className="text-[14px] text-warm-700 leading-relaxed mb-3">
            Hard to brew badly: Tieguanyin (oolong, floral), Dianhong (black,
            sweet and round), Silver Needle (white, gentle and slow). All
            three appear in our library with brewing notes.
          </p>
          <Link href="/discover/teas" className="inline-flex">
            <Button variant="secondary">Browse the library →</Button>
          </Link>
        </div>
      )}

      <BrewTimer firstSec={recipe.firstSec} />

      {/* Save the session */}
      <div className="card-surface p-5 sm:p-7 bg-burgundy text-cream">
        <Eyebrow color="rgba(250,247,242,0.8)">Save this session</Eyebrow>
        <h3 className="font-display italic text-cream text-[24px] sm:text-[30px] m-0 mt-1.5 mb-3 leading-tight">
          {isAuthed
            ? "Log this brew to your library."
            : "Want to keep this? Join — free."}
        </h3>
        <p className="text-[13px] leading-relaxed mb-4 max-w-[560px]" style={{ color: "rgba(250,247,242,0.85)" }}>
          {isAuthed
            ? "Take a sip, write down what you tasted, and we'll remember it. Saved sessions feed your palate map and the recommendations engine."
            : "Members can save sessions, build a tea library, and get recommendations that get smarter as you rate. Takes 30 seconds."}
        </p>
        <div className="flex flex-wrap gap-3">
          {isAuthed ? (
            <Link href={startLogHref} className="inline-flex">
              <Button variant="gold">Log this session →</Button>
            </Link>
          ) : (
            <>
              <Link
                href={`/signup?next=${encodeURIComponent(startLogHref)}`}
                className="inline-flex"
              >
                <Button variant="gold">Join free →</Button>
              </Link>
              <Link
                href={`/login?next=${encodeURIComponent(startLogHref)}`}
                className="inline-flex items-center px-4 py-2 rounded-pill border border-cream/40 text-cream text-[13px] font-bold no-underline"
              >
                Already have an account? Sign in
              </Link>
            </>
          )}
        </div>
      </div>

      {/* If they picked a catalog tea, deep-link to the review */}
      {tea.kind === "catalog" && (
        <div className="text-center">
          <Link
            href={teaUrl(tea.tea)}
            className="inline-block text-burgundy font-bold no-underline text-[13px]"
          >
            Read the full review of {tea.tea.name} →
          </Link>
        </div>
      )}
    </section>
  );
}

function Param({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-warm-200 rounded-lg p-3">
      <div className="text-[10px] tracking-widest uppercase font-bold text-warm-600">
        {label}
      </div>
      <div className="font-display text-burgundy text-[24px] sm:text-[28px] tabular-nums mt-1">
        {value}
      </div>
    </div>
  );
}

// Live first-steep countdown timer. Pure setInterval; resets to "ready"
// when paused. The point is to give a clear audible-feedback moment so
// readers don't have to switch to a phone timer.
function BrewTimer({ firstSec }: { firstSec: number }) {
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(firstSec);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(firstSec);
    setDone(false);
    setRunning(false);
  }, [firstSec]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          setDone(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const reset = () => {
    setRemaining(firstSec);
    setRunning(false);
    setDone(false);
  };

  return (
    <div className="card-surface p-5 sm:p-7">
      <Eyebrow>First steep timer</Eyebrow>
      <h3 className="font-display italic text-burgundy text-[22px] m-0 mt-1.5 mb-4">
        {done ? "Pour now." : running ? "Brewing…" : "Ready when you are."}
      </h3>

      <div className="flex items-baseline gap-3 mb-4">
        <span
          className={[
            "font-display tabular-nums leading-none",
            done ? "text-burgundy" : "text-forest",
            remaining < 10 && running ? "text-burgundy" : "",
          ].join(" ")}
          style={{ fontSize: "clamp(56px, 12vw, 96px)" }}
        >
          {remaining}
        </span>
        <span className="font-display italic text-warm-600 text-[20px]">seconds</span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {!running && !done && (
          <Button variant="primary" onClick={() => setRunning(true)}>
            Pour the water → start timer
          </Button>
        )}
        {running && (
          <Button variant="secondary" onClick={() => setRunning(false)}>
            Pause
          </Button>
        )}
        {done && (
          <Button variant="primary" onClick={reset}>
            Reset for next steep
          </Button>
        )}
        {(running || done) && (
          <button
            type="button"
            onClick={reset}
            className="text-[12px] font-bold text-warm-600 hover:text-burgundy bg-transparent border-0 cursor-pointer"
          >
            ↺ Reset
          </button>
        )}
      </div>

      <p className="text-[12px] text-warm-600 italic mt-4 mb-0 leading-snug">
        Tip: pour the hot water, then immediately press start. When the
        timer hits zero, pour the brew off cleanly into your cup so the
        leaves stop steeping.
      </p>
    </div>
  );
}
