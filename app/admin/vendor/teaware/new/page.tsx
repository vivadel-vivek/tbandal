import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { VendorTeawareForm } from "@/components/admin/VendorTeawareForm";

export default async function NewVendorTeawarePage() {
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

  return (
    <div>
      <Link href="/admin/vendor/teaware" className="back-link mb-3">← Your teaware</Link>
      <h1 className="font-display italic text-burgundy text-[28px] m-0 mb-5">
        New teaware listing
      </h1>
      <VendorTeawareForm item={null} ownedVendors={ownedVendors} />
    </div>
  );
}
