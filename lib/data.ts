// =====================================================================
// MOCK DATA — teas, contributors, vendors, posts
// =====================================================================
// Ported from prototype/data.jsx with explicit types. Phase 6 swaps
// these arrays for typed Airtable fetchers; the call-sites don't need
// to change.

import type {
  Contributor,
  Tea,
  Vendor,
  Post,
  TeaReviews,
} from "./types";
import { profileFromArray as p } from "./flavor";

export const CONTRIBUTORS: Record<"vivek" | "james", Contributor> = {
  vivek: {
    key: "vivek",
    name: "Vivek",
    initials: "V",
    color: "#722F37",
    bio: "Pu'er obsessive. Will brew anything in a 60ml gaiwan.",
    palate: "Likes earthy, mineral, mature.",
  },
  james: {
    key: "james",
    name: "James",
    initials: "J",
    color: "#8B9A7D",
    bio: "Spring oolongs and high-mountain greens. Cups stay warm.",
    palate: "Likes floral, vegetal, bright.",
  },
};

export const TEAS: Tea[] = [
  {
    slug: "gaba-shen",
    pathSlug: "gaba-shen-pu-er-spring-2023",
    name: "Gaba Shen Pu'er", chinese: "茶王 普洱",
    type: "Pu'er", region: "Menghai, Yunnan", country: "China",
    year: "Spring 2023", harvest: "Spring",
    elev: 1800, age: "2 years", price: 0.68,
    rarity: 4, vendor: "white2tea",
    gradient: "linear-gradient(135deg,#8B7355 0%,#5C4033 100%)",
    swatch: "#5C4033",
    summary:
      "A rich, honeyed shen with stone fruit on the early steeps and a deep mineral sweetness that lingers. Holds twelve steeps in a 100ml gaiwan before it gives in.",
    brewing: { style: "Gongfu", ratio: "5g/100ml", temp: "95°C", first: "10s" },
    mouthfeel: { astringent: 3, bodyFull: 7 },
    finish: ["Lingering huigan", "Cooling throat", "Sweet aftertaste"],
    sessions: 12, peakSteeps: [3, 4, 5],
    flavor: {
      vivek:   p([1, 4, 6, 8, 3, 2, 5, 7, 8, 1, 1, 2]),
      james:   p([2, 5, 7, 7, 4, 1, 4, 6, 7, 1, 1, 2]),
      members: p([2, 4, 6, 7, 3, 2, 5, 6, 7, 1, 1, 2]),
    },
    reviews: {
      vivek: { rating: 9.2,
        body: "This one keeps revealing itself. Steeps three through five are the heart — that honey-into-stone-fruit moment is exactly what I want from a 2-year shen. The huigan reaches well past the cup.",
        date: "Mar 8, 2026", session: "5g · 100ml gaiwan · 95°C · filtered (60 TDS)" },
      james: { rating: 8.7,
        body: "Sweeter than I usually go for, but the texture earns it. Oily on the tongue, a clean cooling finish. I'd push the temp to 96 next round and shave a few seconds early on.",
        date: "Mar 11, 2026", session: "5g · 110ml gaiwan · 95°C · spring water" },
      members: { rating: 8.8, count: 47,
        body: "Members consistently flag the stone-fruit middle and the long, throaty finish. A few asked for a cooler first flash; otherwise broad agreement on the shape.",
        date: "Aggregated · 47 ratings" },
    },
  },
  {
    slug: "tieguanyin",
    pathSlug: "tieguanyin-spring-2024",
    name: "Tieguanyin", chinese: "铁观音",
    type: "Oolong", region: "Anxi, Fujian", country: "China",
    year: "Spring 2024", harvest: "Spring",
    elev: 600, age: "fresh", price: 0.42,
    rarity: 3, vendor: "Tea Drunk",
    gradient: "linear-gradient(135deg,#D4B06A 0%,#A68B3D 100%)",
    swatch: "#C4A35A",
    summary:
      "Orchid right out of the gate, then toasted rice and butter through the middle. The classic green-style Anxi shape — bright, floral, gently creamy.",
    brewing: { style: "Gongfu", ratio: "6g/100ml", temp: "92°C", first: "15s" },
    mouthfeel: { astringent: 2, bodyFull: 4 },
    finish: ["Floral aftertaste", "Soft sweetness"],
    sessions: 8, peakSteeps: [2, 3],
    flavor: {
      vivek:   p([8, 4, 6, 4, 6, 1, 1, 1, 2, 1, 5, 1]),
      james:   p([9, 5, 6, 4, 5, 0, 1, 1, 2, 1, 6, 1]),
      members: p([8, 4, 5, 4, 6, 1, 1, 1, 2, 1, 5, 1]),
    },
    reviews: {
      vivek: { rating: 8.5,
        body: "A textbook green-style Anxi. The orchid is unmistakable, the toasted-rice middle is what keeps me coming back. Doesn't have the depth of an aged version but it's not pretending to.",
        date: "Apr 2, 2026", session: "6g · 100ml gaiwan · 92°C" },
      james: { rating: 9.0,
        body: "This is the one I'd hand to someone trying oolong for the first time. Clean, generous, no edges. The butter note in steep two is a small miracle.",
        date: "Apr 4, 2026", session: "6g · 110ml gaiwan · 92°C" },
      members: { rating: 8.6, count: 62,
        body: "Members love the approachability. A few experienced drinkers note it's lighter than they prefer; nobody actually disliked it.",
        date: "Aggregated · 62 ratings" },
    },
  },
  {
    slug: "longjing",
    pathSlug: "longjing-pre-qingming-2024",
    name: "Longjing", chinese: "龙井",
    type: "Green", region: "Hangzhou, Zhejiang", country: "China",
    year: "Spring 2024", harvest: "Pre-Qingming",
    elev: 400, age: "fresh", price: 0.38,
    rarity: 3, vendor: "Tea Drunk",
    gradient: "linear-gradient(135deg,#A8B49C 0%,#6B7A5D 100%)",
    swatch: "#7A9A6D",
    summary:
      "Chestnut, snap-pea sweetness, and a faintly grassy backbone. Brewed grandpa-style or in a glass, never gongfu.",
    brewing: { style: "Glass / Grandpa", ratio: "3g/200ml", temp: "80°C", first: "60s" },
    mouthfeel: { astringent: 4, bodyFull: 3 },
    finish: ["Sweet vegetal", "Clean"],
    sessions: 6, peakSteeps: [1, 2],
    flavor: {
      vivek:   p([3, 2, 5, 2, 7, 0, 1, 1, 2, 1, 8, 0]),
      james:   p([4, 3, 6, 2, 8, 0, 1, 1, 2, 1, 9, 0]),
      members: p([3, 2, 5, 2, 7, 0, 1, 1, 2, 1, 8, 0]),
    },
    reviews: {
      vivek: { rating: 8.0,
        body: "Reliable and quiet. The chestnut is real, the grassiness never tips into bitterness if you keep the water under 82.",
        date: "Apr 9, 2026", session: "3g · 200ml glass · 80°C" },
      james: { rating: 8.8,
        body: "Pre-Qingming makes a difference. The pea sweetness in the first two minutes — that's the whole reason to drink this fresh.",
        date: "Apr 7, 2026", session: "3g · 200ml glass · 78°C" },
      members: { rating: 8.4, count: 38,
        body: "Strong agreement on the freshness; some asked for slightly cooler water guidance.",
        date: "Aggregated · 38 ratings" },
    },
  },
  {
    slug: "silver-needle",
    pathSlug: "silver-needle-fuding-2024",
    name: "Silver Needle", chinese: "白毫银针",
    type: "White", region: "Fuding, Fujian", country: "China",
    year: "Spring 2024", harvest: "First Pluck",
    elev: 800, age: "fresh", price: 0.55,
    rarity: 4, vendor: "Yunnan Sourcing",
    gradient: "linear-gradient(135deg,#E8E5E2 0%,#B5B0AA 100%)",
    swatch: "#D4C4A0",
    summary:
      "Honey, hay, and a whisper of apricot. The most patient tea on this list — give it long, gentle steeps.",
    brewing: { style: "Western", ratio: "4g/300ml", temp: "85°C", first: "3m" },
    mouthfeel: { astringent: 1, bodyFull: 3 },
    finish: ["Soft sweetness", "Faint floral"],
    sessions: 5, peakSteeps: [2, 3],
    flavor: {
      vivek:   p([4, 4, 6, 7, 2, 0, 1, 1, 2, 1, 4, 0]),
      james:   p([5, 5, 7, 7, 2, 0, 1, 1, 2, 1, 4, 0]),
      members: p([4, 4, 6, 6, 2, 0, 1, 1, 2, 1, 4, 0]),
    },
    reviews: {
      vivek: { rating: 8.1,
        body: "Patience tea. If you brew it like an oolong you'll get nothing. Three minutes western, and the honey shows up.",
        date: "Apr 1, 2026", session: "4g · 300ml · 85°C" },
      james: null,
      members: { rating: 8.2, count: 29,
        body: "Approachable. A few flagged it as too subtle for the price; others called that the point.",
        date: "Aggregated · 29 ratings" },
    } satisfies TeaReviews,
  },
  {
    slug: "dianhong",
    pathSlug: "dianhong-gold-autumn-2023",
    name: "Dianhong Gold", chinese: "滇红金芽",
    type: "Black", region: "Fengqing, Yunnan", country: "China",
    year: "Autumn 2023", harvest: "Autumn",
    elev: 1500, age: "6 months", price: 0.32,
    rarity: 2, vendor: "white2tea",
    gradient: "linear-gradient(135deg,#A65D57 0%,#5C4033 100%)",
    swatch: "#A65D57",
    summary:
      "Cocoa, malt, and a sweet-potato roundness. The everyday black, but a generous one.",
    brewing: { style: "Gongfu", ratio: "5g/100ml", temp: "95°C", first: "8s" },
    mouthfeel: { astringent: 3, bodyFull: 6 },
    finish: ["Cocoa", "Round sweetness"],
    sessions: 10, peakSteeps: [2, 3, 4],
    flavor: {
      vivek:   p([1, 3, 7, 6, 6, 7, 4, 3, 2, 0, 1, 1]),
      james:   p([2, 4, 7, 6, 6, 6, 3, 2, 2, 0, 1, 1]),
      members: p([1, 3, 7, 6, 6, 6, 3, 3, 2, 0, 1, 1]),
    },
    reviews: {
      vivek: null,
      james: { rating: 8.0,
        body: "Steady. Not a tea that surprises me anymore, but I'm always glad I made it.",
        date: "Feb 22, 2026", session: "5g · 100ml gaiwan · 95°C" },
      members: { rating: 8.4, count: 71,
        body: "Most-rated tea on the site. Universally well-liked.",
        date: "Aggregated · 71 ratings" },
    } satisfies TeaReviews,
  },
  {
    slug: "gyokuro",
    pathSlug: "gyokuro-asahi-uji-2024",
    name: "Gyokuro Asahi", chinese: "玉露 朝日",
    type: "Green", region: "Uji, Kyoto", country: "Japan",
    year: "First Flush 2024", harvest: "Shaded · 21 days",
    elev: 200, age: "fresh", price: 1.20,
    rarity: 5, vendor: "Yunnan Sourcing",
    gradient: "linear-gradient(135deg,#7A9A6D 0%,#2D3A2E 100%)",
    swatch: "#2D3A2E",
    summary:
      "Pure umami. Seaweed, sweet broth, and a cooling sweetness that has nothing to do with sugar.",
    brewing: { style: "Kyusu", ratio: "5g/60ml", temp: "55°C", first: "90s" },
    mouthfeel: { astringent: 1, bodyFull: 5 },
    finish: ["Lingering umami", "Sweet"],
    sessions: 4, peakSteeps: [1, 2],
    flavor: {
      vivek:   p([2, 2, 6, 1, 2, 0, 0, 1, 2, 9, 7, 0]),
      james:   p([3, 2, 7, 1, 2, 0, 0, 1, 2, 9, 8, 0]),
      members: p([2, 2, 6, 1, 2, 0, 0, 1, 2, 8, 7, 0]),
    },
    reviews: {
      vivek: { rating: 9.0,
        body: "An exception to my usual taste. Brew it cold enough — really cold, 55 max — and it stops tasting like tea and starts tasting like a broth.",
        date: "Mar 25, 2026", session: "5g · 60ml kyusu · 55°C" },
      james: { rating: 9.4,
        body: "This is the tea I'd save for someone special. Costly per gram but you only need a tiny session.",
        date: "Mar 27, 2026", session: "5g · 60ml kyusu · 55°C" },
      members: { rating: 9.0, count: 22,
        body: "Polarizing on first impression — the umami is unfamiliar to many — but ratings climb on second session.",
        date: "Aggregated · 22 ratings" },
    },
  },
];

