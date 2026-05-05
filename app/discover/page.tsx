import Link from "next/link";
import type { Metadata } from "next";
import { TEAS, VENDORS } from "@/lib/data";

// Hub page — pure copy. Revalidate weekly so vendor/tea counts refresh.
export const revalidate = 604800;
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TeaStain } from "@/components/ui/TeaStain";

export const metadata: Metadata = {
  title: "Discover",
  description:
    "Three doors into Two Buds and a Leaf — browse the tea library, the vendor atlas, or the glossary of terms.",
};

type HubCard = {
  href: string;
  eyebrow: string;
  title: string;
  desc: string;
  stat: string;
  grad: string;
  mark: string;
  disabled?: boolean;
};

export default function DiscoverHub() {
  const teaCount = TEAS.length;
  const vendorCount = VENDORS.length;

  const cards: HubCard[] = [
    {
      href: "/discover/teas",
      eyebrow: "The library",
      title: "Teas",
      desc:
        "Every tea we've brewed, filtered by type, origin, vendor, and flavor. The full catalogue, with notes you can act on.",
      stat: `${teaCount} tea${teaCount === 1 ? "" : "s"} catalogued`,
      grad: "linear-gradient(135deg,#A8B49C 0%,#5A7A4D 100%)",
      mark: "茶",
    },
    {
      href: "/discover/vendors",
      eyebrow: "The atlas",
      title: "Vendors",
      desc:
        "An atlas of shops we trust — grouped by continent, with their specialties and the teas of theirs we've reviewed.",
      stat: `${vendorCount} vendor${vendorCount === 1 ? "" : "s"} mapped`,
      grad: "linear-gradient(135deg,#D4B06A 0%,#A67A4D 100%)",
      mark: "店",
    },
    {
      href: "/discover/glossary",
      eyebrow: "The reference",
      title: "Glossary",
      desc:
        "Tea types, brewing methods, vessels, flavor terms, and mouthfeel — each entry with a plain-language explanation and the deeper detail behind it.",
      stat: "50 entries",
      grad: "linear-gradient(135deg,#8A9BA8 0%,#5A6B7A 100%)",
      mark: "辞",
    },
  ];

  return (
    <main>
      <Container>
        <div className="relative pt-14 pb-8">
          <TeaStain
            size={320}
            color="#C4A35A"
            opacity={0.14}
            className="absolute top-0 -right-20 pointer-events-none"
          />
          <Eyebrow>Discover</Eyebrow>
          <h1 className="font-display text-burgundy font-medium tracking-tightest leading-tighter mt-3 mb-5 text-[72px]">
            <span className="italic">Find your way in.</span>
          </h1>
          <p className="text-lg text-warm-700 max-w-[640px] leading-relaxed m-0">
            Three doors into the same room. Pick the leaves, the people who
            sourced them, or the words we use to describe what&apos;s in the
            cup.
          </p>
        </div>

        <section className="grid grid-cols-3 gap-6 pb-16">
          {cards.map((c) => {
            const inner = (
              <article
                className={[
                  "group bg-[var(--bg-elevated)] rounded-2xl border border-warm-200 shadow-card overflow-hidden flex flex-col",
                  "transition-all duration-200 ease-smooth",
                  c.disabled ? "opacity-70 cursor-default" : "cursor-pointer hover:shadow-elevated hover:-translate-y-0.5",
                ].join(" ")}
              >
                <div
                  className="relative flex items-center justify-center"
                  style={{ aspectRatio: "5/4", background: c.grad }}
                >
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.25) 100%)",
                    }}
                  />
                  <span
                    aria-hidden
                    className="relative font-display italic font-medium tracking-tightest"
                    style={{
                      fontSize: 140,
                      color: "rgba(250,247,242,0.9)",
                      textShadow: "0 4px 24px rgba(0,0,0,0.18)",
                    }}
                  >
                    {c.mark}
                  </span>
                  {c.disabled && (
                    <span className="absolute top-3.5 right-3.5 px-3 py-1 rounded-pill bg-[rgba(250,247,242,0.95)] text-warm-600 text-[10px] font-bold tracking-widest uppercase">
                      Coming next
                    </span>
                  )}
                </div>
                <div className="px-6 pt-5 pb-6 flex-1 flex flex-col">
                  <Eyebrow>{c.eyebrow}</Eyebrow>
                  <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-2.5 text-[36px]">
                    {c.title}
                  </h2>
                  <p className="text-sm text-warm-700 leading-relaxed m-0 mb-4 flex-1">
                    {c.desc}
                  </p>
                  <div className="flex justify-between items-center pt-3.5 border-t border-warm-200">
                    <span className="text-[11px] text-warm-500 tracking-widest uppercase font-bold">
                      {c.stat}
                    </span>
                    {!c.disabled && (
                      <span className="text-[13px] font-bold text-burgundy">
                        Open →
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );

            return c.disabled ? (
              <div key={c.href}>{inner}</div>
            ) : (
              <Link key={c.href} href={c.href} className="no-underline">
                {inner}
              </Link>
            );
          })}
        </section>
      </Container>
    </main>
  );
}
