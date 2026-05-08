// One-shot: hand-picked Unsplash placeholders for the catalog so the
// site stops looking like a gradient demo. Idempotent — re-runs only
// upload + relink rows whose image_url is null (or pass --force to
// overwrite everything).
//
// Pipeline per row:
//   1. fetch the Unsplash URL → buffer
//   2. upload to the editorial bucket at editorial/{kind}/{slug}/...
//   3. update the catalog row's image_url to the public URL
//
// All photo IDs were validated against images.unsplash.com before
// commit. If any 404s after a re-run, swap the ID in MAPPINGS below.
//
// Run:  node scripts/seed-images.mjs           # only fills nulls
//       node scripts/seed-images.mjs --force   # overwrites all

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import WS from "ws";
if (!globalThis.WebSocket) globalThis.WebSocket = WS;

loadEnv({ path: ".env.production" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing Supabase env in .env.production");
  process.exit(1);
}

const force = process.argv.includes("--force");

const sb = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Hand-picked Unsplash photo IDs, verified working at seed time.
// Order roughly: warm/editorial photos for vendors, leaf/liquor closeups
// for teas, vessel-on-counter for teaware, atmospheric for posts.
const MAPPINGS = [
  // ---- vendors (table=vendors, image_url) ------------------------
  { table: "vendors", slug: "tea-drunk",       unsplash: "1532136868905-8094ef8ef5f2" },
  { table: "vendors", slug: "white2tea",       unsplash: "1577016029703-cc22a7c0c28c" },
  { table: "vendors", slug: "yunnan-sourcing", unsplash: "1455157823797-3019317cbcf0" },
  { table: "vendors", slug: "ippodo",          unsplash: "1601831753677-01f960be19eb" },

  // ---- teas ------------------------------------------------------
  { table: "teas", slug: "gaba-shen",  unsplash: "1567922045116-2a00fae2ed03" },
  { table: "teas", slug: "dianhong",   unsplash: "1558160074-4d7d8bdf4256" },
  { table: "teas", slug: "tieguanyin", unsplash: "1531970227416-f0cddeb1f748" },
  { table: "teas", slug: "gyokuro",    unsplash: "1704079698754-5e621edb610b" },

  // ---- teaware ---------------------------------------------------
  { table: "teaware", slug: "jingdezhen-100ml-gaiwan",     unsplash: "1531969179221-3946e6b5a5e7" },
  { table: "teaware", slug: "tokoname-kyusu-180ml",        unsplash: "1683558654439-8b9986cbf1dd" },
  { table: "teaware", slug: "yixing-zisha-120ml",          unsplash: "1639428133787-b580d8c27f96" },
  { table: "teaware", slug: "glass-fairness-pitcher-200ml",unsplash: "1600536347460-b07c77b9472c" },
  { table: "teaware", slug: "fellow-stagg-ekg",            unsplash: "1486240036762-6db0544d5f46" },
  { table: "teaware", slug: "acaia-pearl-scale",           unsplash: "1601043966939-687b89dc6f9c" },

  // ---- posts -----------------------------------------------------
  { table: "posts", slug: "second-steep",      unsplash: "1507513319174-e556268bb244" },
  { table: "posts", slug: "tea-drunk-morning", unsplash: "1512923680040-ae76121db32b" },
  { table: "posts", slug: "gongfu-isnt",       unsplash: "1522160196-1a0efa63778d" },
  { table: "posts", slug: "yunnan-altitudes",  unsplash: "1491497895121-1334fc14d8c9" },
];

// kind matches the editorial folder structure used by uploadEditorialImage.
const KIND_BY_TABLE = {
  vendors: "vendor",
  teas: "tea",
  teaware: "teaware",
  posts: "post",
};

// What column holds the image URL on each table.
const COLUMN_BY_TABLE = {
  vendors: "image_url",
  teas: "image_url",
  teaware: "image_url",
  posts: "image_url",
};

async function fetchUnsplash(unsplashId) {
  const u = `https://images.unsplash.com/photo-${unsplashId}?w=1600&q=85&fm=jpg&auto=format`;
  const res = await fetch(u);
  if (!res.ok) throw new Error(`fetch failed: ${u} → ${res.status}`);
  const buf = await res.arrayBuffer();
  return Buffer.from(buf);
}

async function alreadyHasImage(table, slug, column) {
  const { data, error } = await sb.from(table).select(column).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return Boolean(data?.[column]);
}

async function uploadAndLink({ table, slug, unsplash }) {
  const kind = KIND_BY_TABLE[table];
  const col = COLUMN_BY_TABLE[table];
  if (!kind || !col) throw new Error(`unknown table: ${table}`);

  if (!force) {
    const has = await alreadyHasImage(table, slug, col);
    if (has) {
      console.log(`  ${table}/${slug}: already has image, skip (use --force to overwrite)`);
      return;
    }
  }

  process.stdout.write(`  ${table}/${slug}: fetching… `);
  const buf = await fetchUnsplash(unsplash);
  process.stdout.write(`${(buf.byteLength / 1024).toFixed(0)}KB; `);

  const path = `${kind}/${slug}/seed-${Date.now()}.jpg`;
  const { error: upErr } = await sb.storage
    .from("editorial")
    .upload(path, buf, {
      contentType: "image/jpeg",
      cacheControl: "31536000",
      upsert: false,
    });
  if (upErr) throw new Error(`upload: ${upErr.message}`);
  process.stdout.write("uploaded; ");

  const { data: pub } = sb.storage.from("editorial").getPublicUrl(path);
  const { error: dbErr } = await sb.from(table).update({ [col]: pub.publicUrl }).eq("slug", slug);
  if (dbErr) throw new Error(`update row: ${dbErr.message}`);

  console.log("✓");
}

console.log(`→ seeding ${MAPPINGS.length} images into ${url}`);
console.log(`  mode: ${force ? "FORCE (overwrite all)" : "fill nulls only"}\n`);

let ok = 0;
let failed = 0;
for (const m of MAPPINGS) {
  try {
    await uploadAndLink(m);
    ok++;
  } catch (e) {
    console.error(`  ${m.table}/${m.slug}: ✗ ${e.message}`);
    failed++;
  }
}

console.log(`\nDone. ${ok} succeeded, ${failed} failed.`);
if (failed) process.exit(1);
