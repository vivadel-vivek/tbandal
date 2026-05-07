import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PostEditForm } from "@/components/admin/PostEditForm";

export default async function ContributorPostEdit({
  params,
}: {
  params: { slug: string };
}) {
  const sb = await createSupabaseServerClient();
  const { data: post, error } = await sb
    .from("posts")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();
  if (error) throw error;
  if (!post) notFound();

  return (
    <div>
      <Link href="/admin/contributor/posts" className="back-link mb-3">
        ← All posts
      </Link>
      <h1 className="font-display italic text-burgundy text-[28px] m-0 mb-5">
        Edit post
      </h1>
      <PostEditForm post={post} />
    </div>
  );
}
