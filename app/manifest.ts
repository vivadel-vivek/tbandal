import type { MetadataRoute } from "next";

/**
 * Web app manifest — makes the site installable as a PWA. Served at
 * /manifest.webmanifest with the correct content-type by Next.js.
 *
 * Icon strategy: SVG-only. Chrome 112+ and Firefox accept SVG manifest
 * icons and rasterise them to whatever size the OS asks for. iOS Safari
 * 14+ also accepts SVG for apple-touch-icon. Older Safari falls back
 * to the page screenshot — acceptable for a v1 install.
 *
 * Theme + background colors match the warm-paper / burgundy palette so
 * the splash screen and chrome (status bar) read as part of the editorial
 * canvas rather than a generic white shell.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Two Buds and a Leaf",
    short_name: "Two Buds",
    description:
      "A two-person tea journal. Single-origin reviews, a 12-axis flavor radar, and brewing parameters that actually got the cup we describe.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FAF7F2",
    theme_color: "#722F37",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        // Maskable variant — same SVG, declared so Android adaptive
        // icons crop into the safe zone we've already left around the mark.
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    categories: ["food", "lifestyle", "books"],
    lang: "en",
    dir: "ltr",
  };
}
