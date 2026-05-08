import Image from "next/image";

// Display layer for editorial / hero images. One component, three
// behaviours:
//
//   - When `src` is set: renders next/image inside an aspect-ratio
//     box. Lazy by default; `priority` flips it to eager + fetchpriority
//     for above-the-fold heroes. Responsive `sizes` attribute matches
//     our common card / hero widths.
//
//   - When `src` is null: falls back to the supplied CSS gradient (or
//     a neutral warm-paper tint) so cards still render before any
//     editor uploads photography. Same aspect ratio either way to
//     prevent layout shift.
//
//   - Always sets a meaningful alt — required prop. Pass an empty
//     string for purely decorative imagery.
//
// We don't store blur placeholders on the row yet; lazy loading +
// next/image's default fade-in is good enough for v1. If we want LQIP
// later we'll add an image_blur column and pass it via blurDataURL.

type Props = {
  src: string | null | undefined;
  alt: string;
  /** Fallback CSS background applied when src is null. */
  gradient?: string | null;
  /** Aspect ratio (CSS aspect-ratio value: "16/10", "1/1", etc). */
  aspectRatio?: string;
  /** Eager-load + fetchpriority high. Use for the LCP hero. */
  priority?: boolean;
  /** Responsive sizes hint for next/image. Defaults to a card-sized
   *  responsive curve. */
  sizes?: string;
  /** Wrapper class for layout. */
  className?: string;
  /** Extra style on the wrapper. */
  style?: React.CSSProperties;
  /** object-fit override (default: cover). */
  fit?: "cover" | "contain";
};

export function EditorialImage({
  src,
  alt,
  gradient,
  aspectRatio = "16/10",
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className = "",
  style,
  fit = "cover",
}: Props) {
  const wrapperStyle: React.CSSProperties = {
    aspectRatio,
    ...style,
  };

  if (!src) {
    return (
      <div
        className={className}
        style={{
          ...wrapperStyle,
          background: gradient ?? "var(--warm-200, #E5DCD0)",
        }}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
      />
    );
  }

  return (
    <div
      className={className}
      style={{ ...wrapperStyle, position: "relative", overflow: "hidden" }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        sizes={sizes}
        style={{ objectFit: fit }}
      />
    </div>
  );
}
