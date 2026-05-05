import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Color override (defaults to a deep editorial gold that meets
   *  WCAG AA contrast at 11px against parchment / cream backgrounds.
   *  Pass an alternate when laying eyebrows over a dark surface — see
   *  the burgundy vendor banner on tea-detail). */
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
  color = "var(--eyebrow-fg, #7A6428)",
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
