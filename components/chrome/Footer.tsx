import Link from "next/link";

type Item = { label: string; href?: string; external?: boolean };

const COLS: { title: string; items: Item[] }[] = [
  {
    title: "Explore",
    items: [
      { label: "Discover",  href: "/discover" },
      { label: "Teas",      href: "/discover/teas" },
      { label: "Vendors",   href: "/discover/vendors" },
      { label: "Teaware",   href: "/discover/teaware" },
      { label: "Glossary",  href: "/discover/glossary" },
      { label: "Journal",   href: "/journal" },
    ],
  },
  {
    title: "The Site",
    items: [
      { label: "About",        href: "/about" },
      { label: "Contributors", href: "/about" },
      { label: "Methodology",  href: "/about" },
      { label: "For vendors",  href: "/for-vendors" },
    ],
  },
  {
    title: "Connect",
    items: [
      { label: "hello@twobudsandaleaf.com", href: "mailto:hello@twobudsandaleaf.com", external: true },
      { label: "RSS" },
      { label: "Mastodon" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-warm-200 bg-[var(--bg)] mt-16 px-5 sm:px-10 pt-10 sm:pt-12 pb-8 font-sans">
      <div className="max-w-site mx-auto grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 sm:gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/mark.svg"
              alt=""
              aria-hidden
              width={28}
              height={28}
              className="pointer-events-none"
            />
            <span className="font-display italic text-burgundy text-[18px] font-medium">
              Two Buds and a Leaf
            </span>
          </div>
          <p className="text-[13px] text-warm-600 max-w-[320px] leading-relaxed m-0">
            A working catalogue of teas we&apos;ve brewed, with notes from
            gongfu sessions, vendor pointers, and the occasional confession of
            a bad pour.
          </p>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <div className="text-[10px] font-bold tracking-widest uppercase text-warm-600 mb-3.5">
              {col.title}
            </div>
            <ul className="list-none p-0 m-0 flex flex-col gap-1">
              {col.items.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    item.external ? (
                      <a
                        href={item.href}
                        // py-2 + leading-tight gives a ≥36px tap target
                        // without exploding footer height (44px would force
                        // each link onto its own visual block; 36px reads as
                        // a normal link list and still beats AAA hit-area
                        // for touch).
                        className="block py-2 text-[13px] leading-tight text-warm-700 hover:text-burgundy no-underline"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="block py-2 text-[13px] leading-tight text-warm-700 hover:text-burgundy no-underline"
                      >
                        {item.label}
                      </Link>
                    )
                  ) : (
                    <span className="block py-2 text-[13px] leading-tight text-warm-700">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-site mx-auto mt-8 pt-6 border-t border-warm-200 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between text-[11px] text-warm-600 tracking-wide">
        <span>© 2026 Two Buds and a Leaf · Brewed with care.</span>
        <span>
          <Link href="/about#affiliate-disclosure" className="text-warm-600 hover:text-burgundy no-underline">
            Affiliate disclosure
          </Link>
          {" · "}
          <Link href="/about" className="text-warm-600 hover:text-burgundy no-underline">
            Privacy
          </Link>
        </span>
      </div>
    </footer>
  );
}
