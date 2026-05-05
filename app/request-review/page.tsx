import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RequestReviewForm } from "@/components/member/RequestReviewForm";

// Form state lives client-side; the page itself is dynamic so query
// params reach the form on first paint without a flash of empty inputs.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request a review",
  description:
    "Suggest a tea you'd like Vivek or James to brew and write up — including how to get them a sample or where to buy.",
  robots: { index: false, follow: false },
};

export default function RequestReviewPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // Pull single string values, defaulting to "" so the form can prefill.
  const get = (k: string): string => {
    const v = searchParams[k];
    return typeof v === "string" ? v : "";
  };

  return (
    <main>
      <Container size="article">
        <div className="pt-12 pb-8">
          <Eyebrow>Members · Request a review</Eyebrow>
          <h1 className="font-display text-burgundy font-medium tracking-tight leading-hero mt-2 mb-4 text-hero-xl">
            <span className="italic">Suggest a tea</span> for review.
          </h1>
          <p className="text-base text-warm-700 leading-relaxed max-w-[640px] m-0">
            Send us a tea you&apos;d like brewed and written up. If you have a
            sample we&apos;ll cover return shipping; otherwise drop a purchase
            link and we&apos;ll source it. Vivek and James each handle a
            different stack — pick whichever palate you trust on this one.
          </p>
        </div>

        <RequestReviewForm
          initialTea={get("tea")}
          initialVendor={get("vendor")}
          initialFrom={get("from")}
        />
      </Container>
      <div className="h-16" />
    </main>
  );
}
