# Two Buds and a Leaf
## Complete Launch Guide

---

## Design System Files

You have three design system artifacts ready to use:

1. **Design System (Interactive)** — Visual reference with live components
2. **tailwind.config.ts** — Full Tailwind configuration with your brand tokens
3. **globals.css** — Base styles, component classes, and utilities

### Key Brand Elements

| Element | Value |
|---------|-------|
| **Display Font** | Cormorant Garamond (headings) |
| **Body Font** | Nunito Sans (text, UI) |
| **Primary Color** | Burgundy `#722F37` |
| **Accent Color** | Gold `#C4A35A` |
| **Secondary Color** | Sage `#8B9A7D` |
| **Background** | Cream `#FAF7F2` / Parchment `#F5EFE6` |
| **Text** | Forest `#2D3A2E` |
| **Border Radius** | Pill (buttons), xl/2xl (cards) |
| **Shadows** | Warm-tinted, subtle |

### Component Classes (in globals.css)

```css
/* Buttons */
.btn-primary    /* Burgundy filled */
.btn-secondary  /* Burgundy outline */
.btn-ghost      /* Transparent */
.btn-gold       /* Gold filled */
.btn-sage       /* Sage filled */

/* Cards */
.card           /* Basic card */
.card-hover     /* With hover effect */
.card-tea       /* Tea card variant */

/* Badges */
.badge-default .badge-burgundy .badge-gold .badge-sage .badge-outline

/* Flavor badges */
.flavor-badge   /* With .flavor-badge-dot for color dot */

/* Inputs */
.input .input-label

/* Typography */
.section-label  /* Uppercase small label */
.section-title  /* Section heading with border */
.prose-tea      /* Blog content styling */

/* Tea type colors */
.tea-type-green .tea-type-white .tea-type-oolong .tea-type-black .tea-type-puer
```

---

# 🤖 Claude in Chrome Implementation Guide

## What This Document Is

This is a complete technical specification for building a tea blog and discovery platform. It includes:
- Full Airtable schema (16 tables)
- Next.js project structure
- Airtable integration code
- Discovery/similarity algorithms
- UI component designs
- Deployment configuration

## How to Use This With Claude in Chrome

Break the build into focused sessions. Claude in Chrome works best with specific, bounded tasks rather than "build everything."

### Recommended Session Breakdown

| Session | Task | Est. Time |
|---------|------|-----------|
| 1 | Foundation setup (accounts, DNS, repo) | Manual, 1-2 hrs |
| 2 | Airtable schema creation | 30-45 min |
| 3 | Airtable Interfaces setup | 20-30 min |
| 4 | Next.js scaffold + Vercel deploy | 15-20 min |
| 5 | Airtable client + types | 20-30 min |
| 6 | Tea pages (list + detail) | 30-45 min |
| 7 | Discovery features (similarity, radar) | 30-45 min |
| 8 | Blog pages | 20-30 min |
| 9 | Vendor pages + referral system | 20-30 min |
| 10 | Preview mode + webhooks | 15-20 min |
| 11 | Polish + testing | 30+ min |

---

## Starter Prompts

### Session 1: Foundation (Do Manually)
Steps 1-7 require account creation and clicking through UIs. Do these yourself following the guide below.

---

### Session 2: Airtable Schema

```
I'm building a tea blog and discovery platform called "Two Buds and a Leaf."

I need you to help me create the Airtable schema. I have a base already created called "Tea Library & Blog."

Here's the complete schema specification. Please help me create these tables one by one, starting with the Tea Types table (since other tables reference it), then Varietals, then Flavor Notes, Aroma Notes, Mouthfeel, Finish Qualities, Growing Conditions, Water Profiles, Teaware, then Vendors, then Teas, then Tasting Sessions, then Steeps, then Blog Posts, Authors, Categories, and finally Referral Clicks.

For each table:
1. Create the table with all fields as specified
2. Set up any formulas
3. Add initial seed data where noted

[PASTE THE SCHEMA SECTION FROM THIS DOC]
```

---

### Session 3: Airtable Interfaces

```
Now I need to create Airtable Interfaces for content entry. I have my tables set up.

Please help me create these interfaces:

1. **Quick Tea Rating** (Mobile-optimized form)
   - For quickly logging ratings while drinking tea
   - Fields: Tea lookup, Rating (stars), Quick flavor picks, Quick notes
   
2. **Full Tasting Session** (Tablet/Desktop)
   - Record review layout
   - Left: Tea gallery/selector filtered by Status = "In Collection"
   - Right: Full session form with brewing params, water, steeps
   
3. **Tea Collection Gallery**
   - Gallery view grouped by Tea Type
   - Card shows: photo, name, rating, vendor, top flavors
   
4. **Blog Writing**
   - Form layout with metadata sidebar
   - Fields: Title, Status, Category, Content (markdown), Related Teas, SEO fields
   - Include Preview URL button
   
5. **Vendor Management**
   - List view for managing vendor partnerships
   - Show: name, active status, referral stats, rating
```

---

### Session 4: Next.js Scaffold

```
I'm building a Next.js tea blog called "Two Buds and a Leaf."

Please help me:

1. Create a new Next.js 14 project with:
   - TypeScript
   - Tailwind CSS
   - App Router
   - src directory
   
2. Set up the project structure as specified in my architecture doc

3. Configure Tailwind with my custom design tokens:
   - Colors: cream (#FAF7F2), parchment (#F5EFE6), burgundy (#722F37), gold (#C4A35A), sage (#8B9A7D), forest (#2D3A2E)
   - Fonts: Cormorant Garamond (display), Nunito Sans (body)
   
4. Create a basic layout with the brand styling

5. Initialize git and push to my repo: [YOUR_REPO_URL]

6. Deploy to Vercel and connect my domain: twobudsandaleaf.com

Here's my full project structure:
[PASTE PROJECT STRUCTURE SECTION]
```

---

### Session 5: Airtable Integration

```
I need to build the Airtable integration layer for my tea blog.

My Airtable base has these tables:
- Teas (main tea database)
- Tasting Sessions
- Steeps  
- Vendors
- Blog Posts
- Flavor Notes, Aroma Notes, Mouthfeel, etc. (lookup tables)

Please create:

1. `lib/airtable/client.ts` - Base Airtable client with error handling
2. `lib/airtable/types.ts` - TypeScript interfaces for all tables
3. `lib/airtable/teas.ts` - Tea queries (getAll, getBySlug, getByVendor, etc.)
4. `lib/airtable/sessions.ts` - Session queries
5. `lib/airtable/vendors.ts` - Vendor queries
6. `lib/airtable/posts.ts` - Blog post queries
7. `lib/airtable/discovery.ts` - Similarity algorithms

Here's my complete schema and the query patterns I need:
[PASTE RELEVANT SECTIONS]

Environment variables I have set:
- AIRTABLE_API_KEY
- AIRTABLE_BASE_ID
```

