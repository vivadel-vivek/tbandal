// Server component — pure static teaware directory, generated from lib/data.

import Link from "next/link";
import type { Metadata } from "next";
import { getTeaware, groupTeawareByCategory } from "@/lib/content";
import { TEAWARE_CATEGORY_ORDER } from "@/lib/tea-helpers";
import type { Teaware } from "@/lib/types";

import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StarRow } from "@/components/ui/StarRow";
import { ItemListJsonLd, teawareListItems } from "@/components/seo/JsonLd";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Teaware",
  description:
    "Vessels, kettles, and the small instruments that actually change how the cup tastes — every item here is something one of us uses every week.",
  alternates: { canonical: "/discover/teaware" },
};

export default async function TeawareDirectory() {
  const [TEAWARE, grouped] = await Promise.all([
    getTeaware(), groupTeawareByCategory(),
  ]);
  const total = TEAWARE.length;
  const categoryRank = (c: string) =>
    (TEAWARE_CATEGORY_ORDER as readonly string[]).indexOf(c);
  const categories = Object.keys(grouped).sort(
    (a, b) => categoryRank(a) - categoryRank(b),
  );

  return (
    <main>
      <ItemListJsonLd
        name="Teaware — Two Buds and a Leaf"
        description="Vessels, kettles, and instruments we use to brew tea every week."
        items={teawareListItems(TEAWARE)}
      />
      <Container>
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-warm-600 text-[13px] font-sans no-underline mt-8 mb-2"
        >
          ← Discover
        </Link>

        <div className="pt-2 pb-6 sm:pb-8">
          <Eyebrow>Discover · Teaware</Eyebrow>
          <h1 className="font-display text-burgundy font-medium tracking-tight leading-[1.05] mt-2 mb-4 text-[40px] sm:text-[64px]">
            <span className="italic">The instruments,</span> not the gadgets.
          </h1>
          <p className="text-base text-warm-700 leading-relaxed max-w-[640px] m-0">
            A short, opinionated list of vessels, kettles, and tools we use
            every week. Outbound links are tracked through our affiliate
            redirect; we only list items we&apos;d actually replace if one
            broke.
          </p>
        </div>

        {/* Sticky category index */}
        <div className="sticky top-[68px] sm:top-[84px] z-[5] bg-[var(--bg)] pt-2 pb-3 mb-4 border-b border-warm-200 flex gap-2 flex-wrap overflow-x-auto">
          {categories.map((c) => (
            <a
              key={c}
              href={`#cat-${c}`}
              className="px-3 py-1 rounded-pill border border-warm-300 text-[11px] font-bold text-forest tracking-wide uppercase no-underline"
            >
              {c}
            </a>
          ))}
        </div>

        {categories.map((cat) => {
          const items = grouped[cat] ?? [];
          return (
            <section key={cat} id={`cat-${cat}`} className="pt-8 pb-4">
              <div className="flex items-baseline gap-3 sm:gap-4 mb-5 sm:mb-6 pb-3 sm:pb-3.5 border-b-2 border-burgundy-muted flex-wrap">
                <h2 className="font-display italic text-burgundy font-medium tracking-tight m-0 text-[32px] sm:text-[44px]">
                  {cat}
                </h2>
                <span className="text-[11px] text-warm-600 tracking-widest uppercase font-bold">
                  {items.length} item{items.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {items.map((t) => (
                  <TeawareCard key={t.slug} item={t} />
                ))}
              </div>
            </section>
          );
        })}

        <div className="bg-cream rounded-xl border border-dashed border-warm-300 px-6 py-5 mt-6 mb-8 text-xs text-warm-600 leading-relaxed">
          <strong className="text-forest">Affiliate disclosure:</strong>{" "}
          {total} items listed. Outbound links go through our /go/teaware/
          redirect; we earn a small commission on referrals, which never
          influences what appears here.
        </div>
      </Container>
    </main>
  );
}

function TeawareCard({ item: t }: { item: Teaware }) {
  return (
    <article className="group bg-[var(--bg-elevated)] rounded-xl border border-warm-200 shadow-card overflow-hidden flex flex-col transition-all duration-200 ease-smooth hover:shadow-elevated hover:-translate-y-0.5">
      <div
        className="relative flex items-center justify-center"
        style={{ aspectRatio: "5/3", background: t.gradient }}
      >
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.22) 100%)",
          }}
        />
        <span
          className="absolute top-3 left-3 px-2.5 py-0.5 rounded-pill text-[10px] font-bold tracking-widest uppercase"
          style={{
            background: "rgba(250,247,242,0.94)",
            color: "var(--forest, #2D3A2E)",
          }}
        >
          {t.category}
        </span>
        {t.volumeMl && (
          <span
            className="absolute top-3 right-3 px-2.5 py-0.5 rounded-pill text-[11px] font-bold font-mono"
            style={{
              background: "rgba(0,0,0,0.35)",
              color: "var(--cream, #FAF7F2)",
            }}
          >
            {t.volumeMl}ml
          </span>
        )}
      </div>
      <div className="px-5 pt-4 pb-5 flex-1 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-3">
          <h3 className="font-display text-burgundy font-medium tracking-tight m-0 text-[22px] leading-tight flex-1 min-w-0">
            {t.name}
          </h3>
          <div className="shrink-0">
            <StarRow value={t.rating} />
          </div>
        </div>
        <Eyebrow color="var(--warm-600, #6B6560)">
          {t.material}
          {t.origin && <span> · {t.origin}</span>}
        </Eyebrow>
        <p className="text-[13px] text-warm-700 leading-relaxed m-0">
          {t.tagline}
        </p>
        <div className="flex justify-between items-center pt-3 mt-auto border-t border-warm-200">
          <span className="text-[15px] font-display text-forest">
            ${t.price.toFixed(0)}
            <span className="text-[11px] text-warm-600 ml-1">
              · {t.vendor}
            </span>
          </span>
          <Link
            href={`/discover/teaware/${t.slug}`}
            className="text-xs font-bold text-burgundy no-underline"
          >
            Open →
          </Link>
        </div>
      </div>
    </article>
  );
}
