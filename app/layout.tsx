import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Nunito_Sans } from "next/font/google";
import { Shell } from "@/components/chrome/Shell";
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
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Two Buds and a Leaf",
    description:
      "Editorial tea library, journal, and recommendation engine — built by two reviewers who like long afternoons.",
    siteName: "Two Buds and a Leaf",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body data-theme="parchment" className="font-sans min-h-screen">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
