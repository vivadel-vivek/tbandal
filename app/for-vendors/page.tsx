import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "For vendors",
  description:
    "Submit a tea for review, get featured in the atlas, and partner with Two Buds and a Leaf — vendor guidelines, sample policy, and how we rate.",
};

const REQUIREMENTS = [
  ["Single-origin or transparent blends", "We focus on teas with a real provenance — region, harvest, processor — and pass on lifestyle SKUs."],
  ["A real product page",                  "Public URL, ingredient list, harvest details. We won't review samples that aren't also sold."],
  ["No paid placement",                    "We never accept payment for reviews. Affiliate links are tagged sponsored; the editorial verdict isn't for sale."],
  ["You're OK with critical reviews",      "If we don't like a tea we'll say so — fairly. If that's a problem, we're not the right venue."],
];

const FAQ = [
  ["How do you handle samples?",            "Mail us 5–8 grams. If we publish a review you keep the sample; if we pass, we'll ship it back at our cost on request."],
  ["Turnaround?",                           "Two to six weeks from receipt. Pu'er and aged teas can run longer — we like multiple sessions before publishing."],
  ["Can I pay to be in the atlas?",         "No. Vendors in the atlas are ones we've bought from, brewed from, and would tell a friend about."],
  ["Do you take affiliate?",                "Yes — disclosed on every page that links out. We use a /go/[vendor] tracker so attribution is honest. We do not adjust ratings based on affiliate revenue."],
  ["What about exclusives or first-look?",  "Happy to honor an embargo on a public-launch date if it lines up with our publish schedule. We won't run reviews that hide negative findings."],
  ["Where do my outbound links go?",        "Through /go/[your-slug] with a UTM tag (utm_source=twobudsandaleaf). You can attribute traffic in your analytics under that source."],
];

export default function ForVendorsPage() {
  return (
    <main>
      <Container size="article">
        <div className="pt-12 pb-8">
          <Eyebrow>For vendors</Eyebrow>
          <h1 className="font-display text-burgundy font-medium tracking-tightest leading-tighter mt-3 mb-4 text-hero-2xl">
            <span className="italic">Submit a tea</span> for review.
          </h1>
          <p className="text-lg text-warm-700 leading-relaxed max-w-[640px] m-0">
            Two Buds and a Leaf is a two-person tea journal. We review what we
            buy and what gets sent to us — single-origin teas, transparent
            blends, and the small vendors who source them. Here&apos;s what we
            cover, what we ask of you, and how to pitch.
          </p>
        </div>

        <section className="grid grid-cols-2 gap-6 mb-10">
          <div className="card-surface p-7">
            <Eyebrow>What we cover</Eyebrow>
            <h2 className="font-display text-burgundy font-medium m-0 mt-2 mb-4 text-hero-sm">
              The kind of tea we review
            </h2>
            <ul className="list-none p-0 m-0 flex flex-col gap-3.5 text-sm text-warm-700 leading-relaxed">
              {REQUIREMENTS.map(([h, d]) => (
                <li key={h}>
                  <strong className="font-display text-burgundy text-base block mb-0.5">
                    {h}
                  </strong>
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div className="card-surface p-7">
            <Eyebrow>How to pitch</Eyebrow>
            <h2 className="font-display text-burgundy font-medium m-0 mt-2 mb-4 text-hero-sm">
              Send us a sample
            </h2>
            <p className="text-sm text-warm-700 leading-relaxed mb-4">
              Email{" "}
              <a
                href="mailto:hello@twobudsandaleaf.com?subject=Tea%20for%20review&body=Tea%3A%0AVendor%3A%0AHarvest%2Fyear%3A%0APublic%20product%20URL%3A%0ASample%20available%3F%0ANotes%3A%0A"
                className="underline text-burgundy"
              >
                hello@twobudsandaleaf.com
              </a>{" "}
              with the subject line &ldquo;Tea for review&rdquo; and the
              following — copy/paste this template so we can route faster:
            </p>
            <pre className="bg-cream rounded-md p-4 text-xs text-warm-700 font-mono leading-relaxed whitespace-pre-wrap m-0">
{`Tea:
Vendor:
Harvest / year:
Public product URL:
Sample available?
Notes:`}
            </pre>
            <p className="text-xs text-warm-600 mt-4 mb-4">
              We&apos;ll reply within a week with a yes / no / where-to-mail.
            </p>
            <a
              href="mailto:hello@twobudsandaleaf.com?subject=Tea%20for%20review"
              className="no-underline inline-block"
            >
              <Button variant="primary">Email hello@twobudsandaleaf.com →</Button>
            </a>
          </div>
        </section>

        <section className="card-surface p-7 mb-10">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="font-display text-burgundy font-medium m-0 mt-2 mb-5 text-hero-sm">
            Common vendor questions
          </h2>
          <dl className="grid grid-cols-1 gap-5">
            {FAQ.map(([q, a]) => (
              <div key={q}>
                <dt className="font-display text-burgundy text-base font-medium mb-1">
                  {q}
                </dt>
                <dd className="text-sm text-warm-700 leading-relaxed m-0">
                  {a}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="dashed-card p-7 mb-12 text-center">
          <Eyebrow>Methodology lives elsewhere</Eyebrow>
          <h3 className="font-display text-burgundy font-medium m-0 mt-2 mb-3 text-hero-sm">
            How we rate &amp; the editorial line
          </h3>
          <p className="text-sm text-warm-700 leading-relaxed max-w-[460px] mx-auto m-0 mb-5">
            Twelve flavor axes, two independent palates, a member-rating
            composite, and brewing parameters that match the cup we describe.
            Read the methodology before pitching.
          </p>
          <Link href="/about" className="no-underline">
            <Button variant="secondary">Read the methodology →</Button>
          </Link>
        </section>
      </Container>
    </main>
  );
}
