// Public shared-session page. RLS gates the read on share_enabled +
// share_token presence; this route just translates the URL token into
// a query and renders a focused view of the rating.

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { getTeaBySlug } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RatingScore } from "@/components/ui/RatingScore";
import { Glossarized } from "@/components/glossary/Glossarized";
import type { Database } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shared session",
  // Search engines should index the share page itself but not crawl
  // it as canonical for any tea route.
  robots: { index: false, follow: true },
};

type Params = { token: string };

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];
type UserTeaRow = Database["public"]["Tables"]["user_teas"]["Row"];

function anonSb() {
  const { url, anon } = getSupabasePublicEnv();
  return createClient<Database>(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default async function SharedSessionPage({ params }: { params: Params }) {
  const sb = anonSb();
  const { data: session } = await sb
    .from("sessions")
    .select("*, user_tea:user_teas(*)")
    .eq("share_token", params.token)
    .eq("share_enabled", true)
    .maybeSingle<SessionRow & { user_tea: UserTeaRow | null }>();

  if (!session) notFound();
  const tea = session.user_tea?.tea_slug
    ? await getTeaBySlug(session.user_tea.tea_slug)
    : null;

  // Pull a readable name even for off-catalog teas.
  const teaName = tea?.name ?? session.user_tea?.custom_name ?? "Untitled tea";
  const vendorName = tea?.vendor ?? session.user_tea?.custom_vendor ?? "";
  const year = tea?.year ?? session.user_tea?.custom_year ?? "";

  return (
    <main>
      <Container size="article">
        <div className="pt-10 sm:pt-12 pb-8">
          <Eyebrow>Shared session</Eyebrow>
          <h1 className="font-display italic text-burgundy text-[36px] sm:text-[52px] m-0 mt-2 mb-1 leading-tight">
            {teaName}
          </h1>
          {(vendorName || year) && (
            <div className="text-warm-700 mt-1">
              {[vendorName, year].filter(Boolean).join(" · ")}
            </div>
          )}

          <div className="mt-6 flex items-center gap-4 flex-wrap">
            {session.rating !== null && (
              <RatingScore
                value={session.scale === "basic" ? Number(session.rating) / 2 : Number(session.rating)}
                max={session.scale === "basic" ? 5 : 10}
                big
              />
            )}
            <div className="text-[12px] text-warm-600">
              <div>Brewed{" "}
                <time dateTime={session.brewed_at}>
                  {new Date(session.brewed_at).toLocaleDateString(undefined, {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </time>
              </div>
              <div>{session.mode === "per-steep" ? "Per-steep mode" : "Quick log"}</div>
            </div>
          </div>

          {session.body && (
            <p
              className="font-serif italic text-forest leading-relaxed mt-6 mb-6 pl-4 text-[18px]"
              style={{ borderLeft: "2px solid var(--gold, #C4A35A)" }}
            >
              &ldquo;<Glossarized>{session.body}</Glossarized>&rdquo;
            </p>
          )}

          {/* Brewing meta strip — only shown when the rater filled it in. */}
          {(session.vessel || session.water || session.leaf_g || session.water_ml) && (
            <div className="bg-cream px-4 py-3 rounded-md text-xs text-warm-700 font-mono break-words">
              <div className="text-[10px] tracking-widest uppercase text-warm-600 mb-1 font-sans font-bold">
                Brewing
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {session.leaf_g && session.water_ml && (
                  <span>{session.leaf_g}g / {session.water_ml}ml</span>
                )}
                {session.vessel && <span>{session.vessel}</span>}
                {session.water && <span>{session.water}</span>}
                {session.brew_style_override && (
                  <span className="text-burgundy">brewed {session.brew_style_override}</span>
                )}
              </div>
            </div>
          )}

          {tea && (
            <div className="mt-8 pt-6 border-t border-warm-200 text-[13px] text-warm-700">
              Read the full review and brew it yourself at{" "}
              <Link
                href={`/tea/${tea.vendorSlug}/${tea.pathSlug}`}
                className="text-burgundy font-bold no-underline"
              >
                /tea/{tea.vendorSlug}/{tea.pathSlug} →
              </Link>
            </div>
          )}

          <div className="mt-10 text-[11px] text-warm-600 italic">
            Shared via Two Buds and a Leaf · the rater can revoke this link
            at any time.
          </div>
        </div>
      </Container>
    </main>
  );
}
