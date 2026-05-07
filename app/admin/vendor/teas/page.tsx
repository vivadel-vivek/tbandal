import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Vendor view of attributed teas. Read-only — only contributors can
// publish reviews, but a vendor may want to see how their catalog is
// being covered (rating, sessions logged) and which are still drafts.
export default async function VendorTeasPage() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();

  // Find the vendor(s) the caller owns, then list teas attributed
  // to those vendor slugs.
  const { data: ownedVendors } = await sb
    .from("vendors")
    .select("slug, name")
    .eq("owner_id", user!.id);

  if (!ownedVendors || ownedVendors.length === 0) {
    return (
      <div>
        <Link href="/admin/vendor" className="back-link mb-3">← Overview</Link>
        <p className="text-warm-700 mt-3">
          No vendor profile linked yet — nothing to attribute teas against.
        </p>
      </div>
    );
  }

  const vendorSlugs = ownedVendors.map((v) => v.slug);
  const { data: teas } = await sb
    .from("teas")
    .select("slug, name, year, type, published, rarity")
    .in("vendor_slug", vendorSlugs)
    .order("created_at", { ascending: false });

  return (
    <div>
      <Link href="/admin/vendor" className="back-link mb-3">← Overview</Link>
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="font-display italic text-burgundy text-[28px] m-0">
          Teas attributed to you
        </h1>
        <span className="text-[11px] tracking-widest uppercase font-bold text-warm-600">
          Read-only · contributors edit
        </span>
      </div>
      <p className="text-[12px] text-warm-600 mb-5 max-w-[520px]">
        Reviews are written by James, Vivek, and other contributors. To
        suggest a tea for review or correct an attribution, email{" "}
        <a href="mailto:hello@twobudsandaleaf.com" className="text-burgundy underline">
          hello@twobudsandaleaf.com
        </a>.
      </p>

      {(teas ?? []).length === 0 ? (
        <p className="text-warm-700">No teas reviewed yet.</p>
      ) : (
        <ul className="divide-y divide-warm-200 border border-warm-200 rounded-xl bg-[var(--bg-elevated)]">
          {(teas ?? []).map((t) => (
            <li key={t.slug} className="px-5 py-3.5 flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-display text-burgundy text-[18px] truncate">
                  {t.name}
                </div>
                <div className="text-[11px] text-warm-600">
                  {t.type} · {t.year} · rarity {t.rarity}/5
                </div>
              </div>
              <span
                className={[
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[10px] font-bold tracking-widest uppercase border shrink-0",
                  t.published
                    ? "bg-sage-soft border-sage text-forest"
                    : "bg-warm-100 border-warm-300 text-warm-600",
                ].join(" ")}
              >
                <span aria-hidden className={`w-1.5 h-1.5 rounded-full ${t.published ? "bg-forest" : "bg-warm-400"}`} />
                {t.published ? "Live" : "Draft"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
