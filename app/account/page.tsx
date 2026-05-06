import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { AccountForm } from "@/components/auth/AccountForm";
import { Button } from "@/components/ui/Button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account",
  description: "Profile, password, and account preferences.",
  alternates: { canonical: "/account" },
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  // Cast through the row type explicitly — until `supabase gen types`
  // produces the runtime-precise schema, the SDK's column-string
  // overloads can't narrow against our hand-written placeholder. The
  // RLS policy makes sure we only read our own row.
  type ProfileSlice = {
    email: string | null;
    display_name: string | null;
    contributor_handle: string | null;
    role: import("@/lib/supabase/types").UserRole;
    aligned: "vivek" | "james";
  };
  const { data: rawProfile } = await supabase
    .from("profiles")
    .select("email, display_name, contributor_handle, role, aligned")
    .eq("id", user.id)
    .single();
  const profile = rawProfile as ProfileSlice | null;

  // The signup trigger normally creates the profile row immediately; if
  // for any reason it isn't there (e.g. trigger failed during a manual
  // pg_dump restore), the `select` returns null. Surface a helpful
  // error rather than crashing the page.
  if (!profile) {
    return (
      <AuthCard
        eyebrow="Member · Account"
        title="Profile not found."
        intro="This shouldn't happen — the signup trigger creates the row automatically. Sign out and back in, or contact us."
      >
        <form action="/auth/signout" method="POST">
          <Button variant="secondary">Sign out</Button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Member · Account"
      title="Your account."
      intro={`Signed in as ${profile.email ?? user.email ?? "you"}.`}
    >
      <AccountForm
        initial={{
          email: profile.email,
          display_name: profile.display_name,
          contributor_handle: profile.contributor_handle,
          role: profile.role,
          aligned: profile.aligned,
        }}
      />

      <div className="mt-6 pt-6 border-t border-warm-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/account/password"
          className="text-[12px] font-bold text-burgundy no-underline"
        >
          Change password →
        </Link>
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="text-[12px] text-warm-700 hover:text-burgundy bg-transparent border-0 cursor-pointer"
          >
            Sign out
          </button>
        </form>
      </div>
    </AuthCard>
  );
}
