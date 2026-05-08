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
// Engagement metrics — duration + device mix + journey
// =====================================================================

/** Median time-on-page (in seconds) for the top N most-viewed paths.
 *  Median is more honest than mean for the long-tailed distribution
 *  of session lengths (the "left a tab open overnight" outliers). */
export const getTopPagesByTimeOnPage = cache(
  async (days = 30, limit = 10): Promise<{ label: string; medianSec: number; views: number }[]> => {
    const sb = await createSupabaseServerClient();
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const { data, error } = await sb
      .from("page_views")
      .select("path, duration_ms")
      .gte("viewed_at", since.toISOString())
      .not("duration_ms", "is", null);
    if (error || !data) return [];

    const buckets = new Map<string, number[]>();
    for (const r of data) {
      if (typeof r.duration_ms !== "number") continue;
      const arr = buckets.get(r.path) ?? [];
      arr.push(r.duration_ms);
      buckets.set(r.path, arr);
    }
    const rows: { label: string; medianSec: number; views: number }[] = [];
    for (const [path, durs] of Array.from(buckets.entries())) {
      durs.sort((a, b) => a - b);
      const mid = Math.floor(durs.length / 2);
      const median =
        durs.length % 2 === 0 ? (durs[mid - 1]! + durs[mid]!) / 2 : durs[mid]!;
      rows.push({ label: path, medianSec: median / 1000, views: durs.length });
    }
    return rows
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  },
);

/** Counts by ua_class — desktop/mobile/unknown. Used for the device-mix tile. */
export const getDeviceMix = cache(async (days = 30): Promise<Record<string, number>> => {
  const sb = await createSupabaseServerClient();
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const { data, error } = await sb
    .from("page_views")
    .select("ua_class")
    .gte("viewed_at", since.toISOString());
  if (error || !data) return {};
  const counts: Record<string, number> = {};
  for (const r of data) {
    const c = r.ua_class ?? "unknown";
    counts[c] = (counts[c] ?? 0) + 1;
  }
  return counts;
});

/** Top within-site path transitions ("home → discover/teas").
 *  Aggregates by (referrer_path, path) over the window. Sankey-style
 *  data without the visual fanfare; renders as a list. */
export const getTopJourneys = cache(
  async (days = 30, limit = 10): Promise<{ from: string; to: string; count: number }[]> => {
    const sb = await createSupabaseServerClient();
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const { data, error } = await sb
      .from("page_views")
      .select("path, referrer_path")
      .gte("viewed_at", since.toISOString())
      .not("referrer_path", "is", null);
    if (error || !data) return [];

    const counts = new Map<string, { from: string; to: string; count: number }>();
    for (const r of data) {
      if (!r.referrer_path) continue;
      if (r.referrer_path === r.path) continue; // skip self-loops
      const key = `${r.referrer_path}→${r.path}`;
      const cur = counts.get(key) ?? {
        from: r.referrer_path,
        to: r.path,
        count: 0,
      };
      cur.count += 1;
      counts.set(key, cur);
    }
    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },
);

// =====================================================================
// Membership + sessions logged
// =====================================================================

/** Daily new-user signups (profiles.created_at) for the last `days`. */
export const getNewUsersDaily = cache(async (days = 30): Promise<DailyPoint[]> => {
  const sb = await createSupabaseServerClient();
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const { data, error } = await sb
    .from("profiles")
    .select("created_at")
    .gte("created_at", since.toISOString());
  if (error) return zeroSeries(since, days);
  return aggregateByDay(data ?? [], "created_at", since, days);
});

/** Rollup of new users in the last 24h / 7d / 30d. Used as a strip
 *  of three KPI tiles on the overview. */
export const getNewUserCounts = cache(async (): Promise<{
  day: number; week: number; month: number;
}> => {
  const sb = await createSupabaseServerClient();
  const now = new Date();
  const dayAgo   = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const weekAgo  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [d, w, m] = await Promise.all([
    sb.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", dayAgo.toISOString()),
    sb.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
    sb.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", monthAgo.toISOString()),
  ]);
  return { day: d.count ?? 0, week: w.count ?? 0, month: m.count ?? 0 };
});

/** Daily count of tea-rating sessions logged (the `sessions` table —
 *  what members log when they brew a tea). Anchors how active the
 *  member base is independently of how many people sign up. */
export const getSessionsLoggedDaily = cache(async (days = 30): Promise<DailyPoint[]> => {
  const sb = await createSupabaseServerClient();
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const { data, error } = await sb
    .from("sessions")
    .select("created_at")
    .gte("created_at", since.toISOString());
  if (error) return zeroSeries(since, days);
  return aggregateByDay(data ?? [], "created_at", since, days);
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
