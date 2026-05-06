import type { RadarStyle } from "@/lib/types";
import { FLAVOR_AXES } from "@/lib/flavor";

type AxisLike = { key: string; label: string; color: string };
type Profile = Record<string, number>;

export type RadarProfile = {
  values: Profile;
  color: string;
  /** Shown only when the parent renders its own legend */
  label?: string;
};

type Props = {
  profiles: RadarProfile[];
  /** Defaults to the 12 advanced axes */
  axes?: readonly AxisLike[];
  size?: number;
  style?: RadarStyle;
  showLabels?: boolean;
  showGrid?: boolean;
};

/**
 * Polygonal radar chart. Stateless / SSR-safe — renders pure SVG.
 * Values are 0–10 across each axis. Pass `axes={BASIC_AXES}` for the
 * 6-axis basic radar; default is the 12-axis advanced radar.
 */
export function RadarChart({
  profiles,
  axes = FLAVOR_AXES,
  size = 360,
  style = "fill",
  showLabels = true,
  showGrid = true,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  // Tighter label margin for the simpler 6-axis basic radar
  const labelPad = axes.length <= 6 ? 38 : 50;
  const r = size / 2 - (showLabels ? labelPad : 16);
  const N = axes.length;
  const angle = (i: number) => (Math.PI * 2 * i) / N - Math.PI / 2;
  const point = (i: number, val: number): [number, number] => {
    const a = angle(i);
    const rad = (val / 10) * r;
    return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
  };
  const polygonPath = (vals: Profile) =>
    axes
      .map((ax, i) => {
        const [x, y] = point(i, vals[ax.key] ?? 0);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ") + " Z";

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
      aria-hidden
    >
      {/* Concentric grid rings at 2/4/6/8/10 */}
      {showGrid &&
        [2, 4, 6, 8, 10].map((level) => (
          <polygon
            key={level}
            points={axes.map((_, i) => point(i, level).join(",")).join(" ")}
            fill="none"
            stroke="var(--warm-200, #D4D0CC)"
            strokeWidth={level === 10 ? 1 : 0.6}
            strokeDasharray={level === 10 ? "" : "2,3"}
            opacity={level === 10 ? 0.8 : 0.5}
          />
        ))}

      {/* Spokes */}
      {showGrid &&
        axes.map((_, i) => {
          const [x, y] = point(i, 10);
          return (
            <line
              key={i}
              x1={cx} y1={cy} x2={x} y2={y}
              stroke="var(--warm-200, #D4D0CC)"
              strokeWidth={0.5}
              opacity={0.5}
            />
          );
        })}

      {/* Profile shapes (back-to-front so first profile reads on top) */}
      {profiles.map((prof, idx) => {
        const path = polygonPath(prof.values);
        const color = prof.color;
        if (style === "outline") {
          return (
            <path
              key={idx}
              d={path}
              fill={color + "10"}
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          );
        }
        if (style === "dotted") {
          return (
            <path
              key={idx}
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeDasharray="3,3"
              strokeLinejoin="round"
            />
          );
        }
        return (
          <path
            key={idx}
            d={path}
            fill={color}
            fillOpacity={0.18}
            stroke={color}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        );
      })}

      {/* Vertex dots for the primary profile */}
      {(() => {
        const primary = profiles[0];
        if (!primary) return null;
        return axes.map((ax, i) => {
          const [x, y] = point(i, primary.values[ax.key] ?? 0);
          return (
            <circle key={i} cx={x} cy={y} r={2.5} fill={primary.color} />
          );
        });
      })()}

      {/* Axis labels — wrapped in SVG <a> so each one links to its
          glossary entry. Lay-user audit asked for definitional access
          on radar terms; advanced + basic axis keys both map 1:1 to
          glossary slugs (floral, fruity, sweet, …). */}
      {showLabels &&
        axes.map((ax, i) => {
          const a = angle(i);
          const rad = r + 22;
          const x = cx + Math.cos(a) * rad;
          const y = cy + Math.sin(a) * rad;
          const dotX = cx + Math.cos(a) * (r + 8);
          const dotY = cy + Math.sin(a) * (r + 8);
          const align =
            Math.cos(a) > 0.3 ? "start" : Math.cos(a) < -0.3 ? "end" : "middle";
          const fontSize = axes.length <= 6 ? 11 : 10;
          return (
            <a
              key={ax.key}
              href={`/discover/glossary#${ax.key}`}
              aria-label={`${ax.label} — open glossary entry`}
            >
              <title>{`${ax.label} — see glossary`}</title>
              <circle cx={dotX} cy={dotY} r={3} fill={ax.color} opacity={0.7} />
              <text
                x={x}
                y={y}
                textAnchor={align}
                dominantBaseline="middle"
                fontFamily="var(--font-sans)"
                fontSize={fontSize}
                fontWeight={600}
                fill="var(--forest, #2D3A2E)"
                letterSpacing={0.3}
                style={{ textTransform: "uppercase", cursor: "pointer" }}
              >
                {ax.label}
              </text>
            </a>
          );
        })}
    </svg>
  );
}
