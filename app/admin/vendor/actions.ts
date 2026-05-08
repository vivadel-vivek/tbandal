"use server";

// Vendor-portal server actions. Re-check role + ownership server-side
// (defense in depth on top of RLS).

import { revalidatePath } from "next/cache";
import { requireVendorOrAdmin } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type VendorUpdate = Database["public"]["Tables"]["vendors"]["Update"];
type TeawareInsert = Database["public"]["Tables"]["teaware"]["Insert"];

export type SaveResult = { ok: true } | { ok: false; message: string };

/** Vendor-side fields the owner controls. Slug, owner_id, rating, and
 *  tea_count are deliberately excluded — those are admin-only. */
export async function saveVendorProfile(input: {
  slug: string;
  city: string;
  country: string;
  continent: string;
  tagline: string;
  body: string;
  swatch: string;
  founded: number;
  specialties: string[];
  url: string;
  image_url: string | null;
}): Promise<SaveResult> {
  const { userId, role } = await requireVendorOrAdmin();
  const sb = await createSupabaseServerClient();

  // Verify caller owns this vendor (or is admin). RLS would also block
  // a stray write, but this returns a friendlier error.
  const { data: vendor } = await sb
    .from("vendors")
    .select("owner_id")
    .eq("slug", input.slug)
    .maybeSingle();
  if (!vendor) return { ok: false, message: "Vendor not found." };
  if (role !== "admin" && vendor.owner_id !== userId) {
    return { ok: false, message: "You don't own this vendor row." };
  }

  const { slug, ...updates } = input;
  const row: VendorUpdate = updates;
  const { error } = await sb.from("vendors").update(row).eq("slug", slug);
  if (error) return { ok: false, message: error.message };

  revalidatePath(`/discover/vendors/${slug}`);
  revalidatePath("/discover/vendors");
  revalidatePath("/admin/vendor");
  revalidatePath("/admin/vendor/profile");
  return { ok: true };
}

/** Vendor-side teaware upsert — vendor field is forced to the owned
 *  vendor's display name so a vendor can't list teaware sold by
 *  someone else. */
export async function saveOwnedTeaware(input: {
  originalSlug?: string;
  slug: string;
  vendorSlug: string;       // which owned vendor sells this
  name: string;
  category: string;
  volume_ml: number | null;
  material: string;
  origin: string | null;
  external_url: string | null;
  price: number;
  gradient: string;
  swatch: string;
  tagline: string;
  body: string;
  good_for: string[];
  rating: number;
  published: boolean;
}): Promise<SaveResult> {
  const { userId, role } = await requireVendorOrAdmin();
  const sb = await createSupabaseServerClient();

  const { data: vendor } = await sb
    .from("vendors")
    .select("name, owner_id")
    .eq("slug", input.vendorSlug)
    .maybeSingle();
  if (!vendor) return { ok: false, message: "Vendor not found." };
  if (role !== "admin" && vendor.owner_id !== userId) {
    return { ok: false, message: "You don't own this vendor row." };
  }

  if (!/^[a-z0-9][a-z0-9-]*$/.test(input.slug)) {
    return { ok: false, message: "Slug must be lowercase letters/digits/hyphens." };
  }

  const { originalSlug, vendorSlug, category, ...rest } = input;
  const row: TeawareInsert = {
    ...rest,
    vendor:   vendor.name,
    category: category as TeawareInsert["category"],
  };
  const { error } = await sb.from("teaware").upsert(row, { onConflict: "slug" });
  if (error) return { ok: false, message: error.message };

  if (originalSlug && originalSlug !== input.slug) {
    revalidatePath(`/discover/teaware/${originalSlug}`);
  }
  revalidatePath(`/discover/teaware/${input.slug}`);
  revalidatePath("/discover/teaware");
  revalidatePath("/admin/vendor/teaware");
  return { ok: true };
}

export async function deleteOwnedTeaware(slug: string, vendorSlug: string): Promise<SaveResult> {
  const { userId, role } = await requireVendorOrAdmin();
  const sb = await createSupabaseServerClient();

  const { data: vendor } = await sb
    .from("vendors")
    .select("name, owner_id")
    .eq("slug", vendorSlug)
    .maybeSingle();
  if (!vendor) return { ok: false, message: "Vendor not found." };
  if (role !== "admin" && vendor.owner_id !== userId) {
    return { ok: false, message: "You don't own this vendor row." };
  }

  const { error } = await sb.from("teaware").delete().eq("slug", slug).eq("vendor", vendor.name);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/discover/teaware");
  revalidatePath("/admin/vendor/teaware");
  return { ok: true };
}
