type Props = {
  value: number;
  max?: number;
  /** Big = hero treatment (56px display); default = inline 22px */
  big?: boolean;
};

/**
 * Editorial display-font rating, e.g. `9.2/10` or `4.5/5`.
 * Big = hero size (used inside review cards); inline default for cards.
 *
 * A `value` of 0 (or less) renders as "Not yet rated" — newcomers
 * read "0.0/10" as a verdict, not as "no data" (lay-user audit).
 */
export function RatingScore({ value, max = 10, big = false }: Props) {
  if (!Number.isFinite(value) || value <= 0) {
    return (
      <span
        className={[
          "inline-block font-sans font-bold uppercase tracking-widest text-warm-600",
          big ? "text-[14px]" : "text-[10px]",
        ].join(" ")}
      >
        Not yet rated
      </span>
    );
  }
  return (
    <span className="inline-flex items-baseline gap-1 font-display text-burgundy">
      <span
        className={[
          "font-medium leading-none tracking-tightest",
          big ? "text-[56px]" : "text-[22px]",
        ].join(" ")}
      >
        {value.toFixed(1)}
      </span>
      <span
        className={[
          "text-warm-600 font-sans font-semibold",
          big ? "text-[18px]" : "text-[11px]",
        ].join(" ")}
      >
        /{max}
      </span>
    </span>
  );
}
