import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RebuildButton } from "@/components/admin/RebuildButton";

export default async function ContributorOverview() {
  const sb = await createSupabaseServerClient();

  // Staff RLS lets contributors + admins see drafts; counts include
  // unpublished rows. Five concurrent counts — small enough to fan out.
  const [teas, posts, vendors, teaware, drafts] = await Promise.all([
    sb.from("teas").select("*", { count: "exact", head: true }),
    sb.from("posts").select("*", { count: "exact", head: true }),
    sb.from("vendors").select("*", { count: "exact", head: true }),
    sb.from("teaware").select("*", { count: "exact", head: true }),
    Promise.all([
      sb.from("teas").select("*", { count: "exact", head: true }).eq("published", false),
      sb.from("posts").select("*", { count: "exact", head: true }).eq("published", false),
      sb.from("vendors").select("*", { count: "exact", head: true }).eq("published", false),
      sb.from("teaware").select("*", { count: "exact", head: true }).eq("published", false),
    ]).then((r) => r.reduce((a, c) => a + (c.count ?? 0), 0)),
  ]);

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
              <strong className="text-burgundy">{drafts}</strong>{" "}
              unpublished {drafts === 1 ? "row" : "rows"} across all catalogs.
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
    </div>
  );
}
