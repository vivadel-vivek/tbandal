import type { Metadata } from "next";
import { MemberSettingsView } from "@/components/member/MemberSettingsView";
import { getTeas } from "@/lib/content";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
  description: "Identity, notifications, display options, and the teas you've revealed in blind mode.",
  robots: { index: false, follow: false },
};

export default async function MemberSettingsPage() {
  // Load avatar_url server-side so the settings page can show the
  // current photo without a roundtrip on hydration. Fall back to null
  // for guests (the uploader hides itself in that case anyway).
  let avatarUrl: string | null = null;
  try {
    const sb = await createSupabaseServerClient();
    const { data: auth } = await sb.auth.getUser();
    if (auth.user) {
      const { data } = await sb
        .from("profiles")
        .select("avatar_url")
        .eq("id", auth.user.id)
        .maybeSingle();
      avatarUrl = data?.avatar_url ?? null;
    }
  } catch {
    /* env not wired in dev — render without an avatar */
  }
  const teas = await getTeas();
  return <MemberSettingsView teas={teas} avatarUrl={avatarUrl} />;
}
