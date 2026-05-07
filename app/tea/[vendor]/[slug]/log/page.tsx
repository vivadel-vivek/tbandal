import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTeaByVendorAndPath, vesselTeaware } from "@/lib/content";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SessionLogEditor } from "@/components/session/SessionLogEditor";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

// Member-driven; never pre-render. Anonymous visitors get a join CTA
// in place of the editor — sessions are persisted server-side, so
// without an account the data has nowhere to land.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Log a session",
  description:
    "Record a tasting session — overall score, flavor radar, mouthfeel, and per-steep notes if you brewed gongfu.",
  robots: { index: false, follow: false },
};

type Params = { vendor: string; slug: string };

export default async function LogSessionPage({
  params,
}: {
  params: Params;
}) {
  const [tea, vessels, sb] = await Promise.all([
    getTeaByVendorAndPath(params.vendor, params.slug),
    vesselTeaware(),
    createSupabaseServerClient(),
  ]);
  if (!tea) notFound();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    const next = `/tea/${params.vendor}/${params.slug}/log`;
    return (
      <main>
        <Container size="article">
          <div className="pt-12 sm:pt-16 pb-10">
            <Link href={`/tea/${params.vendor}/${params.slug}`} className="back-link mb-3">
              ← {tea.name}
            </Link>
            <Eyebrow>Members only</Eyebrow>
            <h1 className="font-display italic text-burgundy text-[36px] sm:text-[52px] m-0 mt-2 mb-4 leading-tight">
              Join to log this session.
            </h1>
            <p className="text-warm-700 leading-relaxed mb-6 max-w-[540px]">
              Session logs live with your account so they can show up on your
              palate radar, refine your recommendations, and stay with you
              across devices. Free, takes 30 seconds.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/signup?next=${encodeURIComponent(next)}`}
                className="inline-flex items-center px-5 py-3 rounded-pill bg-burgundy text-cream font-sans text-[13px] font-bold no-underline"
              >
                Join free →
              </Link>
              <Link
                href={`/login?next=${encodeURIComponent(next)}`}
                className="inline-flex items-center px-5 py-3 rounded-pill border border-warm-300 text-forest font-sans text-[13px] font-bold no-underline"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main>
      <SessionLogEditor tea={tea} vessels={vessels} />
    </main>
  );
}
