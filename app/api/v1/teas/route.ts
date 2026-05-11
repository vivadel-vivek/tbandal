import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateBearer } from "@/lib/api/auth";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";

// POST /api/v1/teas — upsert a tea row by slug.
//
// Auth: Bearer token via Authorization header (lib/api/auth.ts).
// Service-role write; the auth gate is the API key itself.
//
// Request body: a partial tea row. `slug` is required; everything
// else is optional and defaulted to existing values on update. On
// create, the catalog columns marked NOT NULL in the schema must
// be supplied (path_slug, vendor_slug, name, type, region, country,
// year, harvest, elev, price, rarity, gradient, swatch, summary,
// brewing, mouthfeel, flavor, reviews).
//
// Response: { ok: true, slug } or { ok: false, message }.
// Status codes: 200 on success, 400 on validation, 401 on auth,
// 422 on Supabase constraint failure.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TeaInsert = Database["public"]["Tables"]["teas"]["Insert"];

function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: Request) {
  const auth = await authenticateBearer(request);
  if (!auth) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    return NextResponse.json(
      {
        ok: false,
        message: "slug is required and must match /^[a-z0-9][a-z0-9-]*$/",
      },
      { status: 400 },
    );
  }

  // Whitelist the fields we accept. Anything else in the body is
  // silently dropped — prevents future-column-name surprises and
  // limits the blast radius of a typo.
  const ALLOWED = new Set<string>([
    "slug", "path_slug", "vendor_slug", "name", "chinese",
    "type", "subtype", "aged", "region", "country", "year",
    "harvest", "elev", "age", "price", "rarity", "gradient",
    "swatch", "image_url", "subtitle", "summary", "brewing",
    "mouthfeel", "finish", "sessions_count", "peak_steeps",
    "flavor", "reviews", "published",
  ]);
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (ALLOWED.has(k)) row[k] = v;
  }

  const sb = svc();
  const { error } = await sb
    .from("teas")
    .upsert(row as TeaInsert, { onConflict: "slug" });
  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 422 },
    );
  }

  // Best-effort revalidation. Don't fail the response if it errors.
  try {
    revalidatePath(`/tea/${row.vendor_slug ?? "*"}/${row.path_slug ?? slug}`);
    revalidatePath("/discover/teas");
  } catch {
    /* noop */
  }

  return NextResponse.json({ ok: true, slug });
}
