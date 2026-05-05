import type { MetadataRoute } from "next";
import { POSTS, TEAS, VENDORS } from "@/lib/data";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

/**
 * Site map regenerated as part of every ISR rebuild. Once Airtable lands,
 * the per-record `lastModified` will come from each row's `updated` field
 * so search engines and AI crawlers can reliably re-fetch only what
 * changed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,                  lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/about`,             lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/discover`,          lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/discover/teas`,     lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/discover/vendors`,  lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/discover/glossary`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/journal`,           lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
  ];

  const teaRoutes: MetadataRoute.Sitemap = TEAS.map((t) => ({
    url: `${BASE}/tea/${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const vendorRoutes: MetadataRoute.Sitemap = VENDORS.map((v) => ({
    url: `${BASE}/discover/vendors/${v.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const postRoutes: MetadataRoute.Sitemap = POSTS.map((p) => ({
    url: `${BASE}/journal/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...teaRoutes, ...vendorRoutes, ...postRoutes];
}
