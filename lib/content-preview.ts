// Preview-aware reads — SSR client backed by the staff RLS policies
// (`teas_staff_all` / `posts_staff_all` etc.) so the same fetcher
// returns draft rows when the caller is admin or contributor.
//
// Usage pattern: page reads `searchParams.preview`. When set AND the
// caller is staff, use the preview helpers below; otherwise fall back
// to the public anon-client getters in lib/content.ts.

import "server-only";
import type { Post, Tea, TeaFlavorBundle, TeaReviews, Teaware, Vendor } from "./types";
import { createSupabaseServerClient } from "./supabase/server";
import type { Database } from "./supabase/types";

type VendorRow = Database["public"]["Tables"]["vendors"]["Row"];

export async function isCurrentUserStaff(): Promise<boolean> {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;
  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.role === "admin" || profile?.role === "contributor";
}

// Mirrors the row → domain mapper in lib/content.ts. Kept here so we
// can fetch via the SSR client without depending on the anon module.
type TeaRow = Database["public"]["Tables"]["teas"]["Row"];
type TeaRowJoined = TeaRow & { vendor: Pick<VendorRow, "slug" | "name"> | null };

function teaFromRow(r: TeaRowJoined): Tea {
  if (!r.vendor) {
    throw new Error(`tea "${r.slug}": missing vendor join`);
  }
  return {
    slug:       r.slug,
    pathSlug:   r.path_slug,
    vendor:     r.vendor.name,
    vendorSlug: r.vendor.slug,
    name:       r.name,
    chinese:    r.chinese ?? undefined,
    type:       r.type,
    region:     r.region,
    country:    r.country,
    year:       r.year,
    harvest:    r.harvest,
    elev:       r.elev,
    age:        r.age,
    price:      Number(r.price),
    rarity:     r.rarity,
    gradient:   r.gradient,
    swatch:     r.swatch,
    subtitle:   r.subtitle ?? null,
    summary:    r.summary,
    brewing:    r.brewing as Tea["brewing"],
    mouthfeel:  r.mouthfeel as Tea["mouthfeel"],
    finish:     r.finish,
    sessions:   r.sessions_count,
    peakSteeps: r.peak_steeps,
    flavor:     r.flavor as TeaFlavorBundle,
    reviews:    r.reviews as TeaReviews,
  };
}

export async function getPreviewTeaByVendorAndPath(
  vendorSlug: string,
  pathSlug: string,
): Promise<Tea | undefined> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("teas")
    .select("*, vendor:vendors!teas_vendor_slug_fkey(slug, name)")
    .eq("path_slug", pathSlug)
    .maybeSingle();
  if (error || !data) return undefined;
  const row = data as unknown as TeaRowJoined;
  if (row.vendor?.slug !== vendorSlug) return undefined;
  return teaFromRow(row);
}

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

export async function getPreviewPostBySlug(slug: string): Promise<Post | undefined> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<PostRow>();
  if (error || !data) return undefined;
  return {
    slug:     data.slug,
    cat:      data.cat,
    title:    data.title,
    excerpt:  data.excerpt,
    author:   data.author as Post["author"],
    date:     data.date,
    readTime: data.read_time,
    grad:     data.grad,
    related:  data.related,
    body:     data.body ?? undefined,
  };
}

// Vendor + teaware preview helpers — same shape, less commonly drafted
// but useful for completeness.

export async function getPreviewVendorBySlug(slug: string): Promise<Vendor | undefined> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("vendors")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<VendorRow>();
  if (error || !data) return undefined;
  return {
    slug:        data.slug,
    name:        data.name,
    city:        data.city,
    country:     data.country,
    continent:   data.continent,
    tagline:     data.tagline,
    body:        data.body,
    rating:      Number(data.rating),
    swatch:      data.swatch,
    teaCount:    data.tea_count,
    founded:     data.founded,
    specialties: data.specialties,
    url:         data.url,
  };
}

type TeawareRow = Database["public"]["Tables"]["teaware"]["Row"];

export async function getPreviewTeawareBySlug(slug: string): Promise<Teaware | undefined> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("teaware")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<TeawareRow>();
  if (error || !data) return undefined;
  return {
    slug:        data.slug,
    name:        data.name,
    category:    data.category,
    volumeMl:    data.volume_ml ?? undefined,
    material:    data.material,
    origin:      data.origin ?? undefined,
    vendor:      data.vendor,
    externalUrl: data.external_url ?? undefined,
    price:       Number(data.price),
    gradient:    data.gradient,
    swatch:      data.swatch,
    tagline:     data.tagline,
    body:        data.body,
    goodFor:     data.good_for as Teaware["goodFor"],
    rating:      data.rating,
  };
}