---

### Session 6: Tea Pages

```
Now I need to build the tea pages for my discovery platform.

Please create:

1. `/teas/page.tsx` - Tea library index
   - Filterable by: type, region, vendor, flavor, season
   - Sortable by: rating, price, date added
   - Grid of tea cards
   
2. `/teas/[slug]/page.tsx` - Individual tea page
   - Hero with images, rating, key info
   - Flavor radar chart
   - Brewing recommendations
   - Tasting sessions list
   - Similar teas section
   - Vendor card with referral link
   
3. Components needed:
   - TeaCard
   - TeaFilters
   - FlavorBadge
   - RatingStars
   - RadarChart
   - BrewingParams
   - SteepTimeline
   - SimilarTeas

Use my design system tokens and reference these UI mockups:
[PASTE DESIGN SYSTEM AND UI SECTIONS]
```

---

### Session 7: Discovery Features

```
I need to implement the tea discovery/similarity engine.

Please create:

1. `lib/similarity.ts` with these functions:
   - findSimilarTeas(tea, allTeas) - weighted multi-factor similarity
   - getSimilarByFlavor(teaId)
   - getSimilarByRegion(teaId)  
   - getSimilarByElevation(teaId, range)
   - getSimilarByGrowing(teaId)
   
2. `lib/radar.ts` for flavor radar data:
   - buildRadarData(flavorNotes) - aggregate to 8 categories
   - FLAVOR_TO_CATEGORY mapping
   
3. Components:
   - RadarChart (SVG-based, 8 axes)
   - SimilarTeaCard (with match % and reason)
   - DiscoveryFilters (filter pills)

4. Discovery pages:
   - `/discover/page.tsx` - Discovery hub
   - `/flavors/[slug]/page.tsx` - Teas by flavor

Here's my similarity algorithm specification:
[PASTE DISCOVERY ENGINE SECTION]
```

---

### Session 8-11: Continue Pattern

Use similar focused prompts for:
- **Session 8**: Blog pages (index, post detail, categories)
- **Session 9**: Vendor pages + referral tracking system
- **Session 10**: Preview mode (draftMode), revalidation webhooks
- **Session 11**: Polish, responsive design, error states, loading states

---

## Tips for Working with Claude in Chrome

1. **One major feature per session** - Don't try to build everything at once

2. **Paste relevant sections** - Don't paste the entire doc; give Claude the specific schema/code it needs for that task

3. **Test as you go** - After each session, verify the feature works before moving on

4. **Keep a running issues list** - Note bugs or improvements to address in a polish session

5. **Use Vercel preview deploys** - Each push creates a preview URL to test

6. **Seed Airtable with real data early** - You need test data to see if the UI actually works

---

## Environment Variables Checklist

Make sure these are set in Vercel before development:

```
AIRTABLE_API_KEY=pat_xxxxx
AIRTABLE_BASE_ID=appXXXXX
PREVIEW_SECRET=random-string-here
REVALIDATE_SECRET=another-random-string
NEXT_PUBLIC_SITE_URL=https://twobudsandaleaf.com
```

---

## Quick Reference: What's in This Doc

| Section | What It Contains |
|---------|------------------|
| Phase 1: Foundation | Account setup, DNS, GitHub, Vercel |
| Phase 2: Airtable | Complete 16-table schema with all fields |
| Discovery Engine | Similarity algorithms, radar charts, queries |
| Phase 3: Development | Project structure, code patterns, components |
| Phase 4-5: Launch | Pre-launch checklist, go-live steps |

---

---

# Phase 1: Foundation (Day 1-2)

## Step 1: Create Gmail Account
1. Go to accounts.google.com
2. Create **twobudsandaleaf@gmail.com**
3. Use a strong password, save in password manager
4. Enable 2FA immediately
5. Set up recovery phone/email to your personal accounts

---

## Step 2: Create Cloudflare Account
1. Go to dash.cloudflare.com
2. Sign up with **twobudsandaleaf@gmail.com**
3. Verify email
4. Enable 2FA

---

## Step 3: Register Domain
1. In Cloudflare, go to **Registrar** → **Register Domains**
2. Search for `twobudsandaleaf.com`
3. Purchase (~$10/year)
4. Cloudflare auto-configures DNS management

---

## Step 4: Set Up Email Forwarding
1. In Cloudflare, go to **Email** → **Email Routing**
2. Click **Enable Email Routing**
3. Add destination: your personal Gmail
4. Verify by clicking link in personal Gmail
5. Create route:
   ```
   hello@twobudsandaleaf.com → your-personal@gmail.com
   ```
6. Optional: add catch-all `*@twobudsandaleaf.com` → personal

**That's it for email.** Cloudflare handles inbound forwarding. For outbound, just reply from twobudsandaleaf@gmail.com—it's a tea blog, not enterprise software.

### Optional: Send FROM hello@twobudsandaleaf.com

If you really want outbound emails to show your custom domain (not required):

1. Sign up for **Resend.com** (free: 3k emails/month)
2. Add your domain in Resend dashboard
3. Add the DNS records Resend gives you to Cloudflare (SPF, DKIM, DMARC)
4. In Gmail → Settings → Accounts → "Send mail as"
5. Add `hello@twobudsandaleaf.com`
6. Choose "Send through SMTP server"
7. Use Resend's SMTP credentials (smtp.resend.com, port 587, your API key)

This is optional. Most tea blogs don't need it.

---

## Step 5: Create GitHub Repository
1. Go to github.com (use personal account or create one)
2. New repository: `two-buds-and-a-leaf`
3. Initialize with README
4. Set to **Private** (can make public later)

---

## Step 6: Create Vercel Account
1. Go to vercel.com
2. Sign up with **GitHub** (not email) — this auto-connects repos
3. Authorize Vercel to access your repos
4. You'll connect the repo to a project later

---

## Step 7: Point DNS to Vercel
1. In Cloudflare **DNS** settings, add:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | 76.76.21.21 | DNS only (gray cloud) |
| CNAME | www | cname.vercel-dns.com | DNS only (gray cloud) |

2. **Important:** Turn OFF proxy (orange cloud → gray cloud) for Vercel to work

DNS can take up to 48 hours but usually 10-30 minutes.

