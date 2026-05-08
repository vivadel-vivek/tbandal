// Server-renderable. The previous version took onClick callbacks for
// the "Log a session" / "Buy from {vendor}" buttons, which forced any
// parent into a "use client" boundary; lifting them to plain hrefs
// lets the entire hero (and its tasting paragraph — the LCP element
// on tea-detail pages) render in static HTML. Audit item #5.

import Link from "next/link";
import { teaAvg } from "@/lib/tea-helpers";
import type { HeroVariant, Tea } from "@/lib/types";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { TeaTypeTag } from "@/components/ui/TeaTypeTag";
import { RatingScore } from "@/components/ui/RatingScore";
import { TeaStain } from "@/components/ui/TeaStain";
import { Glossarized } from "@/components/glossary/Glossarized";
import { renderInlineMarkdown } from "@/lib/markdown";
import { LibraryStatusToggle } from "@/components/library/LibraryStatusToggle";

type Props = {
  tea: Tea;
  variant: HeroVariant;
  hideReviews?: boolean;
  /** Internal route to the session-log page. Made a prop so this
   *  component stays server-renderable (no router.push call sites). */
  logHref: string;
  /** Outbound /go/ redirect for the vendor's shop. Anchor with
   *  target="_blank" + rel="nofollow sponsored" — direct navigation,
   *  no client-side window.open. */
  vendorOutboundHref: string | null;
  /** 1-based catalog position; rendered as "Tea №NNN" in the editorial
   *  variant. Parents pass it down because computing it requires the
   *  full catalog, which lives in Supabase now. */
  catalogIndex?: number;
};

export function TeaHero({
  tea,
  variant,
  hideReviews = false,
  logHref,
  vendorOutboundHref,
  catalogIndex,
}: Props) {
  if (variant === "stain") {
    return (
      <HeroStain
        tea={tea}
        hideReviews={hideReviews}
        logHref={logHref}
        vendorOutboundHref={vendorOutboundHref}
      />
    );
  }
  if (variant === "editorial") {
    return (
      <HeroEditorial
        tea={tea}
        hideReviews={hideReviews}
        logHref={logHref}
        vendorOutboundHref={vendorOutboundHref}
        catalogIndex={catalogIndex}
      />
    );
  }
  return (
    <HeroSplit
      tea={tea}
      hideReviews={hideReviews}
      logHref={logHref}
      vendorOutboundHref={vendorOutboundHref}
    />
  );
}

// Helper — render the action-row buttons consistently across variants.
function HeroActions({
  tea,
  logHref,
  vendorOutboundHref,
}: {
  tea: Tea;
  logHref: string;
  vendorOutboundHref: string | null;
}) {
  return (
    <>
      <Link href={logHref} className="inline-flex">
        <Button variant="primary">Log a session</Button>
      </Link>
      {vendorOutboundHref && (
        <a
          href={vendorOutboundHref}
          target="_blank"
          rel="noopener nofollow sponsored"
          className="inline-flex no-underline"
        >
          <Button variant="secondary">Buy from {tea.vendor} ↗</Button>
        </a>
      )}
      <LibraryStatusToggle kind="tea" slug={tea.slug} size="md" />
    </>
  );
}

// =====================================================================
// SPLIT — image left + meta right (default)
// =====================================================================

function HeroSplit({ tea, hideReviews, logHref, vendorOutboundHref }: Omit<Props, "variant">) {
  const avg = teaAvg(tea);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_1fr] gap-6 sm:gap-10 mt-4">
      <div
        className="rounded-2xl shadow-elevated relative overflow-hidden"
        style={{ aspectRatio: "1/1", background: tea.gradient }}
      >
        <div className="absolute top-5 left-5 right-5 flex justify-between">
          <TeaTypeTag type={tea.type} />
          <span className="px-3 py-1 rounded-pill bg-[rgba(250,247,242,0.92)] text-burgundy text-[11px] font-bold tracking-wide uppercase">
            ★ Featured
          </span>
        </div>
        {tea.chinese && (
          <div className="absolute bottom-5 sm:bottom-6 left-5 sm:left-6 right-5 sm:right-6 text-cream">
            <div className="font-display italic tracking-tight text-[28px] sm:text-[40px]">
              {tea.chinese}
            </div>
          </div>
        )}
      </div>

      <div>
        <Eyebrow>
          {tea.region} · {tea.year}
        </Eyebrow>
        <h1 className="font-display text-burgundy font-medium tracking-tightest leading-tighter m-0 mt-2 mb-3 text-hero-xl">
          {tea.name}
        </h1>
        {!hideReviews && (
          <div className="flex items-center gap-4 mb-4">
            <RatingScore value={avg} big />
            <div className="text-[13px] text-warm-600">
              <div>
                From <strong className="text-forest">{tea.vendor}</strong>
              </div>
              <div>
                {tea.sessions} sessions · {tea.elev}m elevation
              </div>
            </div>
          </div>
        )}
        <p className="text-[17px] text-warm-700 leading-relaxed mb-5">
          <Glossarized>{renderInlineMarkdown(tea.summary)}</Glossarized>
        </p>
        <div className="flex gap-2.5 flex-wrap items-center">
          <HeroActions tea={tea} logHref={logHref} vendorOutboundHref={vendorOutboundHref} />
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// STAIN — centered editorial w/ tea-stain accent
// =====================================================================

