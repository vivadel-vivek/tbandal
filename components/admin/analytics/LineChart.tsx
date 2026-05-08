// Server-renderable line chart. Hand-rolled SVG to keep the bundle
// thin and the editorial colour palette consistent. Used for the
// 30-day page-view + clickout trend.
//
// Inputs:
//   data: ordered points { date: "YYYY-MM-DD", count: number }
//   height: pixel height (width is responsive via viewBox)
//
// We don't draw a Y-axis ruler; the max value is shown inline at the
// top-left as a small caption ("peak: 142") which reads cleanly with
// our editorial typography. Sparse-day labels on the X axis (every
// fifth) keep the chart legible at narrow widths.

import type { DailyPoint } from "@/lib/analytics";

type Props = {
  data: DailyPoint[];
  height?: number;
  /** CSS color for the line + fill. */
  color?: string;
  /** Caption at the top — e.g. "Page views, last 30 days". */
  label?: string;
};

const PADDING = { top: 24, right: 8, bottom: 22, left: 8 };

export function LineChart({
  data,
  height = 160,
  color = "var(--burgundy, #722F37)",
  label,
}: Props) {
  if (data.length === 0) {
    return (
      <div className="text-[12px] text-warm-600 italic py-8 text-center">
        No data yet.
      </div>
    );
  }

  const width = 800; // viewBox width — responsive via max-width:100% below
  const innerW = width - PADDING.left - PADDING.right;
  const innerH = height - PADDING.top - PADDING.bottom;

  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);

  // X scale: evenly distribute points across the inner width.
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
  const x = (i: number) => PADDING.left + i * stepX;
  // Y scale: invert (SVG origin top-left) and pad ~10% headroom.
  const y = (v: number) =>
    PADDING.top + innerH - (v / (max * 1.1)) * innerH;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.count).toFixed(1)}`)
    .join(" ");

  // Filled area under the line — adds visual weight without a thick
  // stroke. Fades opacity from the editorial accent.
  const areaPath =
    `${linePath} L ${x(data.length - 1).toFixed(1)} ${(PADDING.top + innerH).toFixed(1)}` +
    ` L ${x(0).toFixed(1)} ${(PADDING.top + innerH).toFixed(1)} Z`;

  // Sparse x-axis labels (~every fifth day, plus first + last).
  const labelEvery = Math.max(1, Math.floor(data.length / 6));
  const labels = data
    .map((d, i) => ({ d, i }))
    .filter(({ i }) => i === 0 || i === data.length - 1 || i % labelEvery === 0);

  return (
    <div className="relative">
      <div className="flex items-baseline justify-between mb-2">
        {label ? (
          <span className="text-[10px] tracking-widest uppercase font-bold text-warm-600">
            {label}
          </span>
        ) : <span />}
        <span className="text-[12px] text-warm-600 font-mono tabular-nums">
          {total.toLocaleString()} total · peak {max.toLocaleString()}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-auto block"
        role="img"
        aria-label={label ?? "Time series chart"}
      >
        <path d={areaPath} fill={color} fillOpacity="0.08" />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {labels.map(({ d, i }) => (
          <text
            key={i}
            x={x(i)}
            y={height - 6}
            textAnchor={
              i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"
            }
            className="fill-warm-600"
            style={{ fontSize: 10, fontFamily: "var(--font-sans, sans-serif)" }}
          >
            {formatDayLabel(d.date)}
          </text>
        ))}
      </svg>
    </div>
  );
}

function formatDayLabel(iso: string): string {
  // "YYYY-MM-DD" → "May 8"
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
