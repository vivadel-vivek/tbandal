import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getTeas,
  getTeaByVendorAndPath,
  getContributors,
  getVendorByName,
} from "@/lib/content";
import {
  getPreviewTeaByVendorAndPath,
  isCurrentUserStaff,
} from "@/lib/content-preview";
import { vendorSlugForTea } from "@/lib/tea-helpers";
import { compositeProfile, profileOverlap } from "@/lib/flavor";
import type { Tea } from "@/lib/types";
import { TeaDetailView } from "@/components/tea/TeaDetailView";
import { TeaHero } from "@/components/tea/TeaHero";
import { ProductReviewJsonLd } from "@/components/seo/JsonLd";
import { PreviewBanner } from "@/components/admin/PreviewBanner";
import { Container } from "@/components/ui/Container";

// Audit item #5: hero + tasting-paragraph (the LCP element) now
// render server-side, while interactive parts (review tabs, radar
// mode toggle, blind banners) stay in the TeaDetailView client
// component below. Cache freshness is handled at the Supabase
// fetcher layer (revalidate: 60), not by force-dynamic — this lets
// the route statically prerender from build with 60-second ISR.
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
  searchParams: { blind?: string; preview?: string };
}) {
  // Preview mode: ?preview=1 + staff session → fetch via SSR client
  // (RLS staff_all policy returns drafts). Anyone non-staff hitting
  // ?preview=1 just gets the published version.
  const wantsPreview = searchParams.preview === "1";
  const previewMode = wantsPreview && (await isCurrentUserStaff());
  const tea = previewMode
    ? await getPreviewTeaByVendorAndPath(params.vendor, params.slug)
    : await getTeaByVendorAndPath(params.vendor, params.slug);
  if (!tea) notFound();

  const [allTeas, contributors, vendor] = await Promise.all([
    getTeas(),
    getContributors(),
    getVendorByName(tea.vendor),
  ]);
  const similar = findSimilar(tea, allTeas);
  const blindMode = searchParams.blind === "1";
  const logHref = `/tea/${vendor?.slug ?? tea.vendor}/${tea.pathSlug}/log`;
  const vendorOutboundHref = vendor ? `/go/${vendor.slug}` : null;
  // Determine published status for banner — SSR fetch returns the row
  // including its `published` flag implicitly via teas_staff_all. We
  // detect "Draft" by re-fetching the public version and comparing:
  // if the public version exists, the row is published; otherwise
  // it's a draft. Cheap because the call is React.cache()d.
  const isPublishedDraft = previewMode
    ? Boolean(await getTeaByVendorAndPath(params.vendor, params.slug))
    : false;

  return (
    <>
      {previewMode && (
        <PreviewBanner
          editHref={`/admin/contributor/teas/${tea.slug}`}
          status={isPublishedDraft ? "Published" : "Draft"}
          subject={tea.name}
        />
      )}
      <ProductReviewJsonLd tea={tea} />
      <main>
        <Container>
          <Link
            href="/discover/teas"
            className="inline-flex items-center gap-1.5 text-warm-600 text-[13px] font-sans no-underline mt-6 mb-2"
          >
            ← Back to teas
          </Link>

          {/* Server-rendered hero. Contains the LCP tasting paragraph;
              ships in static HTML, hydrates on its own subtree only
              for the LibraryStatusToggle popover. */}
          <TeaHero
            tea={tea}
            variant="split"
            hideReviews={blindMode}
            logHref={logHref}
            vendorOutboundHref={vendorOutboundHref}
          />

          {/* Everything below the hero — blind banners, review tabs,
              radar, brewing card, vendor banner, similar teas — runs
              client-side. */}
          <TeaDetailView
            tea={tea}
            vendor={vendor ?? null}
            contributors={contributors}
            similar={similar}
            blindMode={blindMode}
          />
        </Container>
      </main>
    </>
  );
}
