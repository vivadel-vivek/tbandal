type Props = {
  value: number;
  max?: number;
  /** Big = hero treatment (56px display); default = inline 22px */
  big?: boolean;
};

/**
 * Editorial display-font rating, e.g. `9.2/10` or `4.5/5`.
 * Big = hero size (used inside review cards); inline default for cards.
 */
export function RatingScore({ value, max = 10, big = false }: Props) {
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