export const VENDORS: Vendor[] = [
  {
    slug: "tea-drunk", name: "Tea Drunk",
    city: "New York, NY", country: "USA", continent: "North America",
    tagline: "Ancient-tree pu'er and direct-from-the-mountain sourcing.",
    body: "Shunan Teng's small Manhattan shop quietly redefined what direct-from-the-mountain looks like in the West. We've been buying here since 2022 and have yet to be disappointed.",
    rating: 5, swatch: "#722F37", teaCount: 24, founded: 2013,
    specialties: ["Pu'er", "Aged oolong", "Single-origin"],
  },
  {
    slug: "white2tea", name: "white2tea",
    city: "Beijing", country: "China", continent: "Asia",
    tagline: "Pu'er and oolongs from a small team with strong opinions.",
    body: "Paul Murray's small operation in Beijing. Excellent shen pu'er, idiosyncratic blending, and clear sourcing notes on every product. Worth the international shipping.",
    rating: 5, swatch: "#A68B3D", teaCount: 31, founded: 2014,
    specialties: ["Pu'er", "Oolong", "Blends"],
  },
  {
    slug: "yunnan-sourcing", name: "Yunnan Sourcing",
    city: "Kunming", country: "China", continent: "Asia",
    tagline: "The comprehensive catalog. The place to learn the landscape.",
    body: "Scott Wilson's enormous catalog is the practical reference for Western buyers. Not every tea is special, but the meta-knowledge — the consistent labeling, the seasonal repeats — is unmatched.",
    rating: 4, swatch: "#8B9A7D", teaCount: 412, founded: 2004,
    specialties: ["Pu'er", "Yunnan black", "Encyclopaedic"],
  },
];

