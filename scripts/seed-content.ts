// Seed the editorial catalog (vendors, contributors, teas, teaware,
// posts) into Supabase from scripts/seed-data.json — a frozen snapshot
// of the original lib/data.ts arrays. After this initial bootstrap,
// edits flow through Supabase Studio or the contributor portal and the
// JSON is no longer authoritative.
//
// Run via `npm run seed:content` (tsx, local) or `seed:content:remote`
// (hosted dnfejeqvolirzepkuncv). Idempotent — every row uses `upsert`
// keyed on the catalog slug / handle.

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import WS from "ws";

import type { Database } from "../lib/supabase/types";

if (!globalThis.WebSocket) {
  // @ts-expect-error — Node 20 lacks a global WebSocket; supabase-js
  // builds a realtime client at construction time and crashes without one.
  globalThis.WebSocket = WS;
}

const target = process.argv.includes("--remote") || process.env.SEED_TARGET === "remote"
  ? "remote" : "local";

loadEnv({ path: target === "remote" ? ".env.production" : ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    `Missing Supabase env for target=${target}. Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.${target === "remote" ? "production" : "local"}.`,
  );
  process.exit(1);
}

const db = createClient<Database>(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const seed = JSON.parse(
  readFileSync(join(process.cwd(), "scripts/seed-data.json"), "utf8"),
) as {
  vendors: Array<{
    slug: string; name: string; city: string; country: string; continent: string;
    tagline: string; body: string; rating: number; swatch: string;
    teaCount: number; founded: number; specialties: string[]; url: string;
  }>;
  contributors: Array<{
    key: string; name: string; initials: string; color: string;
    bio: string; palate: string;
  }>;
  teas: Array<Record<string, unknown> & {
    slug: string; pathSlug: string; vendorSlug: string;
  }>;
  teaware: Array<Record<string, unknown> & { slug: string; goodFor: string[] }>;
  posts: Array<Record<string, unknown> & { slug: string; date: string }>;
};

console.log(`→ seeding content into ${target} (${url})`);

// ---- contributors -------------------------------------------------
const contributorRows = seed.contributors.map((c, idx) => ({
  handle:       c.key,
  display_name: c.name,
  initials:     c.initials,
  color:        c.color,
  bio:          c.bio,
  palate:       c.palate,
  sort_order:   idx,
}));

// ---- vendors ------------------------------------------------------
const vendorRows = seed.vendors.map((v) => ({
  slug:        v.slug,
  name:        v.name,
  city:        v.city,
  country:     v.country,
  continent:   v.continent,
  tagline:     v.tagline,
  body:        v.body,
  rating:      v.rating,
  swatch:      v.swatch,
  tea_count:   v.teaCount,
  founded:     v.founded,
  specialties: v.specialties,
  url:         v.url,
}));

// ---- teas ---------------------------------------------------------
const teaRows = seed.teas.map((t) => ({
  slug:           t.slug,
  path_slug:      t.pathSlug,
  vendor_slug:    t.vendorSlug,
  name:           t.name as string,
  chinese:        (t.chinese as string | undefined) ?? null,
  type:           t.type as string,
  region:         t.region as string,
  country:        t.country as string,
  year:           t.year as string,
  harvest:        t.harvest as string,
  elev:           t.elev as number,
  age:            t.age as string,
  price:          t.price as number,
  rarity:         t.rarity as number,
  gradient:       t.gradient as string,
  swatch:         t.swatch as string,
  summary:        t.summary as string,
  brewing:        t.brewing,
  mouthfeel:      t.mouthfeel,
  finish:         t.finish as string[],
  sessions_count: t.sessions as number,
  peak_steeps:    t.peakSteeps as number[],
  flavor:         t.flavor,
  reviews:        t.reviews,
}));

// ---- teaware ------------------------------------------------------
const teawareRows = seed.teaware.map((w) => ({
  slug:         w.slug,
  name:         w.name as string,
  category:     w.category as string,
  volume_ml:    (w.volumeMl as number | undefined) ?? null,
  material:     w.material as string,
  origin:       (w.origin as string | undefined) ?? null,
  vendor:       w.vendor as string,
  external_url: (w.externalUrl as string | undefined) ?? null,
  price:        w.price as number,
  gradient:     w.gradient as string,
  swatch:       w.swatch as string,
  tagline:      w.tagline as string,
  body:         w.body as string,
  good_for:     w.goodFor,
  rating:       w.rating as number,
}));

// ---- posts --------------------------------------------------------
function parseDisplayDate(s: string): string | null {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
const postRows = seed.posts.map((p) => ({
  slug:         p.slug,
  cat:          p.cat as string,
  title:        p.title as string,
  excerpt:      p.excerpt as string,
  author:       p.author as string,
  date:         p.date,
  read_time:    p.readTime as number,
  grad:         p.grad as string,
  related:      p.related as string[],
  body:         (p.body as string | undefined) ?? null,
  published_at: parseDisplayDate(p.date),
}));

// ---- run ----------------------------------------------------------
type CatalogTable = "contributors" | "vendors" | "teas" | "teaware" | "posts";

async function upsert<T>(label: string, table: CatalogTable, rows: T[], onConflict: string) {
  const { error, count } = await db
    .from(table)
    .upsert(rows as never, { onConflict, count: "exact" });
  if (error) {
    console.error(`✗ ${label}: ${error.message}`);
    throw error;
  }
  console.log(`✓ ${label}: ${count ?? rows.length} rows`);
}

async function main() {
  await upsert("contributors", "contributors", contributorRows, "handle");
  await upsert("vendors",      "vendors",      vendorRows,     "slug");
  await upsert("teas",         "teas",         teaRows,        "slug");
  await upsert("teaware",      "teaware",      teawareRows,    "slug");
  await upsert("posts",        "posts",        postRows,       "slug");
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
