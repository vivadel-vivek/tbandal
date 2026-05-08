import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPosts, getPostBySlug, getTeas } from "@/lib/content";
import {
  getPreviewPostBySlug,
  isCurrentUserStaff,
} from "@/lib/content-preview";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { AvatarChip } from "@/components/ui/AvatarChip";
import { TeaCard } from "@/components/tea/TeaCard";
import { renderMarkdown } from "@/lib/markdown";
import { ArticleJsonLd } from "@/components/seo/JsonLd";
import { PreviewBanner } from "@/components/admin/PreviewBanner";
import { EditorialImage } from "@/components/ui/EditorialImage";

// ISR: pre-render every post slug, dynamicParams: true so new posts ISR
// on first hit once Airtable lands.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const POSTS = await getPosts();
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Post not found" };
  const path = `/journal/${params.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: path },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: path,
      authors: [post.author],
      publishedTime: post.date,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
  };
}

export default async function JournalPost({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { preview?: string };
}) {
  const wantsPreview = searchParams.preview === "1";
  const previewMode = wantsPreview && (await isCurrentUserStaff());
  const [post, allTeas] = await Promise.all([
    previewMode ? getPreviewPostBySlug(params.slug) : getPostBySlug(params.slug),
    getTeas(),
  ]);
  if (!post) notFound();

  // Detect Draft vs Published in preview mode by checking the public
  // anon-read.
  const isPublishedDraft = previewMode
    ? Boolean(await getPostBySlug(params.slug))
    : false;

  const related = post.related
    .map((slug) => allTeas.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <main>
      {previewMode && (
        <PreviewBanner
          editHref={`/admin/contributor/posts/${post.slug}`}
          status={isPublishedDraft ? "Published" : "Draft"}
          subject={post.title}
        />
      )}
      <ArticleJsonLd post={post} />
      <article>
      <Container size="narrow">
        <Link href="/journal" className="back-link mt-8 mb-2">
          ← Back to journal
        </Link>
        <Eyebrow color="var(--sage-text, #556649)">
          {post.cat} · {post.readTime} min read
        </Eyebrow>
        <h1 className="font-display text-burgundy font-medium tracking-tight leading-hero mt-3 mb-5 text-[40px] sm:text-hero-xl">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 mb-8">
          <AvatarChip
            who={post.author.toLowerCase() as "vivek" | "james"}
            size={36}
          />
          <div>
            <div className="text-sm font-bold text-forest">{post.author}</div>
            <time
              className="text-xs text-warm-600 block"
              dateTime={post.date}
            >
              {post.date}
            </time>
          </div>
        </div>
      </Container>

      <Container size="article">
        <div className="rounded-2xl shadow-elevated overflow-hidden mb-10">
          <EditorialImage
            src={post.imageUrl}
            alt={post.title}
            gradient={post.grad}
            aspectRatio="16/7"
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 720px, 920px"
          />
        </div>
      </Container>

      <Container size="prose">
        <div className="font-serif text-forest leading-relaxed text-[18px] sm:text-[20px]">
          <p
            className="text-[20px] sm:text-[22px] italic text-warm-700 mb-6 pl-5"
            style={{ borderLeft: "2px solid var(--gold, #C4A35A)" }}
          >
            {post.excerpt}
          </p>
          <PostBody body={post.body} />
        </div>

        {related.length > 0 && (
          <div className="mt-12 sm:mt-14 pt-8 border-t border-warm-200">
            <Eyebrow>Teas referenced in this post</Eyebrow>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {related.map((t) => (
                <TeaCard key={t.slug} tea={t} density="compact" />
              ))}
            </div>
          </div>
        )}
      </Container>
      </article>
      <div className="h-16" />
    </main>
  );
}

/** Empty-state for posts without a body yet (rare, but possible
 *  when a draft is created with title + metadata first). */
function PostBody({ body }: { body: string | undefined }) {
  if (!body) {
    return (
      <p className="mb-5 italic text-warm-600">
        The full essay text lands when this post is published. Check back
        soon — the byline and related teas above are real.
      </p>
    );
  }
  return <>{renderMarkdown(body)}</>;
}
