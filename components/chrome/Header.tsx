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
  { href: "/discover/teaware",  label: "Teaware",   desc: "Vessels and instruments" },
  { href: "/discover/glossary", label: "Glossary",  desc: "Terms, types & techniques" },
] as const;

// Top-level mobile drawer items — flat list rather than nested dropdown,
// since the drawer has the room for everything to live at one tier.
const MOBILE_NAV_ITEMS = [
  { href: "/",                   label: "Home",      desc: "Recently brewed & featured" },
  { href: "/discover/teas",      label: "Teas",      desc: "Browse the full library" },
  { href: "/discover/vendors",   label: "Vendors",   desc: "Atlas of shops we trust" },
  { href: "/discover/teaware",   label: "Teaware",   desc: "Vessels and instruments" },
  { href: "/discover/glossary",  label: "Glossary",  desc: "Terms, types & techniques" },
  { href: "/journal",            label: "Journal",   desc: "Essays, sessions & thoughts" },
  { href: "/about",              label: "About",     desc: "Who we are, how we rate" },
] as const;

export function Header() {
  const pathname = usePathname() ?? "/";
  const { member } = useMember();

  // Desktop dropdown — hover or click to open.
  const [open, setOpen] = useState(false);
  // Mobile drawer — full-screen overlay.
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  // Close on Escape + outside click (desktop dropdown only — drawer
  // handles its own backdrop click).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setDrawerOpen(false);
      }
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

  // Lock body scroll while the drawer is open so the editorial canvas
  // doesn't peek behind it on iOS.
  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return;
  }, [drawerOpen]);

  // Close drawer when route changes — Link clicks fire pathname change
  // before navigation; this keeps state clean for back-nav too.
  useEffect(() => {
    setDrawerOpen(false);
    setOpen(false);
  }, [pathname]);

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
      <div className="flex items-center justify-between px-5 sm:px-10 py-4 sm:py-5 gap-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer no-underline min-w-0"
        >
          {/* Mark — embedded so it can be CSS-tinted via currentColor */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/mark.svg"
            alt=""
            aria-hidden
            width={36}
            height={36}
            className="pointer-events-none w-8 h-8 sm:w-9 sm:h-9 shrink-0"
          />
          <div className="flex flex-col leading-none whitespace-nowrap min-w-0">
            <span className="font-display italic text-burgundy font-medium text-[18px] sm:text-[22px] truncate">
              Two Buds and a Leaf
            </span>
            <span className="hidden sm:inline font-sans text-[9px] tracking-widest uppercase text-warm-600 mt-1">
              Tea Library &amp; Journal
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV — hidden on mobile */}
        <nav className="hidden sm:flex gap-1 items-center">
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

        {/* MOBILE TRIGGER — hidden on desktop */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/member"
            className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-warm-300 bg-[var(--bg-elevated)]"
            aria-label="Member profile"
          >
            <AvatarChip who={member.aligned} size={26} />
          </Link>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            className="w-11 h-11 inline-flex flex-col items-center justify-center gap-[5px] rounded-md border border-warm-300 bg-[var(--bg-elevated)] cursor-pointer"
          >
            <span className="block w-[18px] h-[1.5px] bg-forest" />
            <span className="block w-[18px] h-[1.5px] bg-forest" />
            <span className="block w-[18px] h-[1.5px] bg-forest" />
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER — full-bleed warm-paper panel, editorial display links */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        pathname={pathname}
        memberName={member.name || "You"}
        memberKey={member.aligned}
      />
    </header>
  );
}

function MobileDrawer({
  open,
  onClose,
  pathname,
  memberName,
  memberKey,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  memberName: string;
  memberKey: "vivek" | "james";
}) {
  return (
    <>
      {/* Backdrop — only the dim overlay; warm-paper panel is below. */}
      <div
        onClick={onClose}
        aria-hidden
        className={[
          "fixed inset-0 z-40 bg-burgundy/30 backdrop-blur-[2px] transition-opacity duration-200 sm:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* Panel — slides in from the right, full warm-paper canvas.
          Uses <div role="dialog">: <aside> doesn't allow role=dialog
          per ARIA-allowed-roles (Lighthouse aria-allowed-role audit). */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={[
          "fixed top-0 right-0 bottom-0 z-50 w-[88%] max-w-[420px] bg-[var(--bg)] sm:hidden",
          "transition-transform duration-300 ease-smooth",
          "border-l border-warm-200 shadow-elevated",
          "flex flex-col",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        style={{
          // Subtle gold accent rule running down the inside edge — the
          // editorial running-mark from the print analog.
          boxShadow: open
            ? "inset 4px 0 0 var(--gold-dark, #A68B3D), -8px 0 32px rgba(0,0,0,0.15)"
            : undefined,
        }}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-warm-200">
          <span className="font-display italic text-burgundy text-[20px] font-medium">
            Two Buds & a Leaf
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-warm-300 bg-[var(--bg-elevated)] cursor-pointer text-forest text-[18px] leading-none"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-4">
          <div className="text-[10px] tracking-widest uppercase text-warm-600 font-bold mb-4">
            Wander
          </div>
          <ul className="list-none p-0 m-0 flex flex-col gap-0">
            {MOBILE_NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={[
                      "block py-3.5 border-b border-warm-200 no-underline transition-colors",
                      active ? "text-burgundy" : "text-forest",
                    ].join(" ")}
                  >
                    <div className="flex items-baseline gap-3">
                      <span
                        className={[
                          "font-display italic font-medium leading-tight",
                          active ? "text-[34px]" : "text-[30px]",
                        ].join(" ")}
                      >
                        {item.label}
                      </span>
                      {active && (
                        <span
                          aria-hidden
                          className="text-[14px] text-gold-dark font-bold tracking-widest uppercase"
                        >
                          ·
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-warm-700 mt-0.5 font-sans leading-snug">
                      {item.desc}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-6 py-5 border-t border-warm-200 bg-cream">
          <Link
            href="/member"
            onClick={onClose}
            className="flex items-center gap-3 no-underline"
          >
            <AvatarChip who={memberKey} size={36} />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] tracking-widest uppercase text-warm-600 font-bold">
                Your profile
              </div>
              <div className="font-display italic text-burgundy text-[18px] font-medium truncate">
                {memberName}
              </div>
            </div>
            <span
              aria-hidden
              className="text-burgundy text-[18px] font-bold"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
