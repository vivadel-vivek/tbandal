import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PublishToggle } from "@/components/admin/PublishToggle";

export default async function ContributorVendorsList() {
  const sb = await createSupabaseServerClient();
  const { data: vendors, error } = await sb
    .from("vendors")
    .select("slug, name, city, country, continent, published, updated_at")
    .order("name", { ascending: true });

  if (error) throw error;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h1 className="font-display italic text-burgundy text-[28px] m-0">Vendors</h1>
        <Link
          href="/admin/contributor/vendors/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-burgundy text-cream text-[11px] font-bold tracking-widest uppercase no-underline"
        >
          + New vendor
        </Link>
      </div>

      <ul className="divide-y divide-warm-200 border border-warm-200 rounded-xl bg-[var(--bg-elevated)]">
        {(vendors ?? []).map((v) => (
          <li
            key={v.slug}
            className="px-5 py-3.5 flex items-center gap-4 justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="font-display text-burgundy text-[18px] truncate">
                {v.name}
              </div>
              <div className="text-[11px] text-warm-600 truncate">
                {v.city} · {v.country} · {v.continent}
              </div>
            </div>
            <PublishToggle table="vendors" slug={v.slug} published={v.published} />
            <Link
              href={`/admin/contributor/vendors/${v.slug}`}
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
