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
        <div className="pt-8 pb-4 border-b border-warm-200 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
          <div className="min-w-0">
            <Eyebrow>Admin · Contributor portal</Eyebrow>
            <div className="font-display italic text-burgundy text-[18px] sm:text-[20px] mt-1 truncate">
              {email}
              <span className="ml-3 text-[12px] uppercase tracking-widest font-bold text-warm-600 not-italic">
                {role}
              </span>
            </div>
          </div>
          {/* Nav wraps to a second row on narrow viewports — overflow-x
              on the parent would clip the active-link border-bottom. */}
          <nav className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-bold">
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
            <Link href="/admin/contributor/users" className="text-warm-700 hover:text-burgundy">
              Users
            </Link>
          </nav>
        </div>
        <div className="py-6">{children}</div>
      </Container>
    </main>
  );
}
