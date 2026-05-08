"use server";

// Server actions for the contributor portal. Each action re-checks
// the staff role server-side (defense in depth — the layout already
// gates at the route level, but actions can be invoked directly).

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/require-role";
import type { Database } from "@/lib/supabase/types";

type PostInsert    = Database["public"]["Tables"]["posts"]["Insert"];
type VendorInsert  = Database["public"]["Tables"]["vendors"]["Insert"];
type TeawareInsert = Database["public"]["Tables"]["teaware"]["Insert"];
type TeaInsert     = Database["public"]["Tables"]["teas"]["Insert"];

/**
 * Trigger a Vercel deploy. Reads VERCEL_DEPLOY_HOOK_URL from env;
 * if unset, returns a clear error so the operator knows they need to
 * create the hook (Vercel → Project → Settings → Git → Deploy Hooks).
 *
 * Behavior:
 *   - POSTs to the hook URL with an empty body (Vercel ignores the body).
 *   - Vercel responds with a deployment ID; we don't surface it, but we
 *     could pipe it into a status panel later.
 *   - On success, also revalidates the catalog routes so the editor
 *     sees fresh data on the next view.
 */
export async function triggerRebuild(): Promise<{ ok: boolean; message: string }> {
  await requireStaff();

  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) {
    return {
      ok: false,
      message:
        "VERCEL_DEPLOY_HOOK_URL is not configured. Create a deploy hook in Vercel → Settings → Git, then add the URL to env (Production + Preview).",
    };
  }

  try {
    const res = await fetch(hook, { method: "POST" });
    if (!res.ok) {
      return { ok: false, message: `Vercel returned ${res.status} ${res.statusText}` };
    }
    // Drop the cached anon-client reads so the editor sees changes
    // immediately, even before the rebuild completes.
    revalidatePath("/", "layout");
    return { ok: true, message: "Rebuild queued. Check Vercel deployments for status." };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Unknown error calling deploy hook",
    };
  }
}

// =====================================================================
// Catalog upserts. Each one validates server-side, writes through the
// SSR client (RLS gates on staff role), and revalidates the public
// route so a draft → publish toggle is visible on the next view.
// =====================================================================

export type SaveResult = { ok: true; slug: string } | { ok: false; message: string };

export async function savePost(input: {
  // Original slug — present when editing an existing row, absent on
  // create. Used as the WHERE for upsert and to revalidate the old
  // path if the slug changes.
  originalSlug?: string;
  slug: string;
  cat: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  read_time: number;
  grad: string;
  related: string[];
  body: string | null;
  published: boolean;
  published_at: string | null;
}): Promise<SaveResult> {
  await requireStaff();
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const sb = await createSupabaseServerClient();

  if (!/^[a-z0-9][a-z0-9-]*$/.test(input.slug)) {
    return { ok: false, message: "Slug must be lowercase letters/digits/hyphens." };
  }

  const row: PostInsert = {
    slug:         input.slug,
    cat:          input.cat as PostInsert["cat"],
    title:        input.title,
    excerpt:      input.excerpt,
    author:       input.author,
    date:         input.date,
    read_time:    input.read_time,
    grad:         input.grad,
    related:      input.related,
    body:         input.body,
    published:    input.published,
    published_at: input.published_at,
  };

  const { error } = await sb.from("posts").upsert(row, { onConflict: "slug" });
  if (error) return { ok: false, message: error.message };

  // If the slug changed, drop the old route's cache too.
  if (input.originalSlug && input.originalSlug !== input.slug) {
    revalidatePath(`/journal/${input.originalSlug}`);
  }
  revalidatePath(`/journal/${input.slug}`);
  revalidatePath("/journal");
  revalidatePath("/admin/contributor/posts");
  return { ok: true, slug: input.slug };
}

export async function saveVendor(input: {
  originalSlug?: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  continent: string;
  tagline: string;
  body: string;
  rating: number;
  swatch: string;
  tea_count: number;
  founded: number;
  specialties: string[];
  url: string;
  published: boolean;
  owner_id: string | null;
}): Promise<SaveResult> {
  await requireStaff();
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const sb = await createSupabaseServerClient();

  if (!/^[a-z0-9][a-z0-9-]*$/.test(input.slug)) {
    return { ok: false, message: "Slug must be lowercase letters/digits/hyphens." };
  }

  const { originalSlug, ...rest } = input;
  const row: VendorInsert = rest;
  const { error } = await sb.from("vendors").upsert(row, { onConflict: "slug" });
  if (error) return { ok: false, message: error.message };

  if (originalSlug && originalSlug !== input.slug) {
    revalidatePath(`/discover/vendors/${originalSlug}`);
  }
  revalidatePath(`/discover/vendors/${input.slug}`);
  revalidatePath("/discover/vendors");
  revalidatePath("/admin/contributor/vendors");
  return { ok: true, slug: input.slug };
}

