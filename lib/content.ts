// =====================================================================
// Content fetchers — async getters for the editorial catalog
// =====================================================================
// These replace the synchronous TEAS / VENDORS / POSTS / TEAWARE /
// CONTRIBUTORS arrays previously hardcoded in lib/data.ts. The shape
// they return is identical to the sync versions, so call sites only
// have to add `await`.
//
// Build-time SSG: pages call these at request time; Next.js statically
// renders the result for routes without dynamic params (`force-dynamic`
// is reserved for the auth/member surfaces). The fetchers use the
// public anon client — RLS lets anonymous read published rows.
// =====================================================================

import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

import type {
  Contributor,
  ContributorKey,
  Post,
  Tea,
  TeaReviews,
  TeaFlavorBundle,
  Teaware,
  Vendor,
} from "./types";
import { getSupabasePublicEnv } from "./supabase/env";
import type { Database } from "./supabase/types";

// Stateless anon client — no cookies, no session. Build-time and
// runtime page renders both share this. RLS lets anonymous read
// published rows of every catalog table.
//
// Returns null when Supabase env vars are missing rather than
// throwing. The getters below treat null as "no catalog yet" and
// return empty arrays so a missing-env deploy succeeds with empty
// pages instead of breaking the entire build.
//
// 60-second revalidate on every Supabase fetch. Without it, Next's
// Data Cache memoizes responses indefinitely and DB edits stay
// invisible until the next deploy. With `revalidate: 0` (or
// `cache: "no-store"`), every consuming page becomes dynamic and
// statically-prerenderable routes (sitemap, about, journal index)
// fail to build. 60s is the smallest window that lets all routes
// stay statically prerendered while keeping content reasonably
// fresh — contributor-portal save actions still call revalidatePath
// for instant invalidation; Studio / direct-DB edits surface
// within a minute.
function anonClient() {
  try {
    const { url, anon } = getSupabasePublicEnv();
    return createClient<Database>(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) =>
          fetch(input, { ...init, next: { revalidate: 60 } }),
      },
    });
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[lib/content] Supabase env missing — catalog reads return empty.",
      );
    }
    return null;
  }
}

// =====================================================================
// Row → domain mappers
// =====================================================================

type VendorRow = Database["public"]["Tables"]["vendors"]["Row"];
function vendorFromRow(r: VendorRow): Vendor {
  return {
    slug:        r.slug,
    name:        r.name,
    city:        r.city,
    country:     r.country,
    continent:   r.continent,
    tagline:     r.tagline,
    body:        r.body,
    rating:      Number(r.rating),
    swatch:      r.swatch,
    teaCount:    r.tea_count,
    founded:     r.founded,
    specialties: r.specialties,
    url:         r.url,
  };
}

type TeaRow = Database["public"]["Tables"]["teas"]["Row"];
type TeaRowJoined = TeaRow & { vendor: Pick<VendorRow, "name" | "slug"> | null };

function teaFromRow(r: TeaRowJoined): Tea {
  if (!r.vendor) {
    throw new Error(`tea "${r.slug}": missing vendor join (vendor_slug=${r.vendor_slug})`);
  }
  return {
    slug:       r.slug,
    pathSlug:   r.path_slug,
    vendor:     r.vendor.name,
    vendorSlug: r.vendor.slug,
    name:       r.name,
    chinese:    r.chinese ?? undefined,
    type:       r.type,
    subtype:    r.subtype ?? null,
    aged:       r.aged ?? false,
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

type TeawareRow = Database["public"]["Tables"]["teaware"]["Row"];
function teawareFromRow(r: TeawareRow): Teaware {
  return {
    slug:        r.slug,
    name:        r.name,
    category:    r.category,
    volumeMl:    r.volume_ml ?? undefined,
    material:    r.material,
    origin:      r.origin ?? undefined,
    vendor:      r.vendor,
    externalUrl: r.external_url ?? undefined,
    price:       Number(r.price),
    gradient:    r.gradient,
    swatch:      r.swatch,
    tagline:     r.tagline,
    body:        r.body,
    goodFor:     r.good_for as Teaware["goodFor"],
    rating:      r.rating,
  };
}

type PostRow = Database["public"]["Tables"]["posts"]["Row"];
function postFromRow(r: PostRow): Post {
  return {
    slug:     r.slug,
    cat:      r.cat,
    title:    r.title,
    excerpt:  r.excerpt,
    author:   r.author as Post["author"],
    date:     r.date,
    readTime: r.read_time,
    grad:     r.grad,
    related:  r.related,
    body:     r.body ?? undefined,
  };
}

type ContributorRow = Database["public"]["Tables"]["contributors"]["Row"];
function contributorFromRow(r: ContributorRow): Contributor {
  return {
    key:      r.handle as ContributorKey,
    name:     r.display_name,
    initials: r.initials,
    color:    r.color,
    bio:      r.bio,
    palate:   r.palate,
  };
}

// =====================================================================
// Getters — wrapped in React.cache() so a single render only fetches
// each list once, even if multiple components await it.
// =====================================================================

export const getVendors = cache(async (): Promise<Vendor[]> => {
  const sb = anonClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("vendors")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw new Error(`getVendors: ${error.message}`);
  return (data ?? []).map(vendorFromRow);
});

export async function getVendorBySlug(slug: string): Promise<Vendor | undefined> {
  const all = await getVendors();
  return all.find((v) => v.slug === slug);
}

export async function getVendorByName(name: string): Promise<Vendor | undefined> {
  const all = await getVendors();
  return all.find((v) => v.name === name);
}

export const getTeas = cache(async (): Promise<Tea[]> => {
  const sb = anonClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("teas")
    .select("*, vendor:vendors!teas_vendor_slug_fkey(slug, name)")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`getTeas: ${error.message}`);
  return (data as unknown as TeaRowJoined[] ?? []).map(teaFromRow);
});

export async function getTeaBySlug(slug: string): Promise<Tea | undefined> {
  const all = await getTeas();
  return all.find((t) => t.slug === slug);
}

export async function getTeaByVendorAndPath(
  vendorSlug: string,
  pathSlug: string,
): Promise<Tea | undefined> {
  const all = await getTeas();
  // tea.vendor is the vendor name; we need the vendor slug to match.
  // The join in getTeas embedded slug too; we can avoid an extra
  // round-trip by walking vendors map.
  const vendors = await getVendors();
  const vName = vendors.find((v) => v.slug === vendorSlug)?.name;
  if (!vName) return undefined;
  return all.find((t) => t.vendor === vName && t.pathSlug === pathSlug);
}

export const getTeaware = cache(async (): Promise<Teaware[]> => {
  const sb = anonClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("teaware")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`getTeaware: ${error.message}`);
  return (data ?? []).map(teawareFromRow);
});

