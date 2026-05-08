"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

const inputCls =
  "w-full px-3 py-2.5 rounded-md border border-warm-300 bg-cream text-[14px] focus:outline-none focus:border-burgundy";

// Handles the three recovery-link variants Supabase may send:
//   - PKCE:     /auth/reset?code=…              (newer projects, default)
//   - OTP hash: /auth/reset?token_hash=…&type=… (older email templates)
//   - Implicit: /auth/reset#access_token=…&type=recovery
//
// supabase-js's browser client picks up `code` and the URL hash on its
// own and fires `PASSWORD_RECOVERY` / `SIGNED_IN`. For `token_hash` we
// invoke verifyOtp manually since that branch isn't auto-handled.
//
// Once a session is established, the user can submit a new password.
// If the link is invalid/expired, we surface a clear message + a link
// back to the forgot-password screen.

type Status = "checking" | "ready" | "saving" | "done" | "invalid";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // On mount, figure out whether the link delivered a valid session.
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    let cancelled = false;

    const settle = (ok: boolean, msg?: string) => {
      if (cancelled) return;
      setStatus(ok ? "ready" : "invalid");
      if (!ok && msg) setError(msg);
    };

    const verifyTokenHashIfPresent = async () => {
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      if (!tokenHash || !type) return null;
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        type: type as "recovery" | "invite" | "email" | "signup" | "magiclink",
        token_hash: tokenHash,
      });
      return verifyErr;
    };

    (async () => {
      // 1. token_hash flow (older email template)
      const verifyErr = await verifyTokenHashIfPresent();
      if (verifyErr) {
        return settle(false, verifyErr.message);
      }

      // 2. Listen for the implicit-hash + PKCE flows. supabase-js parses
      // both automatically and fires PASSWORD_RECOVERY / SIGNED_IN.
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
          settle(true);
        }
      });

      // 3. If a session is already in place (token_hash branch above,
      // or returning visit), short-circuit.
      const { data } = await supabase.auth.getSession();
      if (data.session) settle(true);

      // 4. After a beat with no signal, mark invalid so the user gets
      // a clear "this link is no good" instead of a hung spinner.
      const timer = setTimeout(() => {
        if (!cancelled) {
          setStatus((prev) => (prev === "checking" ? "invalid" : prev));
          setError((prev) => prev ?? "This link is invalid or has expired.");
        }
      }, 4000);

      return () => {
        sub.subscription.unsubscribe();
        clearTimeout(timer);
      };
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setStatus("saving");
    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError(err.message);
      setStatus("ready");
      return;
    }
    setStatus("done");
    // Settle for a beat so the success copy is readable, then forward.
    setTimeout(() => router.push(next), 800);
  };

  if (status === "checking") {
    return (
      <div className="text-[14px] text-warm-700">
        Verifying your link…
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="space-y-3">
        <div className="text-[14px] text-burgundy">
          {error ?? "This link is invalid or has expired."}
        </div>
        <a
          href="/login"
          className="text-[12px] font-bold text-burgundy no-underline"
        >
          ← Back to sign in
        </a>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="text-[14px] text-warm-700">
        Password saved. Taking you to your dashboard…
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="New password">
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
          autoFocus
        />
      </Field>
      <Field label="Confirm">
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputCls}
        />
      </Field>

      {error && (
        <div
          role="alert"
          className="text-[12px] text-burgundy bg-burgundy-muted px-3 py-2 rounded-md"
        >
          {error}
        </div>
      )}

      <div className="flex justify-end mt-2">
        <Button variant="primary" disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Save password"}
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
