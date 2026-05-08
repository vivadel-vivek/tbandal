"use client";

import { useState, useTransition } from "react";
import { setUserRole } from "@/app/admin/contributor/actions";
import type { UserRole } from "@/lib/supabase/types";

const ROLES: UserRole[] = ["admin", "contributor", "vendor", "member", "user"];

export function UserRoleSelect({
  userId,
  role: initial,
}: {
  userId: string;
  role: UserRole;
}) {
  const [role, setRole] = useState<UserRole>(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onChange = (next: UserRole) => {
    if (next === role) return;
    const prev = role;
    setRole(next); // optimistic
    setError(null);
    startTransition(async () => {
      const r = await setUserRole({ userId, role: next });
      if (!r.ok) {
        setRole(prev);
        setError(r.message ?? "Update failed");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <select
        value={role}
        onChange={(e) => onChange(e.target.value as UserRole)}
        disabled={pending}
        aria-label="User role"
        className="px-2.5 py-1 rounded-pill border border-warm-300 bg-cream text-[11px] font-bold tracking-widest uppercase text-forest cursor-pointer disabled:opacity-60"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      {error && (
        <span className="text-[10px] text-burgundy">{error}</span>
      )}
    </div>
  );
}
