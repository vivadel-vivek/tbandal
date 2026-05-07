// Contributor design tokens — initials + color used by AvatarChip.
// These are branding (the J badge in burgundy, the V in sage) so they
// live in source, separate from the editorial fields (name, bio,
// palate) that come from the contributors table and can be edited via
// the contributor portal.
//
// To onboard a new contributor: add a row in the contributors table
// (display_name, bio, palate, etc.) AND add a styling entry here.

import type { ContributorKey } from "./types";

export const CONTRIBUTOR_STYLE: Record<ContributorKey, { initials: string; color: string }> = {
  james: { initials: "J", color: "#722F37" },
  vivek: { initials: "V", color: "#8B9A7D" },
};