export async function saveTeaware(input: {
  originalSlug?: string;
  slug: string;
  name: string;
  category: string;
  volume_ml: number | null;
  material: string;
  origin: string | null;
  vendor: string;
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
  await requireStaff();
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const sb = await createSupabaseServerClient();

  if (!/^[a-z0-9][a-z0-9-]*$/.test(input.slug)) {
    return { ok: false, message: "Slug must be lowercase letters/digits/hyphens." };
  }

  const { originalSlug, category, ...rest } = input;
  const row: TeawareInsert = {
    ...rest,
    category: category as TeawareInsert["category"],
  };
  const { error } = await sb.from("teaware").upsert(row, { onConflict: "slug" });
  if (error) return { ok: false, message: error.message };

  if (originalSlug && originalSlug !== input.slug) {
    revalidatePath(`/discover/teaware/${originalSlug}`);
  }
  revalidatePath(`/discover/teaware/${input.slug}`);
  revalidatePath("/discover/teaware");
  revalidatePath("/admin/contributor/teaware");
  return { ok: true, slug: input.slug };
}

export async function saveTea(input: {
  originalSlug?: string;
  slug: string;
  path_slug: string;
  vendor_slug: string;
  name: string;
  chinese: string | null;
  type: string;
  region: string;
  country: string;
  year: string;
  harvest: string;
  elev: number;
  age: string;
  price: number;
  rarity: number;
  gradient: string;
  swatch: string;
  subtitle: string | null;
  summary: string;
  brewing: unknown;
  mouthfeel: unknown;
  finish: string[];
  sessions_count: number;
  peak_steeps: number[];
  flavor: unknown;
  reviews: unknown;
  published: boolean;
}): Promise<SaveResult> {
  await requireStaff();
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const sb = await createSupabaseServerClient();

  if (!/^[a-z0-9][a-z0-9-]*$/.test(input.slug)) {
    return { ok: false, message: "Slug must be lowercase letters/digits/hyphens." };
  }

  const { originalSlug, type, brewing, mouthfeel, flavor, reviews, ...rest } = input;
  const row: TeaInsert = {
    ...rest,
    type:      type as TeaInsert["type"],
    brewing:   brewing as TeaInsert["brewing"],
    mouthfeel: mouthfeel as TeaInsert["mouthfeel"],
    flavor:    flavor as TeaInsert["flavor"],
    reviews:   reviews as TeaInsert["reviews"],
  };
  const { error } = await sb.from("teas").upsert(row, { onConflict: "slug" });
  if (error) return { ok: false, message: error.message };

  if (originalSlug && originalSlug !== input.slug) {
    // Path-slug-based public URL, derived from the vendor slug + tea
    // path_slug. Best-effort: we don't know the vendor of the previous
    // row from here, so we revalidate at the parent layout level.
    revalidatePath("/", "layout");
  }
  revalidatePath(`/tea/${input.vendor_slug}/${input.path_slug}`);
  revalidatePath("/discover/teas");
  revalidatePath("/admin/contributor/teas");
  return { ok: true, slug: input.slug };
}

/** Update a user's role. Admin-only — contributors can edit catalog
 *  rows but they shouldn't be able to promote themselves to admin. */
export async function setUserRole(input: {
  userId: string;
  role: "admin" | "contributor" | "vendor" | "member" | "user";
}): Promise<{ ok: boolean; message?: string }> {
  const { requireRole } = await import("@/lib/auth/require-role");
  const { userId: callerId } = await requireRole(["admin"]);
  if (callerId === input.userId) {
    return { ok: false, message: "You can't change your own role. Ask another admin." };
  }
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const sb = await createSupabaseServerClient();
  const { error } = await sb
    .from("profiles")
    .update({ role: input.role })
    .eq("id", input.userId);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/contributor/users");
  return { ok: true };
}

/** Toggle the `published` flag on any catalog row. */
export async function setPublished(args: {
  table: "teas" | "vendors" | "posts" | "teaware";
  slug: string;
  published: boolean;
}): Promise<{ ok: boolean; message?: string }> {
  await requireStaff();
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const sb = await createSupabaseServerClient();

  const { error } = await sb
    .from(args.table)
    .update({ published: args.published })
    .eq("slug", args.slug);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/contributor");
  revalidatePath("/admin/contributor/" + args.table);
  return { ok: true };
}
