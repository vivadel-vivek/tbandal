import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { VendorEditForm } from "@/components/admin/VendorEditForm";

export default async function ContributorVendorEdit({
  params,
}: {
  params: { slug: string };
}) {
  const sb = await createSupabaseServerClient();
  const { data: vendor, error } = await sb
    .from("vendors")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();
  if (error) throw error;
  if (!vendor) notFound();

  // Vendor users available to claim this row. Uses the admin client
  // because RLS hides other users' profile rows from staff (only
  // contributor/admin profiles are publicly visible). The contributor
  // form is staff-only — this read is safe.
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
        Edit vendor
      </h1>
      <VendorEditForm vendor={vendor} vendorUsers={vendorUsers ?? []} />
    </div>
  );
}
