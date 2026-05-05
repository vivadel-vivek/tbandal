import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Tailwind max-w preset name. Use "site" (default), "article", "narrow", or "prose". */
  size?: "site" | "article" | "narrow" | "prose";
  className?: string;
  style?: CSSProperties;
};

const MAX_W: Record<NonNullable<Props["size"]>, string> = {
  site: "max-w-site",
  article: "max-w-article",
  narrow: "max-w-narrow",
  prose: "max-w-prose",
};

export function Container({
  children,
  size = "site",
  className = "",
  style,
}: Props) {
  return (
    <div
      className={`${MAX_W[size]} mx-auto px-10 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
