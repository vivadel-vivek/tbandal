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
 */
export function teaAvg(tea: Tea): number {
  const r = tea.reviews;
  const vals: number[] = [];
  if (r.vivek && typeof r.vivek.rating === "number") vals.push(r.vivek.rating);
  if (r.james && typeof r.james.rating === "number") vals.push(r.james.rating);
  if (vals.length === 0 && r.members && typeof r.members.rating === "number") {
    vals.push(r.members.rating);
  }
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
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
