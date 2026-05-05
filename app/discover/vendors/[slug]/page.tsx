import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TEAS, VENDORS, vendorBySlug } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TeaCard } from "@/components/tea/TeaCard";

export function generateStaticParams() {
  return VENDORS.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const v = vendorBySlug(params.slug);
  if (!v) return { title: "Vendor not found" };
  return {
    title: v.name,
    description: v.tagline,
  };
}

export default function VendorDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const vendor = vendorBySlug(params.slug);
  if (!vendor) notFound();

  const teas = TEAS.filter((t) => t.vendor === vendor.name);

  return (
    <main>
      <Container>
        <Link
          href="/discover/vendors"
          className="inline-flex items-center gap-1.5 text-warm-600 text-[13px] font-sans no-underline mt-8 mb-4"
        >
          ← All vendors
        </Link>

        <div className="grid grid-cols-[1.4fr_1fr] gap-12 items-start">
          <div>
            <Eyebrow>
              {vendor.city} · est. {vendor.founded}
            </Eyebrow>
            <h1 className="font-display text-burgundy font-medium tracking-tight m-0 mt-2 mb-4 text-[64px]">
              {vendor.name}
            </h1>
            <p className="text-lg text-warm-700 leading-relaxed mb-4">
              {vendor.tagline}
            </p>
            <p className="text-[15px] text-warm-700 leading-relaxed mb-6">
              {vendor.body}
            </p>
            <div className="flex gap-3">
              <Button variant="primary">Visit shop ↗</Button>
              <Button variant="secondary">All teas ({vendor.teaCount})</Button>
            </div>
            <div className="flex gap-8 mt-8 pt-6 border-t border-warm-200">
              <Stat n={vendor.teaCount} label="Teas catalogued" />
              <Stat n={teas.length} label="We've reviewed" />
              <Stat n={`${vendor.rating}.0`} label="Our rating" />
            </div>
          </div>
          <div
            className="rounded-2xl shadow-elevated relative overflow-hidden flex items-center justify-center"
            style={{ aspectRatio: "1/1", background: vendor.swatch }}
          >
            <span
              aria-hidden
              className="font-display italic font-medium"
              style={{
                fontSize: 120,
                color: "rgba(250,247,242,0.85)",
              }}
            >
              {vendor.name[0]}
            </span>
          </div>
        </div>

        <div className="mt-14">
          <SectionHeader
            eyebrow="From this vendor"
            title="Teas we've brewed"
          />
          {teas.length > 0 ? (
            <div className="grid grid-cols-3 gap-5">
              {teas.map((t) => (
                <TeaCard key={t.slug} tea={t} />
              ))}
            </div>
          ) : (
            <p className="text-warm-600 text-sm">
              No teas from {vendor.name} reviewed yet.
            </p>
          )}
        </div>

        <div className="bg-cream rounded-xl border border-dashed border-warm-300 px-6 py-5 mt-10 mb-8 text-xs text-warm-600 leading-relaxed">
          <strong className="text-forest">Affiliate disclosure:</strong>{" "}
          outbound links to {vendor.name} are tracked through our /go/ redirect
          system. We earn a small commission on referrals; this never
          influences which teas appear in the library.
        </div>
      </Container>
    </main>
  );
}
