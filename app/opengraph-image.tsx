import { ImageResponse } from "next/og";

// Default Open Graph image — used by social and LLM crawlers when no
// per-route opengraph-image overrides this. Lighthouse + the audit
// flagged the missing og:image as the biggest social/AEO regression.
//
// Edge runtime keeps generation under the next/og guidance: pure JSX,
// no node-only deps, fonts loaded via fetch from a stable CDN.

export const runtime = "edge";
export const alt = "Two Buds and a Leaf — a two-person tea journal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #FAF7F2 0%, #F5EFE6 50%, #E8DDC8 100%)",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* Tea-stain accent — matches the on-site design language */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -140,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 45%, rgba(196, 163, 90, 0.28), transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -120,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 45%, rgba(114, 47, 55, 0.18), transparent 70%)",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            fontWeight: 700,
            color: "#A68B3D",
          }}
        >
          A two-person tea journal · est. 2024
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 36,
            fontSize: 96,
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
            color: "#722F37",
            fontWeight: 500,
          }}
        >
          <span style={{ fontStyle: "italic" }}>Two buds,</span>
          <span>a leaf, and a long</span>
          <span>afternoon to brew it.</span>
        </div>

        {/* Subhead */}
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 28,
            color: "#524D49",
            lineHeight: 1.4,
            maxWidth: 880,
          }}
        >
          Honest single-origin tea reviews from two friends — twelve flavor
          axes, dual ratings, brewing parameters that match the cup.
        </div>

        {/* Footer mark */}
        <div
          style={{
            position: "absolute",
            bottom: 56,
            right: 80,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 18,
            color: "#6B6560",
            letterSpacing: 2,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          <span>twobudsandaleaf</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
