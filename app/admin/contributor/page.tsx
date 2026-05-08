import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RebuildButton } from "@/components/admin/RebuildButton";
import {
  getDailyPageViews,
  getDailyVendorClicks,
  getTopPages,
  getTopVendorClickouts,
  getTotalVendorClicks,
  getUserCounts,
  getDeviceMix,
  getTopJourneys,
  getTopPagesByTimeOnPage,
  getNewUsersDaily,
  getNewUserCounts,
  getSessionsLoggedDaily,
} from "@/lib/analytics";
import { LineChart } from "@/components/admin/analytics/LineChart";
import { BarList } from "@/components/admin/analytics/BarList";

type DraftRow = {
  kind: "tea" | "post" | "vendor" | "teaware";
  slug: string;
  title: string;
  href: string;
  updatedAt: string;
};

export default async function ContributorOverview() {
  const sb = await createSupabaseServerClient();

  // Staff RLS lets contributors + admins see drafts; counts include
  // unpublished rows. Six concurrent reads — counts + draft rows for
  // the dashboard panel.
  const [
    teas, posts, vendors, teaware, draftRows,
    dailyViews, topPages, dailyClicks, topVendors, totalClicks30, users,
    deviceMix, topJourneys, topByTime,
    newUsersSeries, newUserKpis, sessionsSeries,
  ] = await Promise.all([
    sb.from("teas").select("*", { count: "exact", head: true }),
    sb.from("posts").select("*", { count: "exact", head: true }),
    sb.from("vendors").select("*", { count: "exact", head: true }),
    sb.from("teaware").select("*", { count: "exact", head: true }),
    Promise.all([
      sb.from("teas").select("slug, name, updated_at").eq("published", false)
        .order("updated_at", { ascending: false }).limit(5),
      sb.from("posts").select("slug, title, updated_at").eq("published", false)
        .order("updated_at", { ascending: false }).limit(5),
      sb.from("vendors").select("slug, name, updated_at").eq("published", false)
        .order("updated_at", { ascending: false }).limit(5),
      sb.from("teaware").select("slug, name, updated_at").eq("published", false)
        .order("updated_at", { ascending: false }).limit(5),
    ]).then(([t, p, v, w]) => {
      const rows: DraftRow[] = [];
      for (const r of t.data ?? []) rows.push({ kind: "tea", slug: r.slug, title: r.name, href: `/admin/contributor/teas/${r.slug}`, updatedAt: r.updated_at });
      for (const r of p.data ?? []) rows.push({ kind: "post", slug: r.slug, title: r.title, href: `/admin/contributor/posts/${r.slug}`, updatedAt: r.updated_at });
      for (const r of v.data ?? []) rows.push({ kind: "vendor", slug: r.slug, title: r.name, href: `/admin/contributor/vendors/${r.slug}`, updatedAt: r.updated_at });
      for (const r of w.data ?? []) rows.push({ kind: "teaware", slug: r.slug, title: r.name, href: `/admin/contributor/teaware/${r.slug}`, updatedAt: r.updated_at });
      return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8);
    }),
    getDailyPageViews(30),
    getTopPages(30, 8),
    getDailyVendorClicks(30),
    getTopVendorClickouts(30, 8),
    getTotalVendorClicks(30),
    getUserCounts(),
    getDeviceMix(30),
    getTopJourneys(30, 10),
    getTopPagesByTimeOnPage(30, 8),
    getNewUsersDaily(30),
    getNewUserCounts(),
    getSessionsLoggedDaily(30),
  ]);
  const drafts = draftRows.length;
  const totalViews30 = dailyViews.reduce((s, d) => s + d.count, 0);
  const totalSessions30 = sessionsSeries.reduce((s, d) => s + d.count, 0);
  const deviceTotal = Object.values(deviceMix).reduce((s, n) => s + n, 0);
  const deviceMobile = (deviceMix.mobile ?? 0);
  const deviceDesktop = (deviceMix.desktop ?? 0);
  const mobilePct = deviceTotal > 0 ? (deviceMobile / deviceTotal) * 100 : 0;
  const desktopPct = deviceTotal > 0 ? (deviceDesktop / deviceTotal) * 100 : 0;

  const tiles: { href: string; label: string; count: number; eyebrow: string }[] = [
    { href: "/admin/contributor/teas",    label: "Teas",    count: teas.count ?? 0,    eyebrow: "Catalog" },
    { href: "/admin/contributor/posts",   label: "Posts",   count: posts.count ?? 0,   eyebrow: "Journal" },
    { href: "/admin/contributor/vendors", label: "Vendors", count: vendors.count ?? 0, eyebrow: "Atlas" },
    { href: "/admin/contributor/teaware", label: "Teaware", count: teaware.count ?? 0, eyebrow: "Instruments" },
  ];

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-start">
        <div>
          <h1 className="font-display italic text-burgundy text-[36px] m-0 leading-tight">
            Edit the catalog.
          </h1>
          <p className="text-warm-700 leading-relaxed mt-3 max-w-[520px]">
            Studio is the day-to-day CRM. This portal is for contributors who
            want a focused, schema-aware editor for the editorial fields —
            and a one-click rebuild when copy ships.
          </p>
          {drafts > 0 && (
            <p className="mt-3 text-[13px] text-warm-700">
              <strong className="text-burgundy">{drafts}</strong> recent{" "}
              {drafts === 1 ? "draft" : "drafts"} below.
            </p>
          )}
        </div>
        <div className="bg-cream border border-warm-200 rounded-xl p-5 max-w-[280px] sm:min-w-[240px]">
          <div className="text-[10px] tracking-widest uppercase font-bold text-warm-600">
            Publish pipeline
          </div>
          <p className="text-[12px] text-warm-700 leading-snug mt-1.5 mb-3">
            Triggers a fresh production deploy on Vercel. The new content
            goes live in 1–3 min.
          </p>
          <RebuildButton />
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group card-surface card-surface-hover p-5 no-underline flex items-center justify-between gap-4"
          >
            <div>
              <div className="text-[10px] tracking-widest uppercase font-bold text-warm-600">
                {t.eyebrow}
              </div>
              <div className="font-display italic text-burgundy text-[26px] mt-1">
                {t.label}
              </div>
            </div>
            <div className="font-display text-burgundy text-[40px] tabular-nums">
              {t.count}
            </div>
          </Link>
        ))}
      </section>

      {/* ----- Analytics — last 30 days, cookieless self-host -----
          Page views via PageViewBeacon, clickouts via /go/[vendor]. */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between flex-wrap gap-3">
          <h2 className="font-display italic text-burgundy text-[26px] m-0">
            Audience
          </h2>
          <span className="text-[10px] tracking-widest uppercase font-bold text-warm-600">
            Last 30 days · cookieless
          </span>
        </div>

        {/* KPI strip — top row: traffic + conversion */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Page views"       value={totalViews30} />
          <Stat label="Sessions logged"  value={totalSessions30} />
          <Stat label="Vendor clickouts" value={totalClicks30} accent />
          <Stat
            label="Click-through"
            value={
              totalViews30 > 0
                ? `${((totalClicks30 / totalViews30) * 100).toFixed(1)}%`
                : "—"
            }
            small
          />
        </div>

        {/* KPI strip — second row: membership pulse */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="New today"      value={newUserKpis.day} small />
          <Stat label="New this week"  value={newUserKpis.week} small />
          <Stat label="New this month" value={newUserKpis.month} small />
          <Stat label="Members total"  value={users.total} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-surface p-5">
            <LineChart
              data={dailyViews}
              label="Page views, last 30 days"
              color="var(--burgundy, #722F37)"
            />
          </div>
          <div className="card-surface p-5">
            <LineChart
              data={dailyClicks}
              label="Vendor clickouts, last 30 days"
              color="var(--gold, #C4A35A)"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-surface p-5">
            <LineChart
              data={newUsersSeries}
              label="New users, last 30 days"
              color="var(--sage-text, #556649)"
            />
          </div>
          <div className="card-surface p-5">
            <LineChart
              data={sessionsSeries}
              label="Sessions logged, last 30 days"
              color="var(--forest, #2D3A2E)"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-surface p-5">
            <h3 className="font-display italic text-burgundy text-[20px] m-0 mb-3">
              Top pages
            </h3>
            <BarList
              data={topPages}
              href={(p) => p}
              emptyMessage="No page views logged yet — visit a few pages on the live site to populate."
            />
          </div>
          <div className="card-surface p-5">
            <h3 className="font-display italic text-burgundy text-[20px] m-0 mb-3">
              Top vendor clickouts
            </h3>
            <BarList
              data={topVendors}
              href={(slug) => `/discover/vendors/${slug}`}
              emptyMessage="No vendor clickouts yet."
              barColor="var(--gold, #C4A35A)"
            />
          </div>
        </div>

        {/* Engagement — mobile/desktop, journey, time on page */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device mix */}
          <div className="card-surface p-5">
            <h3 className="font-display italic text-burgundy text-[20px] m-0 mb-3">
              Mobile vs desktop
            </h3>
            {deviceTotal === 0 ? (
              <p className="text-[12px] text-warm-600 italic">No data yet.</p>
            ) : (
              <div>
                <DeviceBar
                  label="Mobile"
                  count={deviceMobile}
                  pct={mobilePct}
                  color="var(--burgundy, #722F37)"
                />
                <DeviceBar
                  label="Desktop"
                  count={deviceDesktop}
                  pct={desktopPct}
                  color="var(--gold, #C4A35A)"
                />
                {deviceMix.unknown ? (
                  <DeviceBar
                    label="Unknown"
                    count={deviceMix.unknown}
                    pct={(deviceMix.unknown / deviceTotal) * 100}
                    color="var(--warm-400, #B5A99A)"
                  />
                ) : null}
              </div>
            )}
          </div>

          {/* Time on page (median) */}
          <div className="card-surface p-5">
            <h3 className="font-display italic text-burgundy text-[20px] m-0 mb-3">
              Time on page
            </h3>
            {topByTime.length === 0 ? (
              <p className="text-[12px] text-warm-600 italic">
                Need a few visits with measured durations to populate.
              </p>
            ) : (
              <ul className="list-none p-0 m-0 flex flex-col gap-1.5">
                {topByTime.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-baseline justify-between gap-2 text-[12px]"
                  >
                    <span className="font-mono text-forest truncate" style={{ maxWidth: "65%" }}>
                      {row.label}
                    </span>
                    <span className="font-mono tabular-nums text-warm-700 shrink-0">
                      {formatDuration(row.medianSec)}
                      <span className="text-warm-500"> · {row.views}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Journey list — top within-site path transitions */}
          <div className="card-surface p-5">
            <h3 className="font-display italic text-burgundy text-[20px] m-0 mb-3">
              Top journeys
            </h3>
            {topJourneys.length === 0 ? (
              <p className="text-[12px] text-warm-600 italic">
                No internal navigations logged yet.
              </p>
            ) : (
              <ul className="list-none p-0 m-0 flex flex-col gap-1.5">
                {topJourneys.map((j) => (
                  <li
                    key={`${j.from}→${j.to}`}
                    className="flex items-baseline justify-between gap-2 text-[12px]"
                  >
                    <span className="font-mono text-forest truncate" style={{ maxWidth: "75%" }}>
                      {shortPath(j.from)}{" "}
                      <span className="text-warm-500">→</span>{" "}
                      {shortPath(j.to)}
                    </span>
                    <span className="font-mono tabular-nums text-warm-700 shrink-0">
                      {j.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Drafts dashboard — 8 most-recently-updated unpublished rows
          across every catalog. The clean way back into in-flight work. */}
      {draftRows.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display italic text-burgundy text-[24px] m-0">
              Recent drafts
            </h2>
            <span className="text-[10px] tracking-widest uppercase font-bold text-warm-600">
              {draftRows.length} unpublished
            </span>
          </div>
          <ul className="divide-y divide-warm-200 border border-warm-200 rounded-xl bg-[var(--bg-elevated)]">
            {draftRows.map((d) => (
              <li key={`${d.kind}-${d.slug}`}>
                <Link
                  href={d.href}
                  className="flex items-center gap-3 px-4 py-3 no-underline hover:bg-cream"
                >
                  <span className="inline-flex items-center px-2 py-0.5 rounded-pill bg-warm-100 border border-warm-300 text-[10px] font-bold tracking-widest uppercase text-warm-700 shrink-0">
                    {d.kind}
                  </span>
                  <span className="font-display text-burgundy text-[15px] truncate flex-1">
                    {d.title}
                  </span>
                  <time
                    className="text-[11px] text-warm-600 shrink-0"
                    dateTime={d.updatedAt}
                  >
                    {new Date(d.updatedAt).toLocaleDateString(undefined, {
                      month: "short", day: "numeric",
                    })}
                  </time>
                  <span className="text-[12px] font-bold text-burgundy shrink-0">
                    Edit →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// Inline horizontal bar for the device-mix card. Reads cleanly next
// to the chart cards without pulling in another component file.
function DeviceBar({
  label,
  count,
  pct,
  color,
}: {
  label: string;
  count: number;
  pct: number;
  color: string;
}) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex items-baseline justify-between mb-1 text-[12px]">
        <span className="font-bold text-forest">{label}</span>
        <span className="font-mono tabular-nums text-warm-700">
          {count.toLocaleString()}{" "}
          <span className="text-warm-500">· {pct.toFixed(0)}%</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-warm-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

// "/discover/teas/longjing" → "discover/teas/longjing" (drop leading
// slash) and truncate to 36 chars so journey rows stay one-line.
function shortPath(p: string): string {
  const s = p.replace(/^\//, "");
  return s.length > 36 ? s.slice(0, 35) + "…" : s || "home";
}

// Format duration in seconds → "1m 23s" / "12s" / "1h 4m".
function formatDuration(sec: number): string {
  if (sec < 60) return `${Math.round(sec)}s`;
  if (sec < 3600) {
    const m = Math.floor(sec / 60);
    const s = Math.round(sec - m * 60);
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec - h * 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Small KPI tile for the audience strip. `accent` flips the value
// colour to gold; `small` shrinks the value font for percentages or
// composite figures that don't need to dominate.
function Stat({
  label,
  value,
  accent = false,
  small = false,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div className="card-surface p-4">
      <div className="text-[10px] tracking-widest uppercase font-bold text-warm-600">
        {label}
      </div>
      <div
        className={[
          "font-display tabular-nums mt-1",
          accent ? "text-gold-dark" : "text-burgundy",
          small ? "text-[26px]" : "text-[34px]",
        ].join(" ")}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
