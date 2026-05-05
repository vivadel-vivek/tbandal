import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Request a review",
  description:
    "Suggest a tea you'd like Vivek or James to brew and write up — including how to get them a sample or where to buy.",
};

export default function RequestReviewPage() {
  return (
    <main>
      <Container size="article">
        <Link
          href="/discover/teas"
          className="inline-flex items-center gap-1.5 text-warm-600 text-[13px] font-sans no-underline mt-8 mb-2"
        >
          ← Back to teas
        </Link>

        <div className="pt-2 pb-8">
          <Eyebrow>Members · Request a review</Eyebrow>
          <h1 className="font-display text-burgundy font-medium tracking-tight leading-[1.05] mt-2 mb-4 text-[64px]">
            <span className="italic">Suggest a tea</span> for review.
          </h1>
          <p className="text-base text-warm-700 leading-relaxed max-w-[620px] m-0">
            The full request form lands in Phase 4.5.12. It pre-fills the tea
            and vendor when you reach it from a tea-detail page, lets you pick
            which reviewer(s) to request, and offers either &ldquo;I have a
            sample I can send&rdquo; or &ldquo;Here&apos;s a purchase
            link.&rdquo;
          </p>
        </div>

        <div className="bg-[var(--bg-elevated)] rounded-2xl border border-dashed border-warm-300 px-8 py-12 text-center">
          <span className="inline-block px-3.5 py-1 rounded-pill bg-burgundy-muted text-burgundy text-[10px] font-bold tracking-widest uppercase mb-4">
            Coming next · Phase 4.5.12
          </span>
          <h2 className="font-display text-forest font-medium tracking-tight m-0 mb-3 text-[28px]">
            What this form will capture
          </h2>
          <ul className="list-none p-0 m-0 max-w-[480px] mx-auto text-left">
            {[
              ["Tea & vendor", "Pre-filled when launched from a tea page; otherwise free-text."],
              ["Reviewer(s)", "Vivek, James, or both."],
              ["Sample or link", "Offer a sample-send (we cover return shipping) or paste a purchase URL."],
              ["Why this tea", "A few sentences on why it's worth our time."],
            ].map(([t, d]) => (
              <li
                key={t}
                className="py-3 border-b border-warm-200 flex justify-between gap-4"
              >
                <span className="font-display text-burgundy font-medium shrink-0 text-[17px]">{t}</span>
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
