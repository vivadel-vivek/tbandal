"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { POLICY_VERSIONS } from "@/lib/policy";

const inputCls =
  "w-full px-3 py-2.5 rounded-md border border-warm-300 bg-cream text-[14px] focus:outline-none focus:border-burgundy";

// Email + password signup. The Supabase trigger we ship in the initial
// migration auto-creates a `profiles` row on `auth.users` insert, so
// this form only collects the auth credentials. Display name + role
// adjustments happen on /account once the user lands.
//
// In production with email confirmation enabled, signUp returns a
// `user` but no session — we surface the "check your email" state.
// In dev (config.toml has `enable_confirmations = false`) the user is
// signed in immediately and we redirect to /member.
export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Honor a `?next=/path` so users land back on the page that prompted
  // them to sign up (library toggle, log-a-session). Defaults to /member.
  const next = params.get("next") || "/member";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  // Privacy + terms acceptance. Required to submit; the input itself
  // is `required` for native validation and we also gate the action
  // here in case JS handlers ever bypass form-level validation.
  const [accepted, setAccepted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!accepted) {
      setError("Please accept the privacy policy and terms of use to continue.");
      return;
    }
    setPending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // The hosted environment will send a confirmation email back
          // to this URL with the auth code. Local dev just signs the
          // user in directly because confirmations are off.
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
          // Captured by the handle_new_user trigger and written to
          // profiles + consent_log so we have an auditable record of
          // which version each user accepted at signup time.
          data: {
            terms_version:   POLICY_VERSIONS.terms,
            privacy_version: POLICY_VERSIONS.privacy,
          },
        },
      });
      if (err) {
        setError(err.message);
        return;
      }
      if (data.session) {
        // Confirmations off → already signed in.
        router.push(next);
        router.refresh();
        return;
      }
      // Confirmations on → user has to click the email link.
      setPendingEmail(email);
    } finally {
      setPending(false);
    }
  };

  if (pendingEmail) {
    return (
      <div className="flex flex-col gap-3 text-[14px] text-warm-700 leading-relaxed">
        <p className="m-0">
          Check <strong className="text-forest">{pendingEmail}</strong> for a
          confirmation link. Click it to finish signing up.
        </p>
        <p className="m-0 text-[12px]">
          No email after a minute? Check spam, or{" "}
          <button
            type="button"
            onClick={() => setPendingEmail(null)}
            className="text-burgundy underline cursor-pointer bg-transparent border-0 p-0"
          >
            try again
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="Email">
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
        />
      </Field>
      <Field label="Password">
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
        />
        <span className="block text-[11px] text-warm-600 mt-1">
          At least 8 characters.
        </span>
      </Field>

      <label className="flex gap-2.5 items-start text-[12px] text-warm-700 leading-snug cursor-pointer mt-1">
        <input
          type="checkbox"
          required
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 cursor-pointer accent-burgundy shrink-0"
        />
        <span>
          I&apos;ve read and agree to the{" "}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener"
            className="text-burgundy underline"
          >
            privacy policy
          </Link>{" "}
          and{" "}
          <Link
            href="/terms"
            target="_blank"
            rel="noopener"
            className="text-burgundy underline"
          >
            terms of use
          </Link>
          .
        </span>
      </label>

      {error && (
        <div
          role="alert"
          className="text-[12px] text-burgundy bg-burgundy-muted px-3 py-2 rounded-md"
        >
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mt-2 gap-3 flex-wrap">
        <Link
          href={`/login${params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : ""}`}
          className="text-[12px] text-warm-700 hover:text-burgundy"
        >
          Already have an account? Sign in →
        </Link>
        <Button variant="primary" disabled={pending || !accepted}>
          {pending ? "Creating account…" : "Sign up"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-bold tracking-widest uppercase text-warm-600 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
