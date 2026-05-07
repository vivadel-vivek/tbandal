import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { VendorProfileForm } from "@/components/admin/VendorProfileForm";

export default async function VendorProfilePage() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();

  // RLS gates this to the caller's owned vendor row(s). One row is the
  // typical case; if there are multiple, surface the first and let the
  // user navigate via overview (rare edge case for chains).
  const { data: vendor, error } = await sb
    .from("vendors")
    .select("*")
    .eq("owner_id", user!.id)
    .order("name", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  if (!vendor) {
    return (
      <div>
        <Link href="/admin/vendor" className="back-link mb-3">← Back</Link>
        <p className="text-warm-700">No vendor profile linked to this account.</p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/vendor" className="back-link mb-3">← Overview</Link>
      <h1 className="font-display italic text-burgundy text-[28px] m-0 mb-2">
        Edit profile
      </h1>
      <p className="text-[12px] text-warm-600 mb-5">
        Slug, rating, and tea count are admin-managed. Reach out if any need
        changing.
      </p>
      <VendorProfileForm vendor={vendor} />
    </div>
  );
}
