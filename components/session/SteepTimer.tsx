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
 * Behavior (post-re-audit):
 *   - Primary tap (44px target): start counting from 0; second tap
 *     stops, formats elapsed as "{n}s" or "{m}m{s}s", and commits to
 *     the parent's time field via onCommit.
 *   - Visible "↺" reset button appears once the timer is running or
 *     has a captured value — drops elapsed back to 0 without committing.
 *     Right-click on the main button still works on desktop.
 *
 * Tab-backgrounded resilience: setInterval at 250ms instead of rAF,
 * because rAF stops ticking when the tab loses focus and the display
 * would freeze mid-steep on a phone in your pocket. Elapsed is always
 * computed from Date.now() so the displayed value is accurate when the
 * tab returns even if intermediate ticks were missed.
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resync display whenever the tab becomes visible again.
  useEffect(() => {
    const onVis = () => {
      if (running && startedAt.current !== null) {
        setElapsed(Date.now() - startedAt.current);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [running]);

  // setInterval (not rAF) so the display keeps updating when the tab
  // is backgrounded — phones lock-screen often, kettle counters can't
  // pause while the user pours.
  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (startedAt.current === null) return;
      setElapsed(Date.now() - startedAt.current);
    };
    intervalRef.current = setInterval(tick, 250);
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [running]);

  const handleStartStop = () => {
    if (running) {
      const totalSec = Math.round(elapsed / 1000);
      const formatted =
        totalSec >= 60
          ? `${Math.floor(totalSec / 60)}m${totalSec % 60}s`
          : `${totalSec}s`;
      onCommit(formatted);
      setRunning(false);
      startedAt.current = null;
    } else {
      startedAt.current = Date.now();
      setElapsed(0);
      setRunning(true);
    }
  };

  const handleReset = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setRunning(false);
    startedAt.current = null;
    setElapsed(0);
  };

  const totalSec = Math.floor(elapsed / 1000);
  const display =
    totalSec >= 60
      ? `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, "0")}`
      : `0:${String(totalSec).padStart(2, "0")}`;

  const showReset = running || elapsed > 0;

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleStartStop}
        onContextMenu={(e) => handleReset(e)}
        aria-label={
          running
            ? `Stop timer at ${display} and record`
            : elapsed > 0
              ? `Restart timer (currently ${display})`
              : "Start timer"
        }
        className={[
          // 44px tap target (h-11) — was 28px and flagged in the re-audit.
          "inline-flex items-center gap-1.5 h-11 px-3.5 rounded-pill border font-mono text-[12px] font-bold cursor-pointer transition-colors",
          running
            ? "bg-burgundy text-cream border-burgundy"
            : elapsed > 0
              ? "bg-gold-muted text-burgundy border-gold-dark"
              : "bg-cream text-forest border-warm-300 hover:bg-warm-100",
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
      {showReset && (
        <button
          type="button"
          onClick={() => handleReset()}
          aria-label="Reset timer"
          className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-warm-300 bg-cream text-warm-700 cursor-pointer text-[14px] hover:bg-warm-100"
        >
          ↺
        </button>
      )}
    </span>
  );
}
