"use client";

import { useState, useRef, useEffect } from "react";
import { useMember } from "@/contexts/MemberContext";
import type {
  UserTeaStatus,
  UserTeawareStatus,
} from "@/lib/types";

// =====================================================================
// LibraryStatusToggle — pill button that opens a small status menu so
// the user can wishlist / own / mark a tea or teaware item without
// leaving the page they're on. Reads + writes the user's library via
// MemberContext.
//
// Two modes (kind="tea" | "teaware") because the status enums differ:
//   tea     = wishlist | owned | tried | retired
//   teaware = wishlist | owned
// One component, dispatched at the call site so card/detail markup
// stays consistent across the catalog.
// =====================================================================

type CommonProps = {
  /** Visual size — "sm" for cards, "md" for detail pages. */
  size?: "sm" | "md";
  /** Optional className wedge for layout overrides. */
  className?: string;
};

type TeaProps = CommonProps & {
  kind: "tea";
  slug: string;
};
type TeawareProps = CommonProps & {
  kind: "teaware";
  slug: string;
};
type Props = TeaProps | TeawareProps;

const TEA_STATUS_OPTIONS: { value: UserTeaStatus; label: string; hint: string }[] = [
  { value: "wishlist", label: "Wishlist",     hint: "I want to try this" },
  { value: "owned",    label: "Owned",        hint: "It's on my shelf" },
  { value: "tried",    label: "Tried",        hint: "I've brewed it" },
  { value: "retired",  label: "Finished",     hint: "All gone — flag for restock pings" },
];

const TEAWARE_STATUS_OPTIONS: { value: UserTeawareStatus; label: string; hint: string }[] = [
  { value: "wishlist", label: "Wishlist", hint: "I want this vessel" },
  { value: "owned",    label: "Owned",    hint: "I brew with this" },
];

const LABEL_BY_TEA: Record<UserTeaStatus, string> = {
  wishlist: "On wishlist",
  owned:    "In library",
  tried:    "Tried",
  retired:  "Finished",
};

const LABEL_BY_TEAWARE: Record<UserTeawareStatus, string> = {
  wishlist: "On wishlist",
  owned:    "In my teaware",
};

export function LibraryStatusToggle(props: Props) {
  const { kind, slug, size = "sm", className = "" } = props;
  const {
    findUserTeaBySlug,
    findUserTeawareBySlug,
    setTeaStatus,
    setTeawareStatus,
    removeUserTea,
    removeUserTeaware,
  } = useMember();

  const existing =
    kind === "tea"
      ? findUserTeaBySlug(slug)
      : findUserTeawareBySlug(slug);

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click + Escape — same pattern as the discover dropdown.
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

  const buttonLabel = existing
    ? kind === "tea"
      ? LABEL_BY_TEA[(existing as { status: UserTeaStatus }).status]
      : LABEL_BY_TEAWARE[(existing as { status: UserTeawareStatus }).status]
    : kind === "tea"
      ? "+ Add to library"
      : "+ Add to my teaware";

  const sizeCls =
    size === "md"
      ? "h-11 px-4 text-[12px]"
      : "h-9 px-3 text-[11px]";
  const stateCls = existing
    ? "bg-burgundy-muted text-burgundy border-burgundy"
    : "bg-cream text-forest border-warm-300 hover:bg-warm-100";

  return (
    <div ref={wrapRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className={[
          "inline-flex items-center gap-1.5 rounded-pill border font-sans font-bold tracking-wide cursor-pointer transition-colors",
          sizeCls,
          stateCls,
        ].join(" ")}
      >
        {existing && (
          <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
        )}
        {buttonLabel}
        <span aria-hidden className="text-[9px] opacity-60">▾</span>
      </button>

      {open && (
        <div
          role="menu"
          // Stop click bubbling so card-wrapping <Link> elements don't
          // navigate when the user picks a status from inside a card.
          onClick={(e) => e.stopPropagation()}
          className="absolute z-30 right-0 top-[calc(100%+6px)] min-w-[220px] bg-[var(--bg-elevated)] border border-warm-200 rounded-lg shadow-elevated p-1.5"
        >
          {(kind === "tea" ? TEA_STATUS_OPTIONS : TEAWARE_STATUS_OPTIONS).map(
            (opt) => {
              const isActive =
                existing &&
                (existing as { status: string }).status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    if (kind === "tea") {
                      setTeaStatus(slug, opt.value as UserTeaStatus);
                    } else {
                      setTeawareStatus(slug, opt.value as UserTeawareStatus);
                    }
                    setOpen(false);
                  }}
                  className={[
                    "block w-full text-left px-3 py-2 rounded-md transition-colors",
                    isActive
                      ? "bg-burgundy-muted text-burgundy"
                      : "hover:bg-cream text-forest",
                  ].join(" ")}
                >
                  <div className="font-bold text-[13px] leading-tight">
                    {opt.label}
                  </div>
                  <div className="text-[11px] text-warm-600 mt-0.5 leading-snug">
                    {opt.hint}
                  </div>
                </button>
              );
            },
          )}
          {existing && (
            <>
              <div className="border-t border-warm-200 mx-1 my-1.5" />
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  if (kind === "tea") removeUserTea(existing.id);
                  else removeUserTeaware(existing.id);
                  setOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-[12px] text-warm-700 hover:bg-cream"
              >
                Remove from library
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
