// =====================================================================
// FLAVOR — axes config + rollup helpers
// =====================================================================
// Mirrors prototype/data.jsx (FLAVOR_AXES + BASIC_AXES) with explicit
// types. Internal representation is always 12-axis, 0-10. The Basic
// editor uses 0-5 and ×2's on save via expandBasicTo10.

import type {
  FlavorAxis,
  BasicAxis,
  FlavorProfile,
  BasicProfile,
  FlavorAxisKey,
  BasicAxisKey,
} from "./types";

// 12 advanced axes — clockwise from top, grouped so similar flavors are adjacent
export const FLAVOR_AXES: readonly FlavorAxis[] = [
  { key: "floral",  label: "Floral",  color: "#D4A5A5" },
  { key: "fruity",  label: "Fruity",  color: "#C47A7A" },
  { key: "sweet",   label: "Sweet",   color: "#D4A07A" },
  { key: "honey",   label: "Honey",   color: "#D4A94C" },
  { key: "nutty",   label: "Nutty",   color: "#A68B5B" },
  { key: "roasted", label: "Roasted", color: "#5C4033" },
  { key: "woody",   label: "Woody",   color: "#6B4E3D" },
  { key: "earthy",  label: "Earthy",  color: "#8B7355" },
  { key: "mineral", label: "Mineral", color: "#8A9BA8" },
  { key: "marine",  label: "Marine",  color: "#5A8A9A" },
  { key: "vegetal", label: "Vegetal", color: "#7A9A6D" },
  { key: "spicy",   label: "Spicy",   color: "#A65D57" },
] as const;

// 6 basic axes — each rolls up two adjacent advanced axes
export const BASIC_AXES: readonly BasicAxis[] = [
  {
    key: "floral", label: "Floral", color: "#C47A7A",
    members: ["floral", "fruity"],
    lay: "Flowers, fruit, perfume — bright top notes.",
  },
  {
    key: "sweet", label: "Sweet", color: "#D4A94C",
    members: ["sweet", "honey"],
    lay: "Honey, sugar, caramel, malt — sweetness-driven.",
  },
  {
    key: "roasted", label: "Roasted", color: "#5C4033",
    members: ["nutty", "roasted"],
    lay: "Nuts, toasted bread, roasted notes.",
  },
  {
    key: "earthy", label: "Earthy", color: "#8B7355",
    members: ["woody", "earthy"],
    lay: "Wood, soil, forest floor — dark and grounding.",
  },
  {
    key: "mineral", label: "Mineral", color: "#8A9BA8",
    members: ["mineral", "marine"],
    lay: "Wet stone, sea breeze — cool and savory.",
  },
  {
    key: "herbal", label: "Herbal", color: "#7A9A6D",
    members: ["vegetal", "spicy"],
    lay: "Fresh grass, herbs, gentle spice — green and lively.",
  },
] as const;

/** Roll up an Advanced (12-axis, 0-10) profile into a Basic (6-axis, 0-10). */
export function rollUpProfile(advanced: FlavorProfile): BasicProfile {
  const out = {} as BasicProfile;
  for (const ax of BASIC_AXES) {
    let sum = 0;
    for (const k of ax.members) sum += advanced[k] ?? 0;
    out[ax.key as BasicAxisKey] = sum / ax.members.length;
  }
  return out;
}

/**
 * Expand a Basic (6-axis, 0-5) editor input into a 12-axis, 0-10 profile.
 * Each constituent advanced axis takes the basic value × 2.
 */
export function expandBasicTo10(basic5: Partial<BasicProfile>): FlavorProfile {
  const out = {} as Record<FlavorAxisKey, number>;
  for (const ax of BASIC_AXES) {
    const v10 = (basic5[ax.key as BasicAxisKey] ?? 0) * 2;
    for (const k of ax.members) out[k] = v10;
  }
  for (const a of FLAVOR_AXES) if (!(a.key in out)) out[a.key] = 0;
  return out as FlavorProfile;
}

/** Build a profile from a 12-position array (used by the data file). */
export function profileFromArray(values: number[]): FlavorProfile {
  const out = {} as FlavorProfile;
  FLAVOR_AXES.forEach((ax, i) => {
    out[ax.key] = values[i] ?? 0;
  });
  return out;
}

/** Top-N dominant flavors above a threshold, for "top notes" badges */
export function topFlavors(
  profile: FlavorProfile | BasicProfile,
  axes: readonly { key: string; label: string; color: string }[] = FLAVOR_AXES,
  limit = 4,
  threshold = 4,
): typeof axes {
  return [...axes]
    .sort(
      (a, b) =>
        (profile as Record<string, number>)[b.key] -
        (profile as Record<string, number>)[a.key],
    )
    .slice(0, limit)
    .filter(
      (a) => (profile as Record<string, number>)[a.key] >= threshold,
    );
}
