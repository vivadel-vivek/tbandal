import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

// Landing page for password-recovery and invite-acceptance email links.
// Browser-side: the supabase-js client auto-detects the recovery token
// in either `?code=` (PKCE), `?token_hash=&type=recovery` (OTP), or the
// `#access_token=…&type=recovery` hash fragment (implicit flow), then
// fires a `PASSWORD_RECOVERY` auth event. ResetPasswordForm listens for
// that event before letting the user submit a new password.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Pick a new password to finish signing in.",
  alternates: { canonical: "/auth/reset" },
  robots: { index: false, follow: false },
};

export default function ResetPage() {
  return (
    <AuthCard
      eyebrow="Account · Set password"
      title="Pick a new password."
      intro="One last step. Choose something at least eight characters long — we'll sign you in once it's saved."
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
