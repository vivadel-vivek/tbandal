import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PublishToggle } from "@/components/admin/PublishToggle";

export default async function ContributorTeawareList() {
  const sb = await createSupabaseServerClient();
  const { data: teaware, error } = await sb
    .from("teaware")
    .select("slug, name, category, vendor, material, published, updated_at")
    .order("category", { ascending: true });

  if (error) throw error;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h1 className="font-display italic text-burgundy text-[28px] m-0">Teaware</h1>
        <Link
          href="/admin/contributor/teaware/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-burgundy text-cream text-[11px] font-bold tracking-widest uppercase no-underline"
        >
          + New teaware
        </Link>
      </div>

      <ul className="divide-y divide-warm-200 border border-warm-200 rounded-xl bg-[var(--bg-elevated)]">
        {(teaware ?? []).map((w) => (
          <li
            key={w.slug}
            className="px-5 py-3.5 flex items-center gap-4 justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display text-burgundy text-[18px] truncate">
                  {w.name}
                </span>
                <span className="text-[10px] tracking-widest uppercase font-bold text-warm-600">
                  {w.category}
                </span>
              </div>
              <div className="text-[11px] text-warm-600 truncate">
                {w.material} · sold by {w.vendor}
              </div>
            </div>
            <PublishToggle table="teaware" slug={w.slug} published={w.published} />
            <Link
              href={`/admin/contributor/teaware/${w.slug}`}
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
