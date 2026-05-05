import type { ReactNode } from "react";
import Link from "next/link";
import { Eyebrow } from "./Eyebrow";

type Props = {
  eyebrow: ReactNode;
  title: ReactNode;
  /** Optional right-aligned link, e.g. "See all →" */
  link?: ReactNode;
  href?: string;
  /** Or pass a click handler instead of href */
  onClick?: () => void;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  link,
  href,
  onClick,
  className = "",
}: Props) {
  const linkContent = link ? (
    <span className="text-[13px] font-bold text-burgundy tracking-wide">
      {link}
    </span>
  ) : null;

  return (
    <div
      className={`flex justify-between items-end mb-7 pb-4 border-b border-warm-200 ${className}`}
    >
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="font-display text-[36px] text-forest font-medium tracking-tight m-0 mt-1.5">
          {title}
        </h2>
      </div>
      {linkContent &&
        (href ? (
          <Link href={href} className="no-underline">
            {linkContent}
          </Link>
        ) : (
          <button
            onClick={onClick}
            className="bg-transparent border-0 cursor-pointer p-0"
          >
            {linkContent}
          </button>
        ))}
    </div>
  );
}
