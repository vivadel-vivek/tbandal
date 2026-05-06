"use client";

import { useState } from "react";

// Tiny client island: a "copy link to this entry" icon button.
//
// Replaces the prior `<a href="#slug">#</a>` anchor that scrolled the
// page on click. That behavior was redundant — the user is already
// viewing the entry — and didn't give them anything to share. This
// button writes `${origin}/discover/glossary#${slug}` to the clipboard
// and shows a 2-second confirmation, so the user can paste a deep link
// into a chat or note. Cross-references (See-also chips) still
// navigate, which is the expected behavior for those.

export function CopyAnchorButton({
  slug,
  term,
}: {
  slug: string;
  term: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/discover/glossary#${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback: select the URL in a hidden textarea so the user can
      // copy manually. Quietly no-op if even that's blocked.
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.setAttribute("aria-hidden", "true");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        /* no-op */
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={
        copied ? `Link to ${term} copied` : `Copy link to ${term}`
      }
      title={copied ? "Copied!" : "Copy link"}
      className="ml-auto inline-flex items-center justify-center w-9 h-9 rounded-full text-warm-600 hover:text-burgundy hover:bg-cream cursor-pointer transition-colors"
    >
      {copied ? (
        // Check icon — appears for ~2s after a successful copy.
        <svg
          aria-hidden
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 8.5 L6.5 12 L13 4.5" />
        </svg>
      ) : (
        // Chain-link icon (two oblong loops). Visually distinct from the
        // navigation arrows we use elsewhere — reads as "link" not "go".
        <svg
          aria-hidden
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6.5 9.5 a3 3 0 0 1 0-4 l1.5-1.5 a3 3 0 0 1 4 4 l-1 1" />
          <path d="M9.5 6.5 a3 3 0 0 1 0 4 l-1.5 1.5 a3 3 0 0 1 -4 -4 l1 -1" />
        </svg>
      )}
    </button>
  );
}
