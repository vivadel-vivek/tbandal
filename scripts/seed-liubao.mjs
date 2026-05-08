// One-shot: seed a Liu Bao tea so the Dark filter on /discover/teas
// isn't empty. Yunnan Sourcing carries heicha, so the vendor is a
// real fit. Idempotent — skips if the slug already exists.

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import WS from "ws";
if (!globalThis.WebSocket) globalThis.WebSocket = WS;

loadEnv({ path: ".env.production" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sb = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SLUG = "liubao-aged-15";

const existing = await sb.from("teas").select("slug").eq("slug", SLUG).maybeSingle();
if (existing.data) {
  console.log(`${SLUG} already seeded; nothing to do.`);
  process.exit(0);
}

const flavor0 = {
  floral: 0, fruity: 1, sweet: 4, honey: 1, nutty: 4, roasted: 3,
  woody: 7, earthy: 8, mineral: 5, marine: 0, vegetal: 0, spicy: 2,
};

const row = {
  slug:       SLUG,
  path_slug:  "aged-liubao-2010",
  vendor_slug:"yunnan-sourcing",
  name:       "Aged Liu Bao",
  chinese:    "六堡茶",
  type:       "Dark",
  subtype:    "Liu Bao",
  aged:       true,
  region:     "Cangwu, Guangxi",
  country:    "China",
  year:       "2010",
  harvest:    "Spring",
  elev:       300,
  age:        "15 years",
  price:      0.42,
  rarity:     3,
  gradient:   "linear-gradient(135deg,#3F2418 0%,#1F1208 100%)",
  swatch:     "#3F2418",
  subtitle:   "Aged Liu Bao, betel-nut & forest floor",
  summary:    "Fifteen years in basket-aged storage have softened this Liu Bao into the classic profile — betel-nut up front, deep wet-wood and forest-floor through the middle, a long mineral finish that doesn't quit. Brews honest in a yixing seasoned for shou.\n\nA quieter cousin to aged sheng — less astringency to mellow out, but the trade-off is that the high notes of a young sheng are gone too. This is dark-tea comfort drinking, not gongfu fireworks.",
  brewing:    { style: "Gongfu", ratio: "5g/100ml", temp: "100°C", first: "20s", rinse: "2x" },
  mouthfeel:  { astringent: 1, bodyFull: 7 },
  finish:     ["betel-nut", "wet wood", "mineral"],
  sessions_count: 0,
  peak_steeps:    [3, 4, 5, 6],
  flavor:     { vivek: flavor0, james: flavor0, members: flavor0 },
  reviews:    {
    vivek: { rating: 0, body: "", date: "", scale: "advanced" },
    james: { rating: 0, body: "", date: "", scale: "advanced" },
    members: { rating: 0, count: 0, body: "", date: "" },
  },
  published:  true,
};

const { data, error } = await sb.from("teas").insert(row).select("slug, type, subtype").maybeSingle();
if (error) {
  console.error("insert failed:", error.message);
  process.exit(1);
}
console.log("inserted:", JSON.stringify(data));
