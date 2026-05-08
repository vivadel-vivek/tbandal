import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTeas, getTeaware, getTeawareBySlug, getVendorByName } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { StarRow } from "@/components/ui/StarRow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TeaCard } from "@/components/tea/TeaCard";
import { LibraryStatusToggle } from "@/components/library/LibraryStatusToggle";

// ISR: pre-render all teaware at build, revalidate hourly,
// dynamicParams: true so newly-listed items render on first hit.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const TEAWARE = await getTeaware();
  return TEAWARE.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const t = await getTeawareBySlug(params.slug);
  if (!t) return { title: "Teaware not found" };
  const path = `/discover/teaware/${params.slug}`;
  return {
    title: t.name,
    description: t.tagline,
    alternates: { canonical: path },
    openGraph: {
      title: t.name,
      description: t.tagline,
      url: path,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
  };
}

export default async function TeawareDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const item = await getTeawareBySlug(params.slug);
  if (!item) notFound();

  const [internalVendor, allTeas] = await Promise.all([
    getVendorByName(item.vendor),
    getTeas(),
  ]);
  // Pair this item with reviewed teas it actually fits — narrow by the
  // intersection of TeaTypeName so the suggestion list stays honest.
  const matchingTeas = allTeas.filter((tea) =>
    item.goodFor.includes(tea.type),
  ).slice(0, 6);

  return (
    <main>
      <Container>
        <Link
          href="/discover/teaware"
          className="inline-flex items-center gap-1.5 text-warm-600 text-[13px] font-sans no-underline mt-8 mb-4"
        >
          ← All teaware
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-8 sm:gap-12 items-start">
          <div>
            <Eyebrow>
              {item.category}
              {item.origin && <span> · {item.origin}</span>}
            </Eyebrow>
            <h1 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-3 text-[36px] sm:text-[56px] leading-[1.05]">
              {item.name}
            </h1>
            <div className="flex items-center gap-3 mb-5">
              <StarRow value={item.rating} />
              <span className="text-[12px] text-warm-600 font-bold tracking-wide">
                ${item.price.toFixed(0)} · {item.vendor}
              </span>
            </div>
            <p className="text-lg text-warm-700 leading-relaxed mb-4">
              {item.tagline}
            </p>
            <div className="text-[15px] text-warm-700 leading-relaxed mb-4 [&>p]:mb-4 last:[&>p]:mb-0">
              {renderMarkdown(item.body)}
            </div>

            <div className="flex gap-3 mt-6 flex-wrap items-center">
              <a
                href={`/go/teaware/${item.slug}`}
                target="_blank"
                rel="noopener nofollow sponsored"
                className="inline-flex no-underline"
              >
                <Button variant="primary">
                  Buy from {item.vendor} ↗
                </Button>
              </a>
              <LibraryStatusToggle kind="teaware" slug={item.slug} size="md" />
              {internalVendor && (
                <Link
                  href={`/discover/vendors/${internalVendor.slug}`}
                  className="inline-flex no-underline"
                >
                  <Button variant="secondary">Vendor profile</Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-warm-200">
              <Detail k="Material" v={item.material} />
              {item.volumeMl && <Detail k="Capacity" v={`${item.volumeMl}ml`} />}
              {item.origin && <Detail k="Origin" v={item.origin} />}
              <Detail k="Sold by" v={item.vendor} />
              <Detail k="Price" v={`$${item.price.toFixed(0)}`} />
              <Detail k="Our rating" v={`${item.rating}/5`} />
            </div>

            <div className="mt-6 pt-5 border-t border-warm-200">
              <Eyebrow color="var(--warm-600, #6B6560)">Good for</Eyebrow>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {item.goodFor.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-0.5 rounded-pill bg-warm-200 text-warm-700 text-[11px] font-bold tracking-wide uppercase"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl shadow-elevated relative overflow-hidden flex items-center justify-center"
            style={{ aspectRatio: "1/1", background: item.gradient }}
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
              aria-hidden
              className="relative font-display italic font-medium"
              style={{
                fontSize: 96,
                color: "rgba(250,247,242,0.92)",
                textShadow: "0 4px 24px rgba(0,0,0,0.18)",
              }}
            >
              {item.category}
            </span>
            {item.volumeMl && (
              <span
                className="absolute bottom-4 right-4 px-3 py-1 rounded-pill text-[12px] font-bold font-mono"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  color: "var(--cream, #FAF7F2)",
                }}
              >
                {item.volumeMl}ml
              </span>
            )}
          </div>
        </div>

        {matchingTeas.length > 0 && (
          <div className="mt-12 sm:mt-14">
            <SectionHeader
              eyebrow="Pairs well with"
              title="Teas we'd brew in this vessel"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {matchingTeas.map((t) => (
                <TeaCard key={t.slug} tea={t} />
              ))}
            </div>
          </div>
        )}

        <div className="bg-cream rounded-xl border border-dashed border-warm-300 px-6 py-5 mt-10 mb-8 text-xs text-warm-600 leading-relaxed">
          <strong className="text-forest">Affiliate disclosure:</strong>{" "}
          purchase links go through our /go/teaware/ redirect. We earn a small
          commission; this never influences which items appear here.
        </div>
      </Container>
    </main>
  );
}

function Detail({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] tracking-widest uppercase text-warm-600 font-bold">
        {k}
      </div>
      <div className="text-[15px] text-forest mt-1 font-display">{v}</div>
    </div>
  );
}