export const POSTS: Post[] = [
  {
    slug: "second-steep", cat: "Brewing", title: "On the second steep",
    excerpt: "Why the first cup is rarely the best one — and how to read what the leaves are telling you.",
    author: "Vivek", date: "Mar 14, 2026", readTime: 6,
    grad: "linear-gradient(135deg,#D4B06A 0%,#722F37 100%)",
    related: ["gaba-shen", "tieguanyin"],
  },
  {
    slug: "tea-drunk-morning", cat: "Vendor Spotlight", title: "A morning with Tea Drunk",
    excerpt: "Shunan Teng's small Manhattan shop quietly redefined what direct-from-the-mountain looks like in the West.",
    author: "James", date: "Feb 28, 2026", readTime: 9,
    grad: "linear-gradient(135deg,#8B9A7D 0%,#2D3A2E 100%)",
    related: ["tieguanyin", "longjing"],
  },
  {
    slug: "gongfu-isnt", cat: "Culture", title: "What gongfu isn't",
    excerpt: "It's not a recipe, and it's not a competition. A short defense of brewing slowly because it's nice to.",
    author: "Vivek", date: "Feb 11, 2026", readTime: 4,
    grad: "linear-gradient(135deg,#A8B49C 0%,#6B4E3D 100%)",
    related: ["gyokuro"],
  },
  {
    slug: "yunnan-altitudes", cat: "Origin", title: "Reading altitude in a Yunnan cup",
    excerpt: "Below 1200m, above 1800m: what changes, what doesn't, and why we keep asking.",
    author: "James", date: "Jan 30, 2026", readTime: 7,
    grad: "linear-gradient(135deg,#5C4033 0%,#8B7355 100%)",
    related: ["gaba-shen", "dianhong"],
  },
];

