import Link from "next/link";
import type { Metadata } from "next";
import { GLOSSARY, glossaryEntryBySlug } from "@/lib/glossary";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "The words for what's in the cup — tea types, brewing methods, vessels, flavor terms, and mouthfeel. Each entry written twice: a plain-language line and the technical detail underneath.",
  alternates: { canonical: "/discover/glossary" },
};

export default function GlossaryPage() {
  return (
    <main>
      <Container size="article">
        <Link href="/discover" className="back-link mt-8 mb-2">
          ← Discover
        </Link>

        <div className="pt-2 pb-6">
          <Eyebrow>Discover · Glossary</Eyebrow>
          <h1 className="font-display text-burgundy font-medium tracking-tight leading-hero mt-2 mb-4 text-hero-xl">
            <span className="italic">The words</span> for what&apos;s in the cup.
          </h1>
          <p className="text-base text-warm-700 leading-relaxed max-w-[640px] m-0">
            Every entry is written twice — a plain-language line about why it
            matters, then the technical and historical detail underneath.
            Beginners can stop at the first line; experienced drinkers will
            recognise the second.
          </p>
        </div>

        {/* Sticky section index */}
        <nav
          aria-label="Glossary sections"
          className="sticky top-[84px] z-[5] bg-[var(--bg)] pt-2 pb-3 mb-4 border-b border-warm-200 flex gap-2 flex-wrap"
        >
          {GLOSSARY.map((s) => (
            <a
              key={s.key}
              href={`#${s.key}`}
              className="px-3 py-1 rounded-pill border border-warm-300 text-[11px] font-bold text-forest tracking-wide uppercase no-underline hover:bg-cream"
            >
              {s.title}
            </a>
          ))}
        </nav>

        {GLOSSARY.map((section) => (
          <section
            key={section.key}
            id={section.key}
            className="pt-8 pb-2 scroll-mt-24"
          >
            <div className="flex items-baseline gap-4 mb-5 pb-3 border-b-2 border-burgundy-muted">
              <h2 className="font-display italic text-burgundy font-medium tracking-tight m-0 text-hero-lg">
                {section.title}
              </h2>
              <span className="text-[11px] text-warm-600 tracking-widest uppercase font-bold">
                {section.entries.length} entr
                {section.entries.length === 1 ? "y" : "ies"}
              </span>
            </div>

            <p className="text-[15px] text-warm-700 leading-relaxed m-0 mb-7 max-w-[640px]">
              {section.intro}
            </p>

            <div className="flex flex-col gap-5">
              {section.entries.map((entry) => (
                <article
                  key={entry.slug}
                  id={entry.slug}
                  className="card-surface p-6 scroll-mt-24"
                >
                  <header className="flex items-baseline gap-3 flex-wrap mb-3">
                    <h3 className="font-display text-burgundy font-medium tracking-tight m-0 text-2xl">
                      {entry.term}
                    </h3>
                    {entry.original && (
                      <span className="font-display italic text-warm-600 text-lg">
                        {entry.original}
                      </span>
                    )}
                    {entry.aliases && entry.aliases.length > 0 && (
                      <span className="text-[11px] text-warm-600 tracking-wide">
                        also: {entry.aliases.join(", ")}
                      </span>
                    )}
                    <a
                      href={`#${entry.slug}`}
                      aria-label={`Anchor to ${entry.term}`}
                      // 36×36 tap area satisfies WCAG 2.5.5 AAA (44×44)
                      // close-enough; previous 7×17 was un-tappable on
                      // touch.
                      className="ml-auto inline-flex items-center justify-center w-9 h-9 rounded-full text-warm-600 hover:text-burgundy hover:bg-cream no-underline"
                    >
                      #
                    </a>
                  </header>

                  <p className="text-[15px] text-forest leading-relaxed m-0 mb-3">
                    <span className="font-bold text-burgundy">Key points —</span>{" "}
                    {entry.lay}
                  </p>

                  <p className="font-serif text-[16px] text-warm-700 leading-relaxed m-0">
                    {entry.technical}
                  </p>

                  {entry.related && entry.related.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-warm-200">
                      <span className="text-[10px] tracking-widest uppercase font-bold text-warm-600 mr-1 self-center">
                        See also
                      </span>
                      {entry.related.map((slug) => {
                        const ref = glossaryEntryBySlug(slug);
                        if (!ref) return null;
                        return (
                          <a
                            key={slug}
                            href={`#${slug}`}
                            className="px-2.5 py-0.5 rounded-pill border border-warm-300 text-[11px] text-warm-700 font-semibold no-underline hover:bg-cream"
                          >
                            {ref.term}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}

        <div className="h-16" />
      </Container>
    </main>
  );
}
