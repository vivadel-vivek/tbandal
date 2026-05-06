import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordForm } from "@/components/auth/PasswordForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Change password",
  description: "Update your account password.",
  alternates: { canonical: "/account/password" },
  robots: { index: false, follow: false },
};

export default async function PasswordPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/password");

  return (
    <AuthCard
      eyebrow="Member · Password"
      title="Change password."
      intro="Pick something at least eight characters long. The session on this device stays active."
    >
      <PasswordForm />
      <div className="mt-6 pt-6 border-t border-warm-200">
        <Link
          href="/account"
          className="text-[12px] font-bold text-burgundy no-underline"
        >
          ← Back to account
        </Link>
      </div>
    </AuthCard>
  );
}
