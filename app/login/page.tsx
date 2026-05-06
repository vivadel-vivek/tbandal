import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Two Buds and a Leaf.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false },
};

// Authed visitors get bounced to /member instead of seeing the login
// form. A query-string `?next=/path` overrides the redirect target so
// gated CTAs can deep-link visitors back to where they came from.
//
// If Supabase env vars aren't configured yet (first dev boot, missing
// secrets in CI), we render a configure-your-stack notice rather than
// crashing with an env-var stack trace.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const sp = await searchParams;
    if (user) redirect(sp.next ?? "/member");
  } catch (err) {
    // Expected when env vars aren't set; rethrow on anything else.
    if (!(err instanceof Error) || !err.message.includes("Missing Supabase env")) {
      throw err;
    }
    return <SupabaseNotConfigured />;
  }

  return (
    <AuthCard
      eyebrow="Member · Sign in"
      title="Welcome back."
      intro="Logging in syncs your library and sessions across devices."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}

function SupabaseNotConfigured() {
  return (
    <AuthCard
      eyebrow="Member · Setup"
      title="Auth isn't wired up yet."
      intro="The Supabase env vars haven't been set in this environment. See SUPABASE.md for the local setup walkthrough."
    >
      <div className="text-[13px] text-warm-700 leading-relaxed">
        <p className="mt-0">Quick start:</p>
        <pre className="bg-cream rounded-md p-3 text-[12px] font-mono leading-relaxed mt-2 mb-3 whitespace-pre-wrap">
{`cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run supabase:start
npm run supabase:reset`}
        </pre>
        <p className="m-0">
          Then restart the dev server and refresh.
        </p>
      </div>
    </AuthCard>
  );
}
