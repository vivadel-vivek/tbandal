import Link from "next/link";

// Sticky banner shown above any /preview page so the editor knows
// they're looking at a draft (not the published version) and can
// jump back to the edit form. Server-renderable; no state.

type Props = {
  /** Where the "Edit →" link should point (e.g. /admin/contributor/teas/{slug}). */
  editHref: string;
  /** Status word — usually "Draft" or "Published" (preview path
   *  works for both — useful when checking how a layout change reads
   *  before promoting). */
  status: "Draft" | "Published";
  /** Subject — "Tieguanyin" or "On the second steep". */
  subject: string;
};

export function PreviewBanner({ editHref, status, subject }: Props) {
  return (
    <div
      role="status"
      className="sticky top-0 z-40 w-full bg-burgundy text-cream px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap text-[12px]"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[10px] tracking-widest uppercase font-bold opacity-90">
          Preview
        </span>
        <span aria-hidden className="opacity-50">·</span>
        <span className="truncate">
          <span className="font-bold">{status}</span> · {subject}
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href={editHref}
          className="text-cream font-bold no-underline hover:underline"
        >
          Edit →
        </Link>
      </div>
    </div>
  );
}
