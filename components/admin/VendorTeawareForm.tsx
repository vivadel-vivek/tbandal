"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Database } from "@/lib/supabase/types";
import { saveOwnedTeaware, deleteOwnedTeaware } from "@/app/admin/vendor/actions";
import { MarkdownHint } from "@/components/admin/MarkdownHint";

type TeawareRow = Database["public"]["Tables"]["teaware"]["Row"];

const labelCls = "block text-[10px] tracking-widest uppercase font-bold text-warm-600 mb-1.5";
const inputCls =
  "w-full px-3 py-2 rounded-md border border-warm-300 bg-cream text-[14px] font-sans focus:outline-none focus:border-burgundy";

const CATEGORIES = ["Gaiwan", "Teapot", "Kyusu", "Pitcher", "Cup", "Kettle", "Scale", "Strainer", "Other"];
const TEA_TYPES = ["Green", "White", "Yellow", "Oolong", "Black", "Pu'er", "Herbal"];

export function VendorTeawareForm({
  item,
  ownedVendors,
}: {
  item: TeawareRow | null;
  ownedVendors: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // For multi-vendor accounts, default to the vendor that already
  // sells this item (edit) or the first owned vendor (new).
  const defaultVendorSlug = item
    ? ownedVendors.find((v) => v.name === item.vendor)?.slug ?? ownedVendors[0]!.slug
    : ownedVendors[0]!.slug;

  const [vendorSlug,  setVendorSlug]  = useState(defaultVendorSlug);
  const [slug,        setSlug]        = useState(item?.slug ?? "");
  const [name,        setName]        = useState(item?.name ?? "");
  const [category,    setCategory]    = useState<string>(item?.category ?? "Gaiwan");
  const [volumeMl,    setVolumeMl]    = useState<string>(item?.volume_ml?.toString() ?? "");
  const [material,    setMaterial]    = useState(item?.material ?? "");
  const [origin,      setOrigin]      = useState(item?.origin ?? "");
  const [externalUrl, setExternalUrl] = useState(item?.external_url ?? "");
  const [price,       setPrice]       = useState<number>(item ? Number(item.price) : 0);
  const [gradient,    setGradient]    = useState(
    item?.gradient ?? "linear-gradient(135deg,#A65D57 0%,#5C4033 100%)"
  );
  const [swatch,      setSwatch]      = useState(item?.swatch ?? "#A65D57");
  const [tagline,     setTagline]     = useState(item?.tagline ?? "");
  const [body,        setBody]        = useState(item?.body ?? "");
  const [goodFor,     setGoodFor]     = useState<string[]>(item?.good_for ?? []);
  const [rating,      setRating]      = useState<number>(item?.rating ?? 4);
  const [published,   setPublished]   = useState(item?.published ?? false);

  const toggleGoodFor = (t: string) =>
    setGoodFor((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveOwnedTeaware({
        originalSlug: item?.slug,
        slug, vendorSlug, name, category,
        volume_ml: volumeMl ? Number(volumeMl) : null,
        material,
        origin: origin || null,
        external_url: externalUrl || null,
        price, gradient, swatch, tagline, body,
        good_for: goodFor,
        rating, published,
      });
      if (!result.ok) { setError(result.message); return; }
      router.push("/admin/vendor/teaware");
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!item) return;
    if (!confirm(`Delete "${item.name}"? This is irreversible.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteOwnedTeaware(item.slug, vendorSlug);
      if (!result.ok) { setError(result.message); return; }
      router.push("/admin/vendor/teaware");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-[760px]">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-4">
        <div>
          <label className={labelCls} htmlFor="name">Name</label>
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="slug">Slug</label>
          <input id="slug" required pattern="[a-z0-9][a-z0-9-]*" value={slug} onChange={(e) => setSlug(e.target.value)} className={inputCls + " font-mono"} />
        </div>
      </div>

      {ownedVendors.length > 1 && (
        <div>
          <label className={labelCls} htmlFor="vendorSlug">Sold by</label>
          <select id="vendorSlug" value={vendorSlug} onChange={(e) => setVendorSlug(e.target.value)} className={inputCls}>
            {ownedVendors.map((v) => <option key={v.slug} value={v.slug}>{v.name}</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls} htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="volumeMl">Volume (ml, optional)</label>
          <input id="volumeMl" type="number" min={0} value={volumeMl} onChange={(e) => setVolumeMl(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="rating">Self rating (1–5)</label>
          <input id="rating" type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls} htmlFor="material">Material</label>
          <input id="material" required value={material} onChange={(e) => setMaterial(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="origin">Origin</label>
          <input id="origin" value={origin} onChange={(e) => setOrigin(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="price">Price (USD)</label>
          <input id="price" type="number" step="0.01" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="externalUrl">External purchase URL (if not sold via your shop directly)</label>
        <input id="externalUrl" type="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} className={inputCls + " font-mono text-[12px]"} />
      </div>

      <div>
        <label className={labelCls} htmlFor="tagline">Tagline (one line)</label>
        <input id="tagline" required value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputCls} />
      </div>

      <div>
        <label className={labelCls} htmlFor="body">Body</label>
        <textarea id="body" rows={6} required value={body} onChange={(e) => setBody(e.target.value)} className={inputCls + " font-serif text-[15px] leading-relaxed"} />
        <MarkdownHint />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="gradient">Gradient (CSS)</label>
          <input id="gradient" required value={gradient} onChange={(e) => setGradient(e.target.value)} className={inputCls + " font-mono text-[12px]"} />
        </div>
        <div>
          <label className={labelCls} htmlFor="swatch">Swatch (hex)</label>
          <input id="swatch" required value={swatch} onChange={(e) => setSwatch(e.target.value)} className={inputCls + " font-mono"} />
        </div>
      </div>

      <div>
        <span className={labelCls}>Good for</span>
        <div className="flex flex-wrap gap-2">
          {TEA_TYPES.map((t) => (
            <label
              key={t}
              className={[
                "px-2.5 py-1 rounded-pill text-[11px] font-bold tracking-widest uppercase border cursor-pointer",
                goodFor.includes(t)
                  ? "bg-sage-soft border-sage text-forest"
                  : "bg-warm-100 border-warm-300 text-warm-600",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={goodFor.includes(t)}
                onChange={() => toggleGoodFor(t)}
                className="sr-only"
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-[12px] font-bold text-warm-700">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Published
      </label>

      {error && (
        <div className="text-[12px] text-burgundy bg-burgundy/5 border border-burgundy/20 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex gap-3 flex-wrap items-center">
        <button type="submit" disabled={pending} className="px-4 py-2 rounded-pill bg-burgundy text-cream text-[12px] font-bold tracking-widest uppercase disabled:opacity-60">
          {pending ? "Saving…" : item ? "Save changes" : "Create teaware"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-pill border border-warm-300 text-warm-700 text-[12px] font-bold tracking-widest uppercase">
          Cancel
        </button>
        {item && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="ml-auto px-4 py-2 rounded-pill border border-burgundy text-burgundy text-[12px] font-bold tracking-widest uppercase disabled:opacity-60"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
