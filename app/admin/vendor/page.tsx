import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getDailyPageViewsForPath,
  getDailyVendorClicks,
  getTotalVendorClicks,
} from "@/lib/analytics";
import { LineChart } from "@/components/admin/analytics/LineChart";

export default async function VendorOverview() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();

  // RLS already restricts vendor users to their own row (or admin
  // sees everything). Order by name so a vendor with multiple owned
  // rows gets a stable list.
  const { data: vendors } = await sb
    .from("vendors")
    .select("slug, name, city, country, published")
    .eq("owner_id", user!.id)
    .order("name", { ascending: true });

  if (!vendors || vendors.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="font-display italic text-burgundy text-[28px] m-0">
          No vendor profile linked
        </h1>
        <p className="text-warm-700 leading-relaxed max-w-[520px]">
          Your account doesn&apos;t own a vendor row yet. An admin needs to
          link your user ID to the appropriate vendor in the catalog. Reach
          out to <a href="mailto:hello@twobudsandaleaf.com" className="text-burgundy underline">hello@twobudsandaleaf.com</a> if
          you believe this is wrong.
        </p>
      </div>
    );
  }

  // For each owned vendor, count attributed teas + teaware AND pull
  // 30-day analytics: page views on the public detail page, clickouts
  // through /go/[slug], and the running total clickout count.
  const stats = await Promise.all(
    vendors.map(async (v) => {
      const [teas, teaware, viewSeries, clickSeries, totalClicks] = await Promise.all([
        sb.from("teas").select("*", { count: "exact", head: true }).eq("vendor_slug", v.slug),
        sb.from("teaware").select("*", { count: "exact", head: true }).eq("vendor", v.name),
        getDailyPageViewsForPath(`/discover/vendors/${v.slug}`, 30),
        getDailyVendorClicks(30, v.slug),
        getTotalVendorClicks(undefined, v.slug),
      ]);
      const views30 = viewSeries.reduce((s, d) => s + d.count, 0);
      const clicks30 = clickSeries.reduce((s, d) => s + d.count, 0);
      return {
        slug: v.slug,
        teas: teas.count ?? 0,
        teaware: teaware.count ?? 0,
        viewSeries,
        clickSeries,
        views30,
        clicks30,
        totalClicks,
        ctr: views30 > 0 ? (clicks30 / views30) * 100 : 0,
      };
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display italic text-burgundy text-[36px] m-0 leading-tight">
          Your vendor profile.
        </h1>
        <p className="text-warm-700 leading-relaxed mt-3 max-w-[520px]">
          Edit your storefront copy, the specialties chip set, and your
          outbound URL. Reviews of your teas live in the contributor portal
          — only James, Vivek, and other contributors can write those.
        </p>
      </div>

      {vendors.map((v) => {
        const s = stats.find((x) => x.slug === v.slug)!;
        return (
          <article key={v.slug} className="card-surface p-5">
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <div>
                <div className="font-display italic text-burgundy text-[24px]">
                  {v.name}
                </div>
                <div className="text-[12px] text-warm-600">
                  {v.city} · {v.country}
                </div>
              </div>
              <span
                className={[
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[10px] font-bold tracking-widest uppercase border",
                  v.published
                    ? "bg-sage-soft border-sage text-forest"
                    : "bg-warm-100 border-warm-300 text-warm-600",
                ].join(" ")}
              >
                <span aria-hidden className={`w-1.5 h-1.5 rounded-full ${v.published ? "bg-forest" : "bg-warm-400"}`} />
                {v.published ? "Live" : "Draft"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-3 border-y border-warm-200">
              <div>
                <div className="text-[10px] tracking-widest uppercase font-bold text-warm-600">Teas</div>
                <div className="font-display text-burgundy text-[24px] tabular-nums">{s.teas}</div>
              </div>
              <div>
                <div className="text-[10px] tracking-widest uppercase font-bold text-warm-600">Teaware</div>
                <div className="font-display text-burgundy text-[24px] tabular-nums">{s.teaware}</div>
              </div>
              <div>
                <div className="text-[10px] tracking-widest uppercase font-bold text-warm-600">Views, 30d</div>
                <div className="font-display text-burgundy text-[24px] tabular-nums">{s.views30.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] tracking-widest uppercase font-bold text-warm-600">Clickouts</div>
                <div className="font-display text-gold-dark text-[24px] tabular-nums">{s.clicks30.toLocaleString()}</div>
                <div className="text-[10px] text-warm-600 font-mono mt-0.5">
                  {s.totalClicks.toLocaleString()} all-time
                </div>
              </div>
              <div>
                <div className="text-[10px] tracking-widest uppercase font-bold text-warm-600">Click-through</div>
                <div className="font-display text-burgundy text-[24px] tabular-nums">
                  {s.views30 > 0 ? `${s.ctr.toFixed(1)}%` : "—"}
                </div>
              </div>
            </div>

            {(s.views30 > 0 || s.clicks30 > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <LineChart
                    data={s.viewSeries}
                    label="Page views, last 30 days"
                    color="var(--burgundy, #722F37)"
                    height={120}
                  />
                </div>
                <div>
                  <LineChart
                    data={s.clickSeries}
                    label="Clickouts, last 30 days"
                    color="var(--gold, #C4A35A)"
                    height={120}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Link
                href="/admin/vendor/profile"
                className="inline-flex items-center px-3 py-1.5 rounded-pill bg-burgundy text-cream text-[11px] font-bold tracking-widest uppercase no-underline"
              >
                Edit profile →
              </Link>
            </div>

            <div className="flex gap-3 mt-3 text-[12px]">
              <Link href="/admin/vendor/teas" className="text-burgundy font-bold no-underline">
                See teas →
              </Link>
              <Link href="/admin/vendor/teaware" className="text-burgundy font-bold no-underline">
                Manage teaware →
              </Link>
              <a
                href={`/discover/vendors/${v.slug}`}
                target="_blank"
                rel="noopener"
                className="text-warm-600 font-bold no-underline ml-auto"
              >
                View public page ↗
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
