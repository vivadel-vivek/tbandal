import type { Metadata } from "next";
import { MemberProfileView } from "@/components/member/MemberProfileView";
import { getContributors, getTeas } from "@/lib/content";

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
  return <MemberProfileView teas={teas} contributors={contributors} />;
}
