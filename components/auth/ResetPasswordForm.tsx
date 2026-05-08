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
// Each branch is finalized differently:
//   - `code`        → exchangeCodeForSession (must be called explicitly;
//                     supabase-js does NOT auto-exchange URL `?code=`)
//   - `token_hash`  → verifyOtp({ token_hash, type })
//   - hash fragment → supabase-js parses on init and fires
//                     PASSWORD_RECOVERY / SIGNED_IN automatically
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

    // Listen first so any auth event during exchange/verify is caught.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
        settle(true);
      }
    });

    let timer: ReturnType<typeof setTimeout> | null = null;

    (async () => {
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      // 1. Implicit flow — hash fragment. The admin SDK (service-role
      // resetPasswordForEmail) uses this by default, so the email link
      // ends with `#access_token=…&refresh_token=…&type=recovery`.
      // @supabase/ssr's browser client defaults to PKCE and does NOT
      // auto-parse the hash, so we parse + setSession explicitly.
      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(
          window.location.hash.replace(/^#/, ""),
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error: setErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (setErr) {
            return settle(false, setErr.message);
          }
          // Strip the hash so a refresh doesn't re-process stale tokens.
          history.replaceState(null, "", window.location.pathname + window.location.search);
          return settle(true);
        }
      }

      // 2. PKCE — exchange the `?code=` for a session. Required for
      // projects on the new flow.
      if (code) {
        const { error: exchangeErr } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeErr) {
          return settle(false, exchangeErr.message);
        }
        return settle(true);
      }

      // 3. token_hash flow (older email template).
      if (tokenHash && type) {
        const { error: verifyErr } = await supabase.auth.verifyOtp({
          type: type as "recovery" | "invite" | "email" | "signup" | "magiclink",
          token_hash: tokenHash,
        });
        if (verifyErr) {
          return settle(false, verifyErr.message);
        }
        return settle(true);
      }

      // 4. If a session is already in place (returning visit),
      // short-circuit so they can change password.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        settle(true);
        return;
      }

      // 5. Nothing usable in the URL — fail fast.
      timer = setTimeout(() => {
        if (!cancelled) {
          setStatus((prev) => (prev === "checking" ? "invalid" : prev));
          setError((prev) => prev ?? "This link is invalid or has expired.");
        }
      }, 1500);
    })();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      if (timer) clearTimeout(timer);
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
