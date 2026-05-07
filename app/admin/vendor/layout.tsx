// Role gate for the vendor portal. Admin acts as superuser (can see
// any vendor's surface for support / setup); a vendor user only sees
// the vendor row(s) where owner_id = auth.uid(), enforced both at the
// data layer (RLS) and the route handlers below.

import type { ReactNode } from "react";
import Link from "next/link";
import { requireVendorOrAdmin } from "@/lib/auth/require-role";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const dynamic = "force-dynamic";

export default async function VendorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { role, email } = await requireVendorOrAdmin();

  return (
    <main>
      <Container size="article">
        <div className="pt-8 pb-4 flex items-baseline justify-between gap-4 border-b border-warm-200">
          <div>
            <Eyebrow>Admin · Vendor portal</Eyebrow>
            <div className="font-display italic text-burgundy text-[20px] mt-1">
              {email}
              <span className="ml-3 text-[12px] uppercase tracking-widest font-bold text-warm-600 not-italic">
                {role}
              </span>
            </div>
          </div>
          <nav className="flex gap-4 text-[13px] font-bold">
            <Link href="/admin/vendor" className="text-burgundy">Overview</Link>
            <Link href="/admin/vendor/profile" className="text-warm-700 hover:text-burgundy">Profile</Link>
            <Link href="/admin/vendor/teas" className="text-warm-700 hover:text-burgundy">Teas</Link>
            <Link href="/admin/vendor/teaware" className="text-warm-700 hover:text-burgundy">Teaware</Link>
          </nav>
        </div>
        <div className="py-6">{children}</div>
      </Container>
    </main>
  );
}