---

# Phase 2: Airtable Setup (Day 2-4)

## Step 8: Create Airtable Account
1. Go to airtable.com
2. Sign up with **twobudsandaleaf@gmail.com**
3. Create a new workspace called "Two Buds and a Leaf"

---

## Step 9: Invite Collaborators
1. Click workspace name → **Manage members**
2. Invite your friend's personal email as **Creator**
3. Both of you now have full editing access

---

## Step 10: Create Airtable Base
1. Create new base: "Tea Library & Blog"
2. You'll create multiple tables inside this base

---

## Step 11: Create Tables

### Table 1: 🍵 Teas (Master Tea Database)

**Basic Info**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Name | Single line text | Primary field |
| Slug | Formula | `LOWER(SUBSTITUTE(SUBSTITUTE({Name}, " ", "-"), "'", ""))` |
| Tea Type | Link → Tea Types | Single link |
| Varietal | Link → Varietals | Single link |
| Vendor | Link → Vendors | Single link |
| Status | Single select | `Wishlist`, `Ordered`, `In Collection`, `Finished`, `Repurchase` |

**Origin & Harvest**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Origin Country | Single select | China, Japan, Taiwan, India, Nepal, Kenya, etc. |
| Origin Region | Single line text | Yunnan, Fujian, Darjeeling, Uji, etc. |
| Origin Specific | Single line text | Mountain, village, garden name |
| Harvest Year | Number | 2024, 2023, etc. |
| Harvest Season | Single select | `Spring`, `First Flush`, `Second Flush`, `Summer`, `Autumn`, `Winter` |
| Harvest Date | Single line text | Optional specific date if known |

**Growing & Processing**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Growing Conditions | Link → Growing Conditions | Multiple links |
| Processing Notes | Long text | Any special processing info |
| Cultivar | Single line text | Specific plant cultivar if known |
| Elevation | Number | Meters, if known |
| Wild/Plantation | Single select | `Plantation`, `Semi-wild`, `Wild`, `Ancient Tree` |

**Format & Pricing**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Format | Single select | `Loose Leaf`, `Cake/Brick (Pu'er)`, `Powdered (Matcha)`, `Bagged`, `Rolled Ball`, `Compressed Other` |
| Price | Currency | What you paid |
| Weight | Number | Grams purchased |
| Price Per Gram | Formula | `{Price}/{Weight}` |
| Price Per 5g Session | Formula | `{Price Per Gram}*5` |
| Price Per Matcha Serving | Formula | `IF({Format}="Powdered (Matcha)", {Price Per Gram}*2, "")` |
| Rarity | Single select | `Mass Produced`, `Mid Tier`, `Artisan`, `Rare`, `Prized`, `Unique` |
| Purchase URL | URL | Link to product |
| Purchase Date | Date | When you bought it |

**Imagery**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Dry Leaf Photos | Attachment | Multiple allowed |
| Wet Leaf Photos | Attachment | Multiple allowed |
| Liquor Photos | Attachment | Multiple allowed |
| Packaging Photo | Attachment | Label, wrapper, etc. |

**Appearance**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Dry Leaf Appearance | Long text | Color, shape, size description |
| Wet Leaf Appearance | Long text | How it opens, color change |
| Liquor Color | Single select | `Pale Yellow`, `Gold`, `Amber`, `Honey`, `Copper`, `Orange`, `Ruby`, `Mahogany`, `Dark Brown`, `Inky Black` |
| Liquor Clarity | Single select | `Crystal Clear`, `Clear`, `Slightly Hazy`, `Hazy`, `Opaque` |

**Overall Assessment**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Overall Rating | Rating (1-5) | Your summary score |
| Summary Notes | Long text | Quick summary for display |
| Review Post | Link → Blog Posts | Full review if written |
| Would Repurchase | Checkbox | Quick reference |
| Last Tasted | Date | Auto-update from Sessions |
| Created | Created time | |

**Recommended Brewing (Starting Point)**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Rec. Style | Single select | Best brewing style for this tea |
| Rec. Leaf (g/100ml) | Number | Suggested ratio |
| Rec. Temp (°C) | Number | Suggested starting temp |
| Rec. First Steep | Single line text | "10s", "30s", etc. |
| Rec. Water Type | Single select | If specific water matters |
| Brewing Tips | Long text | Special instructions |

**Linked Profiles**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Aroma Notes | Link → Aroma Notes | Multiple links |
| Flavor Notes | Link → Flavor Notes | Multiple links |
| Mouthfeel | Link → Mouthfeel | Multiple links |
| Finish | Link → Finish Qualities | Multiple links |
| Tasting Sessions | Link → Tasting Sessions | Auto-linked from sessions |

---

### Table 2: 🫖 Tasting Sessions

Each time you drink a tea, log a session:

| Field | Type | Options/Notes |
|-------|------|---------------|
| Session Name | Formula | `{Tea} & " - " & DATETIME_FORMAT({Date}, "MMM D, YYYY")` |
| Tea | Link → Teas | Which tea |
| Date | Date | When you drank it |
| Teaware Used | Link → Teaware | What you brewed in |

**Brewing Style**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Brewing Style | Single select | `Gongfu`, `Western`, `Grandpa`, `Cold Brew`, `Japanese (Sencha)`, `Japanese (Gyokuro)`, `Matcha (Usucha)`, `Matcha (Koicha)`, `Sidehandle`, `Bowl/Chawan`, `HongKong Style`, `British`, `Other` |
| Style Notes | Long text | Any deviations from standard |

**Leaf & Water Ratio**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Leaf Amount (g) | Number | Grams of tea |
| Water Volume (ml) | Number | ml of water |
| Ratio | Formula | `ROUND({Leaf Amount (g)}/{Water Volume (ml)}*100, 1) & "g/100ml"` |
| Ratio Style | Formula | Auto-classify (see below) |

**Water**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Water | Link → Water Profiles | Which water you used |
| Water Temp (°C) | Number | Starting temperature |
| Water Temp (°F) | Formula | `ROUND({Water Temp (°C)}*9/5+32)` |
| Temp Category | Formula | See below |
| Pre-warmed Vessel | Checkbox | Did you pre-heat? |
| Kettle | Single select | `Electric Gooseneck`, `Electric Standard`, `Stovetop`, `Tetsubin`, `Other` |

