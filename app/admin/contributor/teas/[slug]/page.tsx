import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TeaEditForm } from "@/components/admin/TeaEditForm";

export default async function ContributorTeaEdit({
  params,
}: {
  params: { slug: string };
}) {
  const sb = await createSupabaseServerClient();
  const [teaQ, vendorsQ] = await Promise.all([
    sb.from("teas").select("*").eq("slug", params.slug).maybeSingle(),
    sb.from("vendors").select("slug, name").order("name", { ascending: true }),
  ]);

  if (teaQ.error) throw teaQ.error;
  if (!teaQ.data) notFound();
  if (vendorsQ.error) throw vendorsQ.error;

  return (
    <div>
      <Link href="/admin/contributor/teas" className="back-link mb-3">
        ← All teas
      </Link>
      <h1 className="font-display italic text-burgundy text-[28px] m-0 mb-5">
        Edit tea
      </h1>
      <TeaEditForm tea={teaQ.data} vendors={vendorsQ.data ?? []} />
    </div>
  );
}
