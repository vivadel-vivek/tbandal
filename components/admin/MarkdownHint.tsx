// Small static hint shown beneath any Markdown-supported textarea so
// editors know which syntax actually renders. Server-renderable.

export function MarkdownHint() {
  return (
    <p className="text-[11px] text-warm-600 leading-snug mt-1.5">
      Markdown supported:{" "}
      <code className="font-mono">**bold**</code>{" · "}
      <code className="font-mono">*italic*</code>{" · "}
      <code className="font-mono">[link](url)</code>{" · "}
      <code className="font-mono">## h2</code>{" · "}
      <code className="font-mono">### h3</code>{" · "}
      <code className="font-mono">{"> "}quote</code>{" · "}
      <code className="font-mono">- list</code>.
      Blank line between paragraphs.
    </p>
  );
}
