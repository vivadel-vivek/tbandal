"use client";

// Recommendations are member-driven; can't pre-render. Force-dynamic so
// the SSR shell ships fresh per-request once auth attaches the user.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Tea, FlavorProfile } from "@/lib/types";
import { CONTRIBUTORS, TEAS, teaAvg, teaUrl } from "@/lib/data";
import { FLAVOR_AXES, compositeProfile, profileOverlap } from "@/lib/flavor";
import { useMember } from "@/contexts/MemberContext";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { TeaStain } from "@/components/ui/TeaStain";
import { TeaTypeTag } from "@/components/ui/TeaTypeTag";
import { RatingScore } from "@/components/ui/RatingScore";
import { TeaCard } from "@/components/tea/TeaCard";
import { RadarChart } from "@/components/tea/RadarChart";

type Mode = "recommend" | "different" | "blind";

type Profile = FlavorProfile;

const MODES: { key: Mode; label: string; desc: string }[] = [
  { key: "recommend", label: "Likely matches",          desc: "High overlap with what you like" },
  { key: "different", label: "Try something different", desc: "Unfamiliar shapes — broaden your palate" },
  { key: "blind",     label: "Blind tasting",           desc: "Rate first, read reviews after" },
];

export default function RecommendationsPage() {
  const { member, isBlindFor } = useMember();
  const [mode, setMode] = useState<Mode>("recommend");

  const targetProfile = useMemo<Profile>(() => {
    // Once the member has rated anything, drop the seed entirely and
    // build the target as a rating-weighted mean of every tea they've
    // rated. The previous "anchor + 15% drift per rating" formula left
    // newcomers seeing the seed tea (Menghai) at top forever and only
    // moved sluggishly toward an actual taste signal. This switches to
    // a real signal as soon as one rating exists.
    if (member.ratings.length > 0) {
      const out = {} as Profile;
      let totalW = 0;
      const profiles: { prof: Profile; w: number }[] = [];
      for (const r of member.ratings) {
        const t = TEAS.find((x) => x.slug === r.slug);
        if (!t) continue;
        const w = Math.max(0.1, r.rating / 10); // floor so a 0/10 still tugs
        profiles.push({ prof: compositeProfile(t), w });
        totalW += w;
      }
      for (const ax of FLAVOR_AXES) {
        let s = 0;
        for (const p of profiles) s += (p.prof[ax.key] ?? 0) * p.w;
        out[ax.key] = totalW > 0 ? s / totalW : 0;
      }
      return out;
    }
    // No ratings yet — derive the cold-start target from the aligned
    // contributor's PALATE SIGNATURE: the rating-weighted mean of every
    // tea the contributor has reviewed. This is real signal (their
    // taste shape across the whole catalogue) instead of the prior
    // single-seed anchor, which made Menghai top recommendation for
    // every newcomer aligned with Vivek.
    const out = {} as Profile;
    let totalW = 0;
    const contribProfiles: { prof: Profile; w: number }[] = [];
    for (const t of TEAS) {
      const review = t.reviews[member.aligned];
      if (!review) continue;
      const w = Math.max(0.1, review.rating / 10);
      contribProfiles.push({ prof: t.flavor[member.aligned], w });
      totalW += w;
    }
    for (const ax of FLAVOR_AXES) {
      let s = 0;
      for (const p of contribProfiles) s += (p.prof[ax.key] ?? 0) * p.w;
      out[ax.key] = totalW > 0 ? s / totalW : 0;
    }
    return out;
  }, [member]);

  const ranked = useMemo(
    () =>
      TEAS.map((t) => {
        // Blend cosine overlap with the tea's quality signal so high-rated
        // teas naturally float up. Pure overlap was rating-blind — a 9.4
        // gyokuro and an 8.4 dianhong tied if their flavor shapes
        // matched equally. 65/35 weighting was tuned in the experienced-
        // drinker re-audit; the overlap term still dominates for taste
        // similarity, but quality breaks ties.
        const overlap = profileOverlap(compositeProfile(t), targetProfile);
        const quality = teaAvg(t) / 10;
        return { t, score: 0.65 * overlap + 0.35 * quality };
      }).sort((a, b) => b.score - a.score),
    [targetProfile],
  );

  const recommended = ranked.slice(0, 3);
  const different = [...ranked].reverse().slice(0, 3);
  const blindCandidates = ranked.slice(0, 4);

  const aligned = CONTRIBUTORS[member.aligned];
  const hide = (slug: string) => isBlindFor(slug);

  return (
    <main>
      <Container>
        <div className="pt-10 sm:pt-12 pb-6 relative">
          <TeaStain
            size={360}
            color="#722F37"
            opacity={0.1}
            className="absolute top-0 -right-20 pointer-events-none hidden sm:block"
          />
          <Eyebrow>Discover</Eyebrow>
          <h1 className="font-display text-burgundy font-medium tracking-tight leading-[1.05] mt-2 mb-4 text-[40px] sm:text-[64px]">
            <span className="italic">What should</span> we brew next?
          </h1>
          <p className="max-w-[600px] text-warm-700 text-base mb-6 leading-relaxed">
            Aligned with{" "}
            <strong style={{ color: aligned.color }}>{aligned.name}&apos;s</strong>{" "}
            palate, then refined by your {member.ratings.length} ratings. Pick a
            mode below.
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2 mb-6 sm:mb-8 flex-wrap">
          {MODES.map((m) => {
            const active = mode === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={[
                  "flex-1 px-5 py-5 rounded-xl text-left cursor-pointer transition-all duration-200 ease-smooth",
                  active
                    ? "border-2 border-burgundy bg-[var(--bg-elevated)] shadow-card"
                    : "border border-warm-300 bg-transparent",
                ].join(" ")}
              >
                <div
                  className={[
                    "font-display italic font-medium leading-snug mb-2 text-[20px]",
                    active ? "text-burgundy" : "text-forest",
                  ].join(" ")}
                >
                  {m.label}
                </div>
                <div className="text-xs text-warm-600 leading-snug">{m.desc}</div>
              </button>
            );
          })}
        </div>

        {mode === "recommend" && (
          <RecommendPanel
            recommended={recommended}
            target={targetProfile}
            radarStyle="fill"
            isBlindFor={hide}
          />
        )}
        {mode === "different" && (
          <DifferentPanel
            teas={different}
            target={targetProfile}
            radarStyle="fill"
            isBlindFor={hide}
          />
        )}
        {mode === "blind" && <BlindPanel teas={blindCandidates} />}
      </Container>
      <div className="h-16" />
    </main>
  );
}

