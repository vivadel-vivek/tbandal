// Pure helpers over Tea / Post / Teaware shapes. No DB calls — these
// take their inputs as args so client components can import freely.
//
// (Server-side fetchers live in lib/content.ts; consumers that need
// catalog data import from there. This module is the safe one to use
// from client components.)

import type { Tea } from "./types";

/**
 * Average of available critic ratings (Vivek + James), null-safe.
 * Falls back to the members rating if neither critic has reviewed.
 * Treats a 0 rating as "no rating" — newly-seeded teas have
 * rating: 0 placeholders that should not contribute to the average.
 */
export function teaAvg(tea: Tea): number {
  const r = tea.reviews;
  const vals: number[] = [];
  if (r.vivek && typeof r.vivek.rating === "number" && r.vivek.rating > 0) {
    vals.push(r.vivek.rating);
  }
  if (r.james && typeof r.james.rating === "number" && r.james.rating > 0) {
    vals.push(r.james.rating);
  }
  if (
    vals.length === 0 &&
    r.members &&
    typeof r.members.rating === "number" &&
    r.members.rating > 0 &&
    (r.members.count ?? 0) > 0
  ) {
    vals.push(r.members.rating);
  }
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

/**
 * True when no critic and no members rating exists — used to decide
 * whether to render "Not yet rated" placeholders instead of a "0.0/10"
 * which reads as a verdict to newcomers (lay-user audit blocker).
 */
export function teaIsRated(tea: Tea): boolean {
  return teaAvg(tea) > 0;
}

/** Vendor URL slug for a tea — read from the denormalized field. */
export function vendorSlugForTea(tea: Tea): string {
  if (!tea.vendorSlug) {
    throw new Error(`vendorSlugForTea: tea "${tea.slug}" missing vendorSlug`);
  }
  return tea.vendorSlug;
}

/** Canonical URL for a tea page: /tea/[vendor]/[pathSlug]. */
export function teaUrl(tea: Tea): string {
  return `/tea/${vendorSlugForTea(tea)}/${tea.pathSlug}`;
}

// =====================================================================
// Subtitle — newcomer-friendly one-liner under the tea name on cards.
// Editor can override with `tea.subtitle`; otherwise derived from
// type + age + the top two flavor axes. Lay-user audit feedback:
// "Menghai Shen Pu'er Spring 2023" reads as a wall of unknowns
// without a plain-English tag underneath it.
// =====================================================================

const TYPE_LABELS: Record<string, string> = {
  "Green":         "green tea",
  "White":         "white tea",
  "Yellow":        "yellow tea",
  "Oolong":        "oolong",
  "Black":         "black tea",
  "Sheng Pu'er":   "raw pu'er",
  "Shou Pu'er":    "ripe pu'er",
  "Dark":          "dark tea",
  "Herbal":        "herbal infusion",
};

// Friendlier rendering of the 12 advanced flavor axes. "Vegetal" reads
// as "grassy" to a newcomer, "marine" as "savory", etc.
const FLAVOR_NICE: Record<string, string> = {
  floral:  "floral",
  fruity:  "fruity",
  sweet:   "sweet",
  honey:   "honeyed",
  nutty:   "nutty",
  roasted: "roasted",
  woody:   "woody",
  earthy:  "earthy",
  mineral: "mineral",
  marine:  "savory",
  vegetal: "grassy",
  spicy:   "spiced",
};

export function teaSubtitle(tea: Tea): string {
  if (tea.subtitle && tea.subtitle.trim().length > 0) return tea.subtitle;

  // Top 2 flavor axes from members consensus (most representative
  // signal — a single contributor can be idiosyncratic).
  const profile = tea.flavor.members;
  const top = (Object.entries(profile) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => FLAVOR_NICE[k] ?? k);

  // Age qualifier — only mention non-fresh ages, and only if it's a
  // recognizable phrase (skip "fresh", "6 months").
  const ageMatch = tea.age?.match(/(\d+)\s*years?/i);
  const ageQualifier = ageMatch ? `${ageMatch[1]}-year` : "";

  const typeLabel = TYPE_LABELS[tea.type] ?? tea.type.toLowerCase();
  // "aged" flag wins over the bare year count — an aged white reads
  // very differently from a 5-year-young white. Editor sets it.
  const agedPrefix = tea.aged ? "aged " : "";
  const headTail = ageQualifier && !tea.aged
    ? `${ageQualifier} ${typeLabel}`
    : `${agedPrefix}${typeLabel}`;
  // Subtype goes in front as a leading designator: "Bingdao · raw pu'er"
  const prefix = tea.subtype && tea.subtype.trim().length > 0
    ? `${tea.subtype.trim()} · ${headTail}`
    : headTail;

  // Capitalize first letter and join the top notes naturally.
  const head = prefix.charAt(0).toUpperCase() + prefix.slice(1);
  return `${head}, ${top.join(" & ")}`;
}

// Display ordering — pure design constants, not editorial data.
export const CONTINENT_ORDER = [
  "Asia",
  "North America",
  "Europe",
  "South America",
  "Africa",
  "Oceania",
  "Other",
] as const;

export const TEAWARE_CATEGORY_ORDER = [
  "Gaiwan",
  "Teapot",
  "Kyusu",
  "Pitcher",
  "Cup",
  "Kettle",
  "Scale",
  "Strainer",
  "Other",
] as const;
