"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Database } from "@/lib/supabase/types";
import { savePost } from "@/app/admin/contributor/actions";
import { MarkdownHint } from "@/components/admin/MarkdownHint";
import { ImageUpload } from "@/components/admin/ImageUpload";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

const CATS = ["Brewing", "Culture", "Origin", "Vendor Spotlight"] as const;
const AUTHORS = ["Vivek", "James"] as const;

const labelCls = "block text-[10px] tracking-widest uppercase font-bold text-warm-600 mb-1.5";
const inputCls =
  "w-full px-3 py-2 rounded-md border border-warm-300 bg-cream text-[14px] font-sans focus:outline-none focus:border-burgundy";

export function PostEditForm({ post }: { post: PostRow | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [slug,        setSlug]        = useState(post?.slug ?? "");
  const [title,       setTitle]       = useState(post?.title ?? "");
  const [cat,         setCat]         = useState<string>(post?.cat ?? "Brewing");
  const [author,      setAuthor]      = useState<string>(post?.author ?? "Vivek");
  const [excerpt,     setExcerpt]     = useState(post?.excerpt ?? "");
  const [date,        setDate]        = useState(post?.date ?? "");
  const [readTime,    setReadTime]    = useState<number>(post?.read_time ?? 5);
  const [grad,        setGrad]        = useState(
    post?.grad ?? "linear-gradient(135deg,#722F37 0%,#A68B3D 100%)"
  );
  const [related,     setRelated]     = useState((post?.related ?? []).join(", "));
  const [body,        setBody]        = useState(post?.body ?? "");
  const [imageUrl,    setImageUrl]    = useState<string | null>(post?.image_url ?? null);
  const [published,   setPublished]   = useState(post?.published ?? false);
  const [publishedAt, setPublishedAt] = useState(
    post?.published_at ? post.published_at.slice(0, 10) : ""
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await savePost({
        originalSlug: post?.slug,
        slug,
        cat,
        title,
        excerpt,
        author,
        date,
        read_time:  readTime,
        grad,
        related:    related.split(",").map((s) => s.trim()).filter(Boolean),
        body:       body || null,
        image_url:  imageUrl,
        published,
        published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push("/admin/contributor/posts");
      router.refresh();
    });
  };

  const previewHref = post ? `/journal/${slug || post.slug}?preview=1` : null;
  const wasPublished = post?.published ?? false;

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-[760px]">
      {/* Top action bar — status pill, preview, draft toggle. */}
      <div className="flex items-center justify-between gap-3 flex-wrap p-3 bg-cream rounded-lg border border-warm-200">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={[
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[10px] font-bold tracking-widest uppercase border",
              published
                ? "bg-sage-soft border-sage text-forest"
                : "bg-warm-100 border-warm-300 text-warm-600",
            ].join(" ")}
          >
            <span aria-hidden className={`w-1.5 h-1.5 rounded-full ${published ? "bg-forest" : "bg-warm-400"}`} />
            {published ? "Published" : "Draft"}
          </span>
          {previewHref ? (
            <a
              href={previewHref}
              target="_blank"
              rel="noopener"
              className="text-[12px] font-bold text-burgundy no-underline hover:underline"
            >
              Preview {published ? "live page" : "draft"} ↗
            </a>
          ) : (
            <span className="text-[11px] text-warm-600 italic">
              Preview available after the first save
            </span>
          )}
        </div>
        <label className="inline-flex items-center gap-2 text-[12px] font-bold text-warm-700">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          {wasPublished && !published
            ? "Will unpublish on save"
            : !wasPublished && published
              ? "Will publish on save"
              : "Published"}
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-4">
        <div>
          <label className={labelCls} htmlFor="title">Title</label>
          <input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="slug">Slug</label>
          <input id="slug" required pattern="[a-z0-9][a-z0-9-]*" value={slug} onChange={(e) => setSlug(e.target.value)} className={inputCls + " font-mono"} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls} htmlFor="cat">Category</label>
          <select id="cat" value={cat} onChange={(e) => setCat(e.target.value)} className={inputCls}>
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="author">Author</label>
          <select id="author" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputCls}>
            {AUTHORS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="readTime">Read time (min)</label>
          <input id="readTime" type="number" min={1} value={readTime} onChange={(e) => setReadTime(Number(e.target.value))} className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="excerpt">Excerpt</label>
        <textarea id="excerpt" rows={3} required value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={inputCls} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="date">Display date</label>
          <input id="date" required value={date} onChange={(e) => setDate(e.target.value)} placeholder="Mar 14, 2026" className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="publishedAt">Published at (date, optional)</label>
          <input id="publishedAt" type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className={inputCls} />
        </div>
      </div>

      <div>
        <ImageUpload
          label="Hero photo"
          value={imageUrl}
          onChange={setImageUrl}
          kind="post"
          slug={slug || "untitled"}
          aspectRatio="16/7"
          alt={`${title || "Post"} hero image`}
        />
        <p className="text-[11px] text-warm-600 leading-snug mt-1.5">
          16:7 aspect — appears on the journal index card and on the post
          detail page above the byline. Falls back to the gradient below
          when blank.
        </p>
      </div>

      <div>
        <label className={labelCls} htmlFor="grad">Hero gradient (CSS — fallback)</label>
        <input id="grad" required value={grad} onChange={(e) => setGrad(e.target.value)} className={inputCls + " font-mono text-[12px]"} />
      </div>

      <div>
        <label className={labelCls} htmlFor="related">Related tea slugs (comma-separated)</label>
        <input id="related" value={related} onChange={(e) => setRelated(e.target.value)} className={inputCls + " font-mono text-[12px]"} />
      </div>

      <div>
        <label className={labelCls} htmlFor="body">Body</label>
        <textarea id="body" rows={20} value={body} onChange={(e) => setBody(e.target.value)} className={inputCls + " font-serif text-[15px] leading-relaxed"} />
        <MarkdownHint />
      </div>

      {/* Published toggle moved into the top action bar. */}

      {error && (
        <div className="text-[12px] text-burgundy bg-burgundy/5 border border-burgundy/20 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 rounded-pill bg-burgundy text-cream text-[12px] font-bold tracking-widest uppercase disabled:opacity-60"
        >
          {pending
            ? "Saving…"
            : !post
              ? (published ? "Publish" : "Save as draft")
              : wasPublished && !published
                ? "Save & unpublish"
                : !wasPublished && published
                  ? "Save & publish"
                  : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-pill border border-warm-300 text-warm-700 text-[12px] font-bold tracking-widest uppercase"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
