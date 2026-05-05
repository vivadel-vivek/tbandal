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
 * dotted-underline link to its glossary entry. The native `title`
 * attribute gives every browser a hover tooltip with the lay
 * description, which is exactly what the newcomer audit asked for.
 *
 * Use this on natural-language prose only (review bodies, tea summaries,
 * finish chips). Don't wrap headlines or chrome — the linkifying noise
 * is meant for body text where readers will pause on a word.
 */
export function Glossarized({ children }: { children: string }) {
  if (!PATTERN || !children) return <>{children}</>;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  // matchAll returns an iterator; collect into an array via Array.from
  // so the loop doesn't depend on for-of-over-iterator semantics.
  const matches = Array.from(children.matchAll(PATTERN));

  for (const match of matches) {
    const idx = match.index ?? 0;
    const matched = match[0];
    const entry = findEntry(matched);

    if (idx > lastIndex) parts.push(children.slice(lastIndex, idx));

    if (entry) {
      parts.push(
        <Link
          key={`${idx}-${entry.slug}`}
          href={`/discover/glossary#${entry.slug}`}
          title={entry.lay}
          className="text-inherit underline decoration-dotted decoration-warm-300 underline-offset-2 hover:decoration-burgundy hover:text-burgundy"
        >
          {matched}
        </Link>,
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