**Ratio Style Formula:**
```
IF(
  {Leaf Amount (g)}/{Water Volume (ml)} >= 0.06,
  "Heavy Gongfu (6g+/100ml)",
  IF(
    {Leaf Amount (g)}/{Water Volume (ml)} >= 0.04,
    "Standard Gongfu (4-6g/100ml)",
    IF(
      {Leaf Amount (g)}/{Water Volume (ml)} >= 0.02,
      "Light Gongfu / Heavy Western",
      "Western (<2g/100ml)"
    )
  )
)
```

**Temp Category Formula:**
```
IF(
  {Water Temp (°C)} >= 95,
  "Boiling (95°C+)",
  IF(
    {Water Temp (°C)} >= 85,
    "Hot (85-95°C)",
    IF(
      {Water Temp (°C)} >= 70,
      "Medium (70-85°C)",
      IF(
        {Water Temp (°C)} >= 50,
        "Low (50-70°C)",
        "Cold (<50°C)"
      )
    )
  )
)
```

**Steep Tracking**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Steeps | Link → Steeps | All steep records for this session |
| Total Steeps | Count | Auto-count of linked steeps |
| Peak Steep | Single line text | "3-4" — which steeps were best |

**Overall Session Sensory** (aggregated impression)
| Field | Type | Options/Notes |
|-------|------|---------------|
| Dominant Flavors | Link → Flavor Notes | Overall flavor impression |
| Dominant Aromas | Link → Aroma Notes | Overall aroma impression |
| Body | Single select | `Light`, `Light-Medium`, `Medium`, `Medium-Full`, `Full` |
| Qi/Energy | Single select | `Relaxing`, `Calming`, `Balanced`, `Energizing`, `Intense` |

**Notes**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Session Summary | Long text | Overall session notes, Markdown |
| Session Rating | Rating (1-5) | This specific session |
| Photos | Attachment | Session photos |
| Mood/Context | Long text | Optional: where, when, who with |

---

### Table 2b: 🫖 Steeps (Per-Steep Evolution)

Each steep within a session gets its own record:

| Field | Type | Options/Notes |
|-------|------|---------------|
| Steep ID | Formula | `{Session} & " - Steep " & {Steep Number}` |
| Session | Link → Tasting Sessions | Parent session |
| Steep Number | Number | 1, 2, 3... or use ranges |
| Steep Range | Single line text | "1", "2-3", "4-6", "7+" for grouping |
| Is Peak | Checkbox | Mark the best steep(s) |

**Parameters**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Time Seconds | Number | Steep duration |
| Time Display | Formula | Format nicely: "15s", "1m 30s" |
| Temperature C | Number | If you adjusted temp |
| Pour Style | Single select | `Standard`, `Flash`, `Extended`, `Rinse` |

**Sensory (This Steep)**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Aroma - Wet Leaf | Link → Aroma Notes | Smell the lid/leaves |
| Aroma - Liquor | Link → Aroma Notes | Smell the tea itself |
| Flavors | Link → Flavor Notes | What you taste |
| Mouthfeel | Link → Mouthfeel | Texture/body |
| Finish | Link → Finish Qualities | Aftertaste |
| Intensity | Single select | `Subtle`, `Light`, `Medium`, `Strong`, `Intense` |

**Notes**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Notes | Long text | Quick notes for this steep |
| Liquor Photo | Attachment | Optional per-steep photo |
| Liquor Color | Single select | Track color evolution |

**Suggested Workflow:**

For quick sessions, you might only log 3 records:
- "Early" (steeps 1-2)
- "Peak" (steeps 3-5) 
- "Late" (steeps 6+)

For detailed reviews, log each steep individually.

---

### Brewing Style Reference

Quick reference for typical parameters by style:

| Style | Leaf:Water | Temp | Steep Time | Vessel |
|-------|-----------|------|------------|--------|
| **Gongfu** | 5-8g/100ml | 85-100°C | 10-60s, many steeps | Gaiwan, Yixing |
| **Western** | 2-3g/250ml | 80-100°C | 3-5 min, 1-2 steeps | Teapot, mug |
| **Grandpa** | 3-4g/300ml | 85-95°C | Continuous | Glass, thermos |
| **Japanese Sencha** | 4g/100ml | 70-80°C | 60-90s | Kyusu |
| **Japanese Gyokuro** | 5g/50ml | 50-60°C | 90-120s | Houhin |
| **Matcha Usucha** | 2g/60ml | 70-80°C | Whisk 15s | Chawan |
| **Matcha Koicha** | 4g/30ml | 70-80°C | Knead | Chawan |
| **Cold Brew** | 5-8g/500ml | Cold | 4-12 hours | Pitcher |
| **British** | 2g/200ml | 100°C | 3-5 min | Teapot |
| **HK Milk Tea** | Heavy | 100°C | Long boil | Stocking filter |

---

### Table 3: 🎨 Flavor Notes

Your flavor vocabulary:

| Field | Type | Options/Notes |
|-------|------|---------------|
| Name | Single line text | "Honey", "Malty", etc. |
| Slug | Formula | |
| Category | Single select | See categories below |
| Icon | Single line text | Emoji |
| Hex Color | Single line text | For UI badges |
| Description | Long text | What this tastes like |
| Teas | Link → Teas | Auto-populated reverse link |

**Categories & Examples:**
- **Sweet**: Honey, Brown Sugar, Molasses, Caramel, Vanilla, Maple
- **Floral**: Orchid, Rose, Jasmine, Osmanthus, Lilac, Chrysanthemum, Lavender
- **Fruity**: Apricot, Peach, Apple, Citrus, Lychee, Berry, Grape, Tropical
- **Vegetal**: Spinach, Kale, Grass, Seaweed, Artichoke, Asparagus
- **Nutty**: Almond, Chestnut, Walnut, Hazelnut, Peanut, Toasted Rice
- **Earthy**: Wet Stone, Petrichor, Forest Floor, Mushroom, Leather, Tobacco
- **Woody**: Cedar, Sandalwood, Oak, Pine, Bamboo, Camphor
- **Spicy**: Cinnamon, Clove, Black Pepper, Ginger, Licorice, Mint
- **Roasted**: Charcoal, Smoke, Coffee, Cocoa, Bread Crust, Barley
- **Marine**: Seaweed, Oceanic, Brine, Iodine, Umami
- **Mineral**: Slate, Chalk, Iron, Limestone, Metallic
- **Dairy**: Butter, Cream, Milk, Cheese

---

### Table 4: 👃 Aroma Notes

Same structure as Flavor Notes:

| Field | Type | Options/Notes |
|-------|------|---------------|
| Name | Single line text | |
| Slug | Formula | |
| Category | Single select | Same categories as flavor |
| Icon | Single line text | |
| Hex Color | Single line text | |
| Description | Long text | |

