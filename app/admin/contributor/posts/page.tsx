import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PublishToggle } from "@/components/admin/PublishToggle";

export default async function ContributorPostsList() {
  const sb = await createSupabaseServerClient();
  const { data: posts, error } = await sb
    .from("posts")
    .select("slug, title, cat, author, date, published, updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h1 className="font-display italic text-burgundy text-[28px] m-0">Journal posts</h1>
        <Link
          href="/admin/contributor/posts/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-burgundy text-cream text-[11px] font-bold tracking-widest uppercase no-underline"
        >
          + New post
        </Link>
      </div>

      <ul className="divide-y divide-warm-200 border border-warm-200 rounded-xl bg-[var(--bg-elevated)]">
        {(posts ?? []).map((p) => (
          <li
            key={p.slug}
            className="px-5 py-3.5 flex items-center gap-4 justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display text-burgundy text-[18px] truncate">
                  {p.title}
                </span>
                <span className="text-[10px] tracking-widest uppercase font-bold text-warm-600">
                  {p.cat} · {p.author}
                </span>
              </div>
              <div className="text-[11px] text-warm-600 truncate">
                {p.date} · /journal/{p.slug}
              </div>
            </div>
            <PublishToggle table="posts" slug={p.slug} published={p.published} />
            <Link
              href={`/admin/contributor/posts/${p.slug}`}
              className="text-[12px] font-bold text-burgundy no-underline shrink-0"
            >
              Edit →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
