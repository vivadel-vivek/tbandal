"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMember } from "@/contexts/MemberContext";
import { vendorSlugForTea } from "@/lib/tea-helpers";
import type {
  Tea,
  Teaware,
  TeaTypeName,
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

type AddMode = null | "catalog" | "custom";

type Props = {
  /** Catalog teas + teaware passed in from the server parent — the
   *  client component never reaches into Supabase directly. */
  teas: Tea[];
  teaware: Teaware[];
};

export function LibraryView({ teas: TEAS, teaware: TEAWARE }: Props) {
  const {
    member,
    removeUserTea,
    removeUserTeaware,
    setTeaStatus,
    setTeawareStatus,
    addCustomTea,
    addCustomTeaware,
  } = useMember();
  const [tab, setTab] = useState<Tab>("teas");
  const [status, setStatus] = useState<AnyStatus>("all");
  const [addMode, setAddMode] = useState<AddMode>(null);

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

        {/* Add row — paired buttons for catalog vs custom add. */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            type="button"
            onClick={() => setAddMode("catalog")}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-pill bg-burgundy text-cream text-[12px] font-bold cursor-pointer hover:bg-burgundy-dark"
          >
            + Add from {tab === "teas" ? "tea" : "teaware"} catalog
          </button>
          <button
            type="button"
            onClick={() => setAddMode("custom")}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-pill border border-warm-300 text-forest text-[12px] font-bold cursor-pointer hover:bg-cream"
          >
            + Add custom {tab === "teas" ? "tea" : "vessel"}
          </button>
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

      {addMode === "catalog" && (
        <CatalogPickerModal
          kind={tab}
          onClose={() => setAddMode(null)}
          onPickTea={(slug, st) => {
            setTeaStatus(slug, st);
            setAddMode(null);
          }}
          onPickTeaware={(slug, st) => {
            setTeawareStatus(slug, st);
            setAddMode(null);
          }}
          existingTeaSlugs={
            new Set(
              member.library.teas
                .map((r) => r.teaSlug)
                .filter((s): s is string => Boolean(s)),
            )
          }
          existingTeawareSlugs={
            new Set(
              member.library.teaware
                .map((r) => r.teawareSlug)
                .filter((s): s is string => Boolean(s)),
            )
          }
          teas={TEAS}
          teaware={TEAWARE}
        />
      )}

      {addMode === "custom" && tab === "teas" && (
        <CustomTeaModal
          onClose={() => setAddMode(null)}
          onSubmit={(input) => {
            addCustomTea(input);
            setAddMode(null);
          }}
        />
      )}

      {addMode === "custom" && tab === "teaware" && (
        <CustomTeawareModal
          onClose={() => setAddMode(null)}
          onSubmit={(input) => {
            addCustomTeaware(input);
            setAddMode(null);
          }}
        />
      )}
    </main>
  );
}

// =====================================================================
// Add modals — three of them (catalog picker, custom tea, custom
// teaware). Reusable Backdrop wraps the dismiss + Esc behavior so all
// three share the same close affordance.
// =====================================================================

function Backdrop({
  onClose,
  ariaLabel,
  children,
}: {
  onClose: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-burgundy/30 backdrop-blur-[2px] flex items-center justify-center px-4"
    >
      <div
        // Stop click bubbling so clicks inside the panel don't dismiss.
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--bg-elevated)] rounded-xl shadow-elevated max-w-[480px] w-full p-5 sm:p-6 max-h-[85vh] overflow-y-auto"
      >
        {children}
      </div>
    </div>
  );
}