**Why separate from Flavor?**
Aroma and taste are related but distinct. A tea might smell like orchids but taste like honey. Keeping them separate lets you track the full experience.

---

### Table 5: 👄 Mouthfeel

| Field | Type | Options/Notes |
|-------|------|---------------|
| Name | Single line text | |
| Slug | Formula | |
| Category | Single select | `Texture`, `Weight`, `Sensation` |
| Description | Long text | |

**Examples:**
- **Texture**: Silky, Velvety, Oily, Watery, Thick, Thin, Creamy, Brothy
- **Weight**: Light, Medium, Full, Viscous, Coating
- **Sensation**: Astringent, Drying, Puckering, Cooling, Warming, Numbing, Tingling

---

### Table 6: ✨ Finish Qualities

What lingers after you swallow:

| Field | Type | Options/Notes |
|-------|------|---------------|
| Name | Single line text | |
| Slug | Formula | |
| Duration | Single select | `Short`, `Medium`, `Long`, `Evolving` |
| Description | Long text | |

**Examples:**
- Huigan (returning sweetness)
- Cooling throat
- Mineral lingering
- Drying
- Clean
- Floral echo
- Savory finish

---

### Table 7: 🌱 Growing Conditions

| Field | Type | Options/Notes |
|-------|------|---------------|
| Name | Single line text | |
| Slug | Formula | |
| Description | Long text | |

