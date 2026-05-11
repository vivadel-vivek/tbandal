import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateBearer } from "@/lib/api/auth";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";

// POST /api/v1/posts — upsert a journal post by slug. Same shape as
// /api/v1/teas: bearer-token auth, service-role write, whitelist of
// editable fields, slug-keyed upsert, best-effort path revalidation.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];

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

  const ALLOWED = new Set<string>([
    "slug", "cat", "title", "excerpt", "author", "date",
    "read_time", "grad", "image_url", "related", "body",
    "published", "published_at",
  ]);
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (ALLOWED.has(k)) row[k] = v;
  }

  const sb = svc();
  const { error } = await sb
    .from("posts")
    .upsert(row as PostInsert, { onConflict: "slug" });
  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 422 },
    );
  }

  try {
    revalidatePath(`/journal/${slug}`);
    revalidatePath("/journal");
  } catch {
    /* noop */
  }

  return NextResponse.json({ ok: true, slug });
}
