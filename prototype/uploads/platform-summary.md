# Two Buds and a Leaf
## Platform Summary

A tea blog and discovery platform built for serious tea enthusiasts—part content site, part tasting journal, part recommendation engine.

---

## Infrastructure Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 (App Router) | Static + dynamic pages, SEO-optimized |
| **Hosting** | Vercel | Edge deployment, preview deploys, analytics |
| **CMS/Database** | Airtable | Headless CMS, structured tea data, content editing |
| **Domain** | Cloudflare Registrar | DNS, email forwarding |
| **Email** | Cloudflare Email Routing | hello@twobudsandaleaf.com → Gmail |
| **Analytics** | Vercel Analytics | Traffic, referral tracking |

### Why This Stack
- **No backend to maintain** — Airtable is the database AND admin UI
- **Fast globally** — Vercel edge + static generation
- **Preview before publish** — Draft mode shows unpublished content
- **Two people can edit** — Both contributors have Airtable access
- **Affordable** — Free tiers cover early growth

---

## Content Architecture

### Airtable Schema (16 Tables)

```
CORE CONTENT
├── Teas ─────────────── Master tea database (name, origin, price, photos, ratings)
├── Tasting Sessions ─── Each time you drink a tea (brewing params, overall notes)
├── Steeps ──────────── Per-steep evolution within a session
├── Blog Posts ──────── Articles, reviews, guides
├── Authors ─────────── You and your friend
└── Categories ──────── Review, Guide, Culture, etc.

SENSORY VOCABULARY
├── Flavor Notes ────── 60+ flavors (honey, malty, floral, etc.)
├── Aroma Notes ─────── Separate from flavor (smell ≠ taste)
├── Mouthfeel ───────── Texture descriptors (silky, astringent, full)
└── Finish Qualities ── Aftertaste (huigan, cooling, lingering)

CLASSIFICATION
├── Tea Types ───────── Green, white, oolong, black, pu'er, etc.
├── Varietals ───────── Silver Needle, Tieguanyin, Dianhong, etc.
├── Growing Conditions ─ Shade-grown, bug-bitten, ancient tree, etc.
└── Water Profiles ──── Track water used (TDS, source, brand)

COMMERCE
├── Vendors ─────────── Shops with bios, referral links, ratings
├── Teaware ─────────── Gaiwans, yixing, kyusu, etc.
└── Referral Clicks ─── Track affiliate link performance
```

---

## Features

### 🍵 Tea Library
- **Browse & filter** by type, region, vendor, flavor, season, altitude
- **Tea detail pages** with:
  - Photos (dry leaf, wet leaf, liquor)
  - Origin info (country → region → specific location, elevation)
  - Harvest details (year, season, first flush)
  - Growing conditions (shade, wild, ancient tree)
  - Recommended brewing parameters
  - Price per gram / per 5g session
  - Rarity score

### 📊 Discovery Engine
- **Flavor radar charts** — Visual profile across 8 categories
- **Similar teas** — Weighted algorithm considering:
  - Flavor profile overlap (30%)
  - Origin match (20%)
  - Aroma similarity (15%)
  - Terroir (elevation, wild/plantation) (10%)
  - Harvest season (10%)
  - Tea type/varietal (10%)
  - Same vendor (5%)
- **Filter by similarity** — "More like this" by flavor, region, altitude, vendor, growing conditions

### 🫖 Tasting Sessions
- **Log each time you drink a tea**
- **Brewing parameters**:
  - Style (gongfu, western, Japanese, grandpa, etc.)
  - Leaf amount (g) and water volume (ml)
  - Auto-calculated ratio (e.g., "5g/100ml = Standard Gongfu")
  - Water profile (type, TDS, brand)
  - Temperature
  - Teaware used
- **Steep-by-steep tracking**:
  - Time, temp, pour style per steep
  - Flavor/aroma/mouthfeel per steep
  - Mark peak steeps
  - Intensity visualization
- **Session ratings** — Rate each experience, see how a tea performs over time

### ⭐ Dual Ratings
- Both contributors can rate teas
- Individual session ratings aggregate to overall tea rating
- See how ratings differ between contributors
- Track personal preferences over time

### ✍️ Blog
- **Markdown-based writing** in Airtable
- **Categories**: Reviews, Guides, Culture, Vendor Spotlights, Recipes
- **Link to related teas** — Blog post can reference specific teas
- **SEO optimized** — Meta titles, descriptions, OG images
- **Draft preview** — See unpublished posts before going live

