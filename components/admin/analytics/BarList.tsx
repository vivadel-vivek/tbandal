// Top-N horizontal bar list with inline labels. We avoid an SVG bar
// chart because the labels (paths, vendor slugs) are arbitrary length
// and look better as actual flow-laid-out text. Each row is a flex
// container with a CSS-width bar behind the label and a tabular-nums
// count on the right.
//
// Used for "top pages" and "top vendor clickouts" on the dashboards.

import type { LabelledCount } from "@/lib/analytics";

type Props = {
  data: LabelledCount[];
  /** Optional URL builder — wraps each label in a link to the surface. */
  href?: (label: string) => string | null;
  /** Override the computed max so multiple lists can share a scale. */
  max?: number;
  /** Empty-state message. */
  emptyMessage?: string;
  /** Foreground (label) accent. */
  color?: string;
  /** Bar fill. */
  barColor?: string;
};

export function BarList({
  data,
  href,
  max,
  emptyMessage = "No data yet.",
  color = "var(--forest, #2D3A2E)",
  barColor = "var(--burgundy, #722F37)",
}: Props) {
  if (data.length === 0) {
    return (
      <div className="text-[12px] text-warm-600 italic py-6">{emptyMessage}</div>
    );
  }
  const localMax = Math.max(1, ...data.map((d) => d.count));
  const scaleMax = max ?? localMax;

  return (
    <ol className="list-none p-0 m-0 flex flex-col gap-1.5">
      {data.map((d) => {
        const pct = (d.count / scaleMax) * 100;
        const link = href?.(d.label) ?? null;
        const labelEl = (
          <span
            className="font-mono text-[12px] truncate relative z-[1]"
            style={{ color, maxWidth: "70%" }}
          >
            {d.label}
          </span>
        );
        return (
          <li
            key={d.label}
            className="relative flex items-center justify-between rounded-md px-2.5 py-1.5 bg-cream"
            style={{ overflow: "hidden" }}
          >
            <span
              aria-hidden
              className="absolute top-0 bottom-0 left-0"
              style={{
                width: `${pct}%`,
                background: barColor,
                opacity: 0.13,
              }}
            />
            {link ? (
              <a
                href={link}
                className="no-underline relative z-[1] truncate"
                style={{ maxWidth: "70%" }}
              >
                {labelEl}
              </a>
            ) : (
              labelEl
            )}
            <span
              className="font-mono text-[12px] font-bold tabular-nums relative z-[1]"
              style={{ color }}
            >
              {d.count.toLocaleString()}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
