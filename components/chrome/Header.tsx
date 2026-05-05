"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useMember } from "@/contexts/MemberContext";
import { AvatarChip } from "@/components/ui/AvatarChip";

const DISCOVER_ITEMS = [
  { href: "/discover/teas",     label: "Teas",      desc: "Browse the full library" },
  { href: "/discover/vendors",  label: "Vendors",   desc: "Atlas of shops we trust" },
  { href: "/discover/glossary", label: "Glossary",  desc: "Terms, types & techniques" },
] as const;

export function Header() {
  const pathname = usePathname() ?? "/";
  const { member } = useMember();

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();

  const openMenu = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  }, []);

  // Close on Escape + outside click
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  const discoverActive = pathname.startsWith("/discover");

  const navLinkClass = (active: boolean) =>
    [
      "px-3.5 py-2 rounded-pill font-sans font-semibold text-[13px] cursor-pointer transition-colors",
      active
        ? "bg-burgundy-muted text-burgundy"
        : "text-forest hover:bg-warm-100",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg)] border-b border-warm-200">
      <div className="flex items-center justify-between px-10 py-5">
        <Link
          href="/"
          className="flex items-center gap-3 cursor-pointer no-underline"
        >
          {/* Mark — embedded so it can be CSS-tinted via currentColor */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/mark.svg"
            alt=""
            aria-hidden
            width={36}
            height={36}
            className="pointer-events-none"
          />
          <div className="flex flex-col leading-none whitespace-nowrap">
            <span className="font-display italic text-burgundy font-medium text-[22px]">
              Two Buds and a Leaf
            </span>
            <span className="font-sans text-[9px] tracking-widest uppercase text-warm-500 mt-1">
              Tea Library &amp; Journal
            </span>
          </div>
        </Link>

        <nav className="flex gap-1 items-center">
          <Link href="/" className={navLinkClass(isActive("/"))}>
            Home
          </Link>

          {/* Discover dropdown */}
          <div
            ref={wrapRef}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
            className="relative"
          >
            <button
              type="button"
              onClick={() => (open ? setOpen(false) : openMenu())}
              onFocus={openMenu}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls={menuId}
              className={
                navLinkClass(discoverActive) +
                " inline-flex items-center gap-1.5"
              }
            >
              Discover
              <span
                aria-hidden
                className="text-[9px] opacity-70 transition-transform duration-fast ease-smooth"
                style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
              >
                ▾
              </span>
            </button>

            {open && (
              <div
                id={menuId}
                role="menu"
                className="absolute top-[calc(100%+8px)] left-0 min-w-60 bg-[var(--bg-elevated)] rounded-lg border border-warm-200 shadow-elevated p-2 z-[60]"
              >
                {DISCOVER_ITEMS.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className={[
                        "block w-full text-left px-3 py-2.5 rounded-md no-underline transition-colors",
                        active ? "bg-burgundy-muted" : "hover:bg-cream",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "font-bold text-sm",
                          active ? "text-burgundy" : "text-forest",
                        ].join(" ")}
                      >
                        {item.label}
                      </div>
                      <div className="text-[11px] text-warm-600 mt-0.5">
                        {item.desc}
                      </div>
                    </Link>
                  );
                })}
                <div className="border-t border-warm-200 mx-1 my-1.5" />
                <Link
                  href="/discover"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="block w-full text-left px-3 py-2 rounded-md text-burgundy text-xs font-bold tracking-wide hover:bg-cream no-underline"
                >
                  Discover overview →
                </Link>
              </div>
            )}
          </div>

          <Link href="/journal" className={navLinkClass(isActive("/journal"))}>
            Journal
          </Link>
          <Link href="/about" className={navLinkClass(isActive("/about"))}>
            About
          </Link>

          <Link
            href="/member"
            className="ml-3 inline-flex items-center gap-2 pl-1.5 pr-3 py-1 border border-warm-300 rounded-pill bg-[var(--bg-elevated)] font-sans text-xs font-semibold text-forest no-underline"
          >
            <AvatarChip who={member.aligned} size={26} />
            {member.name || "You"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
