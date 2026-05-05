import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TEAS, teaBySlug } from "@/lib/data";
import { FLAVOR_AXES } from "@/lib/flavor";
import type { Tea } from "@/lib/types";
import { TeaDetailView } from "@/components/tea/TeaDetailView";

export function generateStaticParams() {
  return TEAS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const tea = teaBySlug(params.slug);
  if (!tea) return { title: "Tea not found" };
  const desc = tea.summary.length > 155 ? tea.summary.slice(0, 152) + "…" : tea.summary;
  return {
    title: tea.name,
    description: desc,
    openGraph: {
      title: `${tea.name} · ${tea.region}`,
      description: desc,
    },
  };
}

// Composite-overlap similarity, ported from the prototype's tea-detail.
function compositeProfile(t: Tea): Record<string, number> {
  const out: Record<string, number> = {};
  for (const ax of FLAVOR_AXES) {
    const vals: number[] = [];
    if (t.reviews.vivek) vals.push(t.flavor.vivek[ax.key]);
    if (t.reviews.james) vals.push(t.flavor.james[ax.key]);
    vals.push(t.flavor.members[ax.key]);
    out[ax.key] = vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  return out;
}

function findSimilar(target: Tea, limit = 3) {
  const targetProfile = compositeProfile(target);
  return TEAS.filter((t) => t.slug !== target.slug)
    .map((t) => {
      const tProf = compositeProfile(t);
      let overlap = 0;
      let denom = 0;
      for (const ax of FLAVOR_AXES) {
        overlap += Math.min(targetProfile[ax.key], tProf[ax.key]);
        denom += Math.max(targetProfile[ax.key], tProf[ax.key]);
      }
      return { tea: t, score: denom ? overlap / denom : 0 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export default function TeaDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { blind?: string };
}) {
  const tea = teaBySlug(params.slug);
  if (!tea) notFound();

  const similar = findSimilar(tea);
  const blindMode = searchParams.blind === "1";
  return <TeaDetailView tea={tea} similar={similar} blindMode={blindMode} />;
}
