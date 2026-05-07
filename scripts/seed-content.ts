// Seed the editorial catalog (vendors, contributors, teas, teaware,
// posts) into Supabase from lib/data.ts.
//
// Run via `npm run seed:content` (tsx). Idempotent — every row uses
// `upsert` keyed on the catalog slug / handle, so re-running picks up
// edits without dupes. Uses the service-role client to bypass RLS;
// authenticated contributors will write through the staff RLS path
// from the contributor portal in Phase D.
//
// Defaults to the local Supabase. Pass `--remote` (or set
// SEED_TARGET=remote) to point at the linked hosted project — the
// script then expects NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
// in `.env.production` (or whatever you've sourced before invoking).

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import WS from "ws";

import {
  TEAS,
  VENDORS,
  POSTS,
  TEAWARE,
  CONTRIBUTORS,
  vendorSlugForTea,
} from "../lib/data";
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

console.log(`→ seeding content into ${target} (${url})`);

// ---- contributors -------------------------------------------------
const contributorRows = Object.values(CONTRIBUTORS).map((c, idx) => ({
  handle:       c.key,
  display_name: c.name,
  initials:     c.initials,
  color:        c.color,
  bio:          c.bio,
  palate:       c.palate,
  // James first per CONTRIBUTORS dict ordering — preserve it.
  sort_order:   idx,
}));

// ---- vendors ------------------------------------------------------
const vendorRows = VENDORS.map((v) => ({
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

// ---- teas (vendor name → vendor slug for FK) ---------------------
const teaRows = TEAS.map((t) => ({
  slug:           t.slug,
  path_slug:      t.pathSlug,
  vendor_slug:    vendorSlugForTea(t),
  name:           t.name,
  chinese:        t.chinese ?? null,
  type:           t.type,
  region:         t.region,
  country:        t.country,
  year:           t.year,
  harvest:        t.harvest,
  elev:           t.elev,
  age:            t.age,
  price:          t.price,
  rarity:         t.rarity,
  gradient:       t.gradient,
  swatch:         t.swatch,
  summary:        t.summary,
  brewing:        t.brewing,
  mouthfeel:      t.mouthfeel,
  finish:         t.finish,
  sessions_count: t.sessions,
  peak_steeps:    t.peakSteeps,
  flavor:         t.flavor,
  reviews:        t.reviews,
}));

// ---- teaware ------------------------------------------------------
const teawareRows = TEAWARE.map((w) => ({
  slug:         w.slug,
  name:         w.name,
  category:     w.category,
  volume_ml:    w.volumeMl ?? null,
  material:     w.material,
  origin:       w.origin ?? null,
  vendor:       w.vendor,
  external_url: w.externalUrl ?? null,
  price:        w.price,
  gradient:     w.gradient,
  swatch:       w.swatch,
  tagline:      w.tagline,
  body:         w.body,
  good_for:     w.goodFor,
  rating:       w.rating,
}));

// ---- posts --------------------------------------------------------
// Convert the freeform "Mar 14, 2026" date into a published_at
// timestamp for sorting; preserve the original string for display.
function parseDisplayDate(s: string): string | null {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
const postRows = POSTS.map((p) => ({
  slug:         p.slug,
  cat:          p.cat,
  title:        p.title,
  excerpt:      p.excerpt,
  author:       p.author,
  date:         p.date,
  read_time:    p.readTime,
  grad:         p.grad,
  related:      p.related,
  body:         p.body ?? null,
  published_at: parseDisplayDate(p.date),
}));

// ---- run ----------------------------------------------------------
type CatalogTable = "contributors" | "vendors" | "teas" | "teaware" | "posts";

async function upsert<T>(label: string, table: CatalogTable, rows: T[], onConflict: string) {
  const { error, count } = await db
    .from(table)
    // supabase-js can't narrow Insert when both `table` and the row
    // type are generics; the call is type-checked at the call sites
    // because each `*Rows` const carries its own structural type.
    .upsert(rows as never, { onConflict, count: "exact" });
  if (error) {
    console.error(`✗ ${label}: ${error.message}`);
    throw error;
  }
  console.log(`✓ ${label}: ${count ?? rows.length} rows`);
}

async function main() {
  await upsert("contributors", "contributors", contributorRows, "handle");
  // Vendors before teas — teas FK on vendor_slug.
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
