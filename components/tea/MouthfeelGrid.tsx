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

/**
 * Cartesian mouthfeel grid:
 *   x: 0 (oily) ↔ 10 (astringent)
 *   y: 0 (light) ↔ 10 (full bodied)
 * Wider canvas than the radar — used inline next to the brewing notes.
 */
export function MouthfeelGrid({ point, points, size = 260 }: Props) {
  const ptArr: GridPoint[] = point
    ? [{ ...point, color: "var(--burgundy, #722F37)", label: "" }]
    : (points ?? []);

  const pad = 36;
  const inner = size - pad * 2;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      aria-hidden
    >
      <rect
        x={pad}
        y={pad}
        width={inner}
        height={inner}
        fill="none"
        stroke="var(--warm-200, #D4D0CC)"
        strokeWidth={1}
      />

      {[0.25, 0.5, 0.75].map((f, i) => (
        <g
          key={i}
          stroke="var(--warm-200, #D4D0CC)"
          strokeWidth={0.5}
          strokeDasharray="2,3"
          opacity={0.7}
        >
          <line
            x1={pad + inner * f}
            y1={pad}
            x2={pad + inner * f}
            y2={pad + inner}
          />
          <line
            x1={pad}
            y1={pad + inner * f}
            x2={pad + inner}
            y2={pad + inner * f}
          />
        </g>
      ))}

      <text
        x={pad}
        y={pad - 12}
        fontFamily="var(--font-sans)"
        fontSize={9}
        fontWeight={700}
        fill="var(--warm-600, #6B6560)"
        letterSpacing="0.14em"
        style={{ textTransform: "uppercase" }}
      >
        Light
      </text>
      <text
        x={pad + inner}
        y={pad - 12}
        textAnchor="end"
        fontFamily="var(--font-sans)"
        fontSize={9}
        fontWeight={700}
        fill="var(--warm-600, #6B6560)"
        letterSpacing="0.14em"
        style={{ textTransform: "uppercase" }}
      >
        Full bodied
      </text>
      <text
        x={pad - 8}
        y={pad + inner + 18}
        textAnchor="end"
        fontFamily="var(--font-sans)"
        fontSize={9}
        fontWeight={700}
        fill="var(--warm-600, #6B6560)"
        letterSpacing="0.14em"
        style={{ textTransform: "uppercase" }}
      >
        Oily
      </text>
      <text
        x={pad + inner + 8}
        y={pad + inner + 18}
        fontFamily="var(--font-sans)"
        fontSize={9}
        fontWeight={700}
        fill="var(--warm-600, #6B6560)"
        letterSpacing="0.14em"
        style={{ textTransform: "uppercase" }}
      >
        Astringent
      </text>

      {/* Center hairlines */}
      <line
        x1={pad + inner / 2} y1={pad}
        x2={pad + inner / 2} y2={pad + inner}
        stroke="var(--warm-300, #B5B0AA)"
        strokeWidth={0.4}
      />
      <line
        x1={pad} y1={pad + inner / 2}
        x2={pad + inner} y2={pad + inner / 2}
        stroke="var(--warm-300, #B5B0AA)"
        strokeWidth={0.4}
      />

      {ptArr.map((p, i) => {
        const x = pad + (p.astringent / 10) * inner;
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
