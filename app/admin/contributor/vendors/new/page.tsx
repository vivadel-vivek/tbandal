import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { VendorEditForm } from "@/components/admin/VendorEditForm";

export default async function NewVendorPage() {
  const admin = createSupabaseAdminClient();
  const { data: vendorUsers } = await admin
    .from("profiles")
    .select("id, email, display_name")
    .eq("role", "vendor")
    .order("email", { ascending: true });

  return (
    <div>
      <Link href="/admin/contributor/vendors" className="back-link mb-3">
        ← All vendors
      </Link>
      <h1 className="font-display italic text-burgundy text-[28px] m-0 mb-5">
        New vendor
      </h1>
      <VendorEditForm vendor={null} vendorUsers={vendorUsers ?? []} />
    </div>
  );
}
