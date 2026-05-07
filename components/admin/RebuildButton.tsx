"use client";

import { useState, useTransition } from "react";
import { triggerRebuild } from "@/app/admin/contributor/actions";

export function RebuildButton() {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const onClick = () => {
    setStatus(null);
    startTransition(async () => {
      const result = await triggerRebuild();
      setStatus(result);
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="w-full px-4 py-2 rounded-pill bg-burgundy text-cream font-sans font-bold text-[12px] tracking-widest uppercase hover:bg-burgundy-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Triggering…" : "Trigger rebuild"}
      </button>
      {status && (
        <div
          className={[
            "mt-2 text-[11px] leading-snug",
            status.ok ? "text-forest" : "text-burgundy",
          ].join(" ")}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
