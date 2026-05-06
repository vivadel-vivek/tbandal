// Server component — pure static atlas, generated from lib/data once.

import Link from "next/link";
import type { Metadata } from "next";
import {
  CONTINENT_ORDER,
  TEAS,
  VENDORS,
  groupVendorsByGeography,
  teaUrl,
} from "@/lib/data";

export const revalidate = 3600;
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StarRow } from "@/components/ui/StarRow";
import { ItemListJsonLd, vendorListItems } from "@/components/seo/JsonLd";
import type { Vendor } from "@/lib/types";

export const metadata: Metadata = {
  title: "Vendors",
  description:
    "An atlas of tea vendors we trust — grouped by continent and country, with their specialties and the teas of theirs we've reviewed.",
};

const grouped = groupVendorsByGeography();
const continentRank = (c: string) =>
  (CONTINENT_ORDER as readonly string[]).indexOf(c);
const continents = Object.keys(grouped).sort(
  (a, b) => continentRank(a) - continentRank(b),
);

export default function VendorsAtlas() {

  return (
    <main>
      <ItemListJsonLd
        name="Tea Vendors — Two Buds and a Leaf"
        description="An atlas of tea vendors we trust, grouped by continent and country."
        items={vendorListItems(VENDORS)}
      />
      <Container>
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-warm-600 text-[13px] font-sans no-underline mt-8 mb-2"
        >
          ← Discover
        </Link>

        <div className="pt-2 pb-6 sm:pb-8">
          <Eyebrow>Discover · Vendors</Eyebrow>
          <h1 className="font-display text-burgundy font-medium tracking-tight leading-[1.05] mt-2 mb-4 text-[40px] sm:text-[64px]">
            <span className="italic">An atlas of shops</span> we trust.
          </h1>
          <p className="text-base text-warm-700 leading-relaxed max-w-[640px] m-0">
            Vendors grouped by continent and country, with the teas of theirs
            we&apos;ve reviewed. Outbound links are tracked through our
            affiliate redirect; we only list shops we&apos;d recommend.
          </p>
        </div>

        {/* Sticky continent index */}
        <div className="sticky top-[68px] sm:top-[84px] z-[5] bg-[var(--bg)] pt-2 pb-3 mb-4 border-b border-warm-200 flex gap-2 flex-wrap overflow-x-auto">
          {continents.map((c) => (
            <a
              key={c}
              href={`#cont-${c.replace(/\s+/g, "-")}`}
              className="px-3 py-1 rounded-pill border border-warm-300 text-[11px] font-bold text-forest tracking-wide uppercase no-underline"
            >
              {c}
            </a>
          ))}
        </div>

        {continents.map((cont) => {
          const byCountry = grouped[cont] ?? {};
          const countries = Object.keys(byCountry).sort();
          const total = countries.reduce(
            (n, c) => n + (byCountry[c]?.length ?? 0),
            0,
          );
          return (
            <section
              key={cont}
              id={`cont-${cont.replace(/\s+/g, "-")}`}
              className="pt-8 pb-4"
            >
              <div className="flex items-baseline gap-3 sm:gap-4 mb-5 sm:mb-6 pb-3 sm:pb-3.5 border-b-2 border-burgundy-muted flex-wrap">
                <h2 className="font-display italic text-burgundy font-medium tracking-tight m-0 text-[32px] sm:text-[44px]">
                  {cont}
                </h2>
                <span className="text-[11px] text-warm-600 tracking-widest uppercase font-bold">
                  {total} vendor{total === 1 ? "" : "s"}
                </span>
              </div>

              {countries.map((country) => (
                <div key={country} className="mb-8 sm:mb-9">
                  <Eyebrow>{country}</Eyebrow>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-3 sm:mt-3.5">
                    {(byCountry[country] ?? []).map((v) => (
                      <VendorCard key={v.slug} vendor={v} />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          );
        })}

        <div className="bg-cream rounded-xl border border-dashed border-warm-300 px-6 py-5 mt-6 mb-8 text-xs text-warm-600 leading-relaxed">
          <strong className="text-forest">Affiliate disclosure:</strong>{" "}
          outbound links to vendors are tracked through our /go/ redirect
          system. We earn a small commission on referrals; this never
          influences which vendors appear in the atlas.
        </div>
      </Container>
    </main>
  );
}

function VendorCard({ vendor: v }: { vendor: Vendor }) {
  const teas = TEAS.filter((t) => t.vendor === v.name);
  return (
    <article
      className="group bg-[var(--bg-elevated)] rounded-xl border border-warm-200 shadow-card p-5 transition-all duration-200 ease-smooth hover:shadow-elevated hover:-translate-y-0.5 flex flex-col gap-4"
    >
      <div className="flex gap-3.5 items-center">
        <div
          className="w-16 h-16 rounded-md shrink-0 flex items-center justify-center font-display italic text-cream font-medium text-[30px]"
          style={{ background: v.swatch }}
          aria-hidden
        >
          {v.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-burgundy font-medium tracking-tight m-0 mb-1 text-2xl">
            {v.name}
          </h3>
          <Eyebrow color="var(--warm-600, #6B6560)">
            {v.city} · est. {v.founded}
          </Eyebrow>
        </div>
        <div className="shrink-0">
          <StarRow value={v.rating} />
        </div>
      </div>
      <p className="text-[13px] text-warm-700 leading-relaxed m-0">
        {v.tagline}
      </p>
      {v.specialties && v.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {v.specialties.map((s) => (
            <span
              key={s}
              className="px-2.5 py-0.5 rounded-pill bg-warm-200 text-warm-700 text-[10px] font-bold tracking-wide uppercase"
            >
              {s}
            </span>
          ))}
        </div>
      )}
      <div className="flex justify-between items-center pt-3 border-t border-warm-200">
        <span className="text-[11px] text-warm-600 tracking-wide font-bold">
          {teas.length} reviewed · {v.teaCount} catalogued
        </span>
        <Link
          href={`/discover/vendors/${v.slug}`}
          className="text-xs font-bold text-burgundy no-underline"
        >
          Open profile →
        </Link>
      </div>
      {teas.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {teas.slice(0, 4).map((t) => (
            <Link
              key={t.slug}
              href={teaUrl(t)}
              className="px-2.5 py-1 rounded-pill text-[11px] font-semibold text-forest font-sans no-underline"
              style={{
                border: `1px solid ${t.swatch}66`,
                background: t.swatch + "1a",
              }}
            >
              {t.name}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
