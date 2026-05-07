// Role gate for the entire /admin/contributor surface. The layout is
// async + server-only so every subroute (landing, teas, vendors, etc.)
// inherits the redirect-if-not-staff check without each having to
// re-implement it.

import type { ReactNode } from "react";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/require-role";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

// Always render fresh — the cookie store + profile lookup must not be
// cached at the edge.
export const dynamic = "force-dynamic";

export default async function ContributorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { role, email } = await requireStaff();

  return (
    <main>
      <Container size="article">
        <div className="pt-8 pb-4 flex items-baseline justify-between gap-4 border-b border-warm-200">
          <div>
            <Eyebrow>Admin · Contributor portal</Eyebrow>
            <div className="font-display italic text-burgundy text-[20px] mt-1">
              {email}
              <span className="ml-3 text-[12px] uppercase tracking-widest font-bold text-warm-600 not-italic">
                {role}
              </span>
            </div>
          </div>
          <nav className="flex gap-4 text-[13px] font-bold">
            <Link href="/admin/contributor" className="text-burgundy">
              Overview
            </Link>
            <Link href="/admin/contributor/teas" className="text-warm-700 hover:text-burgundy">
              Teas
            </Link>
            <Link href="/admin/contributor/posts" className="text-warm-700 hover:text-burgundy">
              Posts
            </Link>
            <Link href="/admin/contributor/vendors" className="text-warm-700 hover:text-burgundy">
              Vendors
            </Link>
            <Link href="/admin/contributor/teaware" className="text-warm-700 hover:text-burgundy">
              Teaware
            </Link>
          </nav>
        </div>
        <div className="py-6">{children}</div>
      </Container>
    </main>
  );
}
