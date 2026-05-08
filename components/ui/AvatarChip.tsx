import { CONTRIBUTOR_STYLE } from "@/lib/contributor-style";
import type { ContributorKey } from "@/lib/types";

type Props = {
  who: ContributorKey;
  size?: number;
  className?: string;
};

export function AvatarChip({ who, size = 28, className = "" }: Props) {
  const c = CONTRIBUTOR_STYLE[who];
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

// Identity avatar for the signed-in user. Initial comes from name (or
// email fallback); the colour tone follows palate alignment so the
// chip still reads as "James-aligned" or "Vivek-aligned" without
// claiming the user IS one of the contributors. Distinct from
// AvatarChip, which is the contributor brand badge (always J / V).
export function IdentityAvatar({
  name,
  email,
  tone,
  size = 28,
  className = "",
}: {
  name?: string | null;
  email?: string | null;
  tone: ContributorKey;
  size?: number;
  className?: string;
}) {
  const initial = (name?.trim()?.[0] ?? email?.trim()?.[0] ?? "?").toUpperCase();
  const c = CONTRIBUTOR_STYLE[tone];
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
      {initial}
    </span>
  );
}
