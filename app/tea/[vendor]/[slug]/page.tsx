import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  TEAS,
  teaByVendorAndSlug,
  vendorSlugForTea,
} from "@/lib/data";
import { compositeProfile, profileOverlap } from "@/lib/flavor";
import type { Tea } from "@/lib/types";
import { TeaDetailView } from "@/components/tea/TeaDetailView";

// ISR: pre-render every (vendor, slug) pair at build, revalidate hourly,
// dynamicParams: true so newly-added teas ISR on first request.
export const revalidate = 3600;
export const dynamicParams = true;

type Params = { vendor: string; slug: string };

export function generateStaticParams(): Params[] {
  return TEAS.map((t) => ({
    vendor: vendorSlugForTea(t),
    slug: t.pathSlug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const tea = teaByVendorAndSlug(params.vendor, params.slug);
  if (!tea) return { title: "Tea not found" };
  const desc =
    tea.summary.length > 155 ? tea.summary.slice(0, 152) + "…" : tea.summary;
  return {
    title: tea.name,
    description: desc,
    openGraph: {
      title: `${tea.name} · ${tea.region}`,
      description: desc,
    },
  };
}

function findSimilar(target: Tea, limit = 3) {
  const targetProfile = compositeProfile(target);
  return TEAS.filter((t) => t.slug !== target.slug)
    .map((t) => ({
      tea: t,
      score: profileOverlap(targetProfile, compositeProfile(t)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export default function TeaDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: { blind?: string };
}) {
  const tea = teaByVendorAndSlug(params.vendor, params.slug);
  if (!tea) notFound();

  const similar = findSimilar(tea);
  const blindMode = searchParams.blind === "1";
  return <TeaDetailView tea={tea} similar={similar} blindMode={blindMode} />;
}
