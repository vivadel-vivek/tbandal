import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RebuildButton } from "@/components/admin/RebuildButton";

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
  const [teas, posts, vendors, teaware, draftRows] = await Promise.all([
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
  ]);
  const drafts = draftRows.length;

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
