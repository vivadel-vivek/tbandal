"use client";

// Floating bottom-left role switcher. Renders only when
// `NEXT_PUBLIC_STAGING_ROLE_SWITCHER=1` — set the env in staging to
// enable, leave unset in real production.
//
// Each button hits /api/staging/switch which uses the admin SDK to
// mint a magic-link for the seeded test user. The browser follows the
// link, Supabase sets cookies via the auth callback, and lands the
// user back on the page they were on.

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSupabaseSession } from "@/lib/supabase/useSession";

const ROLES = [
  { key: "admin",       label: "Admin",       hint: "Sees everything" },
  { key: "contributor", label: "Contributor", hint: "Edits the catalog" },
  { key: "vendor",      label: "Vendor",      hint: "Their storefront" },
  { key: "member",      label: "Member",      hint: "Paid tier" },
  { key: "user",        label: "User",        hint: "Free tier" },
  { key: "anon",        label: "Anonymous",   hint: "Signed out" },
] as const;

export function StagingRoleSwitcher() {
  const pathname = usePathname() ?? "/";
  const session = useSupabaseSession();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Outside-click + Escape close. Same pattern as the SessionLogLauncher.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Best-effort current-role label from the session email's local part
  // (admin@tbal-tests.local → "admin"). Falls back to "anon" when
  // signed out, "?" when signed in but with a non-test email.
  const currentRole = (() => {
    if (!session) return "anon";
    const email = session.email ?? "";
    if (!email.endsWith("@tbal-tests.local")) return "?";
    return email.split("@")[0]!;
  })();

  return (
    <div
      ref={wrapRef}
      className="fixed bottom-5 left-5 z-40 flex flex-col items-start"
    >
      {open && (
        <div
          role="dialog"
          aria-label="Staging role switcher"
          className="mb-3 w-[min(92vw,280px)] bg-[var(--bg-elevated)] border border-warm-200 rounded-xl shadow-elevated overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-warm-200 bg-cream">
            <div className="text-[10px] tracking-widest uppercase font-bold text-warm-600">
              Staging · switch role
            </div>
            <div className="text-[11px] text-warm-700 mt-0.5">
              Now: <span className="font-bold text-burgundy">{currentRole}</span>
            </div>
          </div>
          <div className="py-1">
            {ROLES.map((r) => {
              const active = currentRole === r.key;
              return (
                <a
                  key={r.key}
                  href={`/api/staging/switch?role=${r.key}&next=${encodeURIComponent(pathname)}`}
                  className={[
                    "block px-3 py-2 no-underline transition-colors",
                    active ? "bg-burgundy-muted" : "hover:bg-cream",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "text-[13px] font-bold",
                      active ? "text-burgundy" : "text-forest",
                    ].join(" ")}
                  >
                    {r.label}
                  </div>
                  <div className="text-[11px] text-warm-600 leading-snug">
                    {r.hint}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close role switcher" : "Open role switcher"}
        aria-expanded={open}
        className="inline-flex items-center gap-2 h-10 pl-2 pr-3.5 rounded-pill bg-forest text-cream shadow-elevated hover:bg-forest-dark transition-colors cursor-pointer"
      >
        <span
          aria-hidden
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cream text-forest font-display italic text-[12px]"
        >
          {currentRole === "anon" ? "?" : currentRole[0]?.toUpperCase()}
        </span>
        <span className="text-[11px] tracking-widest uppercase font-bold">
          {open ? "Close" : currentRole}
        </span>
      </button>
    </div>
  );
}
