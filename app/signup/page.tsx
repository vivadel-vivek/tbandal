import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/SignupForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/safe-next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a Two Buds and a Leaf account.",
  alternates: { canonical: "/signup" },
  robots: { index: false, follow: false },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const sp = await searchParams;
      redirect(safeNext(sp.next));
    }
  } catch (err) {
    if (!(err instanceof Error) || !err.message.includes("Missing Supabase env")) {
      throw err;
    }
    return (
      <AuthCard
        eyebrow="Member · Setup"
        title="Auth isn't wired up yet."
        intro="The Supabase env vars haven't been set in this environment. See SUPABASE.md for the local setup walkthrough."
      >
        <div className="text-[13px] text-warm-700">
          Once `.env.local` is filled in and the local stack is running,
          this page becomes the signup form.
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Member · Sign up"
      title="Create an account."
      intro="Free to start. A library, sessions, and recommendations follow you across devices."
    >
      <SignupForm />
    </AuthCard>
  );
}
