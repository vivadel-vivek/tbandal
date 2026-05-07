import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TeawareEditForm } from "@/components/admin/TeawareEditForm";

export default async function ContributorTeawareEdit({
  params,
}: {
  params: { slug: string };
}) {
  const sb = await createSupabaseServerClient();
  const { data: item, error } = await sb
    .from("teaware")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();
  if (error) throw error;
  if (!item) notFound();

  return (
    <div>
      <Link href="/admin/contributor/teaware" className="back-link mb-3">
        ← All teaware
      </Link>
      <h1 className="font-display italic text-burgundy text-[28px] m-0 mb-5">
        Edit teaware
      </h1>
      <TeawareEditForm item={item} />
    </div>
  );
}
