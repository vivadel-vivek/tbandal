"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Database } from "@/lib/supabase/types";
import { saveTeaware } from "@/app/admin/contributor/actions";
import { MarkdownHint } from "@/components/admin/MarkdownHint";
import { ImageUpload } from "@/components/admin/ImageUpload";

type TeawareRow = Database["public"]["Tables"]["teaware"]["Row"];

const labelCls = "block text-[10px] tracking-widest uppercase font-bold text-warm-600 mb-1.5";
const inputCls =
  "w-full px-3 py-2 rounded-md border border-warm-300 bg-cream text-[14px] font-sans focus:outline-none focus:border-burgundy";

const CATEGORIES = ["Gaiwan", "Teapot", "Kyusu", "Pitcher", "Cup", "Kettle", "Scale", "Strainer", "Other"];
const TEA_TYPES = [
  "Green",
  "White",
  "Yellow",
  "Oolong",
  "Black",
  "Sheng Pu'er",
  "Shou Pu'er",
  "Dark",
  "Herbal",
];

export function TeawareEditForm({ item }: { item: TeawareRow | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [slug,        setSlug]        = useState(item?.slug ?? "");
  const [name,        setName]        = useState(item?.name ?? "");
  const [category,    setCategory]    = useState<string>(item?.category ?? "Gaiwan");
  const [volumeMl,    setVolumeMl]    = useState<string>(item?.volume_ml?.toString() ?? "");
  const [material,    setMaterial]    = useState(item?.material ?? "");
  const [origin,      setOrigin]      = useState(item?.origin ?? "");
  const [vendor,      setVendor]      = useState(item?.vendor ?? "");
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
  const [imageUrl,    setImageUrl]    = useState<string | null>(item?.image_url ?? null);
  const [published,   setPublished]   = useState(item?.published ?? false);

  const toggleGoodFor = (t: string) =>
    setGoodFor((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveTeaware({
        originalSlug: item?.slug,
        slug, name, category,
        volume_ml: volumeMl ? Number(volumeMl) : null,
        material,
        origin: origin || null,
        vendor,
        external_url: externalUrl || null,
        price, gradient, swatch, tagline, body,
        good_for: goodFor,
        rating,
        image_url: imageUrl,
        published,
      });
      if (!result.ok) { setError(result.message); return; }
      router.push("/admin/contributor/teaware");
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
          <label className={labelCls} htmlFor="rating">Our rating (1–5)</label>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="vendor">Vendor (display name)</label>
          <input id="vendor" required value={vendor} onChange={(e) => setVendor(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="externalUrl">External URL (for off-catalog brands)</label>
          <input id="externalUrl" type="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} className={inputCls + " font-mono text-[12px]"} />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="tagline">Tagline</label>
        <input id="tagline" required value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputCls} />
      </div>

      <div>
        <label className={labelCls} htmlFor="body">Body</label>
        <textarea id="body" rows={6} required value={body} onChange={(e) => setBody(e.target.value)} className={inputCls + " font-serif text-[15px] leading-relaxed"} />
        <MarkdownHint />
      </div>

      <div>
        <ImageUpload
          label="Hero photo"
          value={imageUrl}
          onChange={setImageUrl}
          kind="teaware"
          slug={slug || "untitled"}
          aspectRatio="4/3"
          alt={`${name || "Teaware"} hero image`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="gradient">Gradient (CSS — fallback)</label>
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

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="px-4 py-2 rounded-pill bg-burgundy text-cream text-[12px] font-bold tracking-widest uppercase disabled:opacity-60">
          {pending ? "Saving…" : item ? "Save changes" : "Create teaware"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-pill border border-warm-300 text-warm-700 text-[12px] font-bold tracking-widest uppercase">
          Cancel
        </button>
      </div>
    </form>
  );
}
