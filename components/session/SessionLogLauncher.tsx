"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { vendorSlugForTea } from "@/lib/tea-helpers";
import { useMember } from "@/contexts/MemberContext";
import type { Tea } from "@/lib/types";

// =====================================================================
// SessionLogLauncher — floating bottom-right CTA that opens a small
// "log a session" picker. Replaces the old tweaks design panel.
//
// Behavior:
//   - On /tea/[v]/[s]/* the trigger is a one-tap deep link to that tea's
//     /log page (no picker needed — the context IS the tea).
//   - Anywhere else, clicking the trigger opens a small dropdown:
//       1. Library teas first (the ones you own / wishlist / have tried)
//       2. Catalog teas (search-filtered)
//       3. A "Tea not in our catalog →" footer that opens a free-form
//          slug entry (defers fully — Phase A simplification).
//
// Phase A is localStorage-backed; Phase B will gate this behind a real
// auth check (`if (!authedSession) return null`).
// =====================================================================

const HIDE_ON_PATHS = ["/login", "/signup", "/account/"];
const HIDE_ON_LOG = /\/tea\/[^/]+\/[^/]+\/log/;

type Props = {
  /** Catalog teas — the Shell server component fetches them once and
   *  threads them through so this client island isn't hitting Supabase. */
  teas: Tea[];
};

