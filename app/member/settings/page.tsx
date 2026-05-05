import type { Metadata } from "next";
import { MemberSettingsView } from "@/components/member/MemberSettingsView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
  description: "Identity, notifications, display options, and the teas you've revealed in blind mode.",
  robots: { index: false, follow: false },
};

export default function MemberSettingsPage() {
  return <MemberSettingsView />;
}
