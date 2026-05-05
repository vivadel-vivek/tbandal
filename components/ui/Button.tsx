import type {
  ButtonHTMLAttributes,
  CSSProperties,
  ReactNode,
} from "react";

type Variant = "primary" | "secondary" | "ghost" | "gold";
type Size = "sm" | "default" | "lg";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> & {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  style?: CSSProperties;
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-burgundy text-cream border-0 hover:bg-burgundy-dark",
  secondary:
    "bg-transparent text-burgundy border-1.5 border-burgundy hover:bg-burgundy-muted",
  ghost:
    "bg-transparent text-forest border-0 rounded-md hover:bg-warm-100",
  gold:
    "bg-gold text-forest border-0 hover:bg-gold-dark",
};

const SIZES: Record<Size, string> = {
  sm:      "px-3.5 py-1.5 text-[11px]",
  default: "px-5  py-2.5 text-[13px]",
  lg:      "px-7  py-3.5 text-[15px]",
};

export function Button({
  children,
  variant = "primary",
  size = "default",
  className = "",
  style,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      style={style}
      className={[
        "font-sans font-bold cursor-pointer inline-flex items-center gap-2 whitespace-nowrap rounded-pill",
        "transition-colors duration-200 ease-smooth",
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
