import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "The words for what's in the cup — tea types, brewing methods, vessels, flavor terms, and mouthfeel, written for both newcomers and experienced drinkers.",
};

const SECTIONS = [
  ["Tea Types",        "Green, white, oolong, black, pu'er sheng/shou, yellow, hei cha…"],
  ["Brewing Methods",  "Gongfu, western, grandpa, cold-brew…"],
  ["Brewing Vessels",  "Gaiwan, yixing, kyusu, hohin, shiboridashi…"],
  ["Flavor Terms",     "Every flavor on the 12-axis radar — defined."],
  ["Mouthfeel",        "Astringent, oily, full-bodied, huigan, qi, drying…"],
] as const;

export default function GlossaryPage() {
  return (
    <main>
      <Container size="article">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-warm-600 text-[13px] font-sans no-underline mt-8 mb-2"
        >
          ← Discover
        </Link>

        <div className="pt-2 pb-8">
          <Eyebrow>Discover · Glossary</Eyebrow>
          <h1 className="font-display text-burgundy font-medium tracking-tight leading-[1.05] mt-2 mb-4 text-[64px]">
            <span className="italic">The words</span> for what&apos;s in the cup.
          </h1>
          <p className="text-base text-warm-700 leading-relaxed max-w-[620px] m-0 mb-8">
            Tea types, brewing methods, vessels, flavor terms, and mouthfeel —
            every entry written twice. A plain-language line about why it
            matters, then the technical and historical detail underneath.
          </p>
        </div>

        <div className="bg-[var(--bg-elevated)] rounded-2xl border border-dashed border-warm-300 px-8 py-12 text-center">
          <span className="inline-block px-3.5 py-1 rounded-pill bg-burgundy-muted text-burgundy text-[10px] font-bold tracking-widest uppercase mb-4">
            Coming next · Phase 2
          </span>
          <h2 className="font-display text-forest font-medium tracking-tight m-0 mb-3 text-[28px]">
            Five sections, side by side
          </h2>
          <ul className="list-none p-0 m-0 mt-4 max-w-[480px] mx-auto text-left">
            {SECTIONS.map(([t, d]) => (
              <li
                key={t}
                className="py-3 border-b border-warm-200 flex justify-between gap-4"
              >
                <span className="font-display text-burgundy font-medium shrink-0 text-[17px]">
                  {t}
                </span>
                <span className="text-xs text-warm-600 text-right">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
      <div className="h-16" />
    </main>
  );
}
