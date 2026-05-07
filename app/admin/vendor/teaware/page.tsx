import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PublishToggle } from "@/components/admin/PublishToggle";

export default async function VendorTeawareListPage() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();

  const { data: ownedVendors } = await sb
    .from("vendors")
    .select("slug, name")
    .eq("owner_id", user!.id);

  if (!ownedVendors || ownedVendors.length === 0) {
    return (
      <div>
        <Link href="/admin/vendor" className="back-link mb-3">← Overview</Link>
        <p className="text-warm-700 mt-3">No vendor profile linked yet.</p>
      </div>
    );
  }

  const vendorNames = ownedVendors.map((v) => v.name);
  const { data: teaware } = await sb
    .from("teaware")
    .select("slug, name, category, material, published, vendor")
    .in("vendor", vendorNames)
    .order("category", { ascending: true });

  return (
    <div>
      <Link href="/admin/vendor" className="back-link mb-3">← Overview</Link>
      <div className="flex items-baseline justify-between mb-5">
        <h1 className="font-display italic text-burgundy text-[28px] m-0">
          Your teaware listings
        </h1>
        <Link
          href="/admin/vendor/teaware/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-burgundy text-cream text-[11px] font-bold tracking-widest uppercase no-underline"
        >
          + Add teaware
        </Link>
      </div>

      {(teaware ?? []).length === 0 ? (
        <p className="text-warm-700">No teaware listed yet — add your first item.</p>
      ) : (
        <ul className="divide-y divide-warm-200 border border-warm-200 rounded-xl bg-[var(--bg-elevated)]">
          {(teaware ?? []).map((w) => (
            <li
              key={w.slug}
              className="px-5 py-3.5 flex items-center gap-4 justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="font-display text-burgundy text-[18px] truncate">
                  {w.name}
                </div>
                <div className="text-[11px] text-warm-600 truncate">
                  {w.category} · {w.material}
                </div>
              </div>
              <PublishToggle table="teaware" slug={w.slug} published={w.published} />
              <Link
                href={`/admin/vendor/teaware/${w.slug}`}
                className="text-[12px] font-bold text-burgundy no-underline shrink-0"
              >
                Edit →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
