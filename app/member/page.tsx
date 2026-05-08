import type { Metadata } from "next";
import { MemberProfileView } from "@/components/member/MemberProfileView";
import { getContributors, getTeas } from "@/lib/content";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Member profile reads context-backed state — never pre-render.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your profile",
  description:
    "Your palate map, alignment, and ratings — refines the recommendations we send your way.",
  robots: { index: false, follow: false },
};

export default async function MemberPage() {
  const [teas, contributors] = await Promise.all([
    getTeas(), getContributors(),
  ]);
  // Look up the role server-side so the profile header can show the
  // editor/admin link without hitting Supabase from the client.
  let role: string | null = null;
  try {
    const sb = await createSupabaseServerClient();
    const { data: auth } = await sb.auth.getUser();
    if (auth.user) {
      const { data } = await sb
        .from("profiles")
        .select("role")
        .eq("id", auth.user.id)
        .maybeSingle();
      role = data?.role ?? null;
    }
  } catch {
    /* env not wired in dev — render without the admin shortcut */
  }
  return (
    <MemberProfileView teas={teas} contributors={contributors} role={role} />
  );
}
