// Server component — header is static; filter sidebar + grid are a
// client island in <TeaBrowser>.

import Link from "next/link";
import type { Metadata } from "next";
import { getTeas, getVendors } from "@/lib/content";

export const revalidate = 3600;
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TeaBrowser } from "@/components/tea/TeaBrowser";
import { ItemListJsonLd, teaListItems } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Teas",
  description:
    "Every tea we've brewed — filtered by type, origin, vendor, and flavor. The full catalogue, with notes you can act on.",
  alternates: { canonical: "/discover/teas" },
};

export default async function TeasPage() {
  const [TEAS, VENDORS] = await Promise.all([getTeas(), getVendors()]);
  return (
    <main className="relative">
      <ItemListJsonLd
        name="Teas — Two Buds and a Leaf"
        description="The full library of single-origin teas reviewed across 12 flavor axes."
        items={teaListItems(TEAS)}
      />
      <Container>
        <Link href="/discover" className="back-link mt-8">
          ← Discover
        </Link>

        <div className="pt-3 pb-8">
          <Eyebrow>Discover · Teas</Eyebrow>
          <h1 className="font-display text-burgundy font-medium tracking-tight leading-hero mt-2 mb-4 text-hero-xl">
            <span className="italic">Every leaf,</span> recorded.
          </h1>
          <p className="max-w-[560px] text-warm-700 text-base mb-8">
            Every tea we&apos;ve brewed and written up — {TEAS.length} so far,
            with the brew recipe we used, where to buy it, and the occasional
            confession of a bad pour.
          </p>
        </div>

        <TeaBrowser teas={TEAS} vendors={VENDORS} />
      </Container>
      <div className="h-16" />
    </main>
  );
}
