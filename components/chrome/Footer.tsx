import Link from "next/link";

const COLS: { title: string; items: { label: string; href?: string }[] }[] = [
  {
    title: "Explore",
    items: [
      { label: "Discover",  href: "/discover" },
      { label: "Teas",      href: "/discover/teas" },
      { label: "Vendors",   href: "/discover/vendors" },
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
      { label: "Newsletter" },
    ],
  },
  {
    title: "Connect",
    items: [
      { label: "hello@twobudsandaleaf.com" },
      { label: "RSS" },
      { label: "Mastodon" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-warm-200 bg-[var(--bg)] mt-16 px-10 pt-12 pb-8 font-sans">
      <div className="max-w-site mx-auto grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
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
            <div className="text-[10px] font-bold tracking-widest uppercase text-warm-500 mb-3.5">
              {col.title}
            </div>
            <ul className="list-none p-0 m-0 flex flex-col gap-2">
              {col.items.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-[13px] text-warm-700 hover:text-burgundy no-underline"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-[13px] text-warm-700">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-site mx-auto mt-8 pt-6 border-t border-warm-200 flex justify-between text-[11px] text-warm-500 tracking-wide">
        <span>© 2026 Two Buds and a Leaf · Brewed with care.</span>
        <span>Affiliate disclosure · Privacy</span>
      </div>
    </footer>
  );
}
