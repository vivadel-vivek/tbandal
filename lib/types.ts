// =====================================================================
// TYPES — domain models for Two Buds and a Leaf
// =====================================================================
// These mirror the prototype's data shapes (data.jsx) with explicit
// types. Once Airtable lands in Phase 6 these stay; only the data
// fetchers change.

export type ContributorKey = "vivek" | "james";

export type Contributor = {
  key: ContributorKey;
  name: string;
  initials: string;
  /** Avatar / accent color */
  color: string;
  bio: string;
  /** Short palate descriptor — "Likes earthy, mineral, mature." */
  palate: string;
};

export type FlavorAxisKey =
  | "floral" | "fruity" | "sweet" | "honey"
  | "nutty" | "roasted" | "woody" | "earthy"
  | "mineral" | "marine" | "vegetal" | "spicy";

export type BasicAxisKey =
  | "floral" | "sweet" | "roasted"
  | "earthy" | "mineral" | "herbal";

export type FlavorAxis = {
  key: FlavorAxisKey;
  label: string;
  /** CSS color value used in the radar + flavor badges */
  color: string;
};

export type BasicAxis = {
  key: BasicAxisKey;
  label: string;
  color: string;
  /** Lay-language description shown beneath the axis in Basic mode */
  lay: string;
  /** Constituent advanced axes that roll up into this basic axis */
  members: FlavorAxisKey[];
};

/** A flavor profile is always stored as 12 axes × 0–10 internally */
export type FlavorProfile = Record<FlavorAxisKey, number>;
/** Basic profiles use the same 0–10 scale; the 5-pt UI ×2's on save */
export type BasicProfile = Record<BasicAxisKey, number>;

export type Mouthfeel = {
  /** 0 = oily, 10 = astringent */
  astringent: number;
  /** 0 = light, 10 = full-bodied */
  bodyFull: number;
};

export type BrewingParams = {
  style: string;     // "Gongfu" | "Western" | "Glass / Grandpa" | "Kyusu" | …
  ratio: string;     // "5g/100ml"
  temp: string;      // "95°C"
  first: string;     // "10s"
  /** Optional rinse instruction — "1x flash", "2x flash", "skip".
   *  Surface for shou pu'er, dark teas, and aged sheng where the
   *  rinse is part of the recipe, not optional. */
  rinse?: string;
};

export type ReviewBody = {
  /** 0–10 internal */
  rating: number;
  body: string;
  date: string;
  /** Brewing notes for this specific session */
  session?: string;
  /** Display scale used when this review was written (default "advanced") */
  scale?: "basic" | "advanced";
};

export type MembersReview = ReviewBody & {
  /** Number of member ratings rolled into this consensus */
  count: number;
};

export type TeaReviews = {
  vivek: ReviewBody | null;
  james: ReviewBody | null;
  members: MembersReview;
};

export type TeaFlavorBundle = {
  vivek: FlavorProfile;
  james: FlavorProfile;
  members: FlavorProfile;
};

// Core tea types. Sheng vs shou pu'er are split because they're
// effectively different teas (raw is fruity/astringent, ripe is
// earthy/fermented). Dark covers heicha (anhua, fu, liubao, tianjian,
// liu'an) which Westerners sometimes mislabel as "black".
export type TeaTypeName =
  | "Green"
  | "White"
  | "Yellow"
  | "Oolong"
  | "Black"
  | "Sheng Pu'er"
  | "Shou Pu'er"
  | "Dark"
  | "Herbal";

