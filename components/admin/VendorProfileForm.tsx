"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Database } from "@/lib/supabase/types";
import { saveVendorProfile } from "@/app/admin/vendor/actions";
import { MarkdownHint } from "@/components/admin/MarkdownHint";
import { ImageUpload } from "@/components/admin/ImageUpload";

type VendorRow = Database["public"]["Tables"]["vendors"]["Row"];

const labelCls = "block text-[10px] tracking-widest uppercase font-bold text-warm-600 mb-1.5";
const inputCls =
  "w-full px-3 py-2 rounded-md border border-warm-300 bg-cream text-[14px] font-sans focus:outline-none focus:border-burgundy";

const CONTINENTS = ["Asia", "North America", "Europe", "South America", "Africa", "Oceania", "Other"];

export function VendorProfileForm({ vendor }: { vendor: VendorRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const [city,        setCity]        = useState(vendor.city);
  const [country,     setCountry]     = useState(vendor.country);
  const [continent,   setContinent]   = useState(vendor.continent);
  const [tagline,     setTagline]     = useState(vendor.tagline);
  const [body,        setBody]        = useState(vendor.body);
  const [swatch,      setSwatch]      = useState(vendor.swatch);
  const [founded,     setFounded]     = useState<number>(vendor.founded);
  const [specialties, setSpecialties] = useState((vendor.specialties ?? []).join(", "));
  const [url,         setUrl]         = useState(vendor.url);
  const [imageUrl,    setImageUrl]    = useState<string | null>(vendor.image_url ?? null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    startTransition(async () => {
      const result = await saveVendorProfile({
        slug: vendor.slug, city, country, continent, tagline, body, swatch, founded,
        specialties: specialties.split(",").map((s) => s.trim()).filter(Boolean),
        url,
        image_url: imageUrl,
      });
      if (!result.ok) {
        setStatus({ ok: false, message: result.message });
        return;
      }
      setStatus({ ok: true, message: "Saved. Public page will reflect changes after next request." });
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-[760px]">
      {/* Read-only top strip — fields the vendor can't edit. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-cream rounded-lg border border-warm-200">
        <div>
          <div className={labelCls}>Name</div>
          <div className="font-display italic text-burgundy text-[18px]">{vendor.name}</div>
        </div>
        <div>
          <div className={labelCls}>Slug</div>
          <div className="font-mono text-[13px] text-warm-700">{vendor.slug}</div>
        </div>
        <div>
          <div className={labelCls}>Our rating</div>
          <div className="font-display text-burgundy text-[18px]">{Number(vendor.rating).toFixed(1)}/5</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls} htmlFor="city">City</label>
          <input id="city" required value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="country">Country</label>
          <input id="country" required value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="continent">Continent</label>
          <select id="continent" value={continent} onChange={(e) => setContinent(e.target.value)} className={inputCls}>
            {CONTINENTS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="tagline">Tagline</label>
        <input id="tagline" required value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputCls} />
      </div>

      <div>
        <label className={labelCls} htmlFor="body">Body (1–2 paragraphs)</label>
        <textarea id="body" rows={6} required value={body} onChange={(e) => setBody(e.target.value)} className={inputCls + " font-serif text-[15px] leading-relaxed"} />
        <MarkdownHint />
      </div>

      <div>
        <ImageUpload
          label="Storefront photo"
          value={imageUrl}
          onChange={setImageUrl}
          kind="vendor"
          slug={vendor.slug}
          aspectRatio="1/1"
          alt={`${vendor.name} hero image`}
        />
        <p className="text-[11px] text-warm-600 leading-snug mt-1.5">
          Square aspect — replaces the colored tile on your detail page.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls} htmlFor="founded">Founded</label>
          <input id="founded" type="number" min={1500} max={2200} value={founded} onChange={(e) => setFounded(Number(e.target.value))} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="specialties">Specialties (comma-separated)</label>
          <input id="specialties" value={specialties} onChange={(e) => setSpecialties(e.target.value)} className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="url">Outbound URL</label>
          <input id="url" type="url" required value={url} onChange={(e) => setUrl(e.target.value)} className={inputCls + " font-mono text-[12px]"} />
        </div>
        <div>
          <label className={labelCls} htmlFor="swatch">Swatch (hex)</label>
          <input id="swatch" required value={swatch} onChange={(e) => setSwatch(e.target.value)} className={inputCls + " font-mono"} />
        </div>
      </div>

      {status && (
        <div
          className={[
            "text-[12px] rounded-md px-3 py-2 border",
            status.ok
              ? "text-forest bg-sage-soft border-sage"
              : "text-burgundy bg-burgundy/5 border-burgundy/20",
          ].join(" ")}
        >
          {status.message}
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="px-4 py-2 rounded-pill bg-burgundy text-cream text-[12px] font-bold tracking-widest uppercase disabled:opacity-60">
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-pill border border-warm-300 text-warm-700 text-[12px] font-bold tracking-widest uppercase">
          Cancel
        </button>
      </div>
    </form>
  );
}
