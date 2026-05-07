import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { VendorTeawareForm } from "@/components/admin/VendorTeawareForm";

export default async function VendorTeawareEdit({
  params,
}: {
  params: { slug: string };
}) {
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
        <p className="text-warm-700 mt-3">No vendor profile linked.</p>
      </div>
    );
  }

  const { data: item } = await sb
    .from("teaware")
    .select("*")
    .eq("slug", params.slug)
    .in("vendor", ownedVendors.map((v) => v.name))
    .maybeSingle();

  if (!item) notFound();

  return (
    <div>
      <Link href="/admin/vendor/teaware" className="back-link mb-3">← Your teaware</Link>
      <h1 className="font-display italic text-burgundy text-[28px] m-0 mb-5">
        Edit teaware
      </h1>
      <VendorTeawareForm item={item} ownedVendors={ownedVendors} />
    </div>
  );
}
