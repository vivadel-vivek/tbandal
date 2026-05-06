"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { UserRole } from "@/lib/supabase/types";

const inputCls =
  "w-full px-3 py-2.5 rounded-md border border-warm-300 bg-cream text-[14px] focus:outline-none focus:border-burgundy";

// Profile editor on /account. Reads the initial profile snapshot from
// the server component (passed via props) and writes through the
// browser client. RLS enforces the user can only update their own row;
// `role` is excluded from the update set in the policy + UI so members
// can't promote themselves.
export function AccountForm({
  initial,
}: {
  initial: {
    email: string | null;
    display_name: string | null;
    contributor_handle: string | null;
    role: UserRole;
    aligned: "vivek" | "james";
  };
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initial.display_name ?? "");
  const [contributorHandle, setContributorHandle] = useState(
    initial.contributor_handle ?? "",
  );
  const [aligned, setAligned] = useState<"vivek" | "james">(initial.aligned);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      // Untyped pass-through against the placeholder Database — the
      // codegen replaces this once `supabase gen types` has run.
      const { error: err } = await (supabase.from("profiles") as unknown as {
        update: (patch: Record<string, unknown>) => {
          eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
        };
      })
        .update({
          display_name: displayName.trim() || null,
          contributor_handle: contributorHandle.trim() || null,
          aligned,
        })
        .eq("id", await getOwnId(supabase));
      if (err) {
        setError(err.message);
        return;
      }
      setMessage("Saved.");
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="Email">
        <input
          value={initial.email ?? ""}
          disabled
          className={`${inputCls} opacity-70`}
        />
        <span className="block text-[11px] text-warm-600 mt-1">
          Changing your email is on the password page (Phase B.4 polish).
        </span>
      </Field>

      <Field label="Display name">
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="What name shows on your reviews"
          className={inputCls}
        />
      </Field>

      <Field label="Contributor handle">
        <input
          value={contributorHandle}
          onChange={(e) => setContributorHandle(e.target.value)}
          placeholder="optional — used in cross-references"
          className={inputCls}
        />
        <span className="block text-[11px] text-warm-600 mt-1">
          Your role is{" "}
          <strong className="text-forest">{initial.role}</strong>. Promotion
          to contributor / vendor / admin is granted by the team.
        </span>
      </Field>

      <Field label="Aligned palate">
        <div className="flex gap-2">
          {(["james", "vivek"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAligned(p)}
              className={[
                "px-3 py-2 rounded-pill border cursor-pointer text-[12px] font-bold tracking-wide capitalize",
                aligned === p
                  ? "bg-burgundy text-cream border-burgundy"
                  : "bg-transparent text-forest border-warm-300 hover:bg-cream",
              ].join(" ")}
            >
              {p}
            </button>
          ))}
        </div>
        <span className="block text-[11px] text-warm-600 mt-1">
          Recommendations seed off the contributor whose palate you start
          aligned with — drift kicks in once you start rating.
        </span>
      </Field>

      {error && (
        <div
          role="alert"
          className="text-[12px] text-burgundy bg-burgundy-muted px-3 py-2 rounded-md"
        >
          {error}
        </div>
      )}
      {message && (
        <div className="text-[12px] text-forest bg-sage-muted px-3 py-2 rounded-md">
          {message}
        </div>
      )}

      <div className="flex justify-end mt-2">
        <Button variant="primary" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

// Pulls the auth user's id off the client so we can target the row in
// the update — RLS will reject anything that doesn't match anyway, but
// scoping the update by id is good defense-in-depth.
async function getOwnId(supabase: ReturnType<typeof createSupabaseBrowserClient>) {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? "";
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
