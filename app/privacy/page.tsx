import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const revalidate = 604800; // weekly — copy that doesn't change much

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What we collect, what we don't, and how we treat your data on Two Buds and a Leaf.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main>
      <Container size="article">
        <div className="pt-10 sm:pt-14 pb-6">
          <Eyebrow>Privacy</Eyebrow>
          <h1 className="font-display text-burgundy font-medium tracking-tightest leading-tighter mt-3 mb-4 text-[44px] sm:text-[64px]">
            <span className="italic">What we keep,</span>
            <br />
            and what we don&apos;t.
          </h1>
          <p className="text-base text-warm-700 leading-relaxed max-w-[640px] m-0">
            This is the short version of how Two Buds and a Leaf treats your
            data. Two of us run the site; we collect as little as we can
            get away with, we don&apos;t sell anything to anyone, and the
            policy is written in English.
          </p>
        </div>

        {/* WHAT WE COLLECT */}
        <section className="mt-10 pt-8 border-t border-warm-200">
          <Eyebrow>What we collect</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-4 text-[28px] sm:text-[40px]">
            Only what the site needs to work.
          </h2>
          <ul className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] space-y-3 m-0 p-0 list-none">
            <li>
              <strong className="text-forest">Account info</strong> — when you
              sign up, we store your email address and a hashed password
              (handled by Supabase Auth). Email is used for sign-in and
              optional notifications, never sold or shared.
            </li>
            <li>
              <strong className="text-forest">Your library and ratings</strong>{" "}
              — teas you wishlist, own, or rate; teaware you save; sessions
              you log. All scoped to your account; only you can see them
              unless you explicitly share a session via a public link.
            </li>
            <li>
              <strong className="text-forest">Settings</strong> — display
              name, palate alignment (James or Vivek), flavor mode, theme,
              notification preferences. Stored on your profile so the site
              looks the same across devices.
            </li>
            <li>
              <strong className="text-forest">Server logs</strong> — Vercel
              records standard request logs (IP, user-agent, route) for
              security and performance debugging. Retention follows
              Vercel&apos;s defaults; we don&apos;t aggregate or join these
              with your account.
            </li>
          </ul>
        </section>

        {/* WHAT WE DON'T */}
        <section className="mt-10 pt-8 border-t border-warm-200">
          <Eyebrow>What we don&apos;t</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-4 text-[28px] sm:text-[40px]">
            No tracking, no selling, no third-party sharing.
          </h2>
          <ul className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] space-y-3 m-0 p-0 list-none">
            <li>
              <strong className="text-forest">No third-party analytics</strong>{" "}
              today — no Google Analytics, no Meta pixel, no Mixpanel, no
              Hotjar. If we ever add aggregate usage analytics, it&apos;ll be
              first-party and we&apos;ll update this page first.
            </li>
            <li>
              <strong className="text-forest">No advertising tracking</strong>.
              We don&apos;t run ads.
            </li>
            <li>
              <strong className="text-forest">No data sales</strong>. Your
              email and library are not products. We will never sell them
              and we will never share them with vendors except in the form
              of de-identified aggregate ratings (e.g. &ldquo;38 members
              rated this tea, average 8.4&rdquo;).
            </li>
          </ul>
        </section>

        {/* COOKIES */}
        <section className="mt-10 pt-8 border-t border-warm-200">
          <Eyebrow>Cookies</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-4 text-[28px] sm:text-[40px]">
            Two cookies, both functional.
          </h2>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] mb-3">
            We set a Supabase session cookie when you sign in (so the site
            knows it&apos;s you on the next request) and a small preferences
            cookie that remembers your theme and flavor-mode choices. Neither
            is used for advertising or tracking across other sites. Sign out
            to clear the session cookie; clear your browser cookies for the
            site to wipe everything.
          </p>
        </section>

        {/* AFFILIATE LINKS */}
        <section className="mt-10 pt-8 border-t border-warm-200">
          <Eyebrow>Affiliate links</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-4 text-[28px] sm:text-[40px]">
            Outbound shop clicks are tracked.
          </h2>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] m-0">
            When you click &ldquo;Visit shop&rdquo; on a tea or vendor page,
            you go through{" "}
            <code className="font-mono text-[13px]">/go/[vendor]</code> with a
            UTM tag attached. Vendors may pay us a small referral commission
            on resulting purchases. Read the full{" "}
            <Link href="/about#affiliate-disclosure" className="text-burgundy underline">
              affiliate disclosure on /about
            </Link>{" "}
            for the rules we hold ourselves to (no paid placements,
            disclosed conflicts of interest, gift-tea flagging).
          </p>
        </section>

        {/* YOUR DATA RIGHTS */}
        <section className="mt-10 pt-8 border-t border-warm-200">
          <Eyebrow>Your data</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-4 text-[28px] sm:text-[40px]">
            Yours to access, export, or delete.
          </h2>
          <ul className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] space-y-3 m-0 p-0 list-none">
            <li>
              <strong className="text-forest">Access &amp; export</strong> —
              email{" "}
              <a href="mailto:hello@twobudsandaleaf.com?subject=Data export" className="text-burgundy underline">
                hello@twobudsandaleaf.com
              </a>{" "}
              and we&apos;ll send your library + sessions as JSON within 30
              days.
            </li>
            <li>
              <strong className="text-forest">Deletion</strong> — email the
              same address with subject &ldquo;Delete account&rdquo;. We
              remove your auth record, profile, library, sessions, and any
              shared session links. De-identified aggregate ratings (e.g.
              the &ldquo;38 members&rdquo; tally) are kept; your specific
              rating is removed from that aggregate.
            </li>
            <li>
              <strong className="text-forest">Correction</strong> — most
              fields you can edit yourself at{" "}
              <Link href="/member/settings" className="text-burgundy underline">
                /member/settings
              </Link>
              . For things you can&apos;t edit, email and we&apos;ll fix it.
            </li>
          </ul>
        </section>

        {/* CONTACT */}
        <section className="mt-10 pt-8 border-t border-warm-200">
          <Eyebrow>Contact</Eyebrow>
          <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-4 text-[24px] sm:text-[32px]">
            Questions go here.
          </h2>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[680px] m-0">
            <a href="mailto:hello@twobudsandaleaf.com" className="text-burgundy underline">
              hello@twobudsandaleaf.com
            </a>
            . We read every message. If something on this page is unclear or
            you think we&apos;re doing something we shouldn&apos;t, please
            tell us — we&apos;ll fix it and update the policy.
          </p>
        </section>

        <p className="text-[12px] text-warm-600 italic mt-12 mb-2">
          Last updated: 2026-05-07. Material changes get a notice on the
          home page and an entry in our{" "}
          <Link href="/journal" className="text-burgundy underline">journal</Link>.
        </p>
        <div className="h-16" />
      </Container>
    </main>
  );
}
