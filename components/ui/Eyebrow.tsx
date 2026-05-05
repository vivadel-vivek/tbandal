import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Color override (defaults to gold-dark, the editorial accent) */
  color?: string;
  className?: string;
  style?: CSSProperties;
  as?: "span" | "div" | "p";
};

/**
 * The little tracked-out caps label that introduces every section /
 * card / form group in the site. Lowercased "eyebrow" because we set
 * the source text to whatever case feels right and the CSS uppercases.
 */
export function Eyebrow({
  children,
  color = "var(--gold-dark, #A68B3D)",
  className = "",
  style,
  as: Tag = "span",
}: Props) {
  return (
    <Tag
      className={`font-sans text-[11px] tracking-widest uppercase font-bold ${className}`}
      style={{ color, ...style }}
    >
      {children}
    </Tag>
  );
}