// =====================================================================
// HELPERS
// =====================================================================

/**
 * Average of available critic ratings (Vivek + James), null-safe.
 * Falls back to the members rating if neither critic has reviewed.
 */
export function teaAvg(tea: Tea): number {
  const r = tea.reviews;
  const vals: number[] = [];
  if (r.vivek && typeof r.vivek.rating === "number") vals.push(r.vivek.rating);
  if (r.james && typeof r.james.rating === "number") vals.push(r.james.rating);
  if (vals.length === 0 && r.members && typeof r.members.rating === "number") {
    vals.push(r.members.rating);
  }
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

export function teaBySlug(slug: string): Tea | undefined {
  return TEAS.find((t) => t.slug === slug);
}

/**
 * Vendor URL slug for a tea — derived from the tea's vendor name via
 * VENDORS lookup. Centralised here so the routing convention has one
 * source of truth.
 */
export function vendorSlugForTea(tea: Tea): string {
  const v = vendorByName(tea.vendor);
  if (!v) {
    throw new Error(
      `vendorSlugForTea: tea "${tea.slug}" references unknown vendor "${tea.vendor}"`,
    );
  }
  return v.slug;
}

/** Canonical URL for a tea page: /tea/[vendor]/[pathSlug]. */
export function teaUrl(tea: Tea): string {
  return `/tea/${vendorSlugForTea(tea)}/${tea.pathSlug}`;
}

/**
 * Look up a tea by its (vendor-slug, path-slug) pair — used by the
 * /tea/[vendor]/[slug] route handler. Both segments must match.
 */
export function teaByVendorAndSlug(
  vendorSlug: string,
  pathSlug: string,
): Tea | undefined {
  return TEAS.find(
    (t) => t.pathSlug === pathSlug && vendorSlugForTea(t) === vendorSlug,
  );
}

/**
 * Helpers that surface "first item" with a non-undefined return.
 * They throw if the underlying array is empty — caller decides whether
 * that's a build-time error (mock data is malformed) or a runtime
 * concern (Airtable returned nothing). With Airtable in Phase 6 these
 * will become async fetchers that fall back to a placeholder.
 */
export function featuredTea(): Tea {
  const t = TEAS[0];
  if (!t) throw new Error("featuredTea: TEAS is empty");
  return t;
}

export function latestPost(): Post {
  const p = POSTS[0];
  if (!p) throw new Error("latestPost: POSTS is empty");
  return p;
}

export function vendorBySlug(slug: string): Vendor | undefined {
  return VENDORS.find((v) => v.slug === slug);
}

export function vendorByName(name: string): Vendor | undefined {
  return VENDORS.find((v) => v.name === name);
}

export function postBySlug(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

/** Group vendors continent → country for the atlas page */
export function groupVendorsByGeography(): Record<string, Record<string, Vendor[]>> {
  const out: Record<string, Record<string, Vendor[]>> = {};
  for (const v of VENDORS) {
    const cont = v.continent || "Other";
    const country = v.country || "Other";
    if (!out[cont]) out[cont] = {};
    if (!out[cont][country]) out[cont][country] = [];
    out[cont][country].push(v);
  }
  return out;
}

export const CONTINENT_ORDER = [
  "Asia",
  "North America",
  "Europe",
  "South America",
  "Africa",
  "Oceania",
  "Other",
] as const;
