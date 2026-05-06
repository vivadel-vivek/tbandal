// Single source of truth for the canonical site URL.
//
// Resolution order:
//   1. NEXT_PUBLIC_SITE_URL — explicitly configured per-env (preferred).
//   2. CANONICAL_FALLBACK    — the stable Vercel alias. Used when the env
//                              var hasn't been set yet so sitemap/robots/
//                              canonical tags don't accidentally emit the
//                              deployment-specific hash URL (which fragments
//                              indexing — Lighthouse/SEO regression).
//   3. http://localhost:3000 — local dev only.
//
// VERCEL_URL is intentionally NOT in the fallback chain: it's the
// per-deployment hash (`two-buds-and-a-leaf-ifbm0s33o-…vercel.app`),
// which is what was leaking into the sitemap before this fix.

const CANONICAL_FALLBACK = "https://two-buds-and-a-leaf.vercel.app";

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NODE_ENV === "production") return CANONICAL_FALLBACK;
  return "http://localhost:3000";
}
