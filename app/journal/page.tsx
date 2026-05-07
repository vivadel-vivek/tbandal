import Link from "next/link";
import type { Metadata } from "next";
import { getPosts } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { AvatarChip } from "@/components/ui/AvatarChip";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Long reads, brewing notes, and vendor spotlights — two reviewers writing one cup at a time. Phase 3 wires up the unified feed and session log.",
  alternates: { canonical: "/journal" },
};

const CATS = ["All", "Brewing", "Culture", "Origin", "Vendor Spotlight"] as const;

export default async function JournalIndex() {
  const POSTS = await getPosts();
  return (
    <main>
      <Container size="article">
        <div className="pt-10 sm:pt-12 pb-6 sm:pb-8">
          <Eyebrow>Journal</Eyebrow>
          <h1 className="font-display italic text-burgundy font-medium tracking-tight leading-hero mt-2 mb-4 text-[44px] sm:text-hero-xl">
            Recently brewed.
          </h1>
          <p className="text-base text-warm-700 leading-relaxed max-w-[580px] m-0">
            Long reads, brewing notes, and vendor spotlights. Two of us
            writing, one cup at a time. The full unified feed (with session
            logs and filters by author) lands in Phase 3.
          </p>
        </div>

        <div className="flex gap-2 mb-6 sm:mb-7 flex-wrap">
          {CATS.map((c, i) => {
            const active = i === 0;
            return (
              <button
                key={c}
                type="button"
                className={[
                  "px-3.5 py-1.5 rounded-pill font-sans text-xs font-semibold cursor-pointer",
                  active
                    ? "border-1.5 border-burgundy bg-burgundy text-cream"
                    : "border border-warm-300 bg-transparent text-forest",
                ].join(" ")}
              >
                {c}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {POSTS.map((p, i) => (
            <Link
              key={p.slug}
              href={`/journal/${p.slug}`}
              className={[
                "card-surface card-surface-hover overflow-hidden no-underline",
                i === 0 ? "sm:col-span-2" : "col-span-1",
              ].join(" ")}
            >
              <div
                className={i === 0 ? "aspect-[16/9] sm:aspect-[16/6]" : "aspect-[16/9]"}
                style={{ background: p.grad }}
              />
              <div className="px-5 sm:px-6 pt-5 pb-5 sm:pb-6">
                <Eyebrow color="var(--sage-text, #556649)">
                  {p.cat} · {p.readTime} min
                </Eyebrow>
                <h3
                  className={[
                    "font-display text-burgundy font-medium leading-snug tracking-tight m-0 mt-2 mb-2.5",
                    i === 0 ? "text-[28px] sm:text-hero-md" : "text-xl sm:text-2xl",
                  ].join(" ")}
                >
                  {p.title}
                </h3>
                <p className="text-sm text-warm-700 leading-relaxed m-0 mb-3.5">
                  {p.excerpt}
                </p>
                <div className="flex items-center gap-2.5">
                  <AvatarChip
                    who={p.author.toLowerCase() as "vivek" | "james"}
                    size={22}
                  />
                  <span className="text-xs text-warm-600">
                    {p.author} · {p.date}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="my-12 px-7 py-6 dashed-card text-center">
          <Eyebrow>Coming next · Phase 3</Eyebrow>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[480px] mx-auto mt-3 mb-0">
            Unified feed with author / type / tea-type filters, search, and a
            session log per tea — including a steep timer that follows the
            brewing guide by default.
          </p>
        </div>
      </Container>
    </main>
  );
}