function CatalogPickerModal({
  kind,
  onClose,
  onPickTea,
  onPickTeaware,
  existingTeaSlugs,
  existingTeawareSlugs,
  teas: TEAS,
  teaware: TEAWARE,
}: {
  kind: Tab;
  onClose: () => void;
  onPickTea: (slug: string, status: UserTeaStatus) => void;
  onPickTeaware: (slug: string, status: UserTeawareStatus) => void;
  existingTeaSlugs: Set<string>;
  existingTeawareSlugs: Set<string>;
  teas: Tea[];
  teaware: Teaware[];
}) {
  const [query, setQuery] = useState("");
  const [defaultTeaStatus, setDefaultTeaStatus] = useState<UserTeaStatus>("wishlist");
  const [defaultTeawareStatus, setDefaultTeawareStatus] = useState<UserTeawareStatus>("owned");

  const q = query.trim().toLowerCase();

  const teaRows = TEAS.filter((t) => !existingTeaSlugs.has(t.slug)).filter(
    (t) =>
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.region.toLowerCase().includes(q) ||
      t.vendor.toLowerCase().includes(q),
  );

  const teawareRows = TEAWARE.filter(
    (t) => !existingTeawareSlugs.has(t.slug),
  ).filter(
    (t) =>
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.material.toLowerCase().includes(q) ||
      t.vendor.toLowerCase().includes(q),
  );

  return (
    <Backdrop
      onClose={onClose}
      ariaLabel={`Add ${kind === "teas" ? "tea" : "teaware"} from catalog`}
    >
      <Eyebrow>From the catalog</Eyebrow>
      <h2 className="font-display italic text-burgundy font-medium m-0 mt-2 mb-3 text-[24px]">
        Pick {kind === "teas" ? "a tea" : "a vessel"} to add
      </h2>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={kind === "teas" ? "Search tea, region, vendor…" : "Search vessel, material…"}
        className="w-full px-3 py-2 rounded-md border border-warm-300 bg-cream text-[13px] mb-3"
        autoFocus
      />

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[10px] tracking-widest uppercase font-bold text-warm-600">
          Adding as
        </span>
        {kind === "teas"
          ? (["wishlist", "owned", "tried"] as UserTeaStatus[]).map((s) => (
              <StatusChip
                key={s}
                active={defaultTeaStatus === s}
                onClick={() => setDefaultTeaStatus(s)}
                label={s.charAt(0).toUpperCase() + s.slice(1)}
              />
            ))
          : (["wishlist", "owned"] as UserTeawareStatus[]).map((s) => (
              <StatusChip
                key={s}
                active={defaultTeawareStatus === s}
                onClick={() => setDefaultTeawareStatus(s)}
                label={s.charAt(0).toUpperCase() + s.slice(1)}
              />
            ))}
      </div>

      <div className="border border-warm-200 rounded-lg overflow-hidden max-h-[44vh] overflow-y-auto">
        {kind === "teas" ? (
          teaRows.length === 0 ? (
            <EmptyHit query={q} />
          ) : (
            teaRows.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => onPickTea(t.slug, defaultTeaStatus)}
                className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-cream cursor-pointer border-b border-warm-200 last:border-b-0"
              >
                <div
                  className="w-9 h-9 rounded-md shrink-0"
                  style={{ background: t.gradient }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="font-display text-burgundy text-[15px] leading-tight truncate">
                    {t.name}
                  </div>
                  <div className="text-[11px] text-warm-600 truncate">
                    {t.region} · {t.vendor}
                  </div>
                </div>
              </button>
            ))
          )
        ) : teawareRows.length === 0 ? (
          <EmptyHit query={q} />
        ) : (
          teawareRows.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => onPickTeaware(t.slug, defaultTeawareStatus)}
              className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-cream cursor-pointer border-b border-warm-200 last:border-b-0"
            >
              <div
                className="w-9 h-9 rounded-md shrink-0"
                style={{ background: t.gradient }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="font-display text-burgundy text-[15px] leading-tight truncate">
                  {t.name}
                </div>
                <div className="text-[11px] text-warm-600 truncate">
                  {t.material}
                  {t.volumeMl ? ` · ${t.volumeMl}ml` : ""}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="text-[12px] text-warm-700 bg-transparent border-0 cursor-pointer underline px-2 py-1"
        >
          Cancel
        </button>
      </div>
    </Backdrop>
  );
}

function EmptyHit({ query }: { query: string }) {
  return (
    <div className="px-4 py-6 text-center text-[13px] text-warm-600">
      {query
        ? "No matches — try a different word, or add it as a custom entry."
        : "Everything in our catalog is already in your library."}
    </div>
  );
}

function StatusChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-2.5 py-1 rounded-pill text-[11px] font-bold cursor-pointer border transition-colors",
        active
          ? "border-burgundy bg-burgundy-muted text-burgundy"
          : "border-warm-300 bg-transparent text-forest hover:bg-cream",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

const TEA_TYPES: TeaTypeName[] = [
  "Green",
  "White",
  "Yellow",
  "Oolong",
  "Black",
  "Sheng Pu'er",
  "Shou Pu'er",
  "Dark",
  "Herbal",
];

function CustomTeaModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: {
    status: UserTeaStatus;
    customName: string;
    customVendor?: string;
    customYear?: string;
    customType?: TeaTypeName;
    notes?: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [vendor, setVendor] = useState("");
  const [year, setYear] = useState("");
  const [type, setType] = useState<TeaTypeName | "">("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<UserTeaStatus>("owned");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      status,
      customName: name.trim(),
      ...(vendor.trim() ? { customVendor: vendor.trim() } : {}),
      ...(year.trim() ? { customYear: year.trim() } : {}),
      ...(type ? { customType: type } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });
  };

  return (
    <Backdrop onClose={onClose} ariaLabel="Add a custom tea">
      <Eyebrow>Custom entry</Eyebrow>
      <h2 className="font-display italic text-burgundy font-medium m-0 mt-2 mb-4 text-[24px]">
        Add a tea we don&apos;t catalog
      </h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <FormField label="Name" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 2024 Lao Banzhang"
            required
            className="w-full px-3 py-2 rounded-md border border-warm-300 bg-cream text-[13px]"
          />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Vendor">
            <input
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="e.g. Yunnan Sourcing"
              className="w-full px-3 py-2 rounded-md border border-warm-300 bg-cream text-[13px]"
            />
          </FormField>
          <FormField label="Year / harvest">
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Spring 2024"
              className="w-full px-3 py-2 rounded-md border border-warm-300 bg-cream text-[13px]"
            />
          </FormField>
        </div>
        <FormField label="Type">
          <select
            value={type}
            onChange={(e) => setType((e.target.value || "") as TeaTypeName | "")}
            className="w-full px-3 py-2 rounded-md border border-warm-300 bg-cream text-[13px]"
          >
            <option value="">— Select —</option>
            {TEA_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Notes (optional)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Where you got it, why you saved it, storage history…"
            rows={2}
            className="w-full px-3 py-2 rounded-md border border-warm-300 bg-cream text-[13px] resize-y"
          />
        </FormField>
        <FormField label="Status">
          <div className="flex gap-1.5 flex-wrap">
            {(["wishlist", "owned", "tried", "retired"] as UserTeaStatus[]).map(
              (s) => (
                <StatusChip
                  key={s}
                  active={status === s}
                  onClick={() => setStatus(s)}
                  label={s === "retired" ? "Finished" : s.charAt(0).toUpperCase() + s.slice(1)}
                />
              ),
            )}
          </div>
        </FormField>

        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-[13px] text-warm-700 bg-transparent border-0 cursor-pointer underline px-3 py-2"
          >
            Cancel
          </button>
          <Button variant="primary" size="sm">
            Add to library
          </Button>
        </div>
      </form>
    </Backdrop>
  );
}

function CustomTeawareModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: {
    status: UserTeawareStatus;
    customName: string;
    customMaterial?: string;
    customVolumeMl?: number;
    notes?: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [material, setMaterial] = useState("");
  const [volume, setVolume] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<UserTeawareStatus>("owned");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      status,
      customName: name.trim(),
      ...(material.trim() ? { customMaterial: material.trim() } : {}),
      ...(volume.trim() ? { customVolumeMl: Number(volume) } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });
  };

  return (
    <Backdrop onClose={onClose} ariaLabel="Add a custom vessel">
      <Eyebrow>Custom entry</Eyebrow>
      <h2 className="font-display italic text-burgundy font-medium m-0 mt-2 mb-4 text-[24px]">
        Add a vessel we don&apos;t catalog
      </h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <FormField label="Name" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 60ml zhuni teapot"
            required
            className="w-full px-3 py-2 rounded-md border border-warm-300 bg-cream text-[13px]"
          />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Material">
            <input
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="Yixing zisha"
              className="w-full px-3 py-2 rounded-md border border-warm-300 bg-cream text-[13px]"
            />
          </FormField>
          <FormField label="Volume (ml)">
            <input
              type="number"
              min={0}
              step={5}
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              placeholder="100"
              className="w-full px-3 py-2 rounded-md border border-warm-300 bg-cream text-[13px]"
            />
          </FormField>
        </div>
        <FormField label="Notes (optional)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Where you got it, what you season it for…"
            rows={2}
            className="w-full px-3 py-2 rounded-md border border-warm-300 bg-cream text-[13px] resize-y"
          />
        </FormField>
        <FormField label="Status">
          <div className="flex gap-1.5 flex-wrap">
            {(["wishlist", "owned"] as UserTeawareStatus[]).map((s) => (
              <StatusChip
                key={s}
                active={status === s}
                onClick={() => setStatus(s)}
                label={s.charAt(0).toUpperCase() + s.slice(1)}
              />
            ))}
          </div>
        </FormField>

        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-[13px] text-warm-700 bg-transparent border-0 cursor-pointer underline px-3 py-2"
          >
            Cancel
          </button>
          <Button variant="primary" size="sm">
            Add to library
          </Button>
        </div>
      </form>
    </Backdrop>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-bold text-forest tracking-widest uppercase mb-1">
        {label}
        {required && <span className="text-burgundy ml-1">*</span>}
      </span>
      {children}
    </label>
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
