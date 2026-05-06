"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type {
  Tea,
  ContributorKey,
  FlavorAxis,
  BasicAxis,
  ReviewBody,
  FlavorProfile,
  MemberRating,
  WaterSource,
} from "@/lib/types";
import { CONTRIBUTORS, vendorByName } from "@/lib/data";
import { BASIC_AXES, FLAVOR_AXES, rollUpProfile, topFlavors } from "@/lib/flavor";
import { useMember } from "@/contexts/MemberContext";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { RatingScore } from "@/components/ui/RatingScore";
import { AvatarChip } from "@/components/ui/AvatarChip";
import { FlavorBadge } from "@/components/ui/FlavorBadge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TeaCard } from "@/components/tea/TeaCard";
import { TeaHero } from "@/components/tea/TeaHero";
import { RadarChart } from "@/components/tea/RadarChart";
import { MouthfeelGrid } from "@/components/tea/MouthfeelGrid";
import { Glossarized } from "@/components/glossary/Glossarized";

type ReviewTab = ContributorKey | "members" | "you";

type Props = {
  tea: Tea;
  similar: { tea: Tea; score: number }[];
  /** Discover-launched blind tasting flow (different from member-blind) */
  blindMode?: boolean;
};

/** Adapter: lift a saved MemberRating into the same ReviewBody shape
 *  the contributor reviews use, so the tab-display code can be uniform. */
function memberRatingToReview(r: MemberRating): ReviewBody {
  return {
    rating: r.rating,
    body: r.body,
    date: r.date,
    session: r.session,
    scale: r.scale,
  };
}

