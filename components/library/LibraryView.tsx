"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMember } from "@/contexts/MemberContext";
import { TEAS, TEAWARE, vendorSlugForTea } from "@/lib/data";
import type {
  Tea,
  Teaware,
  UserTea,
  UserTeaStatus,
  UserTeaware,
  UserTeawareStatus,
} from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { LibraryStatusToggle } from "@/components/library/LibraryStatusToggle";

// =====================================================================
// LibraryView — the /member/library page. Two tabs (Teas, Teaware),
// status filter chips, card grid. Built as a client island because it
// reads MemberContext (localStorage today, Supabase in Phase B); the
// route shell stays a tiny server component.
// =====================================================================

type Tab = "teas" | "teaware";
type AnyStatus = UserTeaStatus | UserTeawareStatus | "all";

const TEA_STATUSES: { value: AnyStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "wishlist", label: "Wishlist" },
  { value: "owned", label: "Owned" },
  { value: "tried", label: "Tried" },
  { value: "retired", label: "Finished" },
];

const TEAWARE_STATUSES: { value: AnyStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "wishlist", label: "Wishlist" },
  { value: "owned", label: "Owned" },
];

export function LibraryView() {
  const { member, removeUserTea, removeUserTeaware } = useMember();
  const [tab, setTab] = useState<Tab>("teas");
  const [status, setStatus] = useState<AnyStatus>("all");

  const teaRows = useMemo(() => {
    return member.library.teas
      .filter((row) => status === "all" || row.status === status)
      .map((row) => ({
        row,
        tea: row.teaSlug
          ? TEAS.find((t) => t.slug === row.teaSlug)
          : undefined,
      }));
  }, [member.library.teas, status]);

  const teawareRows = useMemo(() => {
    return member.library.teaware
      .filter((row) => status === "all" || row.status === status)
      .map((row) => ({
        row,
        item: row.teawareSlug
          ? TEAWARE.find((t) => t.slug === row.teawareSlug)
          : undefined,
      }));
  }, [member.library.teaware, status]);

  const statuses = tab === "teas" ? TEA_STATUSES : TEAWARE_STATUSES;
  const hasItems =
    tab === "teas" ? teaRows.length > 0 : teawareRows.length > 0;

  return (
    <main>
      <Container>
        <Link href="/member" className="back-link mt-8 mb-2">
          ← Your profile
        </Link>

        <div className="pt-2 pb-5 sm:pb-6">
          <Eyebrow>Member · Library</Eyebrow>
          <h1 className="font-display italic text-burgundy font-medium tracking-tight m-0 mt-2 mb-3 text-[36px] sm:text-[56px]">
            Your library.
          </h1>
          <p className="text-base text-warm-700 max-w-[640px] m-0">
            Teas and teaware you&apos;ve marked. Wishlist becomes shopping
            list, finished triggers restock pings (when we wire those up),
            and tried lets us remember what you&apos;ve already brewed.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 bg-cream rounded-pill w-fit border border-warm-200">
          {(["teas", "teaware"] as Tab[]).map((t) => {
            const active = tab === t;
            const count =
              t === "teas"
                ? member.library.teas.length
                : member.library.teaware.length;
            return (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setStatus("all");
                }}
                className={[
                  "px-4 py-2 rounded-pill border-0 cursor-pointer font-sans text-[13px] font-bold inline-flex items-center gap-2 transition-colors",
                  active ? "bg-burgundy text-cream" : "text-forest",
                ].join(" ")}
              >
                {t === "teas" ? "Teas" : "Teaware"}
                <span
                  className="text-[10px] font-mono opacity-80"
                  aria-label={`${count} items`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status chips */}
        <div className="flex gap-1.5 flex-wrap mb-7">
          {statuses.map((s) => {
            const active = status === s.value;
            return (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={[
                  "px-3 py-1.5 rounded-pill font-sans text-[11px] font-bold cursor-pointer border transition-colors",
                  active
                    ? "border-burgundy bg-burgundy-muted text-burgundy"
                    : "border-warm-300 bg-transparent text-forest hover:bg-cream",
                ].join(" ")}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {!hasItems && (
          <div className="card-surface p-7 sm:p-9 text-center">
            <Eyebrow>Nothing here yet</Eyebrow>
            <h2 className="font-display italic text-burgundy font-medium m-0 mt-2 mb-2.5 text-[24px] sm:text-[28px]">
              {tab === "teas" ? "Add some tea." : "Add some teaware."}
            </h2>
            <p className="text-[14px] text-warm-700 max-w-[420px] mx-auto mb-5 leading-relaxed">
              {tab === "teas"
                ? "Browse the library and tap + Add to library on any tea — wishlist what you want, mark what you own, log sessions for what you've brewed."
                : "Browse our teaware catalog and tap + Add to my teaware on any vessel, kettle, or scale you own."}
            </p>
            <Link
              href={
                tab === "teas" ? "/discover/teas" : "/discover/teaware"
              }
              className="inline-flex no-underline"
            >
              <Button variant="primary">
                Browse {tab === "teas" ? "teas" : "teaware"} →
              </Button>
            </Link>
          </div>
        )}

        {/* Tea grid */}
        {tab === "teas" && teaRows.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {teaRows.map(({ row, tea }) => (
              <UserTeaCard
                key={row.id}
                row={row}
                tea={tea}
                onRemove={() => removeUserTea(row.id)}
              />
            ))}
          </div>
        )}

        {/* Teaware grid */}
        {tab === "teaware" && teawareRows.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {teawareRows.map(({ row, item }) => (
              <UserTeawareCard
                key={row.id}
                row={row}
                item={item}
                onRemove={() => removeUserTeaware(row.id)}
              />
            ))}
          </div>
        )}

        <div className="h-16" />
      </Container>
    </main>
  );
}

// ---- Cards ----------------------------------------------------------

function UserTeaCard({
  row,
  tea,
  onRemove,
}: {
  row: UserTea;
  tea: Tea | undefined;
  onRemove: () => void;
}) {
  const isCustom = !tea;
  const display = tea
    ? { name: tea.name, sub: `${tea.region} · ${tea.vendor}`, gradient: tea.gradient }
    : {
        name: row.customName ?? "Untitled tea",
        sub: [row.customVendor, row.customYear].filter(Boolean).join(" · "),
        gradient:
          "linear-gradient(135deg, var(--warm-200) 0%, var(--warm-300) 100%)",
      };

  const statusLabel: Record<UserTeaStatus, string> = {
    wishlist: "Wishlist",
    owned: "Owned",
    tried: "Tried",
    retired: "Finished",
  };

  return (
    <article className="card-surface overflow-hidden flex">
      <div
        className="w-24 sm:w-28 shrink-0"
        style={{ background: display.gradient }}
        aria-hidden
      />
      <div className="flex-1 min-w-0 px-4 py-3.5 flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="px-2 py-0.5 rounded-pill text-[9px] font-bold tracking-widest uppercase border border-warm-300 text-warm-700"
          >
            {statusLabel[row.status]}
          </span>
          {isCustom && (
            <span className="text-[10px] text-warm-600 italic">
              off-catalog
            </span>
          )}
        </div>
        <div className="font-display text-burgundy font-medium text-[18px] sm:text-[20px] leading-tight m-0 mb-1 truncate">
          {display.name}
        </div>
        <div className="text-[11px] text-warm-600 truncate">{display.sub}</div>
        <div className="mt-auto pt-3 flex items-center gap-2 flex-wrap">
          {tea && (
            <Link
              href={`/tea/${vendorSlugForTea(tea)}/${tea.pathSlug}`}
              className="text-[12px] font-bold text-burgundy no-underline"
            >
              Open →
            </Link>
          )}
          {tea && (
            <Link
              href={`/tea/${vendorSlugForTea(tea)}/${tea.pathSlug}/log`}
              className="text-[12px] font-bold text-burgundy no-underline"
            >
              Log session →
            </Link>
          )}
          {tea && <LibraryStatusToggle kind="tea" slug={tea.slug} size="sm" />}
          {!tea && (
            <button
              type="button"
              onClick={onRemove}
              className="text-[11px] text-warm-700 bg-transparent border-0 cursor-pointer underline ml-auto"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function UserTeawareCard({
  row,
  item,
  onRemove,
}: {
  row: UserTeaware;
  item: Teaware | undefined;
  onRemove: () => void;
}) {
  const isCustom = !item;
  const display = item
    ? { name: item.name, sub: `${item.material}${item.volumeMl ? ` · ${item.volumeMl}ml` : ""}`, gradient: item.gradient }
    : {
        name: row.customName ?? "Untitled vessel",
        sub: [row.customMaterial, row.customVolumeMl ? `${row.customVolumeMl}ml` : null]
          .filter(Boolean)
          .join(" · "),
        gradient:
          "linear-gradient(135deg, var(--warm-200) 0%, var(--warm-300) 100%)",
      };

  const statusLabel: Record<UserTeawareStatus, string> = {
    wishlist: "Wishlist",
    owned: "Owned",
  };

  return (
    <article className="card-surface overflow-hidden flex">
      <div
        className="w-24 sm:w-28 shrink-0"
        style={{ background: display.gradient }}
        aria-hidden
      />
      <div className="flex-1 min-w-0 px-4 py-3.5 flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="px-2 py-0.5 rounded-pill text-[9px] font-bold tracking-widest uppercase border border-warm-300 text-warm-700"
          >
            {statusLabel[row.status]}
          </span>
          {isCustom && (
            <span className="text-[10px] text-warm-600 italic">
              off-catalog
            </span>
          )}
        </div>
        <div className="font-display text-burgundy font-medium text-[18px] sm:text-[20px] leading-tight m-0 mb-1 truncate">
          {display.name}
        </div>
        <div className="text-[11px] text-warm-600 truncate">{display.sub}</div>
        <div className="mt-auto pt-3 flex items-center gap-2 flex-wrap">
          {item && (
            <Link
              href={`/discover/teaware/${item.slug}`}
              className="text-[12px] font-bold text-burgundy no-underline"
            >
              Open →
            </Link>
          )}
          {item && (
            <LibraryStatusToggle kind="teaware" slug={item.slug} size="sm" />
          )}
          {!item && (
            <button
              type="button"
              onClick={onRemove}
              className="text-[11px] text-warm-700 bg-transparent border-0 cursor-pointer underline ml-auto"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
