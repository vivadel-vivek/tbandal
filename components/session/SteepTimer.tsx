"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Inline tap-to-start / tap-to-stop count-up timer for a single steep.
 *
 * Why this exists: the experienced-drinker audit pointed out that the
 * Time field is a notebook, not a logger. With wet hands at the kettle,
 * a one-tap timer that writes its result into the field is the
 * difference between "I'll log this later" and "I logged this now".
 *
 * Behavior:
 *   - First tap: start counting from 0 (or resume).
 *   - Second tap: stop, format elapsed as "{n}s" or "{m}m{s}s" and
 *     write into the parent's time field via onCommit.
 *   - Long-press / right-click → reset to 00:00 without committing.
 *
 * The timer is local (no Web Worker, no setInterval drift correction
 * beyond rAF) — for steeps under 5 minutes the drift is sub-second.
 */
export function SteepTimer({
  onCommit,
  className = "",
}: {
  /** Called with a freeform string ("10s" or "2m15s") on stop. */
  onCommit: (formatted: string) => void;
  className?: string;
}) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // ms
  const startedAt = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (startedAt.current === null) return;
      setElapsed(Date.now() - startedAt.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [running]);

  const handleClick = () => {
    if (running) {
      // Stop + commit.
      const totalSec = Math.round(elapsed / 1000);
      const formatted =
        totalSec >= 60
          ? `${Math.floor(totalSec / 60)}m${totalSec % 60}s`
          : `${totalSec}s`;
      onCommit(formatted);
      setRunning(false);
      startedAt.current = null;
      // Keep the elapsed visible briefly; user can tap again to restart
      // (which re-zeroes via the start branch below).
    } else {
      startedAt.current = Date.now();
      setElapsed(0);
      setRunning(true);
    }
  };

  const handleReset = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    setRunning(false);
    startedAt.current = null;
    setElapsed(0);
  };

  const totalSec = Math.floor(elapsed / 1000);
  const display =
    totalSec >= 60
      ? `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, "0")}`
      : `0:${String(totalSec).padStart(2, "0")}`;

  return (
    <button
      type="button"
      onClick={handleClick}
      onContextMenu={handleReset}
      aria-label={
        running
          ? `Stop timer at ${display} and record`
          : elapsed > 0
            ? `Restart timer (currently ${display})`
            : "Start timer"
      }
      className={[
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-pill border font-mono text-[11px] font-bold cursor-pointer transition-colors",
        running
          ? "bg-burgundy text-cream border-burgundy"
          : elapsed > 0
            ? "bg-gold-muted text-burgundy border-gold-dark"
            : "bg-cream text-forest border-warm-300 hover:bg-warm-100",
        className,
      ].join(" ")}
    >
      <span
        aria-hidden
        className={[
          "inline-block w-2 h-2 rounded-full",
          running ? "bg-cream animate-pulse" : "bg-current opacity-60",
        ].join(" ")}
      />
      {running ? display : elapsed > 0 ? `↻ ${display}` : "⏱ Start"}
    </button>
  );
}
