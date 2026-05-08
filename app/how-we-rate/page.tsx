// Standalone methodology page. Linked from the home section + about
// page. Editorial tone, Glossarized body prose, and a live preview of
// the actual axis sets so the reader sees what the radar will look
// like rather than just being told.

import Link from "next/link";
import type { Metadata } from "next";
import { BASIC_AXES, FLAVOR_AXES } from "@/lib/flavor";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { TeaStain } from "@/components/ui/TeaStain";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Glossarized } from "@/components/glossary/Glossarized";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "How we rate",
  description:
    "Two reviewers, a 12-axis flavor wheel (or 6 simpler ones), brewing notes that actually got the cup we describe — the rating system used across Two Buds and a Leaf.",
  alternates: { canonical: "/how-we-rate" },
};

export default function HowWeRatePage() {
  return (
    <main>
      <Container size="article">
        {/* HERO */}
        <div className="relative pt-10 sm:pt-14 pb-6">
          <TeaStain
            size={320}
            color="#C4A35A"
            opacity={0.14}
            className="absolute top-2 -right-20 pointer-events-none hidden sm:block"
          />
          <Eyebrow>The method</Eyebrow>
          <h1 className="font-display text-burgundy font-medium tracking-tightest leading-tighter mt-3 mb-4 sm:mb-5 text-[44px] sm:text-[68px]">
            <span className="italic">How we rate</span>
            <br />
            every cup.
          </h1>
          <p className="text-base sm:text-lg text-warm-700 leading-relaxed max-w-[640px] mb-4">
            Every review on the site uses the same shape: a flavor wheel, a
            mouthfeel, a numerical score, and the brewing notes the reviewer
            actually used. Two of us rate independently, then members add
            their own, and the radar overlays the three so you can see where
            we agree and where we don&apos;t.
          </p>
          <p className="text-base text-warm-700 leading-relaxed max-w-[640px] m-0">
            This page walks through each piece. If you&apos;re new to tea,
            the Basic mode is built for you — six axes in everyday English.
            If you&apos;ve been at this a while, Advanced gives you twelve.
          </p>
        </div>

        {/* THE FLAVOR WHEEL */}
        <section id="flavor-wheel" className="mt-12 sm:mt-14 pt-8 border-t border-warm-200 scroll-mt-24">
          <Eyebrow>The flavor wheel</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-5 text-[32px] sm:text-hero-lg">
            Six axes for newcomers, twelve for the obsessed.
          </h2>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] mb-6">
            The flavor radar comes in two modes. Both describe the same cup;
            Advanced just gives you finer resolution. Toggle between them on
            any tea page — the chart redraws and the description follows.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mb-6">
            <article className="card-surface p-5 sm:p-6">
              <Eyebrow>Basic · 6 axes</Eyebrow>
              <h3 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-3 text-[24px]">
                For most readers.
              </h3>
              <p className="text-[14px] text-warm-700 leading-snug mb-4">
                Plain-English categories. Each axis is the average of two
                Advanced axes — same data, simpler shape.
              </p>
              <ul className="list-none p-0 m-0 grid grid-cols-1 gap-2.5">
                {BASIC_AXES.map((a) => (
                  <li key={a.key} className="flex items-baseline gap-2.5">
                    <span
                      aria-hidden
                      className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                      style={{ background: a.color }}
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-forest text-[14px]">
                        {a.label}
                      </span>
                      <span className="text-warm-600 text-[13px] ml-1">
                        — {a.lay}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className="card-surface p-5 sm:p-6">
              <Eyebrow>Advanced · 12 axes</Eyebrow>
              <h3 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-3 text-[24px]">
                For experienced drinkers.
              </h3>
              <p className="text-[14px] text-warm-700 leading-snug mb-4">
                Twelve descriptors arranged so adjacent ones are
                neighbors in flavor — useful when you&apos;re comparing two
                similar teas and need the resolution.
              </p>
              <ul className="list-none p-0 m-0 grid grid-cols-2 gap-x-3 gap-y-2">
                {FLAVOR_AXES.map((a) => (
                  <li key={a.key} className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: a.color }}
                    />
                    <span className="font-bold text-forest text-[13px]">
                      {a.label}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <div className="bg-cream rounded-xl border border-warm-200 px-5 py-4 text-[13px] text-warm-700 leading-relaxed max-w-[680px]">
            <strong className="text-forest">How the rollup works.</strong>{" "}
            Pairs of advanced axes collapse into one Basic axis: Floral +
            Fruity → Floral. Sweet + Honey → Sweet. Nutty + Roasted →
            Roasted. Woody + Earthy → Earthy. Mineral + Marine → Mineral.
            Vegetal + Spicy → Herbal. The Basic chart shows the average,
            so a tea that&apos;s 8 floral and 4 fruity in Advanced shows as
            6 Floral in Basic.
          </div>
        </section>

        {/* TWO OPINIONS + COMPOSITE */}
        <section id="composite" className="mt-12 sm:mt-14 pt-8 border-t border-warm-200 scroll-mt-24">
          <Eyebrow>Two opinions, one composite</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-5 text-[32px] sm:text-hero-lg">
            Different mouths, the same cup.
          </h2>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] mb-4">
            <Glossarized>
              Each tea is brewed and rated independently by both of us —
              James leans toward earthy, mineral, mature pours; Vivek toward
              the subtle and the nutty. We don&apos;t compare notes until
              both reviews are written. Then they show up side by side, with
              their own profiles on the radar, their own scores, and their
              own session details.
            </Glossarized>
          </p>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] mb-4">
            Members can rate the same teas. Member ratings roll up into a
            third profile — the &ldquo;Members&rdquo; line on the radar — that
            grows more useful the more it gets used.
          </p>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] m-0">
            On any tea page, the &ldquo;Composite&rdquo; toggle overlays all
            three. That&apos;s the most honest single picture of what a tea
            is — three palates agreeing on the shape, even when they
            disagree on the score.
          </p>
        </section>

        {/* MOUTHFEEL + FINISH */}
        <section id="mouthfeel" className="mt-12 sm:mt-14 pt-8 border-t border-warm-200 scroll-mt-24">
          <Eyebrow>Beyond flavor</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-5 text-[32px] sm:text-hero-lg">
            Mouthfeel, finish, and how we brewed it.
          </h2>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] mb-4">
            <Glossarized>
              The flavor wheel only describes what the tea tastes like.
              Two more things matter as much: how it feels (astringent vs
              oily, light vs full-bodied) and how long the impression
              lingers after the cup is empty. Both are on every review.
            </Glossarized>
          </p>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] mb-4">
            The brewing card on each tea page tells you the exact recipe
            we used — leaf weight, water volume, temperature, first-pour
            time, vessel. Reproducible. If your cup tastes different from
            ours, the brewing notes are the first place to check.
          </p>
        </section>

        {/* RATING YOURSELF */}
        <section id="log-a-session" className="mt-12 sm:mt-14 pt-8 border-t border-warm-200 scroll-mt-24">
          <Eyebrow>Members · Rating yourself</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-5 text-[32px] sm:text-hero-lg">
            Log a session.
          </h2>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] mb-4">
            Once you have an account, every tea has a &ldquo;Log a
            session&rdquo; button. Two ways to record:
          </p>
          <ul className="list-none p-0 m-0 mb-4 space-y-3 max-w-[680px]">
            <li className="flex gap-3">
              <span className="font-display text-burgundy text-[20px] shrink-0">·</span>
              <div>
                <strong className="font-display italic text-burgundy text-[18px]">
                  Quick log
                </strong>
                <span className="text-[14px] text-warm-700 leading-snug block mt-0.5">
                  One score, one flavor profile, one mouthfeel — five
                  minutes, suits a casual afternoon cup.
                </span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-display text-burgundy text-[20px] shrink-0">·</span>
              <div>
                <strong className="font-display italic text-burgundy text-[18px]">
                  Per-steep
                </strong>
                <span className="text-[14px] text-warm-700 leading-snug block mt-0.5">
                  Rate every steep separately — flavor, temperature, time,
                  notes. Built for a long session at the gaiwan or kyusu.
                </span>
              </div>
            </li>
          </ul>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] m-0">
            Your sessions stay private by default. You can mark any single
            session as public and share the link with a friend without
            exposing the rest of your library.
          </p>
        </section>

        {/* RECOMMENDATIONS */}
        <section id="recommendations" className="mt-12 sm:mt-14 pt-8 border-t border-warm-200 scroll-mt-24">
          <Eyebrow>Recommendations &amp; matching</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-5 text-[32px] sm:text-hero-lg">
            Match % isn&apos;t magic.
          </h2>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] mb-4">
            The recommendation engine takes the flavor profiles of every tea
            you&apos;ve rated, weights them by how much you liked each, and
            builds a target shape — what your palate sits closest to. New
            teas are scored on overlap with that target, blended 65/35 with
            the tea&apos;s own composite rating so high-quality teas float
            up among the matches.
          </p>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] mb-4">
            Haven&apos;t rated anything yet? The cold-start path uses your{" "}
            <Glossarized>
              &ldquo;aligned&rdquo; contributor — pick James or Vivek when
              you sign up — and seeds the engine off their palate signature
              across the catalog. Three or four ratings in, your own profile
              starts replacing theirs.
            </Glossarized>
          </p>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] mb-4">
            There&apos;s also a &ldquo;Try something different&rdquo; mode
            that does the inverse — finds teas <em>furthest</em> from your
            current target. Useful when you want to widen the map instead
            of going deeper.
          </p>
          <h3 className="font-display text-burgundy font-medium tracking-tight m-0 mt-7 mb-3 text-[20px]">
            Type boundaries we respect
          </h3>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] mb-4">
            Cosine overlap on flavor axes alone would happily recommend a
            shou pu&apos;er to someone who&apos;s only rated raw sheng —
            both end up earthy on the wheel, but they drink nothing alike.
            So the engine applies a soft type boundary: teas of types
            you&apos;ve rated stay near full score; types you&apos;ve never
            rated take a 40% haircut. As you rate across more categories
            the haircut fades naturally. The &ldquo;Try something
            different&rdquo; mode reverses the same list, so unseen-type
            teas surface there instead.
          </p>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] m-0">
            A second softer nudge runs on the <strong>aged</strong> flag:
            once your rating history leans more than 70% toward one side,
            opposite-aged candidates take a 15% haircut. An aged-white
            drinker gets aged-white-ish recommendations, not young
            silver-needle. You can override either at any time by rating
            something on the other side of the line.
          </p>
        </section>

        {/* THE SCALE */}
        <section id="scale" className="mt-12 sm:mt-14 pt-8 border-t border-warm-200 scroll-mt-24">
          <Eyebrow>The scale</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-5 text-[32px] sm:text-hero-lg">
            0–10 (advanced) or 0–5 (basic).
          </h2>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] mb-4">
            Numerical scores are 0–10 in Advanced, 0–5 in Basic. The 10-point
            scale gives more room for differentiating teas in the 7–9 band
            where most decent loose-leaf sits; the 5-point scale is friendlier
            if you don&apos;t want to think about the difference between an
            8.4 and an 8.6.
          </p>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] m-0">
            We don&apos;t hand out 10s easily. A 9 means we&apos;d buy it
            again. A 7 means it did its job. A 5 means something interesting
            went wrong worth writing about.
          </p>
        </section>

        {/* CTAs */}
        <section className="mt-14 sm:mt-16 pt-8 border-t border-warm-200">
          <Eyebrow>Ready to read a review?</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-5 text-[28px] sm:text-hero-md">
            Three ways in.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Link
              href="/discover/teas"
              className="card-surface card-surface-hover p-5 no-underline block"
            >
              <Eyebrow>Browse</Eyebrow>
              <div className="font-display italic text-burgundy text-[22px] mt-1.5">
                The library
              </div>
              <p className="text-[12px] text-warm-700 leading-snug mt-2 m-0">
                Every tea, filterable by type, region, and flavor.
              </p>
            </Link>
            <Link
              href="/recommendations"
              className="card-surface card-surface-hover p-5 no-underline block"
            >
              <Eyebrow>Personalize</Eyebrow>
              <div className="font-display italic text-burgundy text-[22px] mt-1.5">
                Recommendations
              </div>
              <p className="text-[12px] text-warm-700 leading-snug mt-2 m-0">
                What we&apos;d brew next, given what you&apos;ve liked.
              </p>
            </Link>
            <Link
              href="/discover/teas"
              className="card-surface card-surface-hover p-5 no-underline block"
            >
              <Eyebrow>Members</Eyebrow>
              <div className="font-display italic text-burgundy text-[22px] mt-1.5">
                Log a session
              </div>
              <p className="text-[12px] text-warm-700 leading-snug mt-2 m-0">
                Pick a tea, rate it, build your own palate map.
              </p>
            </Link>
          </div>
        </section>
        <div className="h-16" />
      </Container>
    </main>
  );
}