export function TeaDetailView({ tea, similar, blindMode = false }: Props) {
  const { member, isBlindFor, unblind } = useMember();
  const router = useRouter();
  // Composite-radar overlay (all three palates at once) is now stored
  // on member settings — used to be a tweaks-panel toggle. Off by default
  // for newcomers; opt-in via /member/settings.
  const showComposite = member.settings.composite;

  // Bind once and let TS narrow naturally — no `memberRating!` needed.
  const mr = member.ratings.find((r) => r.slug === tea.slug);
  const hasMember = mr !== undefined;

  const [activeTab, setActiveTab] = useState<ReviewTab>("james");

  // Effective flavor mode: "blind" is whole-site; tea-detail toggles only basic/advanced
  const memberMode = member.settings.flavorMode;
  const initialDisplayMode: "basic" | "advanced" =
    memberMode === "blind" ? "advanced" : memberMode;
  const [displayMode, setDisplayMode] = useState<"basic" | "advanced">(initialDisplayMode);
  const isBasic = displayMode === "basic";
  const radarAxes: readonly (FlavorAxis | BasicAxis)[] = isBasic
    ? BASIC_AXES
    : FLAVOR_AXES;

  // Member-level blind state for THIS tea (vs the Discover-launched blind flow)
  const isBlinded = isBlindFor(tea.slug) || blindMode;
  const memberBlind = isBlinded && memberMode === "blind" && !blindMode;

  const reviewMap: Record<ReviewTab, ReviewBody | null> = {
    vivek: tea.reviews.vivek,
    james: tea.reviews.james,
    members: tea.reviews.members,
    you: mr ? memberRatingToReview(mr) : null,
  };

  const profileMap: Record<ReviewTab, FlavorProfile | null> = {
    vivek: tea.flavor.vivek,
    james: tea.flavor.james,
    members: tea.flavor.members,
    you: mr ? mr.profile : null,
  };

  // James leads the contributor order site-wide — he's the tea lead.
  const tabOrder: ReviewTab[] = hasMember
    ? ["james", "vivek", "members", "you"]
    : ["james", "vivek", "members"];
  const safeTab: ReviewTab = tabOrder.includes(activeTab) ? activeTab : "members";
  const review = reviewMap[safeTab];
  const profile = profileMap[safeTab];

  // Build the radar profiles for the current view (rolled up if Basic)
  type RP = { values: Record<string, number>; color: string; label?: string };
  const profilesForRadar: RP[] = useMemo(() => {
    const toRadar = (v: Record<string, number>) =>
      isBasic ? rollUpProfile(v as FlavorProfile) : v;
    // Composite-overlay order matches the rest of the site: James (lead),
    // then Vivek, then members aggregate, then the current member.
    const raw: RP[] = showComposite
      ? [
          ...(tea.reviews.james
            ? [{ values: tea.flavor.james, color: CONTRIBUTORS.james.color, label: "James" }]
            : []),
          ...(tea.reviews.vivek
            ? [{ values: tea.flavor.vivek, color: CONTRIBUTORS.vivek.color, label: "Vivek" }]
            : []),
          { values: tea.flavor.members, color: "var(--gold-dark, #A68B3D)", label: "Members" },
          ...(mr
            ? [{ values: mr.profile, color: "var(--forest, #2D3A2E)", label: "You" }]
            : []),
        ]
      : profile
        ? [
            {
              values: profile,
              color:
                safeTab === "you"
                  ? "var(--forest, #2D3A2E)"
                  : safeTab === "members"
                    ? "var(--gold-dark, #A68B3D)"
                    : CONTRIBUTORS[safeTab].color,
            },
          ]
        : [];
    return raw.map((p) => ({ ...p, values: toRadar(p.values) }));
  }, [showComposite, tea, profile, safeTab, mr, isBasic]);

  // Helper used outside the memo for non-radar consumers (top notes badges)
  const toRadarValues = (vals: Record<string, number>) =>
    isBasic ? rollUpProfile(vals as FlavorProfile) : vals;

  // "Visit shop" / "Buy from {vendor}" buttons in the hero send the
  // visitor outbound through our /go/[slug] redirect so we can attribute
  // referrals later. Opens in a new tab so people don't lose the article.
  const handleVisitVendor = () => {
    const v = vendorByName(tea.vendor);
    if (v) window.open(`/go/${v.slug}`, "_blank", "noopener,noreferrer");
  };
  // Session-log entry now lives on a dedicated page (was a cramped
  // modal). Vendor info comes from the URL params we're already on.
  const logHref = `/tea/${vendorByName(tea.vendor)?.slug ?? tea.vendor}/${tea.pathSlug}/log`;
  const handleLogSession = () => router.push(logHref);
  // Used by the bottom burgundy vendor banner — rendered as an anchor
  // for proper rel="nofollow sponsored" + indexable href semantics.
  const vendorOutboundHref =
    vendorByName(tea.vendor) && `/go/${vendorByName(tea.vendor)!.slug}`;

  return (
    <main>
      <Container>
        <Link
          href="/discover/teas"
          className="inline-flex items-center gap-1.5 text-warm-600 text-[13px] font-sans no-underline mt-6 mb-2"
        >
          ← Back to teas
        </Link>

        <TeaHero
          tea={tea}
          variant="split"
          hideReviews={isBlinded}
          onVisitVendor={handleVisitVendor}
          onLogSession={handleLogSession}
        />

        {/* DISCOVER-LAUNCHED BLIND TASTING BANNER */}
        {blindMode && (
          <div className="mt-8 mb-2 px-7 py-5 bg-burgundy text-cream rounded-xl flex justify-between items-center gap-4 flex-wrap">
            <div>
              <div className="text-[11px] tracking-widest uppercase font-bold mb-1" style={{ opacity: 0.7 }}>
                Blind tasting in progress
              </div>
              <div className="font-display italic text-[22px]">
                Reviews and ratings are hidden until you log yours.
              </div>
            </div>
            <Button variant="gold" onClick={() => router.push(logHref)}>
              Rate this tea →
            </Button>
          </div>
        )}

        {/* MEMBER BLIND BANNER */}
        {memberBlind && (
          <div className="mt-8 mb-2 px-7 py-6 bg-[var(--bg-elevated)] border border-dashed border-warm-300 rounded-xl flex justify-between items-center gap-6 flex-wrap">
            <div className="flex-1 min-w-[280px]">
              <div className="text-[11px] tracking-widest uppercase font-bold text-warm-600 mb-1.5">
                Blind mode · your setting
              </div>
              <div className="font-display italic text-burgundy leading-snug text-[24px]">
                Reviews and ratings are hidden until you&apos;ve tasted this one.
              </div>
              <p className="text-[13px] text-warm-700 leading-relaxed mt-2 max-w-[540px] m-0">
                Origin, brewing, and the radar (when you turn it on) stay
                visible. If you&apos;ve already had this tea, reveal the
                reviews — we&apos;ll remember and skip the hide for you next
                time.
              </p>
            </div>
            <div className="flex gap-2.5 shrink-0">
              <Button variant="secondary" onClick={() => router.push(logHref)}>
                Rate it first
              </Button>
              <Button variant="primary" onClick={() => unblind(tea.slug)}>
                I&apos;ve tasted this →
              </Button>
            </div>
          </div>
        )}

        {/* REVIEWS SECTION — hidden during both blind modes */}
        {!memberBlind && !blindMode && (
          <section className="mt-14">
            <SectionHeader
              eyebrow="Reviews"
              title={
                (() => {
                  const n =
                    (tea.reviews.vivek ? 1 : 0) +
                    (tea.reviews.james ? 1 : 0) +
                    1 + // members aggregate is always present
                    (hasMember ? 1 : 0);
                  const word = ["Zero", "One", "Two", "Three", "Four"][n] ?? `${n}`;
                  return `${word} palate${n === 1 ? "" : "s"}, one tea`;
                })()
              }
            />

            {/* Tabs */}
            <div className="flex gap-1 mb-7 p-1 bg-cream rounded-pill w-fit border border-warm-200 flex-wrap">
              {[
                { key: "james" as const, label: "James's Review" },
                { key: "vivek" as const, label: "Vivek's Review" },
                { key: "members" as const, label: "Member Reviews" },
                ...(hasMember ? [{ key: "you" as const, label: "Your Review" }] : []),
              ].map((t) => {
                const has = !!reviewMap[t.key];
                const active = safeTab === t.key;
                const c = t.key === "vivek" || t.key === "james" ? CONTRIBUTORS[t.key] : null;
                const activeBg =
                  t.key === "you"
                    ? "var(--forest, #2D3A2E)"
                    : c?.color ?? "var(--burgundy, #722F37)";
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={[
                      "px-5 py-2.5 rounded-pill border-0 cursor-pointer font-sans text-[13px] font-bold inline-flex items-center gap-2",
                      "transition-colors duration-200 ease-smooth",
                      active ? "text-cream" : has ? "text-forest" : "text-warm-600 italic",
                    ].join(" ")}
                    style={{
                      background: active ? activeBg : "transparent",
                      opacity: has ? 1 : 0.7,
                    }}
                  >
                    {t.key === "members" ? (
                      <span className="text-[14px]" aria-hidden>
                        👥
                      </span>
                    ) : t.key === "you" ? (
                      <span className="text-[12px] font-display italic" aria-hidden>
                        You
                      </span>
                    ) : (
                      <AvatarChip who={t.key} size={20} />
                    )}
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_1fr] gap-6 sm:gap-8 items-start">
              {/* Radar + mouthfeel */}
              <div className="bg-[var(--bg-elevated)] rounded-xl p-7 shadow-card border border-warm-200">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-3">
                  <Eyebrow>
                    Flavor profile · {isBasic ? "6 axes (basic)" : "12 axes (advanced)"}
                  </Eyebrow>
                  <FlavorModeToggle mode={displayMode} onChange={setDisplayMode} />
                </div>
                {showComposite && (
                  <div className="flex gap-3 text-[11px] text-warm-600 flex-wrap mb-1">
                    {tea.reviews.james && <LegendDot color={CONTRIBUTORS.james.color} label="James" />}
                    {tea.reviews.vivek && <LegendDot color={CONTRIBUTORS.vivek.color} label="Vivek" />}
                    <LegendDot color="var(--gold-dark, #A68B3D)" label="Members" />
                    {hasMember && <LegendDot color="var(--forest, #2D3A2E)" label="You" />}
                  </div>
                )}
                <RadarChart
                  profiles={profilesForRadar}
                  axes={radarAxes}
                  style="fill"
                  size={400}
                />
                {isBasic && (
                  <div className="mt-1.5 text-[11px] text-warm-600 leading-normal italic text-center">
                    Six lay-term axes — each combines two of the twelve advanced flavors.
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-warm-200">
                  <Eyebrow>Mouthfeel</Eyebrow>
                  <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] gap-4 mt-3 items-center">
                    <MouthfeelGrid point={tea.mouthfeel} size={220} />
                    <div>
                      <div className="text-[11px] text-warm-600 tracking-widest uppercase font-bold mb-1.5">
                        Finish
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {tea.finish.map((f) => (
                          <span
                            key={f}
                            className="font-display italic text-forest text-[17px]"
                          >
                            · <Glossarized>{f}</Glossarized>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review notes */}
              <div>
                {!review ? (
                  <div className="bg-[var(--bg-elevated)] rounded-xl p-8 shadow-card border border-dashed border-warm-300 text-center">
                    <div
                      className="w-14 h-14 rounded-full mx-auto mb-3.5 flex items-center justify-center text-cream font-display italic text-2xl"
                      style={{
                        background:
                          safeTab === "vivek" || safeTab === "james"
                            ? CONTRIBUTORS[safeTab].color
                            : "var(--warm-300, #B5B0AA)",
                        opacity: 0.6,
                      }}
                    >
                      ?
                    </div>
                    <Eyebrow>Not yet reviewed</Eyebrow>
                    <h4 className="font-display text-burgundy font-medium m-0 mt-2 mb-2 italic leading-snug text-[28px]">
                      {(safeTab === "vivek" || safeTab === "james")
                        ? CONTRIBUTORS[safeTab].name
                        : "We"}
                      {" "}hasn&apos;t tried this one yet.
                    </h4>
                    <p className="text-sm text-warm-700 leading-snug max-w-[360px] mx-auto mb-5">
                      Want a second opinion? Send a request — if you have the
                      tea, we&apos;ll cover return shipping; otherwise drop a
                      purchase link.
                    </p>
                    <Link
                      href={{
                        pathname: "/request-review",
                        query: {
                          tea: tea.pathSlug,
                          vendor: vendorByName(tea.vendor)?.slug ?? "",
                          from: safeTab === "vivek" || safeTab === "james" ? safeTab : "",
                        },
                      }}
                    >
                      <Button variant="primary">
                        Request a review from {(safeTab === "vivek" || safeTab === "james") ? CONTRIBUTORS[safeTab].name : "us"} →
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="bg-[var(--bg-elevated)] rounded-xl p-7 shadow-card border border-warm-200">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {safeTab === "members" ? (
                          <div
                            className="w-12 h-12 rounded-full bg-gold text-forest flex items-center justify-center text-[22px] shrink-0"
                            aria-hidden
                          >
                            👥
                          </div>
                        ) : safeTab === "you" ? (
                          <div
                            className="w-12 h-12 rounded-full bg-forest text-cream flex items-center justify-center font-display italic text-[22px] shrink-0"
                            aria-hidden
                          >
                            You
                          </div>
                        ) : (
                          <AvatarChip who={safeTab} size={48} />
                        )}
                        <div className="min-w-0">
                          <div
                            className={[
                              "font-display font-medium italic leading-snug text-[20px]",
                              safeTab === "you" ? "text-forest" : "text-burgundy",
                            ].join(" ")}
                          >
                            {safeTab === "members"
                              ? "Member consensus"
                              : safeTab === "you"
                                ? "Your notes"
                                : `${CONTRIBUTORS[safeTab].name}'s notes`}
                          </div>
                          <Eyebrow color="var(--warm-600, #6B6560)">
                            {review.date}
                          </Eyebrow>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {(() => {
                          const userBasic =
                            safeTab === "you" && mr?.scale === "basic";
                          return (
                            <RatingScore
                              value={userBasic ? review.rating / 2 : review.rating}
                              max={userBasic ? 5 : 10}
                              big
                            />
                          );
                        })()}
                      </div>
                    </div>

                    <p
                      className="font-serif italic text-forest leading-relaxed mb-5 pl-4 text-[18px]"
                      style={{
                        borderLeft: `2px solid ${
                          safeTab === "you"
                            ? "var(--forest, #2D3A2E)"
                            : "var(--gold, #C4A35A)"
                        }`,
                      }}
                    >
                      &ldquo;<Glossarized>{review.body}</Glossarized>&rdquo;
                    </p>

                    {review.session && (
                      <div className="bg-cream px-4 py-3 rounded-md mb-4 text-xs text-warm-700 font-mono break-words">
                        <div className="text-[10px] tracking-widest uppercase text-warm-600 mb-1 font-sans font-bold">
                          Brewed
                        </div>
                        {review.session}
                      </div>
                    )}

                    {safeTab === "you" && mr && (mr.vessel || mr.water || mr.leafG || mr.waterMl || mr.waterSource || mr.waterTdsPpm !== undefined || mr.brewStyleOverride) && (
                      <div className="bg-cream px-4 py-3 rounded-md mb-4 text-xs text-warm-700">
                        <div className="text-[10px] tracking-widest uppercase text-warm-600 mb-1.5 font-sans font-bold">
                          Session
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono">
                          {mr.leafG && mr.waterMl && (
                            <span>{mr.leafG}g / {mr.waterMl}ml</span>
                          )}
                          {mr.vessel && <span>{mr.vessel}</span>}
                          {(mr.waterSource || mr.waterTdsPpm !== undefined) && (
                            <span>
                              {mr.waterSource && waterSourceLabel(mr.waterSource)}
                              {mr.waterSource && mr.waterTdsPpm !== undefined ? " · " : ""}
                              {mr.waterTdsPpm !== undefined && `${mr.waterTdsPpm} TDS`}
                            </span>
                          )}
                          {!mr.waterSource && !mr.waterTdsPpm && mr.water && <span>{mr.water}</span>}
                          {mr.brewStyleOverride && (
                            <span className="text-burgundy">
                              brewed {mr.brewStyleOverride}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {safeTab === "you" && mr?.steeps && mr.steeps.length > 0 && (
                      <div className="mb-4">
                        <Eyebrow color="var(--warm-600, #6B6560)">
                          Per-steep breakdown · {mr.steeps.length} {mr.steeps.length === 1 ? "steep" : "steeps"}
                        </Eyebrow>
                        <div className="mt-2.5 flex flex-col gap-1.5">
                          {mr.steeps.map((s) => {
                            const meta: string[] = [];
                            if (s.time) meta.push(s.time);
                            if (s.tempC) meta.push(`${s.tempC}°C`);
                            return (
                              <div
                                key={s.index}
                                className="flex items-baseline gap-3 px-3 py-2 bg-cream rounded-md text-[12px] text-warm-700"
                              >
                                <span className="font-display italic text-burgundy text-[15px] shrink-0 w-8">
                                  #{s.index}
                                </span>
                                {meta.length > 0 && (
                                  <span className="font-mono text-warm-600 shrink-0">
                                    {meta.join(" · ")}
                                  </span>
                                )}
                                {s.rating !== undefined && (
                                  <span className="font-display text-forest shrink-0">
                                    {s.rating.toFixed(1)}/10
                                  </span>
                                )}
                                {s.notes && (
                                  <span className="font-serif italic text-forest min-w-0 flex-1">
                                    {s.notes}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {profile &&
                      (() => {
                        const displayProfile: Record<string, number> = toRadarValues(profile);
                        const tops = topFlavors(displayProfile, radarAxes);
                        return tops.length > 0 ? (
                          <div className="mb-4">
                            <Eyebrow color="var(--warm-600, #6B6560)">
                              {safeTab === "members"
                                ? "Top notes — member consensus"
                                : safeTab === "you"
                                  ? "Top notes — your palate"
                                  : `Top notes — ${CONTRIBUTORS[safeTab].name}'s palate`}
                            </Eyebrow>
                            <div className="flex flex-wrap gap-2 mt-2.5">
                              {tops.map((ax) => (
                                <FlavorBadge
                                  key={ax.key}
                                  axis={ax}
                                  intensity={displayProfile[ax.key] ?? 0}
                                />
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })()}

                    {safeTab === "members" && tea.reviews.members.count > 0 && (
                      <div className="pt-4 border-t border-warm-200 flex justify-between text-[13px] text-warm-700">
                        <span>Based on {tea.reviews.members.count} member ratings</span>
                        <a className="text-burgundy font-bold cursor-pointer">See all →</a>
                      </div>
                    )}

                    {safeTab === "you" && (
                      <div className="pt-4 border-t border-warm-200 flex justify-between items-center text-[13px] text-warm-700">
                        <span>Saved to your profile · refines recommendations</span>
                        <Link
                          href={logHref}
                          className="bg-transparent border-0 text-burgundy font-bold cursor-pointer text-[13px] no-underline"
                        >
                          Edit →
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {!hasMember && !memberBlind && (
                  <div className="bg-cream rounded-xl p-6 mt-5 border border-dashed border-warm-300">
                    <Eyebrow>Add your rating</Eyebrow>
                    <p className="text-[13px] text-warm-700 mt-2 mb-3.5">
                      Rate this tea to refine your flavor profile and improve
                      recommendations.
                    </p>
                    <Link href={logHref}>
                      <Button variant="primary">Rate this tea →</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ORIGIN & BREWING */}
        <section className="mt-12 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <div className="bg-[var(--bg-elevated)] rounded-xl p-7 shadow-card border border-warm-200">
            <Eyebrow>Origin & terroir</Eyebrow>
            <h3 className="font-display text-burgundy font-medium m-0 mt-2 mb-4 text-[28px]">
              The journey
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Detail k="Country" v={tea.country} />
              <Detail k="Region" v={tea.region.split(",")[0] ?? tea.region} />
              <Detail k="Elevation" v={`${tea.elev}m`} />
              <Detail k="Harvest" v={tea.harvest} />
              <Detail k="Year" v={tea.year} />
              <Detail k="Age" v={tea.age} />
              <Detail k="Type" v={tea.type} />
              <Detail
                k="Rarity"
                v={"●".repeat(tea.rarity) + "○".repeat(5 - tea.rarity)}
              />
            </div>
          </div>

          <div className="bg-[var(--bg-elevated)] rounded-xl p-7 shadow-card border border-warm-200">
            <Eyebrow>Recommended brewing</Eyebrow>
            <h3 className="font-display text-burgundy font-medium m-0 mt-2 mb-4 text-[28px]">
              How we made it
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <BrewingStat k="Style" v={tea.brewing.style} icon="🫖" />
              <BrewingStat k="Ratio" v={tea.brewing.ratio} icon="⚖️" />
              <BrewingStat k="Temp" v={tea.brewing.temp} icon="🌡️" />
              <BrewingStat k="First steep" v={tea.brewing.first} icon="⏱️" />
            </div>
            <div className="mt-5 pt-4 border-t border-warm-200 text-[13px] text-warm-700 leading-snug">
              <strong className="text-forest">{tea.sessions} sessions logged.</strong>{" "}
              Peak steeps: {tea.peakSteeps.map((n) => `#${n}`).join(", ")}.{" "}
              <Glossarized>{brewingTipFor(tea.brewing.style)}</Glossarized>
            </div>
          </div>
        </section>

        {/* VENDOR CTA BANNER */}
        <section className="mt-8 p-8 bg-burgundy text-cream rounded-xl flex justify-between items-center gap-6 flex-wrap">
          <div>
            <Eyebrow color="rgba(250,247,242,0.7)">Sold by</Eyebrow>
            <h3 className="font-display italic text-cream font-medium m-0 my-1.5 text-[32px]">
              {tea.vendor}
            </h3>
            <p
              className="text-sm m-0"
              style={{ color: "rgba(250,247,242,0.85)" }}
            >
              ${tea.price.toFixed(2)}/g · ${(tea.price * 5).toFixed(2)} per 5g
              session
            </p>
            <p className="text-[12px] m-0 mt-1.5 text-cream">
              <span aria-hidden>★ </span>
              <strong>Affiliate link.</strong> We earn a small commission on
              referrals — it never influences our ratings.{" "}
              <Link
                href="/about#affiliate-disclosure"
                className="underline text-cream"
              >
                How we rate
              </Link>
              .
            </p>
          </div>
          <div className="flex gap-2.5">
            {vendorOutboundHref ? (
              <a
                href={vendorOutboundHref}
                target="_blank"
                rel="noopener nofollow sponsored"
                // inline-flex so the anchor's bounding box matches the
                // wrapped Button — without this, Lighthouse reports the
                // <a> as a sub-44px target even though the visible
                // button is 44px+ tall (target-size audit).
                className="inline-flex no-underline"
              >
                <Button variant="gold" size="lg">
                  Visit {tea.vendor} ↗
                </Button>
              </a>
            ) : (
              <Button variant="gold" size="lg" onClick={handleVisitVendor}>
                Visit {tea.vendor} ↗
              </Button>
            )}
            <Link href={logHref}>
              <Button
                variant="secondary"
                size="lg"
                style={{
                  background: "transparent",
                  border: "1.5px solid var(--cream, #FAF7F2)",
                  color: "var(--cream, #FAF7F2)",
                }}
              >
                Log a session
              </Button>
            </Link>
          </div>
        </section>

        {/* SIMILAR TEAS */}
        {similar.length > 0 && (
          <section className="mt-12 sm:mt-14">
            <SectionHeader
              eyebrow="More like this"
              title="Teas with overlapping profiles"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {similar.map(({ tea: t, score }) => (
                <div key={t.slug} className="relative">
                  <TeaCard tea={t} hideReviews={isBlinded} />
                  <span
                    className="absolute -top-2 right-3 px-2.5 py-0.5 rounded-pill text-[10px] font-bold tracking-wide uppercase shadow-card"
                    style={{
                      background: "var(--gold, #C4A35A)",
                      color: "var(--forest, #2D3A2E)",
                    }}
                  >
                    {Math.round(score * 100)}% match
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </Container>
      <div className="h-16" />
    </main>
  );
}

// ---------- helpers ----------

function FlavorModeToggle({
  mode,
  onChange,
}: {
  mode: "basic" | "advanced";
  onChange: (m: "basic" | "advanced") => void;
}) {
  const opts = [
    { key: "basic" as const, label: "Basic", sub: "6 axes" },
    { key: "advanced" as const, label: "Advanced", sub: "12 axes" },
  ];
  return (
    <div className="inline-flex p-[3px] bg-cream rounded-pill border border-warm-200 gap-[2px]">
      {opts.map((o) => {
        const active = mode === o.key;
        return (
          <button
            key={o.key}
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
              className="text-[10px] font-semibold"
              style={{ opacity: active ? 0.95 : 0.85 }}
            >
              {o.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-warm-700 font-bold">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function Detail({ k, v }: { k: string; v: string | number }) {
  return (
    <div>
      <div className="text-[10px] tracking-widest uppercase text-warm-600 font-bold">
        {k}
      </div>
      <div className="text-[15px] text-forest mt-1 font-display">{v}</div>
    </div>
  );
}

function BrewingStat({ k, v, icon }: { k: string; v: string; icon: string }) {
  return (
    <div className="flex gap-3 items-center">
      <span className="text-[26px] leading-none" aria-hidden>
        {icon}
      </span>
      <div>
        <div className="text-[10px] tracking-widest uppercase text-warm-600 font-bold">
          {k}
        </div>
        <div className="text-[15px] text-forest font-display">{v}</div>
      </div>
    </div>
  );
}

/** Display string for a structured WaterSource enum value. */
function waterSourceLabel(s: WaterSource): string {
  switch (s) {
    case "filtered": return "filtered";
    case "spring": return "spring";
    case "tap": return "tap";
    case "ro": return "RO";
    case "distilled": return "distilled";
    case "well": return "well";
    case "bottled": return "bottled";
    case "unknown": return "unknown source";
  }
}

/**
 * Type-aware "what to do across the rest of the session" tip. The
 * gongfu cadence ("+5s, +1°C") is wrong for Western, Grandpa, and the
 * delicate Japanese cool-water styles — those want shorter, cooler, or
 * effectively-no-resteep guidance instead.
 */
function brewingTipFor(style: string): string {
  const s = style.toLowerCase();
  if (s.includes("kyusu")) {
    return "For the next steep, drop the temp 5°C and shorten by 30 seconds — Japanese greens tire quickly. The third steep can come back up to 70°C for a longer brew.";
  }
  if (s.includes("grandpa") || s.includes("glass")) {
    return "Top up with hot water as you go; the leaves stay in the cup. When the cup tastes thin, dump and start again with fresh leaf.";
  }
  if (s.includes("western")) {
    return "One long steep is the brew. A second pull at +1 minute and a touch hotter will give you a thinner second cup if you want it.";
  }
  // Gongfu and unspecified — assume short repeated steeps.
  return "Add 5s per steep after the first; raise temp by 1°C every two rounds. Most teas open up around steep three.";
}
