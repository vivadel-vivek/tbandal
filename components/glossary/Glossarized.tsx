import React from "react";
import Link from "next/link";
import { GLOSSARY } from "@/lib/glossary";

// Flat lookup: lowercased term/alias -> { slug, lay description }.
// Built once at module-init from the GLOSSARY structure. Sorted longest
// first so multi-word terms like "sheng pu'er" beat "sheng" when both
// would match.
type TermHit = { slug: string; lay: string };
const TERM_INDEX: { lc: string; entry: TermHit }[] = [];
for (const section of GLOSSARY) {
  for (const e of section.entries) {
    const variants = [e.term, ...(e.aliases ?? [])];
    for (const v of variants) {
      // Normalise internal whitespace to a single space — the regex
      // matches either ` ` or `-` between words, so we can store one
      // canonical key and look up both "stone fruit" and "stone-fruit".
      const lc = v.toLowerCase().replace(/\s+/g, " ");
      TERM_INDEX.push({ lc, entry: { slug: e.slug, lay: e.lay } });
    }
  }
}
TERM_INDEX.sort((a, b) => b.lc.length - a.lc.length);

// Terms we explicitly DO NOT auto-link inside prose. Either too common
// as English words ("cup", "stone") or read more naturally as plain
// text ("Black tea" as a category mention).
const SKIP_TERMS = new Set<string>([
  "green tea", "black tea", "white tea", "yellow tea",
]);

const escapeRegex = (s: string) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const ELIGIBLE = TERM_INDEX.filter((t) => !SKIP_TERMS.has(t.lc));

// One mega-pattern combining every eligible term. Word boundaries on
// each side keep us from matching mid-word fragments. Spaces inside an
// alias match either ` ` or `-` so "stone fruit" hits "stone-fruit"
// too. Apostrophes work fine because \b sits between word/non-word.
const PATTERN = ELIGIBLE.length > 0
  ? new RegExp(
      `\\b(${ELIGIBLE.map((t) =>
        escapeRegex(t.lc).replace(/\\ /g, "[\\s-]+"),
      ).join("|")})\\b`,
      "gi",
    )
  : null;

function findEntry(matched: string): TermHit | undefined {
  // Normalise the matched substring back to the canonical "spaces only"
  // form before looking up the index.
  const lc = matched.toLowerCase().replace(/[\s-]+/g, " ");
  return ELIGIBLE.find((t) => t.lc === lc)?.entry;
}

/**
 * Wrap any glossary term that appears in `children` with a subtle
 * dotted-underline link to its glossary entry. Hover/focus reveals
 * a styled popover with the lay-language definition; click navigates
 * to the full glossary entry.
 *
 * Accepts either a plain string OR a ReactNode tree. When passed a
 * tree, only string children are walked for term matches — already-
 * rendered elements (links, bold, italic from the Markdown renderer)
 * pass through untouched. This lets renderMarkdown emit React nodes
 * with inline formatting and still get free term tooltips.
 */
export function Glossarized({ children }: { children: React.ReactNode }) {
  if (!PATTERN || children === null || children === undefined) {
    return <>{children}</>;
  }
  return <>{glossarizeNodes(children)}</>;
}

function glossarizeNodes(nodes: React.ReactNode): React.ReactNode {
  if (typeof nodes === "string") return glossarizeString(nodes);
  if (Array.isArray(nodes)) {
    return nodes.map((n, i) => (
      <React.Fragment key={i}>{glossarizeNodes(n)}</React.Fragment>
    ));
  }
  // Already-rendered React elements (Markdown <strong>, <a>, etc.)
  // pass through. We deliberately don't recurse into their children —
  // glossary terms inside an <a href> would create nested anchors.
  return nodes;
}

function glossarizeString(children: string): React.ReactNode {
  if (!PATTERN || !children) return children;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const matches = Array.from(children.matchAll(PATTERN));

  for (const match of matches) {
    const idx = match.index ?? 0;
    const matched = match[0];
    const entry = findEntry(matched);

    if (idx > lastIndex) parts.push(children.slice(lastIndex, idx));

    if (entry) {
      // Hover/focus reveals a styled popover with the lay-language
      // definition; click navigates to the full glossary entry. The
      // popover is pure CSS (group-hover / group-focus-within) so it
      // ships in the static HTML — no client island per term.
      parts.push(
        <span
          key={`${idx}-${entry.slug}`}
          className="group/glossary relative inline-block"
        >
          <Link
            href={`/discover/glossary#${entry.slug}`}
            aria-describedby={`gloss-${entry.slug}-${idx}`}
            className="text-inherit underline decoration-dotted decoration-warm-300 underline-offset-2 hover:decoration-burgundy hover:text-burgundy focus:outline-none focus:decoration-burgundy focus:text-burgundy"
          >
            {matched}
          </Link>
          <span
            role="tooltip"
            id={`gloss-${entry.slug}-${idx}`}
            className={[
              // Position above the term, centered. min-w lets it expand
              // for long definitions; max-w caps at viewport-2rem so it
              // never overflows on mobile.
              "pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+8px)]",
              "w-[min(280px,calc(100vw-2rem))] z-50",
              // Hidden by default; visible on group hover/focus.
              "invisible opacity-0 transition-opacity duration-150",
              "group-hover/glossary:visible group-hover/glossary:opacity-100",
              "group-focus-within/glossary:visible group-focus-within/glossary:opacity-100",
              // Visual chrome — keeps the editorial palette.
              "rounded-lg bg-[var(--bg-elevated)] border border-warm-200 shadow-elevated",
              "px-3 py-2 text-left",
              // Reset inherited italic/serif from prose contexts.
              "not-italic font-sans text-[12px] leading-snug text-warm-700",
              "whitespace-normal",
            ].join(" ")}
          >
            <span className="block font-bold text-burgundy text-[11px] tracking-wide mb-0.5">
              {matched}
            </span>
            {entry.lay}
            <span
              aria-hidden
              className="block mt-1.5 text-[10px] tracking-widest uppercase font-bold text-warm-600"
            >
              Tap for full entry →
            </span>
          </span>
        </span>,
      );
    } else {
      parts.push(matched);
    }

    lastIndex = idx + matched.length;
  }

  if (lastIndex < children.length) {
    parts.push(children.slice(lastIndex));
  }

  return <>{parts}</>;
}
