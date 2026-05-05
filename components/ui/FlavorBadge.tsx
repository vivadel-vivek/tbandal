type AxisLike = { key: string; label: string; color: string };

type Props = {
  axis: AxisLike;
  /** 0–10 intensity */
  intensity: number;
};

/**
 * Pill chip for a flavor axis with its color and a small intensity
 * readout. Used under reviews ("top notes").
 */
export function FlavorBadge({ axis, intensity }: Props) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs text-forest font-medium"
      style={{
        background: axis.color + "1f", // ~12% alpha
        border: `1px solid ${axis.color}55`,
      }}
    >
      <span
        aria-hidden
        className="w-2 h-2 rounded-full"
        style={{ background: axis.color }}
      />
      {axis.label}
      <span className="opacity-55 text-[9px] tracking-[1px] font-mono">
        {Math.round(intensity)}
      </span>
    </span>
  );
}
