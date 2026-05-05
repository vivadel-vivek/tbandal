import type { CSSProperties } from "react";

type Props = {
  size?: number;
  color?: string;
  opacity?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Decorative tea-ring SVG used as a soft accent on hero sections.
 * Positioned absolutely by the parent — pass className for placement.
 */
export function TeaStain({
  size = 200,
  color = "#C4A35A",
  opacity = 0.18,
  className = "",
  style,
}: Props) {
  // Per-instance gradient id so multiple stains on a page don't collide
  const id = `stain-${color.replace(/[^a-z0-9]/gi, "")}-${Math.round(opacity * 100)}`;
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      aria-hidden
      className={`block ${className}`}
      style={style}
    >
      <defs>
        <radialGradient id={id} cx="0.5" cy="0.45" r="0.5">
          <stop offset="0%"   stopColor={color} stopOpacity={opacity * 0.4} />
          <stop offset="60%"  stopColor={color} stopOpacity={opacity * 0.95} />
          <stop offset="92%"  stopColor={color} stopOpacity={opacity * 0.6} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path
        d="M 100,15 C 142,10 175,40 180,82 C 188,125 165,170 122,182 C 78,193 32,178 22,135 C 12,92 25,42 60,22 C 78,12 88,17 100,15 Z"
        fill={`url(#${id})`}
      />
      <ellipse
        cx={100} cy={100} rx={72} ry={68}
        fill="none"
        stroke={color}
        strokeOpacity={opacity * 1.4}
        strokeWidth={1.5}
      />
      <ellipse
        cx={105} cy={98} rx={58} ry={52}
        fill="none"
        stroke={color}
        strokeOpacity={opacity * 0.9}
        strokeWidth={0.8}
      />
    </svg>
  );
}
