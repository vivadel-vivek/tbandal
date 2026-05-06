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
  Tea,
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

/**
 * Top-N dominant flavors above a threshold, for the "top notes" badges.
 * Generic so callers passing BASIC_AXES or FLAVOR_AXES get back the
 * same axis type they passed in (preserving label, color, lay, etc.).
 */
export function topFlavors<A extends { key: string; label: string; color: string }>(
  profile: Record<string, number>,
  axes: readonly A[],
  limit = 4,
  threshold = 4,
): A[] {
  return [...axes]
    .sort((a, b) => (profile[b.key] ?? 0) - (profile[a.key] ?? 0))
    .slice(0, limit)
    .filter((a) => (profile[a.key] ?? 0) >= threshold);
}

/**
 * Average of contributors that actually reviewed (drops null reviews),
 * always including the members aggregate. Single source of truth —
 * used by tea detail, similarity ranking, and the recommendation engine.
 */
export function compositeProfile(tea: Tea): FlavorProfile {
  const out = {} as FlavorProfile;
  for (const ax of FLAVOR_AXES) {
    const vals: number[] = [];
    if (tea.reviews.vivek) vals.push(tea.flavor.vivek[ax.key] ?? 0);
    if (tea.reviews.james) vals.push(tea.flavor.james[ax.key] ?? 0);
    vals.push(tea.flavor.members[ax.key] ?? 0);
    out[ax.key] = vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  return out;
}

/**
 * Mean of a list of FlavorProfiles, axis-by-axis. Used by Per-steep
 * sessions to roll the overall flavor up from per-steep entries.
 * Empty input returns a zero profile.
 */
export function meanProfile(profiles: readonly FlavorProfile[]): FlavorProfile {
  const out = {} as FlavorProfile;
  for (const ax of FLAVOR_AXES) out[ax.key] = 0;
  if (profiles.length === 0) return out;
  for (const p of profiles) {
    for (const ax of FLAVOR_AXES) out[ax.key] += p[ax.key] ?? 0;
  }
  for (const ax of FLAVOR_AXES) out[ax.key] /= profiles.length;
  return out;
}

/**
 * Mean of a list of mouthfeel readings. Same pattern as meanProfile —
 * used to roll the session-overall mouthfeel up from per-steep notes.
 */
export function meanMouthfeel(
  values: readonly { astringent: number; bodyFull: number }[],
): { astringent: number; bodyFull: number } {
  if (values.length === 0) return { astringent: 0, bodyFull: 0 };
  let a = 0;
  let b = 0;
  for (const v of values) {
    a += v.astringent;
    b += v.bodyFull;
  }
  return { astringent: a / values.length, bodyFull: b / values.length };
}

/**
 * Jaccard-style overlap between two profiles on the 0–10 scale.
 * Used by recommendations + similar-teas. Returns 0..1.
 */
export function profileOverlap(
  a: Record<string, number>,
  b: Record<string, number>,
  axes: readonly { key: string }[] = FLAVOR_AXES,
): number {
  let intersect = 0;
  let union = 0;
  for (const ax of axes) {
    const va = a[ax.key] ?? 0;
    const vb = b[ax.key] ?? 0;
    intersect += Math.min(va, vb);
    union += Math.max(va, vb);
  }
  return union ? intersect / union : 0;
}