### 🏪 Vendor Profiles
- **Full vendor bios** — Story, sourcing philosophy, specialties
- **Stats** — Price tier, shipping info, regions they focus on
- **All their teas** — Browse teas by vendor
- **Referral integration**:
  - Affiliate links with tracking
  - Discount codes displayed
  - Commission tracking
  - Click analytics (source page, attribution, geo)

### 🔗 Referral & Tracking System
- **/go/[vendor]** redirect URLs for clean affiliate links
- **UTM parameter capture** via middleware
- **30-day attribution window** stored in cookies
- **Click logging** to Airtable:
  - Which vendor
  - Source page (which tea/post drove the click)
  - UTM source/medium/campaign
  - Geographic data
- **Analytics dashboard** — See which content drives purchases

---

## User Workflows

### For Content Creators (You & Friend)

**Quick Rating (Mobile)**
```
Drinking tea → Open Airtable app → Quick Rate form
→ Select tea, tap stars, pick flavors, voice note → Save
```

**Full Tasting Session (Tablet)**
```
Airtable Interface → Select tea → Log brewing params
→ Add steep-by-steep notes → Rate session → Save
```

**Blog Writing (Desktop)**
```
Airtable Interface → Draft post in Markdown
→ Link related teas → Preview on site → Publish
```

### For Readers

**Discovery Flow**
```
Browse tea library → Filter by flavor/region
→ View tea detail → See radar chart, similar teas
→ Click vendor link → Purchase (tracked)
```

**Content Flow**
```
Read blog post → See related teas → Explore vendor
→ Browse more from that vendor → Purchase
```

---

## Technical Highlights

| Feature | Implementation |
|---------|----------------|
| **Static + Dynamic** | ISR (Incremental Static Regeneration) — fast loads, fresh content |
| **Preview Mode** | Next.js `draftMode()` — see unpublished content with secret URL |
| **On-Demand Revalidation** | Airtable webhook → `/api/revalidate` — instant updates when content changes |
| **SEO** | Dynamic sitemap, per-page meta, JSON-LD structured data |
| **Dynamic OG Images** | `@vercel/og` — auto-generated social cards with tea name + rating |
| **Referral Tracking** | Middleware captures UTM, `/go/` routes log clicks |

---

## Data Model Overview

```
TEA
│
├── Origin: Country → Region → Specific (e.g., China → Yunnan → Menghai)
├── Terroir: Elevation, Wild/Plantation, Growing Conditions
├── Harvest: Year, Season, First Flush
├── Format: Loose, Cake, Powdered, Bagged
├── Vendor: → links to Vendor record
├── Sensory: → links to Flavors, Aromas, Mouthfeel, Finish
├── Recommended Brewing: Style, ratio, temp, time
│
└── SESSIONS (1:many)
    │
    ├── Brewing: Style, leaf:water ratio, water profile, temp, teaware
    ├── Rating: This session's score
    ├── Notes: Overall session impression
    │
    └── STEEPS (1:many)
        ├── Params: Time, temp, pour style
        ├── Sensory: Flavors, aroma, mouthfeel this steep
        ├── Intensity: Scale for visualization
        └── Is Peak: Boolean for highlighting best steeps
```

---

## Cost Estimate (Early Stage)

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Vercel | Hobby (free) → Pro ($20) | $0–20 |
| Airtable | Free (1,200 records) → Team ($20/seat) | $0–40 |
| Cloudflare | Free | $0 |
| Domain | ~$10/year | ~$1 |
| **Total** | | **$0–60/mo** |

Free tiers work until you have significant traffic or >1,200 teas logged.

---

## What Makes This Different

| vs. Generic Blog | vs. Vivino/Wine Apps |
|------------------|----------------------|
| Structured tea data, not just articles | Steep-by-steep tracking (unique to tea) |
| Discovery by terroir, not just tags | Brewing parameter logging |
| Referral tracking built-in | Gongfu vs. Western style comparison |
| Two-person collaborative ratings | Session-based ratings (same tea, different days) |

---

## Summary

**Two Buds and a Leaf** is a tea discovery platform that combines:

1. **Blog** — Long-form content, guides, vendor spotlights
2. **Tea database** — Structured, searchable, filterable
3. **Tasting journal** — Session + steep logging with full parameters
4. **Discovery engine** — Radar charts, similarity matching, exploration
5. **Vendor directory** — Profiles with referral/affiliate tracking
6. **Dual authorship** — Two contributors with shared access

All powered by **Airtable** (CMS + database), **Next.js** (frontend), and **Vercel** (hosting)—with no backend code to maintain.
