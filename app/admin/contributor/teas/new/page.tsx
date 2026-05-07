import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TeaEditForm } from "@/components/admin/TeaEditForm";

export default async function NewTeaPage() {
  const sb = await createSupabaseServerClient();
  const { data: vendors, error } = await sb
    .from("vendors")
    .select("slug, name")
    .order("name", { ascending: true });
  if (error) throw error;

  return (
    <div>
      <Link href="/admin/contributor/teas" className="back-link mb-3">
        ← All teas
      </Link>
      <h1 className="font-display italic text-burgundy text-[28px] m-0 mb-5">
        New tea
      </h1>
      <TeaEditForm tea={null} vendors={vendors ?? []} />
    </div>
  );
}
