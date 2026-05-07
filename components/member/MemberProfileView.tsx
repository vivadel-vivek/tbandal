"use client";

import Link from "next/link";
import { useMemo } from "react";
import { teaUrl } from "@/lib/tea-helpers";
import { FLAVOR_AXES } from "@/lib/flavor";
import type { Contributor, ContributorKey, FlavorProfile, Tea } from "@/lib/types";
import { useMember } from "@/contexts/MemberContext";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { AvatarChip } from "@/components/ui/AvatarChip";
import { RatingScore } from "@/components/ui/RatingScore";
import { RadarChart } from "@/components/tea/RadarChart";

/**
 * Member profile — palate radar, alignment switch, ratings list, link
 * to settings + recommendations. The radar collapses to a soft "blind
 * mode" placeholder when the user has chosen to hide ratings site-wide.
 */
type Props = {
  teas: Tea[];
  contributors: Record<ContributorKey, Contributor>;
};

export function MemberProfileView({ teas: TEAS, contributors: CONTRIBUTORS }: Props) {
  const { member, setMember } = useMember();

  const aligned = CONTRIBUTORS[member.aligned];

  // Member's drifted palate — anchored to the aligned contributor and
  // gently nudged by the count of rated teas. Once Phase 6 ships this
  // becomes a server-computed value derived from real ratings + Postgres.
  const myProfile = useMemo<FlavorProfile>(() => {
    const seedTea = TEAS[0];
    if (!seedTea) {
      return Object.fromEntries(FLAVOR_AXES.map((a) => [a.key, 0])) as FlavorProfile;
    }
    const seed = seedTea.flavor[member.aligned];
    const out = {} as FlavorProfile;
    const drift = member.ratings.length * 0.1;
    for (const ax of FLAVOR_AXES) {
      out[ax.key] = Math.max(
        0,
        Math.min(10, (seed[ax.key] ?? 0) + drift),
      );
    }
    return out;
  }, [member.aligned, member.ratings.length]);

  const seedTea = TEAS[0];
  const alignedProfile = seedTea ? seedTea.flavor[member.aligned] : null;

  const isBlind = member.settings.flavorMode === "blind";

  return (
    <main>
      <Container>
        <div className="pt-10 sm:pt-12 pb-6 sm:pb-8 flex justify-between items-end gap-6 flex-wrap">
          <div>
            <Eyebrow>Your profile</Eyebrow>
            <h1 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-3 text-[36px] sm:text-[56px]">
              <span className="italic">Hello,</span> {member.name}.
            </h1>
            <p className="text-base text-warm-700 max-w-[580px] m-0">
              Your palate is currently aligned with{" "}
              <strong style={{ color: aligned.color }}>
                {aligned.name}&apos;s
              </strong>
              . As you rate teas, your profile drifts toward your own
              preferences and we recommend better matches.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/member/library">
              <Button variant="secondary">Library →</Button>
            </Link>
            <Link href="/member/settings">
              <Button variant="secondary">Settings →</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] gap-6 sm:gap-10 items-start">
          {/* Palate radar */}
          <div className="card-surface p-5 sm:p-8">
            <Eyebrow>Your flavor map</Eyebrow>
            <h3 className="font-display text-forest font-medium m-0 mt-1.5 mb-5 text-hero-sm">
              {isBlind ? "Hidden in blind mode" : "What you tend to like"}
            </h3>

            {isBlind ? (
              <div className="aspect-square flex items-center justify-center bg-cream rounded-lg border border-dashed border-warm-300">
                <div className="text-center max-w-[320px] p-8">
                  <div className="font-display italic text-burgundy text-[80px] leading-none mb-3">?</div>
                  <Eyebrow>Blind mode</Eyebrow>
                  <p className="text-sm text-warm-700 leading-relaxed mt-3 mb-4">
                    Your radar is hidden while you taste teas without
                    seeing reviews first. Reveal teas as you try them in
                    Settings, or change your mode below.
                  </p>
                  <Link href="/member/settings">
                    <Button variant="secondary" size="sm">
                      Change mode
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <RadarChart
                  profiles={[
                    { values: myProfile, color: "var(--burgundy, #722F37)" },
                    ...(alignedProfile
                      ? [{ values: alignedProfile, color: aligned.color }]
                      : []),
                  ]}
                  style="fill"
                  size={420}
                />
                <div className="flex gap-4 justify-center mt-4 pt-4 border-t border-warm-200">
                  <LegendDot color="var(--burgundy, #722F37)" label={`${member.name}'s palate`} />
                  <LegendDot color={aligned.color} label={`Aligned: ${aligned.name}`} />
                </div>
              </>
            )}
          </div>

          {/* Side stack */}
          <div className="flex flex-col gap-5">
            {/* Realign */}
            <div className="card-surface p-6">
              <Eyebrow>Realign your palate</Eyebrow>
              <p className="text-[13px] text-warm-600 mt-2 mb-3.5">
                Pick a starting point. We use this only until you&apos;ve
                rated a few teas of your own.
              </p>
              <div className="flex gap-2.5">
                {[CONTRIBUTORS.james, CONTRIBUTORS.vivek].map((c) => {
                  const active = member.aligned === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() =>
                        setMember((m) => ({ ...m, aligned: c.key as ContributorKey }))
                      }
                      className={[
                        "flex-1 p-3.5 rounded-lg text-left cursor-pointer flex items-center gap-3",
                        active ? "border-2" : "border border-warm-300",
                      ].join(" ")}
                      style={{
                        borderColor: active ? c.color : undefined,
                        background: active ? c.color + "12" : "transparent",
                      }}
                    >
                      <AvatarChip who={c.key} size={36} />
                      <div>
                        <div className="font-display text-burgundy text-lg font-medium">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-warm-600">
                          {c.palate}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ratings */}
            <div className="card-surface p-6">
              <Eyebrow>Your ratings</Eyebrow>
              <div className="flex items-baseline gap-2 mt-2 mb-4">
                <span className="font-display text-burgundy text-5xl font-medium">
                  {member.ratings.length}
                </span>
                <span className="text-[13px] text-warm-600">
                  teas rated · {Math.max(0, 5 - member.ratings.length)} more
                  to drift independent
                </span>
              </div>
              {member.ratings.length === 0 ? (
                <div className="p-4 bg-cream rounded-md text-[13px] text-warm-700 leading-snug">
                  No ratings yet. Browse the library and rate a few teas to
                  start shaping your profile.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {member.ratings.slice(0, 4).map((r) => {
                    const t = TEAS.find((x) => x.slug === r.slug);
                    if (!t) return null;
                    return (
                      <Link
                        key={r.slug}
                        href={teaUrl(t)}
                        className="flex items-center gap-3 p-2 rounded-md no-underline hover:bg-cream"
                      >
                        <div
                          className="w-9 h-9 rounded-sm shrink-0"
                          style={{ background: t.gradient }}
                        />
                        <div className="flex-1">
                          <div className="font-display text-burgundy text-base font-medium">
                            {t.name}
                          </div>
                          <div className="text-[11px] text-warm-600">
                            {t.region}
                          </div>
                        </div>
                        {(() => {
                          const userBasic = r.scale === "basic";
                          return (
                            <RatingScore
                              value={userBasic ? r.rating / 2 : r.rating}
                              max={userBasic ? 5 : 10}
                            />
                          );
                        })()}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link href="/recommendations">
              <Button variant="primary" size="lg">
                Get recommendations →
              </Button>
            </Link>
          </div>
        </div>
      </Container>
      <div className="h-16" />
    </main>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-warm-700 font-semibold">
      <span
        className="w-3 h-3 rounded-full"
        style={{ background: color }}
        aria-hidden
      />
      {label}
    </span>
  );
}
