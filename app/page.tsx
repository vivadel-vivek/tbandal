// Placeholder home page — confirms the design tokens are wired up.
// Replaced in 4.5.7 with the real Home page.

export default function Home() {
  return (
    <main className="max-w-site mx-auto px-10 py-20">
      <span className="eyebrow">Migration · scaffold checkpoint</span>
      <h1 className="font-display text-burgundy text-7xl font-medium tracking-tightest leading-tighter mt-4 mb-6">
        <span className="display-italic">Two buds,</span>
        <br /> a leaf, and a long
        <br /> afternoon to brew it.
      </h1>
      <p className="text-warm-700 text-lg max-w-prose leading-relaxed">
        The Next.js + Tailwind + TypeScript scaffold is wired up. Real chrome,
        Discover, tea detail, and the rest of the prototype land in the next
        commits. Until then, this page exists to confirm the colors, type
        families, and shadows resolve correctly.
      </p>

      <div className="mt-16 grid grid-cols-3 gap-6">
        <div className="rounded-xl bg-white p-6 shadow-card border border-warm-200">
          <span className="eyebrow">Body type</span>
          <div className="font-sans text-base text-forest mt-2">
            Nunito Sans · 16px
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-card border border-warm-200">
          <span className="eyebrow">Display</span>
          <div className="font-display italic text-2xl text-burgundy mt-2">
            Cormorant Garamond
          </div>
        </div>
        <div className="rounded-xl bg-cream p-6 shadow-soft border border-warm-200">
          <span className="eyebrow">Surfaces</span>
          <div className="text-warm-600 mt-2 text-sm">parchment · cream · white</div>
        </div>
      </div>

      <div className="mt-10 flex gap-3 flex-wrap">
        {[
          "burgundy", "burgundy-light", "burgundy-dark",
          "gold", "gold-dark", "sage", "sage-dark", "forest",
        ].map((c) => (
          <span
            key={c}
            className="px-3 py-1 rounded-pill border border-warm-200 text-xs font-bold tracking-wide font-sans text-warm-700"
          >
            <span
              aria-hidden
              className="inline-block w-3 h-3 rounded-full align-middle mr-2"
              style={{ background: `var(--tw-color)`, backgroundColor: cssVarFor(c) }}
            />
            {c}
          </span>
        ))}
      </div>

      <p className="mt-16 text-warm-500 text-xs tracking-wider uppercase">
        Prototype is preserved at <code className="font-mono">/prototype</code>{" "}
        and runs on <code className="font-mono">npm run prototype</code> (port 3001).
      </p>
    </main>
  );
}

// Helper for the swatch demo only — utility classes can't take dynamic
// arbitrary names without a safelist. Resolved at render time client-side.
function cssVarFor(name: string): string {
  const map: Record<string, string> = {
    burgundy: "#722F37",
    "burgundy-light": "#8B4049",
    "burgundy-dark": "#5A252C",
    gold: "#C4A35A",
    "gold-dark": "#A68B3D",
    sage: "#8B9A7D",
    "sage-dark": "#6B7A5D",
    forest: "#2D3A2E",
  };
  return map[name] ?? "#000";
}
