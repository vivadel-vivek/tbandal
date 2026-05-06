import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { teaByVendorAndSlug } from "@/lib/data";
import { SessionLogEditor } from "@/components/session/SessionLogEditor";

// Member-driven; never pre-render. The editor is a client component and
// reads its initial value from MemberContext (localStorage today, server
// session in Phase 6c).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Log a session",
  description:
    "Record a tasting session — overall score, flavor radar, mouthfeel, and per-steep notes if you brewed gongfu.",
  robots: { index: false, follow: false },
};

type Params = { vendor: string; slug: string };

export default function LogSessionPage({
  params,
}: {
  params: Params;
}) {
  const tea = teaByVendorAndSlug(params.vendor, params.slug);
  if (!tea) notFound();
  return (
    <main>
      <SessionLogEditor tea={tea} />
    </main>
  );
}