function HeroStain({ tea, hideReviews, logHref, vendorOutboundHref }: Omit<Props, "variant">) {
  const avg = teaAvg(tea);
  return (
    <div className="relative pt-12 pb-10">
      <TeaStain
        size={520}
        color={tea.swatch}
        opacity={0.18}
        className="absolute -top-10 -right-20 pointer-events-none hidden sm:block"
      />
      <TeaStain
        size={280}
        color="#C4A35A"
        opacity={0.12}
        className="absolute -bottom-14 -left-24 pointer-events-none hidden sm:block"
      />
      <div className="relative max-w-narrow mx-auto text-center">
        <Eyebrow>
          {tea.region} · {tea.year}
        </Eyebrow>
        {tea.chinese && (
          <div
            // 0.55 was failing WCAG large-text contrast (2.83:1, needs ≥3:1).
            // 0.72 puts it just above the floor while preserving the
            // intentional faded-stamp feel.
            className="font-display italic mt-3 tracking-tight text-burgundy text-[32px] sm:text-[44px]"
            style={{ opacity: 0.72 }}
          >
            {tea.chinese}
          </div>
        )}
        <h1 className="font-display text-burgundy font-medium m-0 mt-1 mb-4 text-hero-3xl" style={{ letterSpacing: "-0.03em", lineHeight: 1 }}>
          {tea.name}
        </h1>
        {!hideReviews && (
          <div
            className="inline-flex items-center gap-4 px-5 py-2.5 rounded-pill bg-[var(--bg-elevated)] border border-warm-200 shadow-card mb-6"
          >
            <RatingScore value={avg} />
            <span className="h-4 w-px bg-warm-300" aria-hidden />
            <span className="text-[13px] text-warm-700">
              From <strong className="text-forest">{tea.vendor}</strong>
            </span>
            <span className="h-4 w-px bg-warm-300" aria-hidden />
            <TeaTypeTag type={tea.type} />
          </div>
        )}
        <p
          className="font-serif italic text-warm-700 leading-relaxed max-w-[600px] mx-auto mb-7 text-[19px]"
          style={{ textWrap: "balance" }}
        >
          &ldquo;<Glossarized>{renderInlineMarkdown(tea.summary)}</Glossarized>&rdquo;
        </p>
        <div className="inline-flex gap-2.5 flex-wrap items-center justify-center">
          <HeroActions tea={tea} logHref={logHref} vendorOutboundHref={vendorOutboundHref} />
        </div>
        <div
          className="mt-10 rounded-2xl shadow-elevated"
          style={{ aspectRatio: "16/8", background: tea.gradient }}
        />
      </div>
    </div>
  );
}

// =====================================================================
// EDITORIAL — magazine-style masthead
// =====================================================================

function HeroEditorial({
  tea, hideReviews, logHref, vendorOutboundHref, catalogIndex,
}: Omit<Props, "variant">) {
  const avg = teaAvg(tea);
  // Fall back to a stable slug-based hash when no catalog index was
  // passed — keeps the editorial variant useful in isolation.
  const idx = typeof catalogIndex === "number"
    ? catalogIndex
    : Math.abs(tea.slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 999;
  const teaNo = String(idx + 1).padStart(3, "0");

  return (
    <div className="mt-4">
      {/* Top eyebrow strip */}
      <div className="flex items-center gap-2.5 px-4.5 py-2.5 bg-[var(--bg-elevated)] border border-warm-200 rounded-md mb-5 text-[11px] tracking-widest uppercase font-bold text-warm-600">
        <span className="text-burgundy">Tea №{teaNo}</span>
        <span>·</span>
        <span>{tea.country}</span>
        <span>·</span>
        <span>{tea.year}</span>
        <span className="ml-auto">{tea.harvest}</span>
      </div>

      {/* Big editorial title */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-end gap-6 sm:gap-8 pb-5 sm:pb-6 border-b-2 border-burgundy">
        <div>
          {tea.chinese && (
            <div className="font-display italic text-gold-dark tracking-tight text-[28px] sm:text-[36px]">
              {tea.chinese}
            </div>
          )}
          <h1
            className="font-display text-burgundy font-medium m-0 text-hero-4xl"
            style={{ letterSpacing: "-0.03em", lineHeight: 0.95 }}
          >
            {tea.name}
          </h1>
          <div className="mt-3.5 font-display italic text-warm-600 tracking-tight text-[22px]">
            {tea.region}, brewed {tea.brewing.style.toLowerCase()} at{" "}
            {tea.brewing.temp}.
          </div>
        </div>
        {!hideReviews && (
          <div className="text-right">
            <div className="text-[11px] tracking-widest uppercase text-warm-600 font-bold mb-1.5">
              Composite
            </div>
            <RatingScore value={avg} big />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-10 mt-8">
        <div>
          <p
            className="font-serif text-forest leading-snug mb-5 text-[22px]"
            style={{ textWrap: "balance" }}
          >
            <span
              className="font-display float-left text-burgundy font-medium mr-2 mt-1"
              style={{ fontSize: 56, lineHeight: 0.85 }}
            >
              {tea.summary[0]}
            </span>
            <Glossarized>{renderInlineMarkdown(tea.summary.slice(1))}</Glossarized>
          </p>
          <div className="flex gap-2.5 flex-wrap items-center">
            <HeroActions tea={tea} logHref={logHref} vendorOutboundHref={vendorOutboundHref} />
          </div>
        </div>
        <aside
          className="rounded-xl border border-warm-200 p-5 self-start"
          style={{ background: tea.swatch + "12" }}
        >
          <Eyebrow>Sigil · vendor</Eyebrow>
          <div className="font-display italic text-burgundy mt-2 mb-1 text-[28px]">
            {tea.vendor}
          </div>
          <div className="text-[13px] text-warm-700">
            {tea.sessions} sessions · {tea.elev}m · {tea.age}
          </div>
        </aside>
      </div>
    </div>
  );
}
