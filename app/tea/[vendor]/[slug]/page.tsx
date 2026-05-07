import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getTeas,
  getTeaByVendorAndPath,
  getContributors,
  getVendorByName,
} from "@/lib/content";
import { vendorSlugForTea } from "@/lib/tea-helpers";
import { compositeProfile, profileOverlap } from "@/lib/flavor";
import type { Tea } from "@/lib/types";
import { TeaDetailView } from "@/components/tea/TeaDetailView";
import { ProductReviewJsonLd } from "@/components/seo/JsonLd";

// ISR: pre-render every (vendor, slug) pair at build, revalidate hourly,
// dynamicParams: true so newly-added teas ISR on first request.
export const revalidate = 3600;
export const dynamicParams = true;

type Params = { vendor: string; slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const teas = await getTeas();
  return teas.map((t) => ({
    vendor: vendorSlugForTea(t),
    slug: t.pathSlug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const tea = await getTeaByVendorAndPath(params.vendor, params.slug);
  if (!tea) return { title: "Tea not found" };
  const desc =
    tea.summary.length > 155 ? tea.summary.slice(0, 152) + "…" : tea.summary;
  const path = `/tea/${params.vendor}/${params.slug}`;
  return {
    title: tea.name,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      title: `${tea.name} · ${tea.region}`,
      description: desc,
      url: path,
      type: "article",
      // Per-route openGraph overrides the layout-level og:image; we
      // re-reference the convention route so the editorial card still
      // ships on tea pages (Lighthouse SEO + social previews).
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
  };
}

function findSimilar(target: Tea, allTeas: Tea[], limit = 3) {
  const targetProfile = compositeProfile(target);
  return allTeas.filter((t) => t.slug !== target.slug)
    .map((t) => ({
      tea: t,
      score: profileOverlap(targetProfile, compositeProfile(t)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export default async function TeaDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: { blind?: string };
}) {
  const tea = await getTeaByVendorAndPath(params.vendor, params.slug);
  if (!tea) notFound();

  const [allTeas, contributors, vendor] = await Promise.all([
    getTeas(),
    getContributors(),
    getVendorByName(tea.vendor),
  ]);
  const similar = findSimilar(tea, allTeas);
  const blindMode = searchParams.blind === "1";
  return (
    <>
      <ProductReviewJsonLd tea={tea} />
      <TeaDetailView
        tea={tea}
        vendor={vendor ?? null}
        contributors={contributors}
        similar={similar}
        blindMode={blindMode}
      />
    </>
  );
}
