import type { TeaTypeName } from "@/lib/types";

type Props = {
  type: TeaTypeName;
  small?: boolean;
};

const STYLES: Record<TeaTypeName, { bg: string; fg: string }> = {
  Green:   { bg: "rgba(122,154,109,0.18)", fg: "#5A7A4D" },
  White:   { bg: "#E8E5E2",                fg: "#6B6560" },
  Yellow:  { bg: "rgba(212,196,122,0.22)", fg: "#A69A3D" },
  Oolong:  { bg: "rgba(212,160,122,0.22)", fg: "#A67A4D" },
  Black:   { bg: "rgba(92,64,51,0.18)",    fg: "#5C4033" },
  "Pu'er": { bg: "rgba(139,115,85,0.2)",   fg: "#6B5335" },
  Herbal:  { bg: "rgba(154,122,154,0.18)", fg: "#7A5A7A" },
};

export function TeaTypeTag({ type, small = false }: Props) {
  const { bg, fg } = STYLES[type] ?? STYLES.Green;
  return (
    <span
      className={[
        "rounded-pill font-bold uppercase tracking-wide",
        small ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]",
      ].join(" ")}
      style={{ background: bg, color: fg }}
    >
      {type}
    </span>
  );
}
