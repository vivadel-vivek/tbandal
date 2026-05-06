import type { Config } from "tailwindcss";

const config: Config = {
  // [data-theme="dark"] is already used in globals.css for runtime theme
  // switching; map Tailwind's `dark:` modifier to the same hook so new
  // markup can opt into dark variants natively.
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds — warm neutrals
        cream: "#FAF7F2",
        parchment: "#F5EFE6",

        // Theme-channel surface tokens — resolve to CSS vars set in globals.css
        // [data-theme] blocks. Use these so dark mode "just works" without
        // touching every call-site.
        surface: "var(--bg)",
        "surface-elevated": "var(--bg-elevated)",
        "surface-subtle": "var(--bg-subtle)",
        // Translucent surface tokens used for floating chips and modal scrim.
        "cream-glass": "rgba(250,247,242,0.92)",
        "cream-glass-strong": "rgba(250,247,242,0.95)",
        "ink-glass": "rgba(31,26,24,0.55)",

        // Brand
        burgundy: {
          DEFAULT: "#722F37",
          light: "#8B4049",
          dark: "#5A252C",
          muted: "rgba(114, 47, 55, 0.12)",
        },
        gold: {
          DEFAULT: "#C4A35A",
          light: "#D4B06A",
          dark: "#A68B3D",
          muted: "#D4C4A0",
        },
        sage: {
          DEFAULT: "#8B9A7D",
          light: "#A8B49C",
          dark: "#6B7A5D",
          muted: "rgba(139, 154, 125, 0.12)",
        },

        // Text
        forest: "#2D3A2E",
        ink: "#2A2522",

        // Warm neutral ramp (gray with warmth)
        warm: {
          50: "#F5F3F1",
          100: "#E8E5E2",
          200: "#D4D0CC",
          300: "#B5B0AA",
          400: "#9A948D",
          500: "#857F79",
          600: "#6B6560",
          700: "#524D49",
          800: "#3D3835",
          900: "#2A2522",
        },

        // Semantic
        success: "#6B8E5E",
        warning: "#C4935A",
        error: "#A54242",
        info: "#5A8BA5",

        // Flavor palette (12-axis radar + flavor badges)
        flavor: {
          honey: "#D4A94C",
          floral: "#D4A5A5",
          earthy: "#8B7355",
          mineral: "#8A9BA8",
          vegetal: "#7A9A6D",
          woody: "#6B4E3D",
          fruity: "#C47A7A",
          sweet: "#D4A07A",
          roasted: "#5C4033",
          spicy: "#A65D57",
          marine: "#5A8A9A",
          nutty: "#A68B5B",
        },

        // Tea-type tints
        tea: {
          green: "#7A9A6D",
          white: "#B5B0AA",
          yellow: "#D4C47A",
          oolong: "#D4A07A",
          black: "#5C4033",
          puer: "#8B7355",
          herbal: "#9A7A9A",
        },
      },

      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Nunito Sans", "system-ui", "sans-serif"],
      },

      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        "6xl": "3.75rem",
        "7xl": "4.5rem",
        "8xl": "6rem",
        // Editorial hero scale — clamp()-based so each name auto-scales
        // from a mobile-readable floor up to its desktop target. Mobile
        // floors are tuned for ~375-410px viewports; ceilings match the
        // original design rhythm. The vw-based middle term lets the
        // headline grow naturally through tablet widths.
        "hero-sm":  "clamp(22px, 3.6vw + 12px, 28px)",
        "hero-md":  "clamp(26px, 4.6vw + 14px, 36px)",
        "hero-lg":  "clamp(30px, 5.5vw + 16px, 44px)",
        "hero-xl":  "clamp(38px, 7.8vw + 18px, 64px)",
        "hero-2xl": "clamp(44px, 9vw   + 20px, 76px)",
        "hero-3xl": "clamp(48px, 10vw  + 22px, 88px)",
        "hero-4xl": "clamp(52px, 11vw  + 24px, 96px)",
      },

      letterSpacing: {
        tightest: "-0.02em",
        tighter: "-0.015em",
        tight: "-0.01em",
        normal: "0",
        wide: "0.04em",
        wider: "0.1em",
        widest: "0.16em",
      },

      lineHeight: {
        tighter: "1.02",
        tight: "1.1",
        snug: "1.25",
        normal: "1.5",
        relaxed: "1.65",
        // Hero-specific line-height used across the page H1s.
        hero: "1.05",
      },

      spacing: {
        // Half-step values used in card paddings + between-element gaps.
        "4.5": "18px",
        "7.5": "30px",
        // 72px shows up as the home-hero pt — name it so we don't ship
        // arbitrary `pt-[72px]` everywhere.
        "18": "72px",
      },

      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        pill: "9999px",
      },

      borderWidth: {
        // Used by primary/secondary buttons and active filter chips.
        "1.5": "1.5px",
      },

      boxShadow: {
        soft: "0 4px 20px rgba(114, 47, 55, 0.08)",
        card: "0 2px 12px rgba(45, 58, 46, 0.06)",
        elevated: "0 8px 30px rgba(42, 37, 34, 0.12)",
        "inner-soft": "inset 0 2px 4px rgba(42, 37, 34, 0.06)",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      transitionDuration: {
        // NB: Tailwind reads `DEFAULT` as the bare `duration` utility, not
        // `duration-DEFAULT` — keep this entry but always reference it as
        // `duration-200` (or bare `duration`) at call-sites.
        DEFAULT: "200ms",
        fast: "150ms",
        slow: "300ms",
        slower: "500ms",
      },

      maxWidth: {
        prose: "680px",
        narrow: "760px",
        article: "920px",
        site: "1180px",
      },

      backgroundImage: {
        "stain-gold": "radial-gradient(circle at 50% 45%, rgba(196, 163, 90, 0.20), transparent 70%)",
        "stain-burgundy": "radial-gradient(circle at 50% 45%, rgba(114, 47, 55, 0.10), transparent 70%)",
      },
    },
  },
  plugins: [],
};

export default config;
