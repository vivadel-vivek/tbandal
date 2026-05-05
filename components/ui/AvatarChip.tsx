import { CONTRIBUTORS } from "@/lib/data";
import type { ContributorKey } from "@/lib/types";

type Props = {
  who: ContributorKey;
  size?: number;
  className?: string;
};

export function AvatarChip({ who, size = 28, className = "" }: Props) {
  const c = CONTRIBUTORS[who];
  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center rounded-full text-cream font-display italic font-medium shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: c.color,
        fontSize: size * 0.5,
      }}
    >
      {c.initials}
    </span>
  );
}