export type Tea = {
  /** Legacy short slug — kept so old /tea/[slug] links still resolve via 301 */
  slug: string;
  /**
   * Second URL segment in the canonical /tea/[vendor]/[pathSlug] route.
   * Encodes name + harvest/grade + year to keep URLs unique within a
   * vendor and SEO-readable.
   * Example: "gaba-shen-pu-er-spring-2023".
   */
  pathSlug: string;
  name: string;
  /** Original-script name, e.g. 茶王 普洱 */
  chinese?: string;
  type: TeaTypeName;
  /** Within-type variation — "Yancha", "Longjing", "Anhua", "Bingdao".
   *  Free text, vendor-faithful (use whatever name the vendor uses).
   *  Glossary holds the cross-references (Longjing ↔ Dragonwell etc). */
  subtype?: string | null;
  /** True for teas significantly aged from production date — what
   *  counts as "aged" depends on type (5+ yrs for white, 10+ for
   *  sheng, 15+ for liubao). Editor sets it manually. The
   *  recommendation engine treats aged ↔ young as a soft boundary
   *  within the same core type. */
  aged?: boolean;
  region: string;
  country: string;
  year: string;
  /** "Spring" | "Pre-Qingming" | "First Pluck" | … */
  harvest: string;
  /** Elevation in meters */
  elev: number;
  /** "fresh" | "2 years" | "6 months" */
  age: string;
  /** Price per gram, USD */
  price: number;
  /** 1–5 rarity score */
  rarity: number;
  /** Vendor display name (matches Vendor.name) */
  vendor: string;
  /** Vendor URL slug — denormalized so URL/route helpers stay pure. */
  vendorSlug: string;
  /** Card hero gradient (CSS) — placeholder until real photography */
  gradient: string;
  /** Single accent color for the tea */
  swatch: string;
  /** Optional newcomer-friendly one-liner shown under the tea name on
   *  card grids. When null, lib/tea-helpers.ts: teaSubtitle derives
   *  a sensible default from type + age + the top flavor axes. */
  subtitle?: string | null;
  /** 1–2 paragraph editorial summary */
  summary: string;
  brewing: BrewingParams;
  mouthfeel: Mouthfeel;
  /** Short list of finish descriptors */
  finish: string[];
  /** Number of sessions Vivek + James have logged with this tea */
  sessions: number;
  /** Steeps that hit peak (e.g. [3, 4, 5]) */
  peakSteeps: number[];
  flavor: TeaFlavorBundle;
  reviews: TeaReviews;
  /** Hero photo URL (Supabase Storage). Falls back to gradient. */
  imageUrl?: string | null;
};

export type Vendor = {
  slug: string;
  name: string;
  city: string;
  country: string;
  /** Continent grouping for the atlas page */
  continent: string;
  tagline: string;
  body: string;
  /** Our 1–5 rating of the vendor */
  rating: number;
  swatch: string;
  /** Total teas in the vendor's catalogue (not just ones we've reviewed) */
  teaCount: number;
  founded: number;
  /** Strong-suit areas (chips on the directory card) */
  specialties: string[];
  /** Vendor's outbound website URL — clicked through /go/[slug] for tracking. */
  url: string;
  /** Hero photo URL (Supabase Storage public URL). When null, the
   *  swatch + name initial render as a fallback. */
  imageUrl?: string | null;
};

export type TeawareCategory =
  | "Gaiwan" | "Teapot" | "Kyusu" | "Pitcher" | "Cup"
  | "Kettle" | "Scale" | "Strainer" | "Other";

export type Teaware = {
  slug: string;
  name: string;
  category: TeawareCategory;
  /** Vessel capacity in ml — gaiwans, teapots, pitchers, cups, kettles. */
  volumeMl?: number;
  /** Primary material — "Porcelain", "Yixing zisha", "Glass", "Stoneware". */
  material: string;
  /** Origin region — "Jingdezhen, China" / "Tokoname, Japan". */
  origin?: string;
  /** Vendor.name we sell through, or the brand for external items. */
  vendor: string;
  /** External brand URL — used when the item isn't carried by a known
   *  Vendor (e.g. kettles & scales). Both vendor *and* externalUrl can
   *  coexist; the redirect prefers internal Vendor when present. */
  externalUrl?: string;
  /** Retail price in USD. */
  price: number;
  /** Card hero gradient placeholder. */
  gradient: string;
  /** Single accent color. */
  swatch: string;
  /** Short one-liner shown on cards. */
  tagline: string;
  /** Editorial body — 2-3 paragraphs. */
  body: string;
  /** Tea types this vessel performs well with. */
  goodFor: TeaTypeName[];
  /** Our 1-5 rating. */
  rating: number;
  /** Hero photo URL (Supabase Storage). Falls back to gradient. */
  imageUrl?: string | null;
};

