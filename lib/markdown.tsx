// Lightweight Markdown renderer for editorial body prose. Handles the
// subset our editors actually use:
//   - Paragraphs (split on \n\n+)
//   - ## h2 / ### h3 headings
//   - > blockquotes
//   - - / 1. lists
//   - **bold**, *italic*, `code`, [text](url) inline
//
// Emits React nodes (not raw HTML strings) so each paragraph can be
// wrapped in <Glossarized> for term tooltips. Renderer is purely
// server-safe — pure functions, no hooks, no dynamic state.
//
// We deliberately don't pull in `marked` or `react-markdown`: this
// surface is small (≤ a dozen post bodies), the bundle hit isn't
// worth it, and a hand-rolled walker keeps Glossarized integration
// straightforward (third-party libs that emit raw HTML defeat the
// term-tooltip layer).

import React from "react";
import { Glossarized } from "@/components/glossary/Glossarized";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Parse inline syntax in a single line of text. Walks the string
// once and emits an array of strings + React elements for **bold**,
// *italic*, `code`, and [text](url).
//
// Order of operations matters: code spans win first (so backticked
// text isn't reinterpreted), then links, then bold (** before *)
// because greedy *italic* would consume the inner asterisks of bold.
function renderInline(text: string): React.ReactNode {
  if (!text) return "";

  // Token shape — each chunk is either a literal string or an
  // already-rendered React element. We rebuild the tree by repeatedly
  // splitting on the next syntax token.
  let nodes: React.ReactNode[] = [text];

  // Apply patterns in priority order. Each transform takes string
  // chunks and replaces them with [pre, element, post] tuples,
  // leaving non-string chunks untouched.
  const patterns: { regex: RegExp; render: (m: RegExpMatchArray, key: number) => React.ReactElement }[] = [
    {
      // Inline code — `text` (no nesting allowed inside).
      regex: /`([^`]+)`/g,
      render: (m, key) => (
        <code key={key} className="font-mono text-[0.92em] bg-warm-100 px-1 py-px rounded">
          {m[1]}
        </code>
      ),
    },
    {
      // [text](url) — anchor. External URLs open in a new tab; in-site
      // links stay in tab. Trusted-but-rel-safe defaults.
      regex: /\[([^\]]+)\]\(([^)]+)\)/g,
      render: (m, key) => {
        const url = m[2] ?? "#";
        const isExternal = /^https?:\/\//i.test(url);
        return (
          <a
            key={key}
            href={url}
            {...(isExternal
              ? { target: "_blank", rel: "noopener nofollow" }
              : {})}
            className="text-burgundy underline decoration-1 underline-offset-2 hover:decoration-2"
          >
            {m[1]}
          </a>
        );
      },
    },
    {
      // **bold** — must come before *italic* so the inner asterisks
      // of bold don't get interpreted.
      regex: /\*\*([^*]+)\*\*/g,
      render: (m, key) => <strong key={key}>{m[1]}</strong>,
    },
    {
      // *italic*. Single asterisk, non-greedy.
      regex: /\*([^*]+)\*/g,
      render: (m, key) => <em key={key}>{m[1]}</em>,
    },
  ];

  let keyCounter = 0;
  for (const { regex, render } of patterns) {
    const next: React.ReactNode[] = [];
    for (const node of nodes) {
      if (typeof node !== "string") {
        next.push(node);
        continue;
      }
      // Walk through matches, slicing strings + inserting elements.
      let lastIdx = 0;
      const re = new RegExp(regex.source, regex.flags); // fresh state
      let m: RegExpExecArray | null;
      while ((m = re.exec(node)) !== null) {
        if (m.index > lastIdx) next.push(node.slice(lastIdx, m.index));
        next.push(render(m, keyCounter++));
        lastIdx = m.index + m[0].length;
      }
      if (lastIdx < node.length) next.push(node.slice(lastIdx));
    }
    nodes = next;
  }

  return <>{nodes.map((n, i) => <React.Fragment key={i}>{n}</React.Fragment>)}</>;
}

// Render a single block (one or more lines separated by single \n,
// already split off from neighbours by \n\n+). Recognizes:
//   ## ... → h2
//   ### ... → h3
//   > ... → blockquote (multi-line; consecutive `> ` lines join)
//   - ... or 1. ... → list (multi-line; one item per line)
//   anything else → paragraph
function renderBlock(block: string, key: React.Key): React.ReactElement {
  if (block.startsWith("## ")) {
    return (
      <h2
        key={key}
        className="font-display text-burgundy font-medium tracking-tight m-0 mt-9 mb-4 text-hero-md"
      >
        {renderInline(block.slice(3).trim())}
      </h2>
    );
  }
  if (block.startsWith("### ")) {
    return (
      <h3
        key={key}
        className="font-display text-burgundy font-medium tracking-tight m-0 mt-7 mb-3 text-[20px]"
      >
        {renderInline(block.slice(4).trim())}
      </h3>
    );
  }
  if (block.startsWith("> ")) {
    const text = block
      .split("\n")
      .map((l) => l.replace(/^>\s?/, ""))
      .join(" ")
      .trim();
    return (
      <blockquote
        key={key}
        className="border-l-2 border-gold pl-4 italic text-warm-700 my-5"
      >
        <Glossarized>{renderInline(text)}</Glossarized>
      </blockquote>
    );
  }
  // Lists — leading `-` or `1.` on every non-blank line.
  const looksLikeList = /^(\s*-\s+|\s*\d+\.\s+)/.test(block);
  if (looksLikeList) {
    const lines = block.split("\n").filter((l) => l.trim());
    const isOrdered = /^\s*\d+\.\s+/.test(lines[0] ?? "");
    const items = lines.map((l) => l.replace(/^(\s*-\s+|\s*\d+\.\s+)/, ""));
    if (isOrdered) {
      return (
        <ol
          key={key}
          className="list-decimal pl-6 my-4 space-y-1.5 marker:text-warm-600"
        >
          {items.map((it, j) => (
            <li key={j}>
              <Glossarized>{renderInline(it)}</Glossarized>
            </li>
          ))}
        </ol>
      );
    }
    return (
      <ul
        key={key}
        className="list-disc pl-6 my-4 space-y-1.5 marker:text-warm-600"
      >
        {items.map((it, j) => (
          <li key={j}>
            <Glossarized>{renderInline(it)}</Glossarized>
          </li>
        ))}
      </ul>
    );
  }
  // Default — paragraph.
  return (
    <p key={key} className="mb-5">
      <Glossarized>{renderInline(block)}</Glossarized>
    </p>
  );
}

/** Render INLINE Markdown only — bold/italic/code/links — without
 *  paragraph or heading wrappers. Use for short prose like the tea
 *  hero summary that already lives inside its own styled <p>. */
export function renderInlineMarkdown(text: string | null | undefined): React.ReactNode {
  if (!text) return null;
  return renderInline(text);
}

/** Render Markdown body text into a React tree. Pass the result
 *  inside whatever wrapper sets your prose font/size; this returns
 *  the raw block-level nodes. */
export function renderMarkdown(text: string | null | undefined): React.ReactNode {
  if (!text) return null;
  const blocks = text.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block, i) => renderBlock(block, i));
}

/** Strip Markdown syntax to plain text — useful for SEO descriptions,
 *  metadata, and card previews where formatting characters would
 *  show through. */
export function stripMarkdown(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^(\s*-\s+|\s*\d+\.\s+)/gm, "")
    .replace(/\n+/g, " ")
    .trim();
}