export async function getTeawareBySlug(slug: string): Promise<Teaware | undefined> {
  const all = await getTeaware();
  return all.find((w) => w.slug === slug);
}

export const getPosts = cache(async (): Promise<Post[]> => {
  const sb = anonClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error) throw new Error(`getPosts: ${error.message}`);
  return (data ?? []).map(postFromRow);
});

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const all = await getPosts();
  return all.find((p) => p.slug === slug);
}

// Built-in design defaults so AvatarChip-style consumers always get a
// reasonable name/initials/color even when the contributors table is
// empty (initial deploy, missing env). The bio + palate strings are
// blank so an empty-DB site doesn't display invented copy.
const FALLBACK_CONTRIBUTORS: Record<ContributorKey, Contributor> = {
  james: { key: "james", name: "James", initials: "J", color: "#722F37", bio: "", palate: "" },
  vivek: { key: "vivek", name: "Vivek", initials: "V", color: "#8B9A7D", bio: "", palate: "" },
};

export const getContributors = cache(async (): Promise<Record<ContributorKey, Contributor>> => {
  const sb = anonClient();
  if (!sb) return FALLBACK_CONTRIBUTORS;
  const { data, error } = await sb
    .from("contributors")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`getContributors: ${error.message}`);
  const out = {} as Record<ContributorKey, Contributor>;
  for (const row of data ?? []) {
    out[row.handle as ContributorKey] = contributorFromRow(row);
  }
  // Backfill any missing contributor with fallback styling so the
  // call sites can index without runtime undefined errors.
  for (const k of Object.keys(FALLBACK_CONTRIBUTORS) as ContributorKey[]) {
    if (!out[k]) out[k] = FALLBACK_CONTRIBUTORS[k];
  }
  return out;
});

// ---- featured / latest ------------------------------------------
// Both can return null when the catalog is empty (typical on first
// deploy before the seed runs). Pages render an empty state instead
// of erroring out the entire build.
export async function featuredTea(): Promise<Tea | null> {
  const teas = await getTeas();
  return teas[0] ?? null;
}

export async function latestPost(): Promise<Post | null> {
  const posts = await getPosts();
  return posts[0] ?? null;
}

// ---- group / filter helpers (now async) ------------------------
export async function groupVendorsByGeography(): Promise<Record<string, Record<string, Vendor[]>>> {
  const vendors = await getVendors();
  const out: Record<string, Record<string, Vendor[]>> = {};
  for (const v of vendors) {
    const cont = v.continent || "Other";
    const country = v.country || "Other";
    if (!out[cont]) out[cont] = {};
    if (!out[cont][country]) out[cont][country] = [];
    out[cont][country].push(v);
  }
  return out;
}

export async function groupTeawareByCategory(): Promise<Record<string, Teaware[]>> {
  const teaware = await getTeaware();
  const out: Record<string, Teaware[]> = {};
  for (const item of teaware) {
    const cat = item.category;
    if (!out[cat]) out[cat] = [];
    out[cat].push(item);
  }
  return out;
}

export const VESSEL_CATEGORIES = [
  "Gaiwan",
  "Teapot",
  "Kyusu",
  "Pitcher",
  "Cup",
] as const;

export async function vesselTeaware(): Promise<Teaware[]> {
  const teaware = await getTeaware();
  return teaware.filter((t) =>
    (VESSEL_CATEGORIES as readonly string[]).includes(t.category),
  );
}
