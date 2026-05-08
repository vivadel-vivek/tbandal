"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSupabaseSession } from "@/lib/supabase/useSession";

// Lightweight first-visit notice for unauthenticated visitors.
//
// We don't run third-party analytics, ads, or cross-site tracking, so
// this isn't a consent banner — it's an informational disclosure with
// a link to the full privacy policy. Authenticated users have already
// agreed to the policy at signup, so they never see it.
//
// Dismissal persists in localStorage (one boolean key). localStorage
// itself is the closest thing we use to a "tracking technology", and
// the user said localStorage is OK in the prior conversation.
//
// The banner mounts in the root layout below the page-view beacon.
// It's deliberately understated — bottom-right toast, not a modal —
// because the only thing it interrupts is editorial reading.

const STORAGE_KEY = "tbandal:privacy-notice-dismissed:v1";

export function PrivacyBanner() {
  // Until both effects below run we render nothing — avoids the flash
  // of the banner appearing for already-dismissed visitors and the
  // mismatch between server (which can't read localStorage) and client.
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(false);
  const session = useSupabaseSession();

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY) === "1";
      setShow(!dismissed);
    } catch {
      setShow(true);
    }
    setReady(true);
  }, []);

  // Hide as soon as a session attaches (signup, signin) without
  // requiring the visitor to dismiss explicitly.
  useEffect(() => {
    if (session) setShow(false);
  }, [session]);

  if (!ready || !show || session) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode / quota — fall through, stays hidden for the page */
    }
    setShow(false);
  };

  return (
    <div
      role="region"
      aria-label="Privacy notice"
      className="fixed left-0 right-0 bottom-0 sm:left-auto sm:bottom-4 sm:right-4 z-40 sm:max-w-[420px] mx-auto sm:mx-0"
    >
      <div className="m-3 sm:m-0 bg-[var(--bg-elevated,#FFF)] border border-warm-300 rounded-xl shadow-elevated p-4 text-[13px] leading-snug text-warm-700">
        <p className="m-0 mb-2.5">
          We use first-party storage to remember your preferences and to keep
          you signed in. No third-party analytics, no advertising cookies, no
          cross-site tracking.{" "}
          <Link href="/privacy" className="text-burgundy underline">
            Read the full privacy policy →
          </Link>
        </p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={dismiss}
            className="text-[11px] font-bold text-burgundy bg-cream border border-warm-300 rounded-pill px-3 py-1.5 cursor-pointer hover:border-burgundy"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
