"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Database } from "@/lib/supabase/types";
import { saveVendor } from "@/app/admin/contributor/actions";

type VendorRow = Database["public"]["Tables"]["vendors"]["Row"];

const labelCls = "block text-[10px] tracking-widest uppercase font-bold text-warm-600 mb-1.5";
const inputCls =
  "w-full px-3 py-2 rounded-md border border-warm-300 bg-cream text-[14px] font-sans focus:outline-none focus:border-burgundy";

const CONTINENTS = ["Asia", "North America", "Europe", "South America", "Africa", "Oceania", "Other"];

type VendorUserOption = {
  id: string;
  email: string | null;
  display_name: string | null;
};

export function VendorEditForm({
  vendor,
  vendorUsers = [],
}: {
  vendor: VendorRow | null;
  vendorUsers?: VendorUserOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [slug,         setSlug]         = useState(vendor?.slug ?? "");
  const [name,         setName]         = useState(vendor?.name ?? "");
  const [city,         setCity]         = useState(vendor?.city ?? "");
  const [country,      setCountry]      = useState(vendor?.country ?? "");
  const [continent,    setContinent]    = useState(vendor?.continent ?? "Asia");
  const [tagline,      setTagline]      = useState(vendor?.tagline ?? "");
  const [body,         setBody]         = useState(vendor?.body ?? "");
  const [rating,       setRating]       = useState<number>(vendor ? Number(vendor.rating) : 4);
  const [swatch,       setSwatch]       = useState(vendor?.swatch ?? "#722F37");
  const [teaCount,     setTeaCount]     = useState<number>(vendor?.tea_count ?? 0);
  const [founded,      setFounded]      = useState<number>(vendor?.founded ?? new Date().getFullYear());
  const [specialties,  setSpecialties]  = useState((vendor?.specialties ?? []).join(", "));
  const [url,          setUrl]          = useState(vendor?.url ?? "");
  const [published,    setPublished]    = useState(vendor?.published ?? false);
  const [ownerId,      setOwnerId]      = useState(vendor?.owner_id ?? "");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveVendor({
        originalSlug: vendor?.slug,
        slug, name, city, country, continent, tagline, body, rating, swatch,
        tea_count: teaCount,
        founded,
        specialties: specialties.split(",").map((s) => s.trim()).filter(Boolean),
        url,
        published,
        owner_id: ownerId || null,
      });
      if (!result.ok) { setError(result.message); return; }
      router.push("/admin/contributor/vendors");
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
        <label className={labelCls} htmlFor="tagline">Tagline (one line)</label>
        <input id="tagline" required value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputCls} />
      </div>

      <div>
        <label className={labelCls} htmlFor="body">Body (1–2 paragraphs)</label>
        <textarea id="body" rows={6} required value={body} onChange={(e) => setBody(e.target.value)} className={inputCls + " font-serif text-[15px] leading-relaxed"} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className={labelCls} htmlFor="rating">Our rating (0–5)</label>
          <input id="rating" type="number" step="0.5" min={0} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="teaCount">Tea count</label>
          <input id="teaCount" type="number" min={0} value={teaCount} onChange={(e) => setTeaCount(Number(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="founded">Founded</label>
          <input id="founded" type="number" min={1500} max={2200} value={founded} onChange={(e) => setFounded(Number(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="swatch">Swatch (hex)</label>
          <input id="swatch" required value={swatch} onChange={(e) => setSwatch(e.target.value)} className={inputCls + " font-mono"} />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="specialties">Specialties (comma-separated)</label>
        <input id="specialties" value={specialties} onChange={(e) => setSpecialties(e.target.value)} className={inputCls} />
      </div>

      <div>
        <label className={labelCls} htmlFor="url">Outbound URL</label>
        <input id="url" type="url" required value={url} onChange={(e) => setUrl(e.target.value)} className={inputCls + " font-mono text-[12px]"} />
      </div>

      {/* Owner — links the vendor row to a user with role=vendor so
          they can edit it via /admin/vendor. Only signed-up vendor
          users appear in the list; once a vendor signs up, refresh
          this page to see them here. */}
      <div>
        <label className={labelCls} htmlFor="ownerId">Vendor owner (optional)</label>
        <select
          id="ownerId"
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          className={inputCls}
        >
          <option value="">— Unclaimed —</option>
          {vendorUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.email ?? u.id}{u.display_name ? ` · ${u.display_name}` : ""}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-warm-600 leading-snug mt-1.5">
          When set, this user can edit the storefront copy via{" "}
          <code className="font-mono">/admin/vendor</code>. Only profiles with
          role=vendor are listed.
        </p>
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
          {pending ? "Saving…" : vendor ? "Save changes" : "Create vendor"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-pill border border-warm-300 text-warm-700 text-[12px] font-bold tracking-widest uppercase">
          Cancel
        </button>
      </div>
    </form>
  );
}
