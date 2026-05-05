import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { POSTS, TEAS, postBySlug, teaUrl } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { AvatarChip } from "@/components/ui/AvatarChip";
import { TeaCard } from "@/components/tea/TeaCard";
import { Glossarized } from "@/components/glossary/Glossarized";

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
          <PostBody body={post.body} />
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

/**
 * Lightweight Markdown-ish renderer. The bodies in lib/data.ts use
 * `\n\n` paragraph breaks and `## ` for H2 subheads — enough for the
 * editorial shape we need without pulling in a full Markdown lib. Will
 * be replaced by MDX in Phase 6 once Airtable is the source.
 */
function PostBody({ body }: { body: string | undefined }) {
  if (!body) {
    return (
      <p className="mb-5 italic text-warm-600">
        The full essay text lands when this post is published. Check back
        soon — the byline and related teas above are real.
      </p>
    );
  }

  const blocks = body.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="font-display text-burgundy font-medium tracking-tight m-0 mt-9 mb-4 text-hero-md"
            >
              {block.slice(3).trim()}
            </h2>
          );
        }
        return (
          <p key={i} className="mb-5">
            <Glossarized>{block}</Glossarized>
          </p>
        );
      })}
    </>
  );
}