export function SessionLogLauncher({ teas: TEAS }: Props) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { member, findUserTeaBySlug } = useMember();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Hide on the log page (would be redundant) and on auth surfaces.
  const isHidden =
    HIDE_ON_LOG.test(pathname) ||
    HIDE_ON_PATHS.some((p) => pathname.startsWith(p));

  // Detect a tea-detail context: /tea/[vendor]/[slug] (but NOT /log).
  const contextTea: Tea | null = useMemo(() => {
    const m = pathname.match(/^\/tea\/([^/]+)\/([^/]+)\/?$/);
    if (!m) return null;
    const [, vendorSlug, pathSlug] = m;
    return (
      TEAS.find(
        (t) => t.pathSlug === pathSlug && vendorSlugForTea(t) === vendorSlug,
      ) ?? null
    );
  }, [pathname]);

  // Outside-click + Escape close.
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

  // Auto-close on route change.
  useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [pathname]);

  if (isHidden) return null;

  // Build the picker rows: library teas first (deduped against catalog),
  // then catalog teas filtered by query.
  const libraryRows = member.library.teas
    .map((row) => {
      const tea = row.teaSlug
        ? TEAS.find((t) => t.slug === row.teaSlug)
        : undefined;
      return tea ? { kind: "lib" as const, tea, status: row.status } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const q = query.trim().toLowerCase();
  const catalogRows = TEAS.filter((t) => {
    if (libraryRows.some((r) => r.tea.slug === t.slug)) return false; // dedupe
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.region.toLowerCase().includes(q) ||
      t.vendor.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q)
    );
  }).slice(0, 12);

  const goToLog = (tea: Tea) => {
    const path = `/tea/${vendorSlugForTea(tea)}/${tea.pathSlug}/log`;
    setOpen(false);
    router.push(path);
  };

  // ---- Contextual single-tap variant ----
  // On a tea-detail page the launcher is a direct deep link, no picker.
  if (contextTea) {
    const userTea = findUserTeaBySlug(contextTea.slug);
    return (
      <button
        type="button"
        onClick={() => goToLog(contextTea)}
        aria-label={`Log a session for ${contextTea.name}`}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 h-12 pl-4 pr-5 rounded-pill bg-burgundy text-cream shadow-elevated hover:bg-burgundy-dark transition-colors font-sans font-bold text-[13px] cursor-pointer"
      >
        <span aria-hidden className="text-[16px]">⏱</span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[10px] tracking-widest uppercase opacity-80">
            {userTea ? "Log another session" : "Log a session"}
          </span>
          <span className="text-[12px] truncate max-w-[180px]">
            {contextTea.name}
          </span>
        </span>
      </button>
    );
  }

  // ---- Picker variant ----
  return (
    <div ref={wrapRef} className="fixed bottom-5 right-5 z-40">
      {open && (
        <div
          role="dialog"
          aria-label="Log a session"
          className="mb-3 w-[min(92vw,360px)] bg-[var(--bg-elevated)] border border-warm-200 rounded-xl shadow-elevated overflow-hidden flex flex-col max-h-[70vh]"
        >
          <div className="px-4 pt-4 pb-3 border-b border-warm-200">
            <div className="text-[10px] tracking-widest uppercase font-bold text-warm-600 mb-1">
              Log a session
            </div>
            <div className="font-display italic text-burgundy text-[20px] leading-tight mb-2.5">
              Which tea?
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your library or catalog…"
              aria-label="Search teas"
              className="w-full px-3 py-2 rounded-md border border-warm-300 bg-cream text-[13px] font-sans"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto flex-1">
            {libraryRows.length > 0 && (
              <div>
                <div className="px-4 pt-3 pb-1.5 text-[10px] tracking-widest uppercase font-bold text-warm-600">
                  Your library
                </div>
                {libraryRows
                  .filter((r) => {
                    if (!q) return true;
                    const t = r.tea;
                    return (
                      t.name.toLowerCase().includes(q) ||
                      t.region.toLowerCase().includes(q) ||
                      t.vendor.toLowerCase().includes(q)
                    );
                  })
                  .slice(0, 8)
                  .map((r) => (
                    <PickerRow
                      key={r.tea.slug}
                      tea={r.tea}
                      tag={r.status}
                      onPick={() => goToLog(r.tea)}
                    />
                  ))}
              </div>
            )}

            {catalogRows.length > 0 && (
              <div>
                <div className="px-4 pt-3 pb-1.5 text-[10px] tracking-widest uppercase font-bold text-warm-600">
                  {libraryRows.length > 0 ? "From the catalog" : "Catalog"}
                </div>
                {catalogRows.map((tea) => (
                  <PickerRow key={tea.slug} tea={tea} onPick={() => goToLog(tea)} />
                ))}
              </div>
            )}

            {libraryRows.length === 0 && catalogRows.length === 0 && (
              <div className="px-4 py-6 text-center text-[13px] text-warm-600 leading-snug">
                No matches. Try a different word, or browse{" "}
                <a href="/discover/teas" className="text-burgundy font-bold">
                  the library
                </a>
                .
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-warm-200 bg-cream text-[11px] text-warm-600">
            Logging a tea not in our catalog?{" "}
            <a
              href="/tea/none/none/log?custom=1"
              className="text-burgundy font-bold no-underline"
            >
              Free-form entry →
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close session log launcher" : "Log a session"}
        aria-expanded={open}
        className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-burgundy text-cream shadow-elevated hover:bg-burgundy-dark transition-colors cursor-pointer"
      >
        <span aria-hidden className="text-[22px]">
          {open ? "✕" : "⏱"}
        </span>
      </button>
    </div>
  );
}

// Single picker row — keeps row markup consistent across the two
// sections (library + catalog) so styling tweaks land in one place.
function PickerRow({
  tea,
  tag,
  onPick,
}: {
  tea: Tea;
  tag?: string;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-cream transition-colors cursor-pointer"
    >
      <div
        className="w-9 h-9 rounded-md shrink-0"
        style={{ background: tea.gradient }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="font-display text-burgundy text-[15px] leading-tight truncate">
          {tea.name}
        </div>
        <div className="text-[11px] text-warm-600 truncate">
          {tea.region} · {tea.vendor}
        </div>
      </div>
      {tag && (
        <span className="shrink-0 px-2 py-0.5 rounded-pill text-[9px] font-bold tracking-widest uppercase border border-warm-300 text-warm-700">
          {tag}
        </span>
      )}
    </button>
  );
}
