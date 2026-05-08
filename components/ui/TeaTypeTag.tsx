import type { TeaTypeName } from "@/lib/types";

type Props = {
  type: TeaTypeName;
  small?: boolean;
};

const STYLES: Record<TeaTypeName, { bg: string; fg: string }> = {
  Green:         { bg: "rgba(122,154,109,0.18)", fg: "#5A7A4D" },
  White:         { bg: "#E8E5E2",                fg: "#6B6560" },
  Yellow:        { bg: "rgba(212,196,122,0.22)", fg: "#A69A3D" },
  Oolong:        { bg: "rgba(212,160,122,0.22)", fg: "#A67A4D" },
  Black:         { bg: "rgba(92,64,51,0.18)",    fg: "#5C4033" },
  // Sheng pu'er — bright green-brown leaning warm. Reads as raw,
  // young, leaning toward the Green side of the wheel.
  "Sheng Pu'er": { bg: "rgba(150,138,90,0.22)",  fg: "#7B6B3A" },
  // Shou pu'er — deep coffee-brown. Reads as fermented, earthy.
  "Shou Pu'er":  { bg: "rgba(70,42,30,0.22)",    fg: "#3F2418" },
  // Dark (heicha) — slate-grey-brown, a cousin of shou but distinct.
  Dark:          { bg: "rgba(60,55,50,0.20)",    fg: "#403A36" },
  Herbal:        { bg: "rgba(154,122,154,0.18)", fg: "#7A5A7A" },
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
