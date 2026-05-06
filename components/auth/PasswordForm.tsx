"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

const inputCls =
  "w-full px-3 py-2.5 rounded-md border border-warm-300 bg-cream text-[14px] focus:outline-none focus:border-burgundy";

// Password change form. Supabase's `updateUser({ password })` requires
// the user to have a fresh session; the server gate on /account/password
// handles that — anyone past it is authed by definition. We don't ask
// for the current password because the SDK doesn't take it; protection
// against session-hijack is the cookie itself + middleware refresh.
export function PasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
    setPending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(err.message);
        return;
      }
      setDone(true);
      setPassword("");
      setConfirm("");
      // Refresh server components so any session-dependent UI updates.
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  if (done) {
    return (
      <div className="text-[14px] text-warm-700">
        Password updated. You&apos;re still signed in on this device — sign
        out elsewhere if you suspect anything.
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
        <Button variant="primary" disabled={pending}>
          {pending ? "Updating…" : "Update password"}
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
