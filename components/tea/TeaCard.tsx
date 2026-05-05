// Server component — used by every list/grid page. No hooks, no
// handlers. If someone later needs an onClick variant they can wrap a
// `<button>` around <TeaCardInner>.

import Link from "next/link";
import type { CardDensity, Tea } from "@/lib/types";
import { teaAvg } from "@/lib/data";
import { TeaTypeTag } from "@/components/ui/TeaTypeTag";
import { StarRow } from "@/components/ui/StarRow";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Props = {
  tea: Tea;
  density?: CardDensity;
  /** Hide rating chip + stars (member blind / forced-hide). */
  hideReviews?: boolean;
};

export function TeaCard({ tea, density = "cozy", hideReviews = false }: Props) {
  const compact = density === "compact";
  const avg = teaAvg(tea);

  return (
    <Link
      href={`/tea/${tea.slug}`}
      className="block no-underline group card-surface card-surface-hover overflow-hidden"
    >
      <div
        className="relative"
        style={{
          aspectRatio: compact ? "16/8" : "16/10",
          background: tea.gradient,
        }}
      >
        <div className="absolute top-3 left-3">
          <TeaTypeTag type={tea.type} small={compact} />
        </div>
        {!hideReviews && (
          <div
            className="absolute top-3 right-3 px-2.5 py-1 rounded-pill font-display font-semibold text-burgundy bg-cream-glass backdrop-blur-[2px] text-sm"
          >
            {avg.toFixed(1)}
          </div>
        )}
      </div>
      <div className={compact ? "px-3.5 pt-3 pb-3.5" : "px-4 pt-4 pb-4"}>
        <Eyebrow>{tea.region}</Eyebrow>
        <h3
          className={[
            "font-display text-burgundy font-medium leading-tight tracking-tight m-0 mt-1",
            compact ? "text-[19px]" : "text-2xl",
          ].join(" ")}
        >
          {tea.name}
        </h3>
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
          {!hideReviews ? (
            <StarRow value={Math.round(avg / 2)} />
          ) : (
            <span /> /* placeholder so $/g stays right-aligned */
          )}
          <span className="text-xs text-warm-500 font-mono">
            ${tea.price.toFixed(2)}/g
          </span>
        </div>
      </div>
    </Link>
  );
}
