import Link from "next/link";
import { PostEditForm } from "@/components/admin/PostEditForm";

export default function NewPostPage() {
  return (
    <div>
      <Link href="/admin/contributor/posts" className="back-link mb-3">
        ← All posts
      </Link>
      <h1 className="font-display italic text-burgundy text-[28px] m-0 mb-5">
        New post
      </h1>
      <PostEditForm post={null} />
    </div>
  );
}
