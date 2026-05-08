import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Nunito_Sans } from "next/font/google";
import { Shell } from "@/components/chrome/Shell";
import { ServiceWorkerRegister } from "@/components/chrome/ServiceWorkerRegister";
import { PageViewBeacon } from "@/components/chrome/PageViewBeacon";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

const sans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Two Buds and a Leaf",
    template: "%s · Two Buds and a Leaf",
  },
  description:
    "A two-person tea journal. Single-origin reviews, a 12-axis flavor radar, and brewing parameters that actually got the cup we describe.",
  // Resolves through lib/site-url so sitemap/robots/canonical all share
  // the same host. Falls back to the canonical alias instead of the
  // VERCEL_URL deployment-hash to keep crawlers on one URL.
  metadataBase: new URL(getSiteUrl()),
  // Default canonical = "/" for the home page. Every other route MUST
  // set its own `alternates.canonical` in generateMetadata or the
  // page-level export so we don't ship the home URL on every route
  // (Lighthouse SEO regression).
  alternates: { canonical: "/" },
  openGraph: {
    title: "Two Buds and a Leaf",
    description:
      "Editorial tea library, journal, and recommendation engine — built by two reviewers who like long afternoons.",
    siteName: "Two Buds and a Leaf",
    type: "website",
  },
  robots: { index: true, follow: true },
  // PWA install hooks — manifest is served by app/manifest.ts; iOS picks
  // up the apple-* meta tags below so "Add to Home Screen" launches in
  // standalone mode with the editorial title bar instead of Safari chrome.
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Two Buds",
  },
  applicationName: "Two Buds and a Leaf",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
    apple: { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
  },
};

export const viewport: Viewport = {
  // Status bar / address bar tint — matches the burgundy hero accents on
  // mobile Chrome and Edge. iOS reads this through apple-mobile-web-app-status-bar-style.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F2" },
    { media: "(prefers-color-scheme: dark)", color: "#2A2522" },
  ],
  // Allow user zoom — never set maximumScale=1 on a content site (a11y).
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body data-theme="parchment" className="font-sans min-h-screen">
        <Shell>{children}</Shell>
        <ServiceWorkerRegister />
        <PageViewBeacon />
      </body>
    </html>
  );
}
