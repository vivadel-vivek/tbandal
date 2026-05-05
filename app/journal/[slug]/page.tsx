import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { POSTS, TEAS, postBySlug, teaUrl } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { AvatarChip } from "@/components/ui/AvatarChip";
import { TeaCard } from "@/components/tea/TeaCard";

// ISR: pre-render every post slug, dynamicParams: true so new posts ISR
// on first hit once Airtable lands.
export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = postBySlug(params.slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      authors: [post.author],
      publishedTime: post.date,
    },
  };
}

export default function JournalPost({
  params,
}: {
  params: { slug: string };
}) {
  const post = postBySlug(params.slug);
  if (!post) notFound();

  const related = post.related
    .map((slug) => TEAS.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <main>
      <Container size="narrow">
        <Link href="/journal" className="back-link mt-8 mb-2">
          ← Back to journal
        </Link>
        <Eyebrow color="var(--sage-dark, #6B7A5D)">
          {post.cat} · {post.readTime} min read
        </Eyebrow>
        <h1 className="font-display text-burgundy font-medium tracking-tight leading-hero mt-3 mb-5 text-hero-xl">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 mb-8">
          <AvatarChip
            who={post.author.toLowerCase() as "vivek" | "james"}
            size={36}
          />
          <div>
            <div className="text-sm font-bold text-forest">{post.author}</div>
            <div className="text-xs text-warm-500">{post.date}</div>
          </div>
        </div>
      </Container>

      <Container size="article">
        <div
          className="aspect-[16/7] rounded-2xl shadow-elevated mb-10"
          style={{ background: post.grad }}
        />
      </Container>

      <Container size="prose">
        <div className="font-serif text-forest leading-relaxed text-[20px]">
          <p
            className="text-[22px] italic text-warm-700 mb-6 pl-5"
            style={{ borderLeft: "2px solid var(--gold, #C4A35A)" }}
          >
            {post.excerpt}
          </p>
          <p className="mb-5">
            {/* Placeholder body — Phase 3 brings the real long-form */}
            The full essay text comes from Airtable in Phase 6 — for now
            this is a placeholder so internal links don&apos;t 404. The
            shape and rhythm are correct: drop cap, pulled-quote intro,
            two-column display headlines for sub-sections, related teas at
            the bottom.
          </p>
          <p className="mb-5">
            Each post gets a category, a read-time estimate, an author
            byline, and a list of related teas — those are the links the
            recommendations engine uses to weave journal content into
            tea-detail pages and vice versa.
          </p>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-9 mb-4 text-hero-md">
            Phase 3 will fill this in
          </h2>
          <p className="mb-5">
            The unified feed (this post + Vivek/James session logs + your
            session logs) is the next chunk of work. Until then, treat this
            as a route that exists so /journal cards link somewhere.
          </p>
        </div>

        {related.length > 0 && (
          <div className="mt-14 pt-8 border-t border-warm-200">
            <Eyebrow>Teas referenced in this post</Eyebrow>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {related.map((t) => (
                <TeaCard key={t.slug} tea={t} density="compact" />
              ))}
            </div>
          </div>
        )}
      </Container>
      <div className="h-16" />
    </main>
  );
}
