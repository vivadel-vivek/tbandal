import Link from "next/link";
import type { Metadata } from "next";
import { CONTRIBUTORS } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { TeaStain } from "@/components/ui/TeaStain";
import { Stat } from "@/components/ui/Stat";
import { AvatarChip } from "@/components/ui/AvatarChip";

// Pure editorial copy — refresh weekly so contributor stats can update
// without a deploy when Phase 6 wires real session counts in.
export const revalidate = 604800;

export const metadata: Metadata = {
  title: "About",
  description:
    "Two friends, a lot of teaware, and stubborn opinions. The story behind Two Buds and a Leaf and how we rate every tea.",
};

export default function AboutPage() {
  return (
    <main>
      <Container size="article">
        <div className="relative pt-14 pb-6">
          <TeaStain
            size={300}
            color="#8B9A7D"
            opacity={0.18}
            className="absolute top-5 -right-16 pointer-events-none"
          />
          <Eyebrow>About</Eyebrow>
          <h1 className="font-display text-burgundy font-medium tracking-tightest leading-tighter mt-3 mb-6 text-[72px]">
            <span className="italic">Two friends,</span>
            <br /> a lot of teaware,
            <br /> and stubborn opinions.
          </h1>
          <p className="text-lg text-warm-700 leading-relaxed max-w-[620px] mb-6">
            We started this site because we kept losing our notes. A shared
            spreadsheet became a database, the database wanted a frontend,
            and somewhere along the way it became a public record of two
            people learning how to drink tea more carefully.
          </p>
          <p className="text-base text-warm-700 leading-relaxed max-w-[620px] m-0">
            Every review here came from a real session, with real water, in
            real teaware we own. Brewing parameters are recorded so the cup
            we describe is the cup you can make.
          </p>
        </div>

        <section className="grid grid-cols-2 gap-6 mt-12">
          {[CONTRIBUTORS.vivek, CONTRIBUTORS.james].map((c) => (
            <article key={c.key} className="card-surface p-8">
              <div className="flex items-center gap-4 mb-4">
                <AvatarChip who={c.key} size={72} />
                <div>
                  <h3 className="font-display italic text-burgundy font-medium m-0 text-hero-md">
                    {c.name}
                  </h3>
                  <Eyebrow color="var(--warm-500, #857F79)">{c.palate}</Eyebrow>
                </div>
              </div>
              <p className="text-sm text-warm-700 leading-relaxed m-0 mb-4">
                {c.bio}
              </p>
              <p className="text-sm text-warm-700 leading-relaxed m-0">
                {c.key === "vivek"
                  ? "Drinks shen pu'er every morning. Has opinions about water TDS that are stronger than anyone needs them to be."
                  : "Comes to tea from coffee. Believes that the ritual matters at least as much as the cup."}
              </p>
              <div className="mt-5 pt-4 border-t border-warm-200 flex gap-5">
                <Stat n={c.key === "vivek" ? 94 : 87} label="Teas reviewed" />
                <Stat n={c.key === "vivek" ? 226 : 198} label="Sessions logged" />
              </div>
            </article>
          ))}
        </section>

        <section className="mt-16 py-10 border-t border-warm-200">
          <Eyebrow>How we rate</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-5 text-hero-lg">
            Twelve axes, two palates, one composite.
          </h2>
          <p className="text-base text-warm-700 leading-relaxed max-w-[680px] mb-6">
            Each tea gets a flavor profile across twelve axes — floral,
            fruity, sweet, honey, nutty, roasted, woody, earthy, mineral,
            marine, vegetal, spicy. Both of us rate independently, then
            members add their own. The result is a composite radar
            that&apos;s more honest than any single palate could be. New to
            this? Switch any radar to <strong>Basic</strong> and you&apos;ll
            see the same data on six lay-language axes (Floral, Sweet,
            Roasted, Earthy, Mineral, Herbal) on a 5-point scale.
          </p>
          <Link href="/discover/teas">
            <Button variant="primary">Start exploring →</Button>
          </Link>
        </section>

        <section
          id="methodology"
          className="mt-12 py-8 border-t border-warm-200 scroll-mt-24"
        >
          <Eyebrow>Methodology</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-5 text-hero-md">
            What goes into a review.
          </h2>
          <ul className="list-none p-0 m-0 grid grid-cols-2 gap-x-8 gap-y-4 text-[15px] text-warm-700 leading-relaxed">
            {[
              ["Real teaware", "Every review is from a session in a gaiwan, yixing, kyusu, or glass we actually own."],
              ["Real water", "Filtered, ~60 TDS unless noted. The brewing card on each tea spells out which."],
              ["Brewed twice", "Each contributor brews independently, then we compare notes — that's what gets published."],
              ["No paid placements", "Affiliate links are tagged and disclosed; they never decide what we cover."],
              ["Member ratings", "Once you've rated a tea, your numbers feed the composite — but never the editorial copy."],
              ["Errors fixed", "Tea facts wrong? Email us; we'll correct in the next pass."],
            ].map(([h, d]) => (
              <li key={h}>
                <strong className="font-display text-burgundy text-base block mb-1">
                  {h}
                </strong>
                {d}
              </li>
            ))}
          </ul>
        </section>

        <section
          id="affiliate-disclosure"
          className="mt-2 py-8 border-t border-warm-200 scroll-mt-24"
        >
          <Eyebrow>Affiliate disclosure</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-5 text-hero-sm">
            How we get paid (and how we don&apos;t).
          </h2>
          <div className="text-[15px] text-warm-700 leading-relaxed grid grid-cols-1 gap-3 max-w-[640px]">
            <p className="m-0">
              When you click &ldquo;Visit shop&rdquo; on a vendor or tea page,
              you go through <code className="font-mono text-sm">/go/[vendor]</code>{" "}
              with a{" "}
              <code className="font-mono text-sm">utm_source=twobudsandaleaf</code>{" "}
              tag attached. If you buy on the other side, the vendor may pay
              us a small referral commission. That commission funds nothing
              but more tea to review — it does not influence our ratings, our
              decision to cover a tea, or the editorial verdict.
            </p>
            <p className="m-0">
              <strong className="text-forest">No paid placements.</strong> We
              never accept payment for reviews. Vendors can pitch teas at{" "}
              <Link href="/for-vendors" className="text-burgundy underline">
                /for-vendors
              </Link>
              ; we accept or decline on editorial grounds.
            </p>
            <p className="m-0">
              <strong className="text-forest">Conflicts of interest.</strong>{" "}
              Tea is a small world. If either of us has a personal
              relationship with a vendor (a friend runs the shop, we&apos;ve
              been hosted by them, etc.) we&apos;ll say so explicitly in the
              review. If we ever review a tea we received as a gift outside
              the formal sample-pitch path, that gets flagged on the page.
            </p>
            <p className="m-0">
              <strong className="text-forest">Errors and corrections.</strong>{" "}
              Spotted a factual error or unclear disclosure? Email{" "}
              <a
                href="mailto:hello@twobudsandaleaf.com?subject=Correction"
                className="text-burgundy underline"
              >
                hello@twobudsandaleaf.com
              </a>{" "}
              and we&apos;ll correct it in the next pass.
            </p>
          </div>
        </section>
        <div className="h-16" />
      </Container>
    </main>
  );
}
