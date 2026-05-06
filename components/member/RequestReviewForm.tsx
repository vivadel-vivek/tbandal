"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TEAS, VENDORS, vendorBySlug } from "@/lib/data";
import { useMember } from "@/contexts/MemberContext";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { AvatarChip } from "@/components/ui/AvatarChip";
import { settingsInput } from "@/components/member/settingsPrimitives";

type Reviewer = "vivek" | "james" | "either";
type DeliveryMode = "sample" | "link";

type Props = {
  /** Pre-fills the tea name. Accepts either a known pathSlug
   *  (resolved to the tea's name) or a free-text fallback. */
  initialTea?: string;
  /** Pre-fills the vendor. Accepts a known vendor slug (resolved to
   *  display name) or free text. */
  initialVendor?: string;
  /** Pre-selects the reviewer when launched from a tea-detail empty
   *  state (`from=vivek` when Vivek hasn't reviewed it). */
  initialFrom?: string;
};

export function RequestReviewForm({
  initialTea = "",
  initialVendor = "",
  initialFrom = "",
}: Props) {
  const { member } = useMember();

  // Resolve the URL params against the known catalogue when possible —
  // launching from `/tea/.../empty-state` passes pathSlug + vendor slug.
  const prefill = useMemo(() => {
    const teaByPath = TEAS.find((t) => t.pathSlug === initialTea);
    const vendorByPath = vendorBySlug(initialVendor);
    return {
      tea: teaByPath ? teaByPath.name : initialTea,
      year: teaByPath ? teaByPath.year : "",
      vendor: vendorByPath ? vendorByPath.name : initialVendor,
    };
  }, [initialTea, initialVendor]);

  const initialReviewer: Reviewer =
    initialFrom === "vivek" || initialFrom === "james" ? initialFrom : "either";

  const [tea, setTea] = useState(prefill.tea);
  const [vendor, setVendor] = useState(prefill.vendor);
  const [year, setYear] = useState(prefill.year);
  const [reviewer, setReviewer] = useState<Reviewer>(initialReviewer);
  const [delivery, setDelivery] = useState<DeliveryMode>("sample");
  const [purchaseUrl, setPurchaseUrl] = useState("");
  const [why, setWhy] = useState("");
  const [email, setEmail] = useState(member.settings.email);
  const [submitted, setSubmitted] = useState<null | {
    tea: string;
    vendor: string;
  }>(null);

  const canSubmit =
    tea.trim().length > 1 &&
    vendor.trim().length > 1 &&
    why.trim().length > 1 &&
    email.trim().length > 4 &&
    (delivery === "sample" || purchaseUrl.trim().length > 7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // Phase 6 hook — POST to /api/review-requests; until then, log and
    // confirm in-memory.
    // eslint-disable-next-line no-console
    console.info("Review request:", {
      tea, vendor, year, reviewer, delivery, purchaseUrl, why, email,
    });
    setSubmitted({ tea: tea.trim(), vendor: vendor.trim() });
  };

  if (submitted) {
    return (
      <div className="card-surface p-9">
        <Eyebrow>Submitted</Eyebrow>
        <h2 className="font-display italic text-burgundy font-medium tracking-tight m-0 mt-2 mb-4 text-hero-md">
          Thanks — we&apos;ve got it.
        </h2>
        <p className="text-[15px] text-warm-700 leading-relaxed mb-2 max-w-[560px]">
          Request for <strong className="text-forest">{submitted.tea}</strong>
          {submitted.vendor ? (
            <> from <strong className="text-forest">{submitted.vendor}</strong></>
          ) : null}{" "}
          is in the queue. We&apos;ll reply to{" "}
          <strong className="text-forest">{email || "your email"}</strong> within
          a week with a yes / no / where-to-mail.
        </p>
        <p className="text-[13px] text-warm-600 mt-4 mb-6">
          {delivery === "sample"
            ? "If we accept, we'll send you a return-shipping label."
            : "If we accept, we'll source the tea via your link."}
        </p>
        <div className="flex gap-2.5 flex-wrap">
          <Button variant="secondary" onClick={() => setSubmitted(null)}>
            Send another request
          </Button>
          <Link href="/discover/teas">
            <Button variant="primary">Back to the library →</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface p-5 sm:p-7">
      <Section title="The tea">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tea name" hint="What you call it. Don't worry about hitting our exact spelling." required>
            <input
              type="text"
              value={tea}
              onChange={(e) => setTea(e.target.value)}
              placeholder="e.g. 2024 Yiwu Spring"
              required
              style={settingsInput}
            />
          </Field>
          <Field label="Year / harvest" hint="If you know it.">
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. Spring 2024"
              style={settingsInput}
            />
          </Field>
        </div>
        <Field label="Vendor / producer" hint="Who you'd buy this from." required>
          <input
            type="text"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder={`e.g. ${VENDORS[0]?.name ?? "white2tea"}`}
            list="vendor-suggestions"
            required
            style={settingsInput}
          />
          <datalist id="vendor-suggestions">
            {VENDORS.map((v) => (
              <option key={v.slug} value={v.name} />
            ))}
          </datalist>
        </Field>
      </Section>

      <Section title="Who do you want to review it?">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {(
            [
              { key: "james",  label: "James",  sub: "Likes earthy, mineral, mature." },
              { key: "vivek",  label: "Vivek",  sub: "Likes sweet, nutty, malty." },
              { key: "either", label: "Either", sub: "First one available." },
            ] as { key: Reviewer; label: string; sub: string }[]
          ).map((opt) => {
            const active = reviewer === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setReviewer(opt.key)}
                className={[
                  "p-3.5 rounded-lg cursor-pointer text-left flex items-start gap-2.5",
                  active ? "border-2 border-burgundy bg-burgundy-muted" : "border border-warm-300",
                ].join(" ")}
              >
                {opt.key === "either" ? (
                  <div
                    className="w-9 h-9 rounded-full bg-warm-200 flex items-center justify-center text-warm-700 text-base font-bold shrink-0"
                    aria-hidden
                  >
                    ?
                  </div>
                ) : (
                  <AvatarChip who={opt.key} size={36} />
                )}
                <div>
                  <div className="font-display text-burgundy font-medium text-base">
                    {opt.label}
                  </div>
                  <div className="text-[11px] text-warm-600 leading-snug mt-0.5">
                    {opt.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="How do we get the tea?">
        <div className="flex flex-col gap-2.5">
          {(
            [
              {
                key: "sample" as const,
                title: "I have a sample I can mail",
                sub: "Send 5–8g; we cover return shipping if we don't review.",
              },
              {
                key: "link" as const,
                title: "Here's a purchase link",
                sub: "We'll buy it ourselves — fastest path to a fair review.",
              },
            ]
          ).map((o) => {
            const active = delivery === o.key;
            return (
              <button
                key={o.key}
                type="button"
                onClick={() => setDelivery(o.key)}
                className={[
                  "p-3.5 rounded-lg cursor-pointer text-left flex items-start gap-3",
                  active ? "border-2 border-burgundy bg-burgundy-muted" : "border border-warm-300",
                ].join(" ")}
              >
                <span
                  aria-hidden
                  className={[
                    "w-4 h-4 rounded-full shrink-0 mt-0.5 box-border",
                    active
                      ? "border-[5px] border-burgundy bg-cream"
                      : "border-2 border-warm-300 bg-transparent",
                  ].join(" ")}
                />
                <div>
                  <div className="font-bold text-sm text-forest">{o.title}</div>
                  <div className="text-xs text-warm-600 mt-0.5 leading-snug">
                    {o.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {delivery === "link" && (
          <Field label="Purchase URL" required>
            <input
              type="url"
              value={purchaseUrl}
              onChange={(e) => setPurchaseUrl(e.target.value)}
              placeholder="https://"
              required
              style={settingsInput}
            />
          </Field>
        )}
      </Section>

      <Section title="Why this tea?">
        <Field
          label="A few sentences"
          hint="What's interesting about it? What would you want us to verify? No marketing copy — your own words."
          required
        >
          <textarea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            rows={5}
            required
            placeholder="e.g. The vendor's tasting notes call it &ldquo;balanced&rdquo; but I keep getting a charcoal note in steep two — wondering if that's the roast or the storage."
            className="w-full px-3.5 py-3 font-serif italic text-[15px] bg-cream border border-warm-200 rounded-md text-forest resize-y leading-normal outline-none"
          />
        </Field>
      </Section>

      <Section title="Where to reply">
        <Field label="Your email" hint="We'll only use this for our reply." required>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={settingsInput}
          />
        </Field>
      </Section>

      <div className="flex justify-between items-center gap-3 pt-5 border-t border-warm-200 flex-wrap">
        <span className="text-xs text-warm-600 max-w-[420px]">
          We respond within a week.{" "}
          <Link href="/for-vendors" className="text-burgundy underline">
            Vendors should pitch here instead.
          </Link>
        </span>
        <Button
          variant="primary"
          size="lg"
          {...(!canSubmit ? { disabled: true, style: { opacity: 0.5, cursor: "not-allowed" } } : {})}
        >
          Send request →
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 pb-6 border-b border-warm-200 last:border-b-0 last:mb-0 last:pb-0">
      <Eyebrow>{title}</Eyebrow>
      <div className="mt-3.5 flex flex-col gap-3.5">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-sans text-xs font-bold text-forest mb-1 tracking-wide">
        {label}
        {required && <span className="text-burgundy ml-1">*</span>}
      </label>
      {hint && (
        <div className="text-xs text-warm-600 m-0 mb-2 leading-normal">
          {hint}
        </div>
      )}
      {children}
    </div>
  );
}
