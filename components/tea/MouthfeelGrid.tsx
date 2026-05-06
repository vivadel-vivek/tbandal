import type { Mouthfeel } from "@/lib/types";

type GridPoint = Mouthfeel & {
  color?: string;
  label?: string;
};

type Props = {
  /** A single point (the typical case for a tea-detail review) */
  point?: Mouthfeel;
  /** Or pass multiple points for comparison */
  points?: GridPoint[];
  size?: number;
};

// =====================================================================
// MouthfeelGrid — 2D mouthfeel chart.
//
// Axes:
//   x: 0 (oily)        ↔ 10 (astringent)
//   y: 0 (light body)  ↔ 10 (full body)
//
// Visual layout:
//   Axis labels sit at the MIDPOINT of each edge — "Full body" along
//   top, "Light" along bottom, "Oily" rotated up the left side,
//   "Astringent" down the right. This is the change from the prior
//   layout, where labels were stuck in corners and overlapped each
//   other on small canvases (and didn't read as axis-aligned).
//
//   Quadrant labels live INSIDE each quadrant, italic, sommelier-y:
//     top-left    (oily + full)         viscous
//     top-right   (astringent + full)   puckering
//     bottom-left (oily + light)        ephemeral
//     bottom-right(astringent + light)  refreshing
//
//   At small sizes (≤ 180 px) the quadrant labels are suppressed and
//   surfaced via <title> hover tooltips on each quadrant rect to keep
//   the chart legible in cramped per-steep cards.
// =====================================================================

const QUADRANTS = [
  { label: "Viscous",    cx: 0.25, cy: 0.25, hint: "oily + full body" },
  { label: "Puckering",  cx: 0.75, cy: 0.25, hint: "astringent + full body" },
  { label: "Ephemeral",  cx: 0.25, cy: 0.75, hint: "oily + light body" },
  { label: "Refreshing", cx: 0.75, cy: 0.75, hint: "astringent + light body" },
] as const;

export function MouthfeelGrid({ point, points, size = 260 }: Props) {
  const ptArr: GridPoint[] = point
    ? [{ ...point, color: "var(--burgundy, #722F37)", label: "" }]
    : (points ?? []);

  // Pad needs room for the rotated axis labels on left/right and the
  // axis labels stacked above/below the box. 32 is just enough at
  // size 160 without bumping into the inner grid.
  const pad = 32;
  const inner = size - pad * 2;
  const showQuadrantLabels = size >= 200;
  const axisFont = size >= 220 ? 10 : 9;
  const quadFont = size >= 260 ? 12 : 11;

  // Position of each cardinal axis label (centered on its edge).
  const cx = pad + inner / 2;
  const cy = pad + inner / 2;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
      role="img"
      aria-label="Mouthfeel — astringent versus oily on the horizontal axis, light versus full-bodied on the vertical axis"
    >
      {/* Outer chart frame */}
      <rect
        x={pad}
        y={pad}
        width={inner}
        height={inner}
        fill="none"
        stroke="var(--warm-200, #D4D0CC)"
        strokeWidth={1}
      />

      {/* 1/4, 1/2, 3/4 dashed gridlines */}
      {[0.25, 0.5, 0.75].map((f, i) => (
        <g
          key={i}
          stroke="var(--warm-200, #D4D0CC)"
          strokeWidth={0.5}
          strokeDasharray="2,3"
          opacity={0.7}
        >
          <line x1={pad + inner * f} y1={pad} x2={pad + inner * f} y2={pad + inner} />
          <line x1={pad} y1={pad + inner * f} x2={pad + inner} y2={pad + inner * f} />
        </g>
      ))}

      {/* Solid centerlines so axes read clearly */}
      <line
        x1={cx} y1={pad} x2={cx} y2={pad + inner}
        stroke="var(--warm-300, #B5B0AA)" strokeWidth={0.6}
      />
      <line
        x1={pad} y1={cy} x2={pad + inner} y2={cy}
        stroke="var(--warm-300, #B5B0AA)" strokeWidth={0.6}
      />

      {/* Quadrant labels — inside each quadrant, italic display.
          Suppressed at small sizes (still surfaced via <title> below).
          pointer-events:none so they don't intercept hover on the hint
          rects underneath them. */}
      {showQuadrantLabels &&
        QUADRANTS.map((q) => (
          <text
            key={q.label}
            x={pad + inner * q.cx}
            y={pad + inner * q.cy + quadFont / 3}
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontStyle="italic"
            fontSize={quadFont}
            fontWeight={500}
            fill="var(--warm-600, #6B6560)"
            opacity={0.65}
            style={{ pointerEvents: "none" }}
          >
            {q.label}
          </text>
        ))}

      {/* Invisible quadrant rects with <title> tooltips — gives every
          visitor (including the small-size case where labels are hidden)
          a hover description. */}
      {QUADRANTS.map((q) => (
        <rect
          key={`${q.label}-hint`}
          x={pad + (q.cx - 0.25) * inner}
          y={pad + (q.cy - 0.25) * inner}
          width={inner / 2}
          height={inner / 2}
          fill="transparent"
        >
          <title>{`${q.label} — ${q.hint}`}</title>
        </rect>
      ))}

      {/* AXIS LABELS — at the midpoint of each edge.
          Top: FULL BODY. Bottom: LIGHT. Left side (rotated up):
          OILY. Right side (rotated down): ASTRINGENT. */}
      <text
        x={cx}
        y={pad - 10}
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize={axisFont}
        fontWeight={700}
        fill="var(--forest, #2D3A2E)"
        letterSpacing="0.16em"
        style={{ textTransform: "uppercase" }}
      >
        Full body
      </text>
      <text
        x={cx}
        y={pad + inner + 16}
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize={axisFont}
        fontWeight={700}
        fill="var(--forest, #2D3A2E)"
        letterSpacing="0.16em"
        style={{ textTransform: "uppercase" }}
      >
        Light
      </text>
      {/* Left axis label rotated -90° so it reads bottom-to-top up the
          left edge. Centered vertically on the chart. */}
      <text
        x={pad - 12}
        y={cy}
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize={axisFont}
        fontWeight={700}
        fill="var(--forest, #2D3A2E)"
        letterSpacing="0.16em"
        style={{ textTransform: "uppercase" }}
        transform={`rotate(-90, ${pad - 12}, ${cy})`}
      >
        Oily
      </text>
      <text
        x={pad + inner + 12}
        y={cy}
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize={axisFont}
        fontWeight={700}
        fill="var(--forest, #2D3A2E)"
        letterSpacing="0.16em"
        style={{ textTransform: "uppercase" }}
        transform={`rotate(90, ${pad + inner + 12}, ${cy})`}
      >
        Astringent
      </text>

      {/* The actual data points. */}
      {ptArr.map((p, i) => {
        const x = pad + (p.astringent / 10) * inner;
        // Inverted y: high bodyFull = top of chart.
        const y = pad + (1 - p.bodyFull / 10) * inner;
        const color = p.color ?? "var(--burgundy, #722F37)";
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={9} fill={color} opacity={0.18} />
            <circle
              cx={x} cy={y} r={5}
              fill={color}
              stroke="var(--cream, #FAF7F2)"
              strokeWidth={1.5}
            />
            {p.label && (
              <text
                x={x + 10}
                y={y + 3}
                fontFamily="var(--font-sans)"
                fontSize={10}
                fontWeight={700}
                fill={color}
              >
                {p.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