**Examples:**
- Shade Grown (Kabusecha/Gyokuro style)
- Full Sun
- Bug Bitten (Oriental Beauty style)
- High Altitude (1000m+)
- Ancient Tree (100+ years)
- Single Origin
- Single Estate
- Small Batch
- Wild Picked
- Jasmine Scented
- Osmanthus Scented
- Gaba Processed
- Charcoal Roasted
- Aged
- Wet Stored (Pu'er)
- Dry Stored (Pu'er)

---

### Table 8: 🍃 Tea Types

| Field | Type | Options/Notes |
|-------|------|---------------|
| Name | Single line text | Green, Black, etc. |
| Slug | Formula | |
| Chinese Name | Single line text | 绿茶, 红茶, etc. |
| Description | Long text | |
| Oxidation Range | Single line text | "0-10%", "80-100%", etc. |
| Typical Temp C | Number | Recommended brewing temp |
| Typical Steep Time | Single line text | Starting point |
| Color | Single line text | Hex for UI |

**Values:**
- Green (绿茶) - ~0-5% oxidation (kill-green halts it early)
- White (白茶) - ~5-15% oxidation (long wither, no kill-green)
- Yellow (黄茶) - ~10-20% oxidation (smothering step)
- Oolong (乌龙) - 15-85% oxidation (wide range)
- Black (红茶) - 85-100% oxidation (fully oxidized)
- Shen Pu'er (生普) - Raw, ages/oxidizes over time
- Shou Pu'er (熟普) - Ripe, pile-fermented (not oxidation)
- Heicha (黑茶) - Dark tea, microbial fermentation
- Herbal/Tisane - Not true tea (Camellia sinensis)

---

### Table 9: 🌿 Varietals

| Field | Type | Options/Notes |
|-------|------|---------------|
| Name | Single line text | |
| Slug | Formula | |
| Tea Type | Link → Tea Types | Which category |
| Origin | Single line text | Where it's from |
| Description | Long text | |
| Famous Examples | Long text | |

**Examples by type:**

**Green:**
- Longjing (Dragonwell)
- Biluochun
- Sencha
- Gyokuro
- Matcha
- Gunpowder

**White:**
- Silver Needle (Bai Hao Yin Zhen)
- White Peony (Bai Mudan)
- Shou Mei

**Oolong:**
- Tieguanyin
- Da Hong Pao
- Dong Ding
- Oriental Beauty
- Jin Xuan (Milk Oolong)
- Dan Cong (Phoenix)

**Black:**
- Keemun (Qimen)
- Lapsang Souchong
- Dianhong (Yunnan Gold)
- Assam
- Darjeeling
- Ceylon

**Pu'er:**
- Gushu (Old Tree)
- Huangpian (Yellow Leaf)
- Shou (Ripe)
- Sheng (Raw)

---

### Table 10: 🫖 Teaware

| Field | Type | Options/Notes |
|-------|------|---------------|
| Name | Single line text | "100ml Jianshui Gaiwan" |
| Type | Single select | `Gaiwan`, `Yixing`, `Kyusu`, `Gongfu Pot`, `Western Pot`, `Glass`, `Grandpa Glass`, `Sidehandle`, `Tetsubin`, `Other` |
| Material | Single select | `Porcelain`, `Clay (Yixing)`, `Clay (Jianshui)`, `Clay (Other)`, `Glass`, `Cast Iron`, `Silver`, `Ceramic` |
| Volume ML | Number | |
| Dedicated Tea Type | Link → Tea Types | Some clay gets dedicated |
| Photos | Attachment | |
| Notes | Long text | |
| Acquired From | Single line text | |
| Price | Currency | |

---

### Table 11: 🏪 Vendors

| Field | Type | Options/Notes |
|-------|------|---------------|
| Name | Single line text | |
| Slug | Formula | |
| Website | URL | |
| Active | Checkbox | Still selling? |
| Featured | Checkbox | Show on vendors page |

**Location & Background**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Based In | Single line text | City, Country |
| Ships From | Single select | Country |
| Founded | Number | Year |
| Founder Story | Long text | How they started |
| Sourcing Philosophy | Long text | How they find teas |

**Profile**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Tagline | Single line text | One-liner description |
| Description | Long text | Markdown bio |
| Specialties | Link → Tea Types | What they're known for |
| Specialty Regions | Multiple select | Yunnan, Taiwan, Japan, etc. |
| Known For | Long text | What makes them unique |
| Pros | Long text | |
| Cons | Long text | |
| Rating | Rating (1-5) | |

**Shipping & Service**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Shipping Cost | Single line text | "$5 US, $15 intl" |
| Free Shipping Threshold | Currency | |
| Shipping Speed | Single line text | "3-5 days US" |
| Shipping Notes | Long text | Customs, packaging |
| Sample Sizes | Checkbox | Do they offer samples? |
| Customer Service Notes | Long text | |

**Pricing Tier**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Price Tier | Single select | `Budget`, `Mid-Range`, `Premium`, `Ultra-Premium`, `Mixed` |
| Price Notes | Long text | |

**Referral**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Referral Link | URL | Affiliate URL |
| Referral Code | Single line text | Discount code |
| Referral Discount | Single line text | "10% off first order" |
| Commission Rate | Percent | Your cut |
| Referral Notes | Long text | Terms, exclusions |

**Media**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Logo | Attachment | |
| Banner Image | Attachment | Header image |
| Photos | Attachment | Shop photos, sourcing trips |

**Social**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Instagram | URL | |
| Twitter | URL | |
| YouTube | URL | |
| Newsletter | URL | |

**Reverse Links**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Teas | Link → Teas | Auto-populated |
| Referral Clicks | Link → Referral Clicks | Auto-populated |
| Blog Mentions | Link → Blog Posts | Posts featuring them |

---

### Table 12: 📝 Blog Posts

| Field | Type | Options/Notes |
|-------|------|---------------|
| Title | Single line text | |
| Slug | Formula | |
| Status | Single select | `Draft`, `In Review`, `Published` |
| Publish Date | Date | |
| Author | Link → Authors | |
| Category | Link → Categories | |
| Tags | Multiple select | |
| Featured | Checkbox | |

**Content**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Excerpt | Long text | Meta description |
| Content | Long text | Markdown, enable rich text |
| Featured Image | Attachment | |

**SEO**
| Field | Type | Options/Notes |
|-------|------|---------------|
| SEO Title | Single line text | Override |
| SEO Description | Long text | Override |
| Preview URL | Formula | See formula below |

**Connections**
| Field | Type | Options/Notes |
|-------|------|---------------|
| Related Teas | Link → Teas | |
| Related Vendors | Link → Vendors | |
| Related Sessions | Link → Tasting Sessions | |

**Preview URL Formula:**
```
IF(
  {Slug},
  CONCATENATE(
    "https://twobudsandaleaf.com/api/preview?secret=YOUR_SECRET&type=blog&slug=",
    {Slug}
  ),
  ""
)
```

---

### Table 13: 👤 Authors

| Field | Type | Options/Notes |
|-------|------|---------------|
| Name | Single line text | |
| Slug | Formula | |
| Avatar | Attachment | |
| Bio | Long text | |
| Twitter | URL | |
| Instagram | URL | |

---

### Table 14: 🏷️ Categories

| Field | Type | Options/Notes |
|-------|------|---------------|
| Name | Single line text | |
| Slug | Formula | |
| Description | Long text | |
| Color | Single line text | Hex |

**Examples:**
- Tea Reviews
- Brewing Guides
- Tea Culture
- Vendor Spotlights
- Tea Recipes
- Teaware
- Gongfu Fundamentals

---

### Table 15: 📊 Referral Clicks

For tracking affiliate performance:

| Field | Type | Options/Notes |
|-------|------|---------------|
| Vendor | Link → Vendors | |
| Timestamp | Created time | |
| Source Page | Single line text | /teas/gaba-shen |
| UTM Source | Single line text | |
| UTM Medium | Single line text | |
| UTM Campaign | Single line text | |
| Country | Single line text | |
| Converted | Checkbox | Mark manually if you know |
| Order Value | Currency | If known |

---

## Step 12: Pre-populate Lookup Tables

Add your initial values to:

1. **Tea Types** - Add the 9 main types
2. **Varietals** - Add 20-30 common ones
3. **Flavor Notes** - Add 50+ from the categories
4. **Aroma Notes** - Add 50+ (can duplicate from flavor)
5. **Mouthfeel** - Add 15-20 options
6. **Finish Qualities** - Add 10-15 options
7. **Growing Conditions** - Add 15-20 options
8. **Categories** - Add your blog categories
9. **Authors** - Add yourself and friend

---

## Step 13: Build Airtable Interfaces

### Interface 1: Quick Tea Rating (Mobile)
- **Type:** Form
- **Fields:** Tea (lookup), Rating, Quick flavor picks, Quick notes
- **Use:** While drinking tea

### Interface 2: Full Tasting Session (Tablet)
- **Type:** Record review
- **Layout:** Tea selector on left, full session form on right
- **Use:** Detailed tasting notes

### Interface 3: Tea Collection (Desktop)
- **Type:** Gallery
- **Grouped by:** Status or Tea Type
- **Use:** Browse your collection

### Interface 4: Blog Writing (Desktop)
- **Type:** Form + Record review
- **Layout:** Metadata sidebar, main content area
- **Use:** Writing posts

### Interface 5: Vendor Management
- **Type:** List
- **Use:** Managing partnerships, referral tracking

---

## Step 14: Add Sample Content

Before development, add:
- 3-5 teas with full details
- 2-3 tasting sessions
- 1-2 vendors
- 1 draft blog post

This gives you real data to develop against.

---

### Table 16: 💧 Water Profiles

Track waters you've tried and their characteristics:

| Field | Type | Options/Notes |
|-------|------|---------------|
| Name | Single line text | "Volvic", "Home Filtered", etc. |
| Type | Single select | `Filtered`, `Spring (Bottled)`, `Spring (Source)`, `Mineral`, `Distilled`, `RO`, `RO (Remineralized)`, `Tap`, `Well` |
| Brand | Single line text | If commercial |
| Source | Single line text | Location if natural source |
| TDS (ppm) | Number | Total dissolved solids |
| pH | Number | If known |
| Notes | Long text | How it affects tea |
| Best For | Link → Tea Types | Which teas it suits |
| Rating | Rating (1-5) | Overall quality for tea |
| Cost | Single line text | "$2/gallon", "free", etc. |
| Sessions | Link → Tasting Sessions | Reverse link |

**Why track water?**
- Soft water (low TDS) → brighter, more delicate
- Hard water (high TDS) → fuller body, can mute aromatics
- Spring water often hits a sweet spot
- Some teas demand specific water

**TDS Reference:**
| TDS (ppm) | Classification | Notes |
|-----------|---------------|-------|
| 0-50 | Very soft | Distilled/RO, can taste flat |
| 50-100 | Soft | Good for delicate teas |
| 100-200 | Medium | Versatile |
| 200-400 | Hard | Fuller body, less clarity |
| 400+ | Very hard | Usually too mineral-heavy |

---

# Discovery Engine Architecture

## Similarity Dimensions

The discovery engine finds similar teas across multiple dimensions:

| Dimension | Fields Used | Weight |
|-----------|-------------|--------|
| **Flavor Profile** | Linked Flavor Notes | 30% |
| **Aroma Profile** | Linked Aroma Notes | 15% |
| **Origin** | Country + Region + Specific | 20% |
| **Terroir** | Elevation, Wild/Plantation | 10% |
| **Harvest** | Season, Year, First Flush | 10% |
| **Vendor** | Same vendor | 5% |
| **Type** | Tea Type + Varietal | 10% |

## Similarity Algorithm

```typescript
// lib/similarity.ts

interface TeaSimilarity {
  tea: Tea;
  score: number;
  matchReasons: string[];
}

export function findSimilarTeas(
  sourceTea: Tea,
  allTeas: Tea[],
  limit = 10
): TeaSimilarity[] {
  
  return allTeas
    .filter(t => t.id !== sourceTea.id)
    .map(tea => {
      const reasons: string[] = [];
      let score = 0;
      
      // Flavor overlap (Jaccard similarity)
      const flavorScore = jaccardSimilarity(
        sourceTea.flavorNotes,
        tea.flavorNotes
      );
      score += flavorScore * 30;
      if (flavorScore > 0.5) {
        const shared = intersection(sourceTea.flavorNotes, tea.flavorNotes);
        reasons.push(`Similar ${shared.slice(0,2).join(', ')} notes`);
      }
      
      // Aroma overlap
      const aromaScore = jaccardSimilarity(
        sourceTea.aromaNotes,
        tea.aromaNotes
      );
      score += aromaScore * 15;
      
      // Origin matching
      if (sourceTea.originCountry === tea.originCountry) {
        score += 10;
        if (sourceTea.originRegion === tea.originRegion) {
          score += 10;
          reasons.push(`Same region (${tea.originRegion})`);
        }
      }
      
      // Elevation (within 300m)
      if (sourceTea.elevation && tea.elevation) {
        const elevDiff = Math.abs(sourceTea.elevation - tea.elevation);
        if (elevDiff < 300) {
          score += 10 * (1 - elevDiff / 300);
          reasons.push(`Similar elevation (~${tea.elevation}m)`);
        }
      }
      
      // Harvest season
      if (sourceTea.harvestSeason === tea.harvestSeason) {
        score += 5;
        reasons.push(`Same harvest season`);
      }
      
      // Harvest year (within 2 years)
      if (sourceTea.harvestYear && tea.harvestYear) {
        const yearDiff = Math.abs(sourceTea.harvestYear - tea.harvestYear);
        if (yearDiff <= 2) {
          score += 5 * (1 - yearDiff / 2);
        }
      }
      
      // Same vendor
      if (sourceTea.vendor === tea.vendor) {
        score += 5;
        reasons.push(`Same vendor`);
      }
      
      // Tea type
      if (sourceTea.teaType === tea.teaType) {
        score += 7;
        if (sourceTea.varietal === tea.varietal) {
          score += 3;
        }
      }
      
      return { tea, score, matchReasons: reasons.slice(0, 2) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersect = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersect.size / union.size;
}

function intersection(a: string[], b: string[]): string[] {
  const setB = new Set(b);
  return a.filter(x => setB.has(x));
}
```

## Radar Chart Data Structure

Normalize flavor notes into radar-friendly categories:

```typescript
// lib/radar.ts

// Master flavor categories for radar charts
const RADAR_CATEGORIES = [
  'Sweet',
  'Floral', 
  'Fruity',
  'Vegetal',
  'Earthy',
  'Woody',
  'Roasted',
  'Mineral',
] as const;

// Map individual notes to categories
const FLAVOR_TO_CATEGORY: Record<string, typeof RADAR_CATEGORIES[number]> = {
  // Sweet
  'Honey': 'Sweet',
  'Brown Sugar': 'Sweet',
  'Caramel': 'Sweet',
  'Molasses': 'Sweet',
  'Vanilla': 'Sweet',
  
  // Floral
  'Orchid': 'Floral',
  'Rose': 'Floral',
  'Jasmine': 'Floral',
  'Osmanthus': 'Floral',
  
  // Fruity
  'Apricot': 'Fruity',
  'Peach': 'Fruity',
  'Citrus': 'Fruity',
  'Berry': 'Fruity',
  
  // etc...
};

export function buildRadarData(
  flavorNotes: Array<{ name: string; intensity?: number }>
): Record<string, number> {
  const radar: Record<string, number> = {};
  
  // Initialize all categories to 0
  RADAR_CATEGORIES.forEach(cat => radar[cat] = 0);
  
  // Aggregate intensities by category
  const counts: Record<string, number> = {};
  RADAR_CATEGORIES.forEach(cat => counts[cat] = 0);
  
  flavorNotes.forEach(note => {
    const category = FLAVOR_TO_CATEGORY[note.name];
    if (category) {
      radar[category] += note.intensity || 2; // default intensity 2
      counts[category]++;
    }
  });
  
  // Average and normalize to 0-5 scale
  RADAR_CATEGORIES.forEach(cat => {
    if (counts[cat] > 0) {
      radar[cat] = Math.min(5, radar[cat] / counts[cat]);
    }
  });
  
  return radar;
}
```

## Discovery Queries

### Similar by Flavor Profile
```typescript
export async function getSimilarByFlavor(teaId: string, limit = 5) {
  const tea = await getTeaById(teaId);
  const allTeas = await getTeas();
  
  return findSimilarTeas(tea, allTeas, limit)
    .filter(t => t.matchReasons.some(r => r.includes('notes')));
}
```

### Similar by Region
```typescript
export async function getSimilarByRegion(teaId: string, limit = 5) {
  const tea = await getTeaById(teaId);
  
  return getTeas({
    filterByFormula: `AND(
      {Origin Country} = '${tea.originCountry}',
      {Origin Region} = '${tea.originRegion}',
      RECORD_ID() != '${teaId}'
    )`,
  });
}
```

### Similar by Elevation Band
```typescript
export async function getSimilarByElevation(teaId: string, range = 300) {
  const tea = await getTeaById(teaId);
  if (!tea.elevation) return [];
  
  const min = tea.elevation - range;
  const max = tea.elevation + range;
  
  return getTeas({
    filterByFormula: `AND(
      {Elevation} >= ${min},
      {Elevation} <= ${max},
      RECORD_ID() != '${teaId}'
    )`,
  });
}
```

### Similar by Growing Conditions
```typescript
export async function getSimilarByGrowing(teaId: string) {
  const tea = await getTeaById(teaId);
  
  // Find teas with overlapping growing conditions
  const conditions = tea.growingConditions; // e.g., ['Shade Grown', 'High Altitude']
  
  return getTeas()
    .then(teas => teas.filter(t => {
      if (t.id === teaId) return false;
      const overlap = t.growingConditions.filter(c => conditions.includes(c));
      return overlap.length >= 1;
    }));
}
```

### Teas by Vendor (with stats)
```typescript
export async function getVendorProfile(vendorSlug: string) {
  const vendor = await getVendorBySlug(vendorSlug);
  const teas = await getTeas({ vendor: vendor.id });
  
  return {
    vendor,
    teas,
    stats: {
      totalTeas: teas.length,
      avgRating: average(teas.map(t => t.rating)),
      topTypes: countBy(teas, 'teaType'),
      topRegions: countBy(teas, 'originRegion'),
      priceRange: {
        min: Math.min(...teas.map(t => t.pricePerGram)),
        max: Math.max(...teas.map(t => t.pricePerGram)),
      },
    },
  };
}
```

## Airtable Views for Discovery

Create these Views in your Teas table:

| View Name | Filter/Group | Purpose |
|-----------|--------------|---------|
| By Region | Group by Country → Region | Browse origins |
| By Type | Group by Tea Type | Browse categories |
| By Vendor | Group by Vendor | Shop by source |
| By Season | Group by Harvest Season | Seasonal browsing |
| High Altitude | Filter: Elevation > 1500m | Terroir discovery |
| Ancient Tree | Filter: Wild/Plantation = "Ancient Tree" | Premium discovery |
| Top Rated | Sort by Rating desc | Best teas |
| Budget Finds | Filter: Price Per Gram < $0.50, Rating >= 4 | Value picks |

## URL Structure for Discovery

```
/teas                           # All teas
/teas?type=oolong               # Filter by type
/teas?region=yunnan             # Filter by region
/teas?vendor=white2tea          # Filter by vendor
/teas?flavor=honey,floral       # Filter by flavor
/teas?elevation=high            # High altitude (>1500m)
/teas?season=spring             # Spring harvest
/teas?sort=rating               # Sort options

/teas/[slug]                    # Individual tea
/teas/[slug]/similar            # Similar teas page

/discover                       # Discovery hub
/discover/regions               # Explore by region
/discover/flavors               # Flavor explorer
/discover/vendors               # Vendor directory
/discover/radar                 # Compare teas visually

/vendors/[slug]                 # Vendor profile + their teas
/regions/[country]/[region]     # Region deep-dive
/flavors/[flavor]               # All teas with this note
```

---

# Phase 3: Development (Day 5-14)

## Step 15: Scaffold Next.js Project

```bash
npx create-next-app@latest two-buds-and-a-leaf \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd two-buds-and-a-leaf
```

## Step 16: Install Dependencies

```bash
npm install airtable @vercel/analytics

# For Markdown rendering
npm install react-markdown remark-gfm

# For images
npm install sharp

# shadcn/ui (optional, for base components)
npx shadcn@latest init
```

## Step 17: Set Up Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   │
│   ├── teas/
│   │   ├── page.tsx              # Tea library
│   │   └── [slug]/
│   │       └── page.tsx          # Individual tea
│   │
│   ├── sessions/
│   │   └── [id]/
│   │       └── page.tsx          # Tasting session
│   │
│   ├── vendors/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── flavors/
│   │   └── [slug]/
│   │       └── page.tsx          # Teas by flavor
│   │
│   ├── go/
│   │   └── [vendor]/
│   │       └── route.ts          # Referral redirects
│   │
│   └── api/
│       ├── preview/
│       │   └── route.ts
│       ├── exit-preview/
│       │   └── route.ts
│       └── revalidate/
│           └── route.ts
│
├── components/
│   ├── ui/                       # Base components
│   ├── tea-card.tsx
│   ├── tea-filters.tsx
│   ├── session-card.tsx
│   ├── flavor-badge.tsx
│   ├── aroma-badge.tsx
│   ├── mouthfeel-badge.tsx
│   ├── rating-stars.tsx
│   ├── brewing-params.tsx
│   ├── vendor-card.tsx
│   ├── referral-button.tsx
│   ├── blog-post-card.tsx
│   ├── preview-banner.tsx
│   ├── tea-gallery.tsx           # Dry/wet/liquor photos
│   └── steep-timeline.tsx        # Visual steep progression
│
├── lib/
│   ├── airtable/
│   │   ├── client.ts             # Base client
│   │   ├── teas.ts               # Tea queries
│   │   ├── sessions.ts           # Session queries
│   │   ├── vendors.ts
│   │   ├── posts.ts
│   │   ├── flavors.ts
│   │   └── types.ts              # TypeScript types
│   └── utils.ts
│
└── styles/
    └── tokens.ts                 # Design system
```

## Step 18: Create Environment Variables

In project root, create `.env.local`:

```bash
# Airtable
AIRTABLE_API_KEY=pat_xxxxxxxxxxxxx
AIRTABLE_BASE_ID=appXXXXXXXXXXX

# Secrets
PREVIEW_SECRET=generate-random-string-here
REVALIDATE_SECRET=generate-another-random-string

# Site
NEXT_PUBLIC_SITE_URL=https://twobudsandaleaf.com
```

## Step 19: Add to Vercel

1. Go to vercel.com/dashboard
2. **Add New Project**
3. Import your GitHub repo
4. Add environment variables (same as .env.local)
5. Deploy

## Step 20: Connect Domain in Vercel

1. In project settings → Domains
2. Add `twobudsandaleaf.com`
3. Add `www.twobudsandaleaf.com`
4. Vercel will verify DNS (already configured in Step 7)

## Step 21: Build Airtable Integration

Create the client and type definitions matching your schema.

## Step 22: Build Pages & Components

Priority order:
1. Layout + design system
2. Tea card + tea list page
3. Individual tea page
4. Tasting session display
5. Vendor pages
6. Blog pages
7. Flavor/filter pages

## Step 23: Add Preview Mode

Implement draftMode() for previewing unpublished content.

## Step 24: Set Up Airtable Webhooks

In Airtable Automations:
1. Trigger: When record matches conditions (Status = Published)
2. Action: Send webhook to `/api/revalidate`

## Step 25: Add Analytics

```tsx
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

# Phase 4: Pre-Launch Checklist

- [ ] 5+ teas with full data
- [ ] 3+ tasting sessions
- [ ] 2-3 vendors set up
- [ ] 2-3 blog posts (1 published, others scheduled)
- [ ] All pages rendering correctly
- [ ] Mobile responsive
- [ ] Preview mode working
- [ ] Referral links tracking
- [ ] Sitemap at /sitemap.xml
- [ ] robots.txt configured
- [ ] OG images generating
- [ ] Page speed score 90+

---

# Phase 5: Launch

1. Merge to main branch
2. Vercel auto-deploys
3. Submit sitemap to Google Search Console
4. Announce!
