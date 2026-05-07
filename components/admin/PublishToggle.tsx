"use client";

import { useState, useTransition } from "react";
import { setPublished } from "@/app/admin/contributor/actions";

type Table = "teas" | "vendors" | "posts" | "teaware";

export function PublishToggle({
  table,
  slug,
  published: initial,
}: {
  table: Table;
  slug: string;
  published: boolean;
}) {
  const [published, setPublishedState] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onToggle = () => {
    const next = !published;
    setError(null);
    // Optimistic — flip the UI immediately, roll back on error.
    setPublishedState(next);
    startTransition(async () => {
      const result = await setPublished({ table, slug, published: next });
      if (!result.ok) {
        setPublishedState(!next);
        setError(result.message ?? "Update failed");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        aria-pressed={published}
        className={[
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[10px] font-bold tracking-widest uppercase border transition-colors",
          published
            ? "bg-sage-soft border-sage text-forest"
            : "bg-warm-100 border-warm-300 text-warm-600",
          pending ? "opacity-60 cursor-wait" : "cursor-pointer",
        ].join(" ")}
      >
        <span
          aria-hidden
          className={[
            "w-1.5 h-1.5 rounded-full",
            published ? "bg-forest" : "bg-warm-400",
          ].join(" ")}
        />
        {published ? "Published" : "Draft"}
      </button>
      {error && <span className="text-[11px] text-burgundy">{error}</span>}
    </div>
  );
}
