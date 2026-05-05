type Props = {
  value: number;
  max?: number;
  size?: number;
};

export function StarRow({ value, max = 5, size = 14 }: Props) {
  return (
    <span
      className="inline-flex gap-px tracking-[1px] leading-none"
      style={{ fontSize: size }}
      aria-label={`${value} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className={i < value ? "text-gold" : "text-warm-200"}
        >
          ★
        </span>
      ))}
    </span>
  );
}
