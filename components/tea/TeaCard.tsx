// Server component — used by every list/grid page. No hooks, no
// handlers. If someone later needs an onClick variant they can wrap a
// `<button>` around <TeaCardInner>.

import Link from "next/link";
import type { CardDensity, Tea } from "@/lib/types";
import { teaAvg, teaUrl, teaSubtitle, teaIsRated } from "@/lib/tea-helpers";
import { TeaTypeTag } from "@/components/ui/TeaTypeTag";
import { StarRow } from "@/components/ui/StarRow";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EditorialImage } from "@/components/ui/EditorialImage";

type Props = {
  tea: Tea;
  density?: CardDensity;
  /** Hide rating chip + stars (member blind / forced-hide). */
  hideReviews?: boolean;
  /** Eager-load this card's hero image. Use on the first 1–2 cards
   *  in a grid so the LCP-eligible image isn't lazy-loaded by
   *  default (Lighthouse: lcp-lazy-loaded). */
  priority?: boolean;
};

export function TeaCard({ tea, density = "cozy", hideReviews = false, priority = false }: Props) {
  const compact = density === "compact";
  const avg = teaAvg(tea);
  const rated = teaIsRated(tea);

  return (
    <Link
      href={teaUrl(tea)}
      className="block no-underline group card-surface card-surface-hover overflow-hidden"
    >
      <div className="relative">
        <EditorialImage
          src={tea.imageUrl}
          alt={`${tea.name} — ${tea.vendor}`}
          gradient={tea.gradient}
          aspectRatio={compact ? "16/8" : "16/10"}
          // Card grids are 1col mobile, 2col sm/md, max-width ~520px
          // per card on lg+. Tightened from "33vw" so next/image
          // serves the right resolution.
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 520px"
          priority={priority}
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <TeaTypeTag type={tea.type} small={compact} />
          {tea.subtype && (
            <span
              className={[
                "rounded-pill font-mono font-bold tracking-wide bg-cream-glass backdrop-blur-[2px] text-forest",
                compact ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-0.5 text-[10px]",
              ].join(" ")}
            >
              {tea.subtype}
            </span>
          )}
        </div>
        {!hideReviews && rated && (
          <div
            className="absolute top-3 right-3 px-2.5 py-1 rounded-pill font-display font-semibold text-burgundy bg-cream-glass backdrop-blur-[2px] text-sm"
          >
            {avg.toFixed(1)}
          </div>
        )}
        {!hideReviews && !rated && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-pill text-warm-700 bg-cream-glass backdrop-blur-[2px] text-[10px] font-bold tracking-widest uppercase">
            New · tasting
          </div>
        )}
      </div>
      <div className={compact ? "px-3.5 pt-3 pb-3.5" : "px-4 pt-4 pb-4"}>
        <Eyebrow>{tea.region}</Eyebrow>
        {/* h2 (not h3): every card is the primary content unit on the
            grid pages, and Lighthouse heading-order enforces no-skip
            from h1. The visual size is unchanged. Same pattern used
            on the journal index. */}
        <h2
          className={[
            "font-display text-burgundy font-medium leading-tight tracking-tight m-0 mt-1",
            compact ? "text-[19px]" : "text-2xl",
          ].join(" ")}
        >
          {tea.name}
        </h2>
        {/* Plain-English subtitle — newcomer-friendly tag like
            "3-year pu'er, mineral & honeyed". Editor-overridable via
            tea.subtitle; falls back to teaSubtitle() derivation. */}
        <p className={[
          "text-warm-700 italic m-0",
          compact ? "text-[12px] mt-0.5 leading-snug" : "text-[13px] mt-1 leading-snug",
        ].join(" ")}>
          {teaSubtitle(tea)}
        </p>
        {!compact && (
          <p className="text-xs text-warm-600 m-0 mt-1">
            {tea.year} · {tea.elev}m · {tea.vendor}
          </p>
        )}
        <div
          className={[
            "flex justify-between items-center gap-2",
            compact ? "mt-2" : "mt-3",
          ].join(" ")}
        >
          {!hideReviews && rated ? (
            <StarRow value={Math.round(avg / 2)} />
          ) : (
            <span /> /* placeholder so $/g stays right-aligned */
          )}
          <span className="text-xs text-warm-600 font-mono">
            ${tea.price.toFixed(2)}/g
          </span>
        </div>
      </div>
    </Link>
  );
}
