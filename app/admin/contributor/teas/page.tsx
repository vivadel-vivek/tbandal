import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PublishToggle } from "@/components/admin/PublishToggle";

export default async function ContributorTeasList() {
  const sb = await createSupabaseServerClient();
  const { data: teas, error } = await sb
    .from("teas")
    .select("slug, name, vendor_slug, year, type, published, updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h1 className="font-display italic text-burgundy text-[28px] m-0">Teas</h1>
        <Link
          href="/admin/contributor/teas/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-burgundy text-cream text-[11px] font-bold tracking-widest uppercase no-underline"
        >
          + New tea
        </Link>
      </div>

      <ul className="divide-y divide-warm-200 border border-warm-200 rounded-xl bg-[var(--bg-elevated)]">
        {(teas ?? []).map((t) => (
          <li
            key={t.slug}
            className="px-5 py-3.5 flex items-center gap-4 justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display text-burgundy text-[18px] truncate">
                  {t.name}
                </span>
                <span className="text-[10px] tracking-widest uppercase font-bold text-warm-600">
                  {t.type} · {t.year}
                </span>
              </div>
              <div className="text-[11px] text-warm-600 font-mono truncate">
                {t.vendor_slug} / {t.slug}
              </div>
            </div>
            <PublishToggle table="teas" slug={t.slug} published={t.published} />
            <Link
              href={`/admin/contributor/teas/${t.slug}`}
              className="text-[12px] font-bold text-burgundy no-underline shrink-0"
            >
              Edit →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
