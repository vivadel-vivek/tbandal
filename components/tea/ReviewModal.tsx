"use client";

import { useEffect, useMemo, useState } from "react";
import type { MemberRating, Tea, FlavorProfile } from "@/lib/types";
import { BASIC_AXES, FLAVOR_AXES, rollUpProfile } from "@/lib/flavor";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { RadarChart } from "@/components/tea/RadarChart";

type Mode = "basic" | "advanced";

type Props = {
  tea: Tea;
  /** When editing an existing rating, prefill the form */
  initial?: MemberRating;
  defaultMode?: Mode;
  onClose: () => void;
  onSubmit: (rating: MemberRating) => void;
};

/**
 * Review editor — Basic mode (6 axes × 0-5 + 0-5 score) or Advanced
 * (12 × 0-10 + 1-10 score). Internally everything normalises to 12-axis
 * 0-10 so the radar + recommender don't care which mode the rater used.
 *
 * The mode persists with the rating as `scale: "basic" | "advanced"` so
 * downstream display can show "4.5 / 5" vs "9.0 / 10" appropriately.
 */
export function ReviewModal({
  tea,
  initial,
  defaultMode = "basic",
  onClose,
  onSubmit,
}: Props) {
  // Internal scale stays 0-10. Initial value: existing rating, or a
  // mid-point seed so the modal opens with something rather than zero.
  const [score, setScore] = useState<number>(initial?.rating ?? 7.5);
  const [body, setBody] = useState<string>(initial?.body ?? "");
  const [session, setSession] = useState<string>(initial?.session ?? "");
  const [profile, setProfile] = useState<FlavorProfile>(
    initial?.profile ??
      (Object.fromEntries(FLAVOR_AXES.map((a) => [a.key, 4])) as FlavorProfile),
  );
  const [mode, setMode] = useState<Mode>(initial?.scale ?? defaultMode);
  const isBasic = mode === "basic";

  // Esc closes; lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // Rolled-up basic view, recomputed when the underlying advanced
  // profile changes.
  const basicProfile = useMemo(() => rollUpProfile(profile), [profile]);

  // Advanced edit: directly mutate the 12-axis profile.
  const setAdvancedAxis = (key: string, v: number) =>
    setProfile((p) => ({ ...p, [key]: v }));

  // Basic edit: setting one of the 6 axes updates BOTH constituent
  // advanced axes to value × 2 so the internal 0-10 representation is
  // consistent.
  const setBasicAxis = (basicKey: string, v5: number) => {
    const ax = BASIC_AXES.find((a) => a.key === basicKey);
    if (!ax) return;
    const v10 = v5 * 2;
    setProfile((p) => {
      const next = { ...p };
      for (const k of ax.members) next[k] = v10;
      return next;
    });
  };

  const handleSave = () => {
    const rating: MemberRating = {
      slug: tea.slug,
      name: tea.name,
      rating: Number(score),
      body: body.trim() || "(no notes)",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      session: session.trim() || undefined,
      profile,
      scale: mode,
    };
    onSubmit(rating);
  };

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      className="fixed inset-0 z-[1000] flex items-start justify-center bg-ink-glass overflow-y-auto"
      style={{ padding: "5vh 20px" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card-surface w-full max-w-[880px] relative"
      >
        {/* Header */}
        <div className="flex justify-between items-start gap-4 px-8 py-6 border-b border-warm-200">
          <div className="flex-1 min-w-0">
            <Eyebrow>{initial ? "Edit your review" : "Add your review"}</Eyebrow>
            <h2
              id="review-modal-title"
              className="font-display italic text-burgundy font-medium tracking-tight m-0 mt-1.5 mb-1 text-hero-sm"
            >
              {tea.name}
            </h2>
            <div className="text-[13px] text-warm-600">
              {tea.region} · {tea.year}
            </div>
          </div>
          <div className="flex gap-3 items-center shrink-0">
            <ModeToggle mode={mode} onChange={setMode} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 rounded-full bg-cream border border-warm-200 cursor-pointer text-warm-700 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-9 px-8 pt-6 pb-2">
          {/* LEFT: score + body + brewing */}
          <div>
            <Eyebrow>Overall score</Eyebrow>
            {isBasic ? (
              <>
                <div className="flex items-baseline gap-3 mt-2 mb-3">
                  <span className="font-display text-burgundy font-medium leading-none text-[64px]">
                    {(score / 2).toFixed(1)}
                  </span>
                  <span className="text-sm text-warm-500">/ 5</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={score / 2}
                  onChange={(e) => setScore(Number(e.target.value) * 2)}
                  className="w-full accent-burgundy mb-2"
                />
                <div className="flex justify-between text-[10px] text-warm-500 tracking-wide uppercase font-bold mb-6">
                  <span>Hint</span>
                  <span>Balanced</span>
                  <span>Dominant</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-3 mt-2 mb-3">
                  <span className="font-display text-burgundy font-medium leading-none text-[64px]">
                    {Number(score).toFixed(1)}
                  </span>
                  <span className="text-sm text-warm-500">/ 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.1}
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full accent-burgundy mb-6"
                />
              </>
            )}

            <div className="mb-5">
              <Eyebrow>Notes</Eyebrow>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder={
                  isBasic
                    ? "What did you taste? Anything stand out?"
                    : "What did you taste? How did it evolve? What does it remind you of?"
                }
                className="w-full mt-2 px-3.5 py-3 font-serif italic text-[15px] bg-cream border border-warm-200 rounded-md text-forest resize-y leading-normal outline-none"
              />
            </div>

            <div>
              <Eyebrow>Brewing (optional)</Eyebrow>
              <input
                value={session}
                onChange={(e) => setSession(e.target.value)}
                placeholder="e.g. 5g · 100ml gaiwan · 95°C"
                className="w-full mt-2 px-3.5 py-2.5 font-mono text-[13px] bg-cream border border-warm-200 rounded-md text-forest outline-none"
              />
            </div>
          </div>

          {/* RIGHT: flavor profile */}
          <div>
            <div className="flex justify-between items-baseline mb-2 gap-2 flex-wrap">
              <Eyebrow>
                Flavor profile · {isBasic ? "6 simple axes" : "12 axes"}
              </Eyebrow>
              <span className="text-[11px] text-warm-500">
                {isBasic ? "0–5" : "0–10"}
              </span>
            </div>
            <div className="mb-3">
              <RadarChart
                profiles={[
                  {
                    values: isBasic ? basicProfile : profile,
                    color: "var(--burgundy, #722F37)",
                  },
                ]}
                axes={isBasic ? BASIC_AXES : FLAVOR_AXES}
                style="fill"
                size={240}
              />
            </div>
            {isBasic ? (
              <div className="flex flex-col gap-3">
                {BASIC_AXES.map((ax) => {
                  const v10 = basicProfile[ax.key] ?? 0;
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
                          onChange={(e) =>
                            setBasicAxis(ax.key, Number(e.target.value))
                          }
                          className="flex-1"
                          style={{ accentColor: ax.color }}
                        />
                        <div className="min-w-[28px] text-[11px] text-warm-600 text-right font-mono font-semibold">
                          {v5}/5
                        </div>
                      </div>
                      <div className="text-[10px] text-warm-600 ml-[78px] mt-0.5 leading-snug italic">
                        {ax.lay}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
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
                      onChange={(e) =>
                        setAdvancedAxis(ax.key, Number(e.target.value))
                      }
                      className="flex-1"
                      style={{ accentColor: ax.color }}
                    />
                    <div className="min-w-[14px] text-[11px] text-warm-500 text-right font-mono">
                      {profile[ax.key] ?? 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-3 px-8 py-5 border-t border-warm-200">
          <span className="text-xs text-warm-500">
            Your rating refines your flavor map and Discover suggestions.
          </span>
          <div className="flex gap-2.5">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {initial ? "Save changes" : "Save review"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  return (
    <div className="inline-flex p-[3px] bg-cream rounded-pill border border-warm-200 gap-[2px]">
      {[
        { key: "basic" as const, label: "Basic", sub: "5-pt" },
        { key: "advanced" as const, label: "Advanced", sub: "10-pt" },
      ].map((o) => {
        const active = mode === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            aria-pressed={active}
            className={[
              "px-3 py-1.5 rounded-pill border-0 font-sans font-bold text-[11px] cursor-pointer tracking-wide",
              "transition-colors duration-200 ease-smooth inline-flex items-center gap-1.5",
              active ? "bg-burgundy text-cream" : "bg-transparent text-forest",
            ].join(" ")}
          >
            {o.label}
            <span
              className="text-[9px] font-medium"
              style={{ opacity: active ? 0.85 : 0.55 }}
            >
              {o.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}
