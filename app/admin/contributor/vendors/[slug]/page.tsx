import Link from "next/link";
import { notFound } from "next/navigation";
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

  return (
    <div>
      <Link href="/admin/contributor/vendors" className="back-link mb-3">
        ← All vendors
      </Link>
      <h1 className="font-display italic text-burgundy text-[28px] m-0 mb-5">
        Edit vendor
      </h1>
      <VendorEditForm vendor={vendor} />
    </div>
  );
}
