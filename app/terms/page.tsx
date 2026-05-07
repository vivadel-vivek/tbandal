import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "The basic rules for using Two Buds and a Leaf — what we promise, what we don't, and what we expect from members and vendors.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main>
      <Container size="article">
        <div className="pt-10 sm:pt-14 pb-6">
          <Eyebrow>Terms of use</Eyebrow>
          <h1 className="font-display text-burgundy font-medium tracking-tightest leading-tighter mt-3 mb-4 text-[44px] sm:text-[64px]">
            <span className="italic">The basics.</span>
          </h1>
          <p className="text-base text-warm-700 leading-relaxed max-w-[640px] m-0">
            By using twobudsandaleaf.com you agree to these terms. We&apos;ve
            tried to keep them short and human. If anything is unclear,
            email us at{" "}
            <a href="mailto:hello@twobudsandaleaf.com" className="text-burgundy underline">
              hello@twobudsandaleaf.com
            </a>{" "}
            and we&apos;ll explain or update.
          </p>
        </div>

        {/* WHAT THE SITE IS */}
        <section className="mt-10 pt-8 border-t border-warm-200">
          <Eyebrow>What this is</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-4 text-[28px] sm:text-[40px]">
            An editorial tea journal.
          </h2>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] m-0">
            Two Buds and a Leaf is an independent two-person review site for
            loose-leaf tea. Reviews and journal entries reflect the personal
            opinions of the named author. We don&apos;t accept payment for
            reviews; affiliate commissions on outbound shop clicks are
            disclosed on{" "}
            <Link href="/about#affiliate-disclosure" className="text-burgundy underline">
              /about
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-burgundy underline">/privacy</Link>.
          </p>
        </section>

        {/* MEMBER ACCOUNTS */}
        <section className="mt-10 pt-8 border-t border-warm-200">
          <Eyebrow>Member accounts</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-4 text-[28px] sm:text-[40px]">
            One account per human, please.
          </h2>
          <ul className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] space-y-3 m-0 p-0 list-none">
            <li>
              You&apos;re responsible for keeping your password and any
              shared session links you generate to yourself. Tell us
              promptly if you think your account has been accessed without
              your permission.
            </li>
            <li>
              Don&apos;t use the rating system to manipulate aggregate
              scores — duplicate accounts, automated rating, or coordinated
              brigading get suspended. We use the lowest-friction tools
              that work; if scale forces tighter rules later, we&apos;ll
              update this page.
            </li>
            <li>
              You can delete your account at any time by emailing{" "}
              <a href="mailto:hello@twobudsandaleaf.com?subject=Delete account" className="text-burgundy underline">
                hello@twobudsandaleaf.com
              </a>
              . Deletion removes your library, sessions, ratings, and shared
              session links. See{" "}
              <Link href="/privacy" className="text-burgundy underline">/privacy</Link>{" "}
              for what survives in aggregate.
            </li>
          </ul>
        </section>

        {/* CONTENT YOU SUBMIT */}
        <section className="mt-10 pt-8 border-t border-warm-200">
          <Eyebrow>Content you submit</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-4 text-[28px] sm:text-[40px]">
            Yours to write, ours to display.
          </h2>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] mb-3">
            Ratings, session notes, and any text you contribute remain
            yours. By posting, you grant us a non-exclusive license to
            display that content within the site (including aggregating
            ratings into the &ldquo;Members&rdquo; line on the radar) and
            to keep showing it as long as your account exists.
          </p>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] m-0">
            Don&apos;t post things you don&apos;t have rights to, things
            that are deceptive (fake ratings to influence the consensus),
            or things that harass other people. We may remove content that
            violates this without notice; repeat issues end the account.
          </p>
        </section>

        {/* VENDOR CONTENT */}
        <section className="mt-10 pt-8 border-t border-warm-200">
          <Eyebrow>Vendors</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-4 text-[28px] sm:text-[40px]">
            Submitting tea for review.
          </h2>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] mb-3">
            See{" "}
            <Link href="/for-vendors" className="text-burgundy underline">/for-vendors</Link>{" "}
            for the submission template. Reviews can be critical — we
            don&apos;t suppress unflattering coverage and we share drafts
            48 hours before publication for factual corrections only, not
            editorial veto.
          </p>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] m-0">
            If you&apos;re a vendor with a linked vendor profile on the
            site, you have edit access to your own storefront copy via{" "}
            <code className="font-mono text-[13px]">/admin/vendor</code>.
            That access is bound to the email you registered with; don&apos;t
            share credentials with people who shouldn&apos;t edit your
            storefront.
          </p>
        </section>

        {/* WARRANTY */}
        <section className="mt-10 pt-8 border-t border-warm-200">
          <Eyebrow>What we promise (and what we don&apos;t)</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-4 text-[28px] sm:text-[40px]">
            Honest opinions, no guarantees about your tea.
          </h2>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] mb-3">
            We make a real effort to get brewing parameters, regions, and
            sourcing notes right, and we update the catalog when we find
            errors. But the site is provided as-is. We&apos;re not
            responsible for results from following our brewing recipes,
            tea you buy through outbound links, or commercial decisions you
            make based on our reviews.
          </p>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] m-0">
            Spotted an error? Email us — we&apos;ll correct in the next
            pass and credit you in the journal if you&apos;d like.
          </p>
        </section>

        {/* CHANGES */}
        <section className="mt-10 pt-8 border-t border-warm-200">
          <Eyebrow>Changes to these terms</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-4 text-[24px] sm:text-[32px]">
            We&apos;ll tell you.
          </h2>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] m-0">
            Material changes get a banner on the home page for at least a
            week and a journal entry explaining what changed and why.
            Continued use after that constitutes acceptance.
          </p>
        </section>

        <p className="text-[12px] text-warm-600 italic mt-12 mb-2">
          Last updated: 2026-05-07.
        </p>
        <div className="h-16" />
      </Container>
    </main>
  );
}
