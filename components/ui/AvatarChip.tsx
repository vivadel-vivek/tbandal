import Image from "next/image";
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

// Identity avatar for the signed-in user. Three rendering paths:
//
//   1. `imageUrl` set: render the actual photo. Any signed-in user
//      with a profile.avatar_url lands here.
//   2. No photo, name available: render the first letter of the
//      display name on the palate-aligned colour. Letter is the
//      identity signal; colour is the brand-tone hint.
//   3. No name: fall back to the email initial, or "?" for guests.
//
// Distinct from AvatarChip, which is the *contributor brand badge*
// (always the literal "J" or "V" in burgundy/sage) — that's used on
// review bylines where the contributor IS the subject.
export function IdentityAvatar({
  name,
  email,
  imageUrl,
  tone,
  size = 28,
  className = "",
}: {
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  tone: ContributorKey;
  size?: number;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <span
        aria-hidden
        className={`relative inline-block rounded-full overflow-hidden shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes={`${size}px`}
          style={{ objectFit: "cover" }}
        />
      </span>
    );
  }
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
