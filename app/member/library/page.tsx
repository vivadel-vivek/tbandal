import type { Metadata } from "next";
import { LibraryView } from "@/components/library/LibraryView";

// Member library — gates on /member which itself is noindex; this route
// inherits that posture. Force-dynamic so the client island reads fresh
// localStorage state on every visit (Phase B switches to a server fetch
// from Supabase with the user's row-level filtered library).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your library",
  description:
    "Teas and teaware you've added to your collection — wishlist, owned, tried, retired.",
  alternates: { canonical: "/member/library" },
  robots: { index: false, follow: false },
};

export default function MemberLibraryPage() {
  return <LibraryView />;
}