export type PostCategory =
  | "Brewing" | "Culture" | "Origin" | "Vendor Spotlight";

export type Post = {
  slug: string;
  cat: PostCategory;
  title: string;
  excerpt: string;
  author: "Vivek" | "James";
  date: string;
  readTime: number;       // minutes
  /** Hero gradient placeholder until real imagery */
  grad: string;
  /** Slugs of related teas */
  related: string[];
  /** Long-form Markdown body. Optional during the type's transition. */
  body?: string;
  /** Hero photo URL (Supabase Storage). Falls back to grad. */
  imageUrl?: string | null;
};

// =====================================================================
// MEMBER / SETTINGS
// =====================================================================

export type FlavorMode = "blind" | "basic" | "advanced";

export type MemberNotifications = {
  weeklyDigest: boolean;
  newTeas: boolean;
  sampleRequests: boolean;
  replies: boolean;
};

export type MemberSettings = {
  email: string;
  displayName: string;
  contributorHandle: string;
  flavorMode: FlavorMode;
  composite: boolean;     // show all 3 radars overlaid by default
  theme: "auto" | "parchment" | "cream" | "dark";
  notifications: MemberNotifications;
  /** Slugs the member has un-blinded (presumed already tasted) */
  tastedTeas: string[];
};

// =====================================================================
// SESSION LOG — what gets captured when a member rates a tea
// =====================================================================
//
// Quick mode: one overall flavor + mouthfeel + score (the original
//   shape; preserved for backward compat).
// Per-steep mode: an array of SteepLog entries; the overall flavor /
//   mouthfeel / rating fields are then computed as the mean of the
//   per-steep values (the editor writes them back so downstream
//   consumers don't need to know which mode produced the rating).

export type SessionMode = "quick" | "per-steep";

/** Where the brew water came from. Structured so search/filtering can
 *  group sessions by water type once we land the journal feed. */
export type WaterSource =
  | "filtered"
  | "spring"
  | "tap"
  | "ro"          // reverse osmosis
  | "distilled"
  | "well"
  | "bottled"
  | "unknown";

export type SteepLog = {
  /** 1-indexed steep number within the session */
  index: number;
  /** Steep duration as freeform string ("5s", "30s", "2m") */
  time?: string;
  /** Brewing temperature in °C */
  tempC?: number;
  /** Per-steep flavor profile, internal 0-10 (always 12-axis) */
  flavor?: FlavorProfile;
  /** Per-steep mouthfeel */
  mouthfeel?: Mouthfeel;
  /** Optional 0-10 per-steep score */
  rating?: number;
  /** Free-text notes for this specific steep */
  notes?: string;
};

