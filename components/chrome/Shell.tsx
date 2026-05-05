"use client";

import type { ReactNode } from "react";
import { MemberProvider } from "@/contexts/MemberContext";
import { TweaksProvider } from "@/contexts/TweaksContext";
import { Header } from "./Header";
import { Footer } from "./Footer";

/**
 * Top-level client wrapper used inside the root layout.
 * Owns the provider tree (Member, Tweaks) and renders the persistent
 * Header / Footer chrome around the page content.
 */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <TweaksProvider>
      <MemberProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </MemberProvider>
    </TweaksProvider>
  );
}