// =====================================================================
// LIKELY MATCHES
// =====================================================================

function RecommendPanel({
  recommended,
  target,
  radarStyle,
  isBlindFor,
}: {
  recommended: { t: Tea; score: number }[];
  target: Profile;
  radarStyle: "fill" | "outline" | "dotted";
  isBlindFor: (slug: string) => boolean;
}) {
  const top = recommended[0];
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr] gap-6 sm:gap-8 items-start">
        <div className="bg-[var(--bg-elevated)] rounded-xl p-5 sm:p-6 shadow-card border border-warm-200 sm:sticky sm:top-24">
          <Eyebrow>Your target profile</Eyebrow>
          <h3 className="font-display text-forest font-medium m-0 mt-1.5 mb-3.5 text-[22px]">
            Where your palate sits
          </h3>
          <RadarChart
            profiles={[
              { values: target, color: "var(--burgundy, #722F37)" },
              ...(top
                ? [
                    {
                      values: compositeProfile(top.t),
                      color: "var(--gold-dark, #A68B3D)",
                    },
                  ]
                : []),
            ]}
            style={radarStyle}
            size={320}
          />
          <div className="flex gap-3.5 justify-center mt-3 pt-3 border-t border-warm-200 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-warm-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-burgundy" />
              You
            </span>
            <span className="inline-flex items-center gap-1.5 text-warm-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--gold-dark, #A68B3D)" }} />
              Top match
            </span>
          </div>
        </div>

        <div>
          <Eyebrow color="var(--gold-dark, #A68B3D)">
            Top matches · ranked by overlap
          </Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-1.5 mb-6 text-[36px]">
            You&apos;ll likely love these.
          </h2>
          <div className="flex flex-col gap-4">
            {recommended.map(({ t, score }, i) => (
              <RecRow
                key={t.slug}
                tea={t}
                score={score}
                rank={i + 1}
                hideReviews={isBlindFor(t.slug)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecRow({
  tea,
  score,
  rank,
  hideReviews,
}: {
  tea: Tea;
  score: number;
  rank: number;
  hideReviews: boolean;
}) {
  const avg = teaAvg(tea);
  return (
    <Link
      href={teaUrl(tea)}
      // Mobile: stack header (rank + thumb + match) above title and summary.
      // Desktop: 4-col grid as before. The fixed gridTemplateColumns in the
      // inline style was the overflow culprit on /recommendations.
      className="no-underline group bg-[var(--bg-elevated)] rounded-xl p-4 sm:p-[18px] shadow-card border border-warm-200 flex flex-col sm:grid sm:grid-cols-[auto_100px_1fr_auto] gap-4 sm:gap-[18px] sm:items-center cursor-pointer transition-all duration-200 ease-smooth hover:shadow-elevated hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3 sm:contents">
        <div
          className="font-display italic text-gold font-medium leading-none w-10 sm:text-center text-[40px] sm:text-[48px]"
          aria-hidden
        >
          {rank}
        </div>
        <div
          className="w-16 h-16 sm:w-[100px] sm:h-[100px] rounded-lg shrink-0"
          style={{ background: tea.gradient }}
        />
        <div className="ml-auto sm:hidden bg-gold text-forest px-3 py-1.5 rounded-pill text-[13px] font-bold font-sans">
          {Math.round(score * 100)}% match
        </div>
      </div>
      <div>
        <div className="flex gap-2 items-center mb-1 flex-wrap">
          <TeaTypeTag type={tea.type} small />
          <span className="text-[11px] text-warm-600 tracking-wider uppercase font-bold">
            {tea.region}
          </span>
        </div>
        <h3 className="font-display text-burgundy font-medium tracking-tight m-0 mb-1.5 text-[22px] sm:text-[26px]">
          {tea.name}
        </h3>
        <p className="text-[13px] text-warm-700 leading-snug m-0 max-w-[460px]">
          {tea.summary.slice(0, 110)}…
        </p>
      </div>
      <div className="hidden sm:flex text-right flex-col gap-2 items-end">
        <div className="bg-gold text-forest px-4 py-2 rounded-pill text-sm font-bold font-sans">
          {Math.round(score * 100)}% match
        </div>
        {!hideReviews && <RatingScore value={avg} />}
        <span className="text-[11px] text-warm-600 font-mono">
          ${tea.price.toFixed(2)}/g
        </span>
      </div>
      <div className="flex sm:hidden gap-3 items-center justify-between pt-2 border-t border-warm-200">
        {!hideReviews && <RatingScore value={avg} />}
        <span className="text-[11px] text-warm-600 font-mono">
          ${tea.price.toFixed(2)}/g
        </span>
      </div>
    </Link>
  );
}

// =====================================================================
// TRY DIFFERENT
// =====================================================================

function DifferentPanel({
  teas,
  target,
  radarStyle,
  isBlindFor,
}: {
  teas: { t: Tea; score: number }[];
  target: Profile;
  radarStyle: "fill" | "outline" | "dotted";
  isBlindFor: (slug: string) => boolean;
}) {
  return (
    <div>
      <div className="bg-cream rounded-xl px-6 py-5 mb-7 border border-dashed border-warm-300">
        <Eyebrow>Why try different?</Eyebrow>
        <p className="text-sm text-warm-700 m-0 mt-1.5 leading-snug">
          These teas sit furthest from your current profile. They might not
          become favorites, but they widen the map. Tea is a long road — drink
          things that surprise you.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {teas.map(({ t, score }) => (
          <div key={t.slug} className="relative">
            <TeaCard tea={t} hideReviews={isBlindFor(t.slug)} />
            <span
              className="absolute -top-2 right-3 px-2.5 py-0.5 rounded-pill text-[10px] font-bold tracking-wide uppercase shadow-card"
              style={{
                background: "var(--sage, #8B9A7D)",
                color: "var(--cream, #FAF7F2)",
              }}
            >
              New territory · {Math.round((1 - score) * 100)}% novel
            </span>
            <div className="mt-3 px-3.5 py-3.5 bg-[var(--bg-elevated)] rounded-lg shadow-card border border-warm-200">
              <Eyebrow color="var(--warm-600, #6B6560)" className="text-[9px]">
                You vs this tea
              </Eyebrow>
              <RadarChart
                profiles={[
                  { values: target, color: "var(--burgundy, #722F37)" },
                  { values: compositeProfile(t), color: "var(--sage, #8B9A7D)" },
                ]}
                style={radarStyle}
                size={180}
                showLabels={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================================
// BLIND TASTING
// =====================================================================

function BlindPanel({ teas }: { teas: { t: Tea; score: number }[] }) {
  const router = useRouter();
  const launchBlind = (tea: Tea) => {
    router.push(`${teaUrl(tea)}?blind=1`);
  };

  return (
    <div>
      <div className="bg-burgundy text-cream rounded-xl px-6 sm:px-9 py-6 sm:py-8 mb-7 sm:mb-8 relative overflow-hidden">
        <TeaStain
          size={400}
          color="#C4A35A"
          opacity={0.18}
          className="absolute -top-24 -right-20 pointer-events-none hidden sm:block"
        />
        <div className="relative max-w-[600px]">
          <Eyebrow color="rgba(250,247,242,0.7)">Blind tasting</Eyebrow>
          <h2 className="font-display italic text-cream font-medium tracking-tight leading-[1.05] m-0 mt-2.5 mb-3.5 text-[30px] sm:text-[44px]">
            Rate it before you read it.
          </h2>
          <p className="text-base leading-relaxed m-0" style={{ color: "rgba(250,247,242,0.85)" }}>
            We hide our reviews, ratings, and even the radar until after you log
            your own. Brewing parameters and origin stay visible — that&apos;s
            what you&apos;d see on the back of the tin.
          </p>
        </div>
      </div>

      <Eyebrow>Pick a tea to taste blind</Eyebrow>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-4">
        {teas.map(({ t }) => (
          <article
            key={t.slug}
            onClick={() => launchBlind(t)}
            // Mobile: stack the gradient banner above the metadata.
            // Desktop: 140px column thumbnail. Inline gridTemplateColumns
            // was the overflow vector at narrow widths.
            className="bg-[var(--bg-elevated)] rounded-xl shadow-card border border-warm-200 overflow-hidden cursor-pointer transition-all duration-200 ease-smooth hover:shadow-elevated hover:-translate-y-0.5 flex flex-col sm:grid sm:grid-cols-[140px_1fr]"
          >
            <div
              className="relative aspect-[16/7] sm:aspect-auto"
              style={{ background: t.gradient }}
              aria-hidden
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "rgba(45,58,46,0.3)" }}
              >
                <span className="font-display italic font-medium text-[48px] sm:text-[64px]" style={{ color: "rgba(250,247,242,0.9)" }}>
                  ?
                </span>
              </div>
            </div>
            <div className="px-4 sm:px-4.5 py-4">
              <TeaTypeTag type={t.type} small />
              <h3 className="font-display text-burgundy font-medium tracking-tight m-0 mt-1.5 mb-1 text-[22px]">
                {t.name}
              </h3>
              <p className="text-xs text-warm-600 m-0 mb-2.5">
                {t.region} · {t.year} · {t.elev}m
              </p>
              <div className="text-[11px] text-warm-600 font-mono">
                {t.brewing.style} · {t.brewing.ratio} · {t.brewing.temp}
              </div>
              <Button variant="primary" size="sm" className="mt-3">
                Start blind tasting →
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