export type MemberRating = {
  slug: string;
  name: string;
  /** Overall 0-10 — entered directly in Quick mode, or mean of steep
   *  scores in Per-steep mode (Per-steep auto-fills if not set). */
  rating: number;
  body: string;
  date: string;
  /** Display-scale used at entry time ("4.5/5" vs "9.0/10") */
  scale: "basic" | "advanced";
  /** Overall flavor profile — entered or mean of steeps */
  profile: FlavorProfile;
  /** Overall mouthfeel — entered or mean of steeps. Optional for back-
   *  compat with pre-7.1 ratings that didn't capture mouthfeel. */
  mouthfeel?: Mouthfeel;
  /** Which entry mode produced this rating. Defaults to "quick". */
  mode?: SessionMode;
  /** Per-steep entries. Present only in Per-steep mode. */
  steeps?: SteepLog[];
  /** Vessel description, freeform — "100ml porcelain gaiwan" */
  vessel?: string;
  /** Water description / TDS — "filtered (60 TDS)" or "spring water".
   *  Kept as freeform for backward compat; new ratings prefer the
   *  structured waterSource + waterTdsPpm fields below. */
  water?: string;
  /** Structured water source — selectable from a fixed enum so we can
   *  filter / group sessions by water type. */
  waterSource?: WaterSource;
  /** Total dissolved solids in ppm. Useful diagnostic — most softer-water
   *  teas (Japanese greens, fresh shen) want 30–80 ppm; hard water above
   *  150 noticeably flattens mid-range flavors. */
  waterTdsPpm?: number;
  /** Override for tea.brewing.style — set when the member intentionally
   *  brewed off-spec ("brewed Western even though we recommend Gongfu").
   *  Empty / undefined means "I followed the recommendation". */
  brewStyleOverride?: string;
  /** Leaf weight in grams */
  leafG?: number;
  /** Water volume in ml */
  waterMl?: number;
  /** Legacy single-line brewing string ("5g · 100ml gaiwan · 95°C") —
   *  kept so older saved ratings still display correctly. New ratings
   *  prefer vessel / water / leafG / waterMl above. */
  session?: string;
};

export type Member = {
  name: string;
  /** Which contributor's palate the member started aligned with */
  aligned: ContributorKey;
  /** Profile photo URL from Supabase Storage. Null = render the
   *  letter-on-colour fallback in IdentityAvatar. */
  avatarUrl: string | null;
  ratings: MemberRating[];
  settings: MemberSettings;
  /** User's saved tea collection — links to catalog teas or holds
   *  free-form entries for teas we don't review. Phase A scaffolds
   *  this in localStorage; Phase B persists in Supabase. */
  library: UserLibrary;
};

// =====================================================================
// LIBRARY — user-owned collections of teas and teaware
// =====================================================================
//
// Two libraries (teas, teaware) of the same shape: each entry tracks a
// catalog reference (when the item is one we review) OR free-form
// fields (custom_*) for off-catalog items. Status moves through the
// natural lifecycle as the user wishlist → owns → tries → retires the
// item; downstream features (restock notifications, "you finished this"
// prompts) read off these states.

export type UserTeaStatus = "wishlist" | "owned" | "tried" | "retired";
export type UserTeawareStatus = "wishlist" | "owned";

export type UserTea = {
  /** Stable ID — random uuid in localStorage scaffolding, Postgres uuid in Phase B. */
  id: string;
  /** When the user added it to their library, ISO date string. */
  addedAt: string;
  /** Current state. Affects sort + filter on /member/library. */
  status: UserTeaStatus;
  /** Catalog tea slug when the user added a reviewed tea. NULL means
   *  the user added a tea we don't catalog (custom fields below). */
  teaSlug: string | null;
  /** Free-form fields used only when teaSlug is null. */
  customName?: string;
  customVendor?: string;
  customYear?: string;
  customType?: TeaTypeName;
  /** Free-form notes the user keeps about the tea (storage history,
   *  cake number, gift origin, etc.) — separate from session notes. */
  notes?: string;
};

export type UserTeaware = {
  id: string;
  addedAt: string;
  status: UserTeawareStatus;
  /** Catalog teaware slug, or NULL for off-catalog items. */
  teawareSlug: string | null;
  customName?: string;
  customMaterial?: string;
  customVolumeMl?: number;
  notes?: string;
};

export type UserLibrary = {
  teas: UserTea[];
  teaware: UserTeaware[];
};

// =====================================================================
// VARIANT TYPES — kept as exported unions because TeaCard, RadarChart,
// and TeaHero still take them as props (the design supports multiple
// variants even though we ship the defaults). The Tweaks bundle and
// runtime panel were removed in Phase A; per-component density / radar
// style / hero variant are baked-in callers of these unions.
// =====================================================================

export type RadarStyle = "fill" | "outline" | "dotted";
export type CardDensity = "cozy" | "compact";
export type HeroVariant = "split" | "stain" | "editorial";
