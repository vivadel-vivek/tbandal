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
  // Server-load profile fields the settings view needs upfront:
  // current avatar (for the picker preview) and policy acceptance
  // dates/versions (for the consent audit panel). Falls back to nulls
  // for guests / unconfigured envs so the page still renders.
  let avatarUrl: string | null = null;
  let consent: {
    privacyVersion: string | null;
    privacyAcceptedAt: string | null;
    termsVersion: string | null;
    termsAcceptedAt: string | null;
  } = {
    privacyVersion: null,
    privacyAcceptedAt: null,
    termsVersion: null,
    termsAcceptedAt: null,
  };
  try {
    const sb = await createSupabaseServerClient();
    const { data: auth } = await sb.auth.getUser();
    if (auth.user) {
      const { data } = await sb
        .from("profiles")
        .select("avatar_url, privacy_version, privacy_accepted_at, terms_version, terms_accepted_at")
        .eq("id", auth.user.id)
        .maybeSingle();
      avatarUrl = data?.avatar_url ?? null;
      consent = {
        privacyVersion:    data?.privacy_version ?? null,
        privacyAcceptedAt: data?.privacy_accepted_at ?? null,
        termsVersion:      data?.terms_version ?? null,
        termsAcceptedAt:   data?.terms_accepted_at ?? null,
      };
    }
  } catch {
    /* env not wired in dev — render without an avatar */
  }
  const teas = await getTeas();
  return <MemberSettingsView teas={teas} avatarUrl={avatarUrl} consent={consent} />;
}
