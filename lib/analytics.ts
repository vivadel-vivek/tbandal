// Read-side helpers for the analytics dashboards.
//
// All reads go through the server Supabase client so RLS gates them
// per-role: staff sees everything, vendor users see only their own
// slugs (the policy is in 20260508140000_analytics_tables.sql).
//
// We aggregate in JS rather than push GROUP BY to Postgres because the
// volumes are small (an editorial site, not a product analytics
// platform). When daily inserts exceed ~10k we'll move to a SQL
// function or a materialized rollup.

import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DailyPoint = { date: string; count: number };
export type LabelledCount = { label: string; count: number };

// =====================================================================
// Pages
// =====================================================================

/** Daily page-view counts for the last `days` days, oldest → newest.
 *  Days with zero traffic appear as `{ date, count: 0 }` so the line
 *  chart doesn't have gaps. */
export const getDailyPageViews = cache(async (days = 30): Promise<DailyPoint[]> => {
  const sb = await createSupabaseServerClient();
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const { data, error } = await sb
    .from("page_views")
    .select("viewed_at")
    .gte("viewed_at", since.toISOString());
  if (error) return zeroSeries(since, days);

  return aggregateByDay(data ?? [], "viewed_at", since, days);
});

/** Daily page-view counts scoped to a single path (or path prefix).
 *  Used by the vendor portal to show the audience of their own
 *  /discover/vendors/[slug] page. */
export const getDailyPageViewsForPath = cache(
  async (pathPrefix: string, days = 30): Promise<DailyPoint[]> => {
    const sb = await createSupabaseServerClient();
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const { data, error } = await sb
      .from("page_views")
      .select("viewed_at")
      .like("path", `${pathPrefix}%`)
      .gte("viewed_at", since.toISOString());
    if (error) return zeroSeries(since, days);

    return aggregateByDay(data ?? [], "viewed_at", since, days);
  },
);

/** Top-N most-viewed paths in the last `days` days. */
export const getTopPages = cache(
  async (days = 30, limit = 10): Promise<LabelledCount[]> => {
    const sb = await createSupabaseServerClient();
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const { data, error } = await sb
      .from("page_views")
      .select("path")
      .gte("viewed_at", since.toISOString());
    if (error) return [];

    const counts = new Map<string, number>();
    for (const r of data ?? []) {
      counts.set(r.path, (counts.get(r.path) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },
);

// =====================================================================
// Vendor clickouts
// =====================================================================

export const getDailyVendorClicks = cache(
  async (days = 30, vendorSlug?: string): Promise<DailyPoint[]> => {
    const sb = await createSupabaseServerClient();
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    let q = sb
      .from("vendor_clicks")
      .select("clicked_at")
      .gte("clicked_at", since.toISOString());
    if (vendorSlug) q = q.eq("vendor_slug", vendorSlug);

    const { data, error } = await q;
    if (error) return zeroSeries(since, days);

    return aggregateByDay(data ?? [], "clicked_at", since, days);
  },
);

/** Top-N vendors by clickout volume in the last `days` days. */
export const getTopVendorClickouts = cache(
  async (days = 30, limit = 10): Promise<LabelledCount[]> => {
    const sb = await createSupabaseServerClient();
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const { data, error } = await sb
      .from("vendor_clicks")
      .select("vendor_slug")
      .gte("clicked_at", since.toISOString());
    if (error) return [];

    const counts = new Map<string, number>();
    for (const r of data ?? []) {
      counts.set(r.vendor_slug, (counts.get(r.vendor_slug) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },
);

/** Total clickouts (all-time or last `days`). */
export const getTotalVendorClicks = cache(
  async (days?: number, vendorSlug?: string): Promise<number> => {
    const sb = await createSupabaseServerClient();
    let q = sb.from("vendor_clicks").select("*", { count: "exact", head: true });
    if (vendorSlug) q = q.eq("vendor_slug", vendorSlug);
    if (days) {
      const since = new Date();
      since.setUTCDate(since.getUTCDate() - days);
      q = q.gte("clicked_at", since.toISOString());
    }
    const { count, error } = await q;
    if (error) return 0;
    return count ?? 0;
  },
);

// =====================================================================
// Users
// =====================================================================

export const getUserCounts = cache(async (): Promise<{
  total: number;
  byRole: Record<string, number>;
}> => {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb.from("profiles").select("role");
  if (error || !data) return { total: 0, byRole: {} };
  const byRole: Record<string, number> = {};
  for (const r of data) {
    byRole[r.role] = (byRole[r.role] ?? 0) + 1;
  }
  return { total: data.length, byRole };
});

// =====================================================================
// Helpers
// =====================================================================

function zeroSeries(since: Date, days: number): DailyPoint[] {
  const out: DailyPoint[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    out.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  return out;
}

function aggregateByDay<T extends Record<string, string>>(
  rows: T[],
  field: keyof T,
  since: Date,
  days: number,
): DailyPoint[] {
  const counts = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    counts.set(d.toISOString().slice(0, 10), 0);
  }
  for (const r of rows) {
    const v = r[field];
    if (typeof v !== "string") continue;
    const day = v.slice(0, 10); // ISO YYYY-MM-DD
    if (counts.has(day)) counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}
