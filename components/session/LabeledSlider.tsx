"use client";

import type { CSSProperties } from "react";

// =====================================================================
// LabeledSlider — a tightly-sized slider row that survives narrow
// containers without overlap.
//
// Layout strategy: a 3-column flex with `flex-shrink-0` on the label
// + value badges and `flex-1 min-w-0` on the slider. The slider shrinks
// to fit whatever space is left; nothing overflows. At very tight widths
// the label can be reduced to its first few characters via the `compact`
// prop and shows a `title` tooltip with the full label.
// =====================================================================

type Props = {
  label: string;
  /** The current value, as displayed (e.g. 4 for "4/5" basic, 7 for "7/10" advanced). */
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Smaller text + tighter spacing for per-steep cards. */
  compact?: boolean;
  /** Color for the slider accent — usually the axis's color. */
  color?: string;
  /** Whether the value badge shows a denominator ("4/5") or just the
   *  number ("4"). Per-steep cards often skip the denominator to save
   *  width. */
  showDenominator?: boolean;
  /** "Lay" hint shown under the slider, italic + small. Optional. */
  hint?: string;
  /** aria-label override; defaults to a sensible composition. */
  ariaLabel?: string;
  onChange: (v: number) => void;
};

export function LabeledSlider({
  label,
  value,
  min,
  max,
  step = 1,
  compact = false,
  color,
  showDenominator = true,
  hint,
  ariaLabel,
  onChange,
}: Props) {
  const labelWidth = compact ? 60 : 70;
  const valueText = showDenominator ? `${value}/${max}` : String(value);
  // Value-badge width sized for the longest representation we'll show
  // ("10/10" = 5 chars × ~7px mono = ~36px; cap there + a little).
  const valueWidth = showDenominator ? 38 : 22;

  const sliderStyle: CSSProperties | undefined = color
    ? { accentColor: color }
    : undefined;

  return (
    <div className={compact ? "" : ""}>
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={`shrink-0 truncate font-bold text-forest ${
            compact ? "text-[10px]" : "text-[11px] sm:text-xs"
          }`}
          style={{ width: labelWidth }}
          title={label}
        >
          {label}
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={
            ariaLabel ??
            `${label} intensity, ${min} to ${max}, currently ${value}`
          }
          // min-w-0 + flex-1 lets the slider shrink instead of pushing
          // its siblings out of the row.
          className="flex-1 min-w-0"
          style={sliderStyle}
        />
        <div
          className={`shrink-0 text-right text-warm-700 font-mono font-semibold ${
            compact ? "text-[10px]" : "text-[11px]"
          }`}
          style={{ width: valueWidth }}
        >
          {valueText}
        </div>
      </div>
      {hint && (
        <div
          className={`text-warm-700 italic leading-snug mt-0.5 ${
            compact ? "text-[9px]" : "text-[10px]"
          }`}
          style={{ marginLeft: labelWidth + 8 }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
