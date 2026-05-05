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

export type TeaTypeName =
  | "Green" | "White" | "Yellow" | "Oolong" | "Black" | "Pu'er" | "Herbal";

export type Tea = {
  slug: string;
  name: string;
  /** Original-script name, e.g. 茶王 普洱 */
  chinese?: string;
  type: TeaTypeName;
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
  vendor: string;
  /** Card hero gradient (CSS) — placeholder until real photography */
  gradient: string;
  /** Single accent color for the tea */
  swatch: string;
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

export type MemberRating = {
  slug: string;
  name: string;
  rating: number;          // 0–10 internal
  body: string;
  date: string;
  session?: string;
  profile: FlavorProfile;
  scale: "basic" | "advanced";
};

export type Member = {
  name: string;
  /** Which contributor's palate the member started aligned with */
  aligned: ContributorKey;
  ratings: MemberRating[];
  settings: MemberSettings;
};

// =====================================================================
// TWEAKS — design-time overrides
// =====================================================================

export type RadarStyle = "fill" | "outline" | "dotted";
export type CardDensity = "cozy" | "compact";
export type HeroVariant = "split" | "stain" | "editorial";

export type Tweaks = {
  theme: "parchment" | "cream" | "dark";
  radarStyle: RadarStyle;
  density: CardDensity;
  heroVariant: HeroVariant;
  showComposite: boolean;
  /** Force-hide reviews + ratings (design preview override) */
  hideReviews: boolean;
};
