// =====================================================================
// GLOSSARY — tea types, brewing methods, vessels, flavor terms, mouthfeel
// =====================================================================
// Two layers per entry: a plain-language "lay" definition for newcomers,
// and a tighter technical paragraph for experienced drinkers. Cross-refs
// use slugs and resolve through glossaryEntryBySlug.

export type GlossarySectionKey =
  | "tea-types"
  | "brewing-methods"
  | "brewing-vessels"
  | "flavor-terms"
  | "mouthfeel";

export type GlossaryEntry = {
  /** URL-safe id, lowercase + hyphens, used for #anchor + tooltip lookups */
  slug: string;
  /** Display name as users would type it */
  term: string;
  /** Original-script form when relevant (Chinese, Japanese, etc.) */
  original?: string;
  /** Other names / search aliases — e.g. ["sheng pu'er", "raw pu'er", "生普"] */
  aliases?: string[];
  /** 1–2 sentence lay definition. ≤ 240 chars. */
  lay: string;
  /** One-paragraph technical / historical detail. ~60–120 words. */
  technical: string;
  /** Cross-references — slugs of other entries to link */
  related?: string[];
};

export type GlossarySection = {
  key: GlossarySectionKey;
  title: string;
  /** One-sentence section intro */
  intro: string;
  entries: GlossaryEntry[];
};

// =====================================================================
// SECTION 1 — TEA TYPES
// =====================================================================

const TEA_TYPES: GlossarySection = {
  key: "tea-types",
  title: "Tea types",
  intro:
    "Every true tea comes from one plant, Camellia sinensis. The category names below describe what was done to the leaf after picking — not where it grew.",
  entries: [
    {
      slug: "green",
      term: "Green tea",
      original: "绿茶 / lǜchá",
      aliases: ["lucha", "green"],
      lay: "Tea leaves heated quickly after picking so they stay green and grassy. Bright, vegetal, and best drunk fresh.",
      technical:
        "Green tea is unoxidized: the kill-green step (杀青, shāqīng) deactivates polyphenol oxidase within hours of picking, locking in chlorophyll and the fresh-leaf chemistry. Two main fixing methods diverge sharply in flavor — Chinese greens like Longjing are pan-fried in a wok, which adds chestnut and toasted-grain notes, while Japanese greens (sencha, gyokuro) are steamed, which preserves a deeper marine umami and a brighter green color. Greens are at their best within a year of harvest, and pre-Qingming pickings (before April 5) are the most prized for their concentrated amino acids.",
      related: ["pre-qingming", "vegetal", "marine", "longjing-method", "kyusu-brewing"],
    },
    {
      slug: "white",
      term: "White tea",
      original: "白茶 / báichá",
      aliases: ["baicha"],
      lay: "Tea made by simply withering the fresh leaves and drying them — the least-processed category. Soft, honeyed, often patient.",
      technical:
        "White tea undergoes minimal processing: a long, controlled wither (sometimes 36–60 hours) followed by a low-temperature dry. There is no rolling and no deliberate kill-green, so a small amount of oxidation occurs during the wither — making 'unoxidized' a slight oversimplification. The Fuding and Zhenghe districts of Fujian are the historical home, and the cultivars (Da Bai, Da Hao) carry the silver-tipped buds the category is known for. Aged white tea (老白茶) is increasingly common; the leaves darken and develop dried-fruit and medicinal notes over five-plus years.",
      related: ["honey", "oxidation", "western"],
    },
    {
      slug: "yellow",
      term: "Yellow tea",
      original: "黄茶 / huángchá",
      aliases: ["huangcha"],
      lay: "A rare Chinese category that's like green tea with the edges rounded off — softer, sweeter, less grassy.",
      technical:
        "Yellow tea sits between green and lightly oxidized teas. After kill-green, the warm, damp leaves are wrapped in cloth or paper for a non-enzymatic 'sealed yellowing' step (闷黄, mènhuáng) lasting hours to days. The result is gentler astringency, a mellower vegetal character, and a faint corn-silk sweetness. Junshan Yinzhen (Hunan) and Mengding Huangya (Sichuan) are the canonical examples. Production is small and shrinking — many commercial 'yellows' are actually greens — so authentic provenance matters when buying.",
      related: ["green", "vegetal", "sweet"],
    },
    {
      slug: "oolong",
      term: "Oolong",
      original: "乌龙茶 / wūlóngchá",
      aliases: ["wulong", "wu long"],
      lay: "The middle category — partially oxidized teas that range from nearly green and floral to nearly black and roasted. Designed to reward gongfu brewing.",
      technical:
        "Oolong covers a wide oxidation range (roughly 15–80%) and splits into two stylistic families. Green-style or 'jade' oolongs — Anxi Tieguanyin, Taiwanese Jin Xuan, Alishan — are tightly rolled into pellets, lightly oxidized, and emphasize orchid and milk-cream notes. Roasted/strip-style oolongs include Wuyi yancha (rock teas like Da Hong Pao, Rou Gui) and Phoenix dancong from Guangdong, which are twisted long, more heavily oxidized, and finished over charcoal. Dancong is famous for varietal mimicry — single bushes producing honey-orchid, almond, or duck-shit-aroma cultivars.",
      related: ["floral", "roasted", "gongfu", "yixing"],
    },
    {
      slug: "black",
      term: "Black tea",
      original: "红茶 / hóngchá",
      aliases: ["hongcha", "red tea"],
      lay: "Fully oxidized tea — what most of the West calls 'black' and what China calls 'red' (红茶). Malty, sweet, dark.",
      technical:
        "The naming gap matters: in Chinese, 红茶 (hóngchá, 'red tea') refers to fully oxidized whole-leaf teas like Dianhong, Keemun, and Lapsang Souchong, while 黑茶 (hēichá, 'black tea') is a different category — post-fermented dark teas. Western-style black tea, often CTC-processed (crush-tear-curl) for tea bags, comes mostly from Assam, Sri Lanka, and Kenya, and is bred for body and color extraction in milk-and-sugar service. The distinction matters when reading sourcing notes: a Chinese 'black' tea is structurally a red, and the leaf style and brewing approach reflect that.",
      related: ["hei-cha", "oxidation", "first-flush"],
    },
    {
      slug: "pu-er",
      term: "Pu'er",
      original: "普洱",
      aliases: ["puer", "pu-erh", "pu'erh"],
      lay: "A category of fermented tea from Yunnan that comes in two very different forms — raw (sheng) and cooked (shou). Pressed into cakes and meant to age.",
      technical:
        "Pu'er is defined geographically (Yunnan province) and by cultivar (large-leaf Camellia sinensis var. assamica). It is the most famous member of the broader hei-cha family. Two production paths diverge after the leaves are sun-dried into maocha: sheng (生, raw) is pressed and left to age slowly through microbial and enzymatic activity over years to decades; shou (熟, ripe/cooked) is wet-piled in a 45–60 day fermentation that simulates aging in roughly two months. The two taste nothing alike. Pu'er is typically pressed into cakes (饼, bǐng), bricks, or tuocha for storage.",
      related: ["sheng-puer", "shou-puer", "hei-cha", "huigan"],
    },
    {
      slug: "sheng-puer",
      term: "Sheng pu'er",
      original: "生普 / shēng pǔ'ěr",
      aliases: ["sheng", "raw pu'er", "生茶", "生普洱"],
      lay: "Raw pu'er — pressed but not cooked, left to age slowly. Young sheng can be sharp and floral; aged sheng turns deep, woody, and sweet.",
      technical:
        "Sheng is the older and more traditional of the two pu'er types. After picking, the leaves are kill-greened (lighter than for green tea), rolled, sun-dried into maocha, and steam-pressed into cakes. Aging happens slowly — initial bitterness and astringency mellow over five to fifteen years as polyphenols polymerize and microbes work on the cake. Storage humidity matters enormously: dry-stored Kunming sheng ages cleanly and slowly, while traditional Hong Kong/Guangdong wet storage accelerates the process at the cost of cleaner flavor. Quality young sheng shows huigan and qi even before aging begins.",
      related: ["pu-er", "shou-puer", "huigan", "qi", "hei-cha"],
    },
    {
      slug: "shou-puer",
      term: "Shou pu'er",
      original: "熟普 / shóu pǔ'ěr",
      aliases: ["shou", "shu", "ripe pu'er", "cooked pu'er", "熟茶"],
      lay: "Ripe pu'er — fermented in a pile over weeks to mimic decades of aging. Earthy, smooth, dark, and ready to drink immediately.",
      technical:
        "Shou is a modern style, developed at the Kunming Tea Factory in 1973 to meet Hong Kong demand for aged-tasting pu'er without the wait. The defining process is wo dui (渥堆, wet-piling): maocha is heaped, sprayed with water, and turned over 45–60 days while controlled microbial fermentation (notably Aspergillus species) transforms the leaf. The result is dark, soft, low-astringency tea with characteristic earth, wet-wood, and dark-cocoa notes. Good shou loses any 'pile' funk within a year or two of production. Shou does age, but the gains are subtler than with sheng.",
      related: ["pu-er", "sheng-puer", "earthy", "hei-cha"],
    },
    {
      slug: "hei-cha",
      term: "Hei cha",
      original: "黑茶 / hēichá",
      aliases: ["heicha", "dark tea", "post-fermented tea"],
      lay: "The umbrella category of Chinese fermented teas. Pu'er is the famous one, but Anhua, Liu Bao, and Fu Zhuan all live here too.",
      technical:
        "Hei cha (literally 'black tea') is the post-fermented category — teas that undergo deliberate microbial fermentation, distinct from the enzymatic oxidation of red/black teas. Pu'er is the best-known member, but the family extends to Hunan's Anhua hei cha (often pressed into bricks), Guangxi's Liu Bao (basket-aged, betel-nut and woody notes), and Fu Zhuan, which intentionally cultivates 'golden flowers' (Eurotium cristatum) within the brick. Many were historically border teas, traded by horseback to Tibet and Mongolia. The umami-savory, mellow profile across the category reflects shared microbial chemistry rather than shared geography.",
      related: ["pu-er", "sheng-puer", "shou-puer", "earthy", "oxidation"],
    },
    {
      slug: "herbal-tisane",
      term: "Herbal tisane",
      aliases: ["tisane", "herbal tea", "herbal infusion"],
      lay: "Not actually tea. Anything brewed from leaves, flowers, or roots that aren't Camellia sinensis — chamomile, rooibos, mint, and so on.",
      technical:
        "Strictly, 'tea' refers only to infusions of Camellia sinensis. Tisane (the French term) covers everything else: chamomile, peppermint, rooibos (Aspalathus linearis, from South Africa), tulsi, hibiscus, yerba mate (Ilex paraguariensis), and the various 'flowering teas' of Chinese herbalism. Most contain no caffeine; mate and yaupon are the notable exceptions. The chemistry is entirely different — no theanine, no catechins, no oxidation pathway — so brewing parameters and flavor vocabulary borrowed from real tea often don't translate. We cover tisanes occasionally but treat them as their own category.",
      related: [],
    },
    {
      slug: "pre-qingming",
      term: "Pre-Qingming",
      original: "明前 / míngqián",
      aliases: ["mingqian", "pre-qing ming", "before qingming"],
      lay: "Tea picked before the Qingming festival in early April — the earliest, smallest, most sought-after spring harvest in China.",
      technical:
        "Qingming (清明节) falls on April 4 or 5. Tea picked before that date — míngqián (明前) — comes from the first new growth after winter dormancy and contains the highest concentrations of amino acids (theanine in particular) and the lowest of bitter polyphenols. The category is most meaningful for green tea (Longjing, Biluochun, Huangshan Maofeng), where the freshness and amino-acid sweetness define the cup. Yields are small and prices climb steeply. The slightly later yǔqián (雨前, before Grain Rain on April 20) is a step down in price but often very close in quality.",
      related: ["green", "first-flush", "longjing-method"],
    },
    {
      slug: "first-flush",
      term: "First flush",
      aliases: ["first-flush", "spring flush"],
      lay: "Indian tea term for the first picking of spring, especially in Darjeeling. Bright, light, and floral — quite different from later harvests.",
      technical:
        "First flush refers to the spring harvest (March–April) on Indian estates, Darjeeling most famously. The leaves are typically lightly oxidized — closer to oolong than to a standard black — and produce a pale, muscatel-floral cup. Second flush (May–June) is heavier-bodied, more oxidized, and shows the classic muscatel grape note Darjeeling is known for. The term is sometimes borrowed in Sri Lanka and Nepal but rarely applied to Chinese teas, where pre-Qingming and the season-name lexicon (春茶, 秋茶) do similar work. The categorical distinction from pre-Qingming is geographic and processing-based, not just calendrical.",
      related: ["pre-qingming", "black", "oxidation"],
    },
    {
      slug: "terroir",
      term: "Terroir",
      aliases: ["terroir"],
      lay: "Borrowed from wine — the idea that a tea tastes the way it does because of its specific place: soil, altitude, weather, surrounding plants.",
      technical:
        "Tea terroir gets serious treatment in regions where single-mountain or single-village sourcing is the norm — Wuyi yancha (rock teas grown in mineral-rich cliff soils), Yunnan ancient-tree pu'er (gushu, where individual mountains like Lao Banzhang, Bingdao, and Yiwu have distinct profiles), and Japanese gyokuro (where the shading microclimate is part of the production). Altitude, soil mineral content, surrounding vegetation, fog cover, and the cultivar all contribute. The concept is real but easy to overstate — processing decisions usually shape a finished tea more than terroir does. Treat sourcing claims with the same skepticism you'd bring to a single-vineyard wine.",
      related: ["pu-er", "oolong", "mineral"],
    },
    {
      slug: "oxidation",
      term: "Oxidation",
      aliases: ["oxidation"],
      lay: "What happens when you bruise an apple and it goes brown. In tea, it's the controlled enzymatic step that determines whether you end up with green, oolong, or black tea.",
      technical:
        "Oxidation in tea is enzymatic: polyphenol oxidase (PPO) in the bruised or rolled leaf converts catechins into theaflavins and thearubigins, darkening the leaf and shifting the flavor toward malt, fruit, and dried-fruit notes. Producers control the depth by managing time, humidity, and temperature, then halt it with heat (kill-green for green tea, firing for oolong and black). Critically, oxidation is not the same as fermentation, even though the words are often used interchangeably. Fermentation involves microbes; oxidation does not. Pu'er and other hei cha are fermented; black tea is oxidized. The distinction matters for shelf life and aging behavior.",
      related: ["green", "black", "oolong", "hei-cha"],
    },
    {
      slug: "tds",
      term: "TDS (water)",
      aliases: ["tds", "total dissolved solids"],
      lay: "Total dissolved solids — how much mineral content is in your brewing water. It changes the cup more than most people realize.",
      technical:
        "TDS measures the mineral content of water in parts per million (ppm), readable with a cheap pen meter. The sweet spot for most tea is 30–80 ppm; below that, water tastes flat and extracts thinly, above it, minerals compete with the tea's own profile. Specific ions matter as much as total count: calcium and magnesium boost body and mouthfeel; bicarbonate buffers and rounds; chloride and high sodium dull. Vivek's session notes often log TDS because hard tap water can flatten a high-mountain oolong and mineral-poor RO water can hollow out a sheng. Bottled spring water (Volvic, Crystal Geyser) is a common reliable middle ground.",
      related: ["mineral", "gongfu", "western"],
    },
  ],
};

// =====================================================================
// SECTION 2 — BREWING METHODS
// =====================================================================

const BREWING_METHODS: GlossarySection = {
  key: "brewing-methods",
  title: "Brewing methods",
  intro:
    "How you brew a tea changes the cup as much as what tea you use. These are the five approaches we reach for, and when each one matters.",
  entries: [
    {
      slug: "gongfu",
      term: "Gongfu",
      original: "功夫茶 / gōngfū chá",
      aliases: ["gong fu", "kung fu tea", "gongfu cha"],
      lay: "The Chinese method of brewing small amounts of tea with lots of leaf and very short steeps, repeated many times. The way most of the teas on this site are reviewed.",
      technical:
        "Gongfu (literally 'tea with skill/effort') uses a high leaf-to-water ratio — typically 5–8 g per 100 ml — in a small vessel like a gaiwan or yixing pot. First steeps run flash-short (5–15 seconds) and lengthen as the leaf gives up its solubles. Eight to fifteen steeps from a single charge is normal for a good oolong or pu'er, and each cup is a meaningful update on the last. The method developed in Chaozhou, Guangdong over the last few centuries and is now the default for serious appreciation of oolong, pu'er, and many reds. The point isn't ceremony; it's resolution.",
      related: ["gaiwan", "yixing", "western", "oolong", "pu-er"],
    },
    {
      slug: "western",
      term: "Western brewing",
      aliases: ["western", "western style"],
      lay: "One leaf, one long steep, done. The method most people learn first — a teaspoon of leaves in a mug or pot, three to five minutes, drink.",
      technical:
        "Western-style brewing uses a low leaf-to-water ratio (roughly 1 g per 100 ml, give or take) and a single long extraction of 3–5 minutes. It works well for fully oxidized teas (most blacks, herbal blends) and for whites that need a long contact time to release their honeyed character. It's poorly suited to oolong or pu'er, where stacked short steeps reveal a tea's arc that western brewing flattens. A second steep is possible but rarely as good as the first. Convenient, forgiving, and the right method for a workday cup.",
      related: ["gongfu", "white", "black", "mug"],
    },
    {
      slug: "grandpa",
      term: "Grandpa style",
      original: "老人法",
      aliases: ["grandpa", "grandpa style", "lao ren cha", "leaves in cup"],
      lay: "Throw a pinch of leaves directly in your mug, top up with hot water, and just keep drinking. Top up the water as you go.",
      technical:
        "Grandpa style is the everyday Chinese way — what working people drink at desks all day. The leaves stay in the cup; you sip past them, refill the water when the cup is half empty, and the brew gradually weakens over hours. It works best with leaf that doesn't punish over-extraction: pre-Qingming greens (Longjing especially), light oolongs, and mild whites. Use less leaf than you think — 2–3 g in a 200–300 ml mug — and slightly cooler water. The method strips ceremony to nothing and is still completely satisfying for most everyday teas.",
      related: ["western", "green", "mug"],
    },
    {
      slug: "cold-brew",
      term: "Cold brew",
      aliases: ["cold brew", "cold-brew", "cold brewing"],
      lay: "Steep leaves in cold water in the fridge for hours. The result is sweeter, smoother, and almost never bitter — but takes patience.",
      technical:
        "Cold-brewing tea uses 3–5 g per 500 ml in cool or refrigerated water for 4–12 hours. At low temperatures, catechins and caffeine extract slowly while amino acids (theanine, glutamate) extract relatively faster — shifting the balance toward sweetness and umami and away from bitterness and astringency. It works particularly well for greens (sencha, Longjing) and oolongs; pu'er and heavily roasted teas tend to read as flat. The method is forgiving and hard to over-extract, which makes it a safe option for unfamiliar teas. A glass jar in the fridge overnight is the whole apparatus.",
      related: ["green", "oolong", "vegetal"],
    },
    {
      slug: "kyusu-brewing",
      term: "Kyusu brewing",
      aliases: ["japanese brewing", "kyusu method", "shaded green brewing"],
      lay: "Japanese-style brewing for greens like gyokuro and shincha — very low water temperature (50–70 °C) and short steeps in a side-handle pot.",
      technical:
        "High-grade Japanese greens — gyokuro especially — are shaded for two to three weeks before harvest, which spikes amino-acid content (theanine, glutamate) and suppresses catechin formation. Brewed at normal temperatures, they taste flat or harsh; brewed at 50–60 °C in a kyusu, hohin, or shiboridashi for 90 seconds to 2 minutes, the umami front-end resolves cleanly. Sencha sits in the 70 °C range with shorter steeps. The leaf-to-water ratio runs higher than most western brewing — 5 g per 60–80 ml is standard for gyokuro. A second and third steep go progressively warmer and shorter.",
      related: ["kyusu", "hohin", "shiboridashi", "marine", "vegetal"],
    },
  ],
};

// =====================================================================
// SECTION 3 — BREWING VESSELS
// =====================================================================

const BREWING_VESSELS: GlossarySection = {
  key: "brewing-vessels",
  title: "Brewing vessels",
  intro:
    "The pot or cup is part of the recipe. Material, volume, and shape each push the cup in a particular direction.",
  entries: [
    {
      slug: "gaiwan",
      term: "Gaiwan",
      original: "盖碗 / gàiwǎn",
      aliases: ["gaiwan", "lidded bowl"],
      lay: "A small porcelain bowl with a lid and saucer — the most versatile gongfu vessel and the one we reach for most often.",
      technical:
        "The gaiwan ('lid-bowl') is the default tool for gongfu brewing across most Chinese teas. Porcelain is thermally neutral and non-reactive, so it neither absorbs flavor (the way unglazed clay does) nor adds anything to the cup — making it the right vessel for evaluating an unfamiliar tea. Common sizes run 80–150 ml; smaller is more demanding but gives finer control. The lid doubles as a strainer when pouring, and as a tool for smelling the wet leaf between steeps. A 100 ml gaiwan with 5–6 g of leaf is the workhorse setup for everything we review.",
      related: ["gongfu", "yixing", "oolong", "pu-er"],
    },
    {
      slug: "yixing",
      term: "Yixing pot",
      original: "宜兴 / yíxīng",
      aliases: ["yixing", "yixing teapot", "zisha", "purple clay"],
      lay: "An unglazed clay teapot from Yixing in Jiangsu. Devoted to one type of tea — it absorbs flavor and gives back a smoother, rounder cup over years of use.",
      technical:
        "Yixing pots are made from zisha (紫砂, 'purple sand') clay, a high-iron, mineral-rich material with microscopic pores that breathe and gradually absorb the volatile aromatics of whatever tea is brewed in it. Because of this, a single pot is dedicated to one tea category — you'd keep one for shou pu'er and another for roasted oolong, never mixing. Seasoning takes months to years. The clay's thermal mass softens astringency and rounds body, particularly flattering for shou and aged sheng. Authenticity is a real concern: most cheap 'yixing' pots online aren't, and even verified zisha varies enormously in quality and provenance.",
      related: ["gaiwan", "shou-puer", "oolong", "gongfu"],
    },
    {
      slug: "kyusu",
      term: "Kyusu",
      original: "急須 / きゅうす",
      aliases: ["kyusu", "japanese teapot"],
      lay: "A Japanese teapot with a side-mounted handle, used for sencha and other Japanese greens. Built around a fine mesh strainer for the small, broken leaves.",
      technical:
        "The classic kyusu has the handle at a 90° angle to the spout, designed for one-handed pouring of small volumes (typically 200–400 ml). The integrated mesh — sometimes a clay sieve, more often a fine stainless screen — handles the small leaf particles of Japanese steamed greens that would clog a standard strainer. Tokoname and Banko are the most respected ware; their high-iron clays are said to soften the tea (similar to yixing's effect, though debated). For gyokuro specifically, smaller handle-less vessels like the hohin and shiboridashi are preferred over a kyusu.",
      related: ["hohin", "shiboridashi", "kyusu-brewing", "marine"],
    },
    {
      slug: "hohin",
      term: "Hohin",
      original: "宝瓶 / ほうひん",
      aliases: ["hohin", "houhin"],
      lay: "A small handle-less Japanese pot for gyokuro. Held by the rim with cool water — the brewing temperatures are low enough that the body doesn't burn your fingers.",
      technical:
        "The hohin (宝瓶, 'treasure vessel') is purpose-built for gyokuro and high-grade sencha brewed at 50–60 °C. With no handle and a low brewing temperature, the pot is held lightly in two hands, encouraging the slow, attentive pour the tea is built around. Volumes are tiny — 80–150 ml — and the wide flat shape exposes maximum leaf surface to a small amount of water, which is the geometry the leaf-to-water ratio (5 g per 60–80 ml) demands. Like the kyusu, fine mesh strainers handle the small leaf particles of Japanese steamed greens.",
      related: ["kyusu", "shiboridashi", "kyusu-brewing", "marine"],
    },
    {
      slug: "shiboridashi",
      term: "Shiboridashi",
      original: "絞り出し / しぼりだし",
      aliases: ["shiboridashi"],
      lay: "An even simpler Japanese vessel for gyokuro — essentially a small lidded bowl with a pinched spout. Like a hohin without the spout structure.",
      technical:
        "Shiboridashi (絞り出し, 'wring-out') is the most minimal of the gyokuro vessels: a small open bowl with a lid that the lid itself, tilted, holds the leaves back during pouring. No mesh, no proper spout — control comes from the angle of your hand. Volumes run 70–120 ml. The shape favors very leafy, very low-temperature brewing where you want maximum interaction between water and leaf and minimum hardware between you and the tea. Use it once and you understand the design — it's the gaiwan's distant Japanese cousin.",
      related: ["hohin", "kyusu", "kyusu-brewing", "gaiwan"],
    },
    {
      slug: "glass-teapot",
      term: "Glass teapot",
      aliases: ["glass", "glass teapot", "glass pot"],
      lay: "Clear glass — used when you want to see the leaves unfurl. Common for whole-leaf greens like Longjing and for blooming teas.",
      technical:
        "Glass is thermally responsive and visually transparent, which makes it useful for two specific cases: brewing showcase greens like Longjing where watching the leaves dance in the cup is part of the experience, and any context where you're tracking liquor color (training your eye on oxidation level, or judging when a steep is ready). Glass cools faster than porcelain, which can help when brewing greens that don't want sustained high temperature. It absorbs no flavor, which means it never improves with use — but it also never compromises a tea. A reasonable backup vessel for almost any category.",
      related: ["green", "grandpa", "longjing-method"],
    },
    {
      slug: "mug",
      term: "Mug",
      aliases: ["mug", "cup"],
      lay: "Just a regular mug. The vessel for grandpa-style and the simplest western brewing — what most of the world's tea is drunk from.",
      technical:
        "The mug doesn't get much technical treatment, but choices still matter: ceramic and porcelain hold heat and don't react; stoneware retains warmth longest; glass cools quickest; metal-lined travel mugs can leach flavor. Volume is the key parameter — 200–300 ml is the comfortable range for grandpa style or western brewing. A wide opening lets aromatics escape; a tall narrow shape concentrates them. Most days, a mug is the right answer; we try not to be precious about it. Gongfu brewing demands different geometry, but the rest of the time, drink from what you have.",
      related: ["grandpa", "western"],
    },
  ],
};

// =====================================================================
// SECTION 4 — FLAVOR TERMS (12 advanced axes + herbal basic)
// =====================================================================

const FLAVOR_TERMS: GlossarySection = {
  key: "flavor-terms",
  title: "Flavor terms",
  intro:
    "The twelve advanced axes our radar charts use, plus the basic-mode rollups. Each entry names what the note actually is and where it tends to dominate.",
  entries: [
    {
      slug: "floral",
      term: "Floral",
      aliases: ["flowers", "perfumed"],
      lay: "Smells like flowers — orchid, jasmine, lilac, rose. Bright and high, sits at the top of the nose.",
      technical:
        "Floral notes in tea trace mainly to linalool, geraniol, and benzyl alcohol — the same monoterpenes that give jasmine and rose their characters. The note dominates lightly oxidized oolongs (Tieguanyin, Alishan, Baozhong), Phoenix dancong (which has named honey-orchid and magnolia cultivars), and high-grade Darjeeling first flush. Floral notes tend to peak in the second and third steeps of a gongfu session and fade noticeably after that as the leaf gives up its volatiles. They are temperature-sensitive: too hot and they cook off into something duller.",
      related: ["fruity", "oolong", "first-flush"],
    },
    {
      slug: "fruity",
      term: "Fruity",
      aliases: ["fruit", "stone fruit"],
      lay: "Smells like fruit — could be stone fruit (peach, apricot), citrus, dried fruit, or muscatel grape. Reads as sweet without being sugary.",
      technical:
        "Fruity notes in tea split into a few families. Stone-fruit (apricot, peach) shows in young sheng pu'er and high-mountain oolongs and is often a mark of well-handled leaf. Citrus and bergamot can come from the cultivar (yellow tea, some Yunnan reds). Muscatel — the wine-grape note — is the signature of second-flush Darjeeling, attributed in part to thrip-induced damage on the leaf. Dried-fruit notes (raisin, fig, longan) develop in aged whites and aged sheng. Compounds include various esters, lactones, and beta-damascenone.",
      related: ["floral", "sweet", "sheng-puer", "first-flush"],
    },
    {
      slug: "sweet",
      term: "Sweet",
      aliases: ["sweetness", "sugar"],
      lay: "Tea isn't sugary, but it can read sweet — the way fresh corn or sugar snap peas read sweet. Sits across the middle of the tongue.",
      technical:
        "Tea's sweetness comes mostly from amino acids (theanine, glutamate, asparagine) and small amounts of monosaccharides released during processing — not from anything you'd call sugar. Pre-Qingming greens (Longjing especially), shaded Japanese greens (gyokuro, kabuse), and well-aged white tea are the most sweetness-driven categories. The note often shows up at the back end of a sip rather than the front, and good sweetness often pairs with — and is enhanced by — huigan, the returning sweetness in the throat. Roasting and aging redistribute sugars; over-firing flattens them.",
      related: ["honey", "huigan", "green", "white"],
    },
    {
      slug: "honey",
      term: "Honey",
      aliases: ["honeyed"],
      lay: "Smells and tastes like honey — that specific waxy, floral, golden-sweet quality. Different from generic 'sweet'.",
      technical:
        "Honey notes are a specific subset of sweetness, dominant in well-made white tea (Silver Needle, Bai Mu Dan), Yunnan red teas (Dianhong, Jin Jun Mei), and aged sheng pu'er. Phenylacetaldehyde and methyl heptenone contribute the characteristic floral-honey aroma. The note typically deepens in the second through fourth steeps and is one of the markers of a well-made tea — it suggests long, careful withering and fully resolved oxidation. A 'cooked sugar' or burnt-honey character usually means processing was rushed or temperatures climbed too high during firing.",
      related: ["sweet", "white", "sheng-puer"],
    },
    {
      slug: "nutty",
      term: "Nutty",
      aliases: ["nuts", "almond", "hazelnut", "chestnut"],
      lay: "Like roasted nuts — chestnut, almond, hazelnut. Warm, dry, comforting.",
      technical:
        "Nutty notes are the signature of pan-fired Chinese greens: Longjing's chestnut (栗香, lìxiāng) is the textbook example, and Maofeng and Anji Baicha share similar profiles. The note develops through Maillard reactions during the wok firing and is enhanced by the careful pressing motion the leaves are subject to. Nuttiness also appears in light-roast oolongs and well-fired Wuyi yancha, where it overlaps with toasted-grain and toasted-bread characters. Pyrazines and furans formed in firing are the relevant compound families. Old, stale green tea loses this note first — fresh-leaf nuttiness is one of the markers of recent harvest.",
      related: ["roasted", "green", "longjing-method"],
    },
    {
      slug: "roasted",
      term: "Roasted",
      aliases: ["roast", "fired", "charcoal"],
      lay: "Like coffee, dark toast, or a charcoal fire. Deep, warm, sometimes a little smoky.",
      technical:
        "Roasted notes come from deliberate firing — most prominently in Wuyi yancha, traditional Tieguanyin (the older, charcoal-roasted style), and some shou pu'er. Charcoal roasting (炭焙, tànbèi) over weeks produces nuanced, layered roast notes; quick electric firing gives a flatter, sharper roast. The depth of roast is a stylistic choice that ranges from light (preserving floral character) to medium (caramelized, candied) to heavy (chocolate, smoke, cocoa). Heavily roasted oolongs typically need months of rest after firing for the roast to integrate; freshly roasted tea can taste harsh until it settles.",
      related: ["nutty", "oolong", "yixing"],
    },
    {
      slug: "woody",
      term: "Woody",
      aliases: ["wood"],
      lay: "Like wood — sandalwood, cedar, old library, dry bark. Earthy but cleaner and drier than 'earthy'.",
      technical:
        "Woody notes are the structural backbone of aged sheng pu'er — sandalwood, cedar, and aged-furniture aromas develop reliably in well-stored cakes after seven to ten years and deepen for decades. Aged white tea reaches a similar place. Compounds include various sesquiterpenes and the breakdown products of lignin in the stem material that older sheng often includes. 'Camphor' (樟香, zhāngxiāng) is a related and prized note, especially in older Yiwu sheng. The line between woody and earthy is fuzzy; woody trends drier and more aromatic, earthy trends damper and heavier.",
      related: ["earthy", "sheng-puer", "white"],
    },
    {
      slug: "earthy",
      term: "Earthy",
      aliases: ["earth", "soil", "forest floor"],
      lay: "Like wet soil, forest floor, or mushrooms. Heavy, damp, grounding — what shou pu'er tastes like at its best.",
      technical:
        "Earthy notes are the defining character of shou pu'er and many other hei cha (Liu Bao, aged Anhua), produced by the microbial fermentation of wet-piling. Geosmin — the same compound that smells like rain on dry earth — is the obvious driver. The line between good earthy and bad earthy is the line between damp-forest aromatics (clean, layered, with sweet edges) and 'pile funk' (acrid, ashy, dirty), which usually fades within a year of post-fermentation. In older sheng, earthiness emerges as a secondary character alongside woody and camphor notes rather than as the primary axis.",
      related: ["woody", "shou-puer", "hei-cha"],
    },
    {
      slug: "mineral",
      term: "Mineral",
      aliases: ["minerality", "stone", "rock"],
      lay: "Like wet stone or rain on rocks — savory but not salty. A 'cool' quality that lingers in the throat.",
      technical:
        "Mineral notes are the calling card of Wuyi rock teas (yancha — literally 'rock tea,' referencing the cliff-face terroir) and high-mountain pu'er. The character is hard to pin to specific compounds; it correlates with high-iron, high-silica growing soils and is enhanced by water mineral content (TDS) at brewing time. Mineral notes are often described as being felt as much as tasted — a coolness or weight at the back of the throat. They tend to deepen in the middle steeps of a gongfu session and are one of the markers experienced drinkers point to when distinguishing 'serious' from merely pleasant tea.",
      related: ["marine", "huigan", "tds", "oolong"],
    },
    {
      slug: "marine",
      term: "Marine",
      aliases: ["seaweed", "ocean", "umami", "oceanic"],
      lay: "Like the ocean — seaweed, kelp, sea-salt air. Savory and umami-rich.",
      technical:
        "Marine notes peak in shaded Japanese greens — gyokuro especially, where 21+ days of pre-harvest shading concentrates glutamate and theanine and produces a profile that overlaps with kelp-broth dashi. Lapsang Souchong and other smoked teas occupy the same axis from a different angle. The umami component is distinct from sweetness or saltiness; it's a savory depth that registers more as mouthfeel than flavor. Brewing temperature is critical — at 80 °C and above, the marine character collapses into vegetal harshness; at 50–60 °C it resolves cleanly. The note is closely related to mineral and often appears together with it.",
      related: ["mineral", "vegetal", "kyusu-brewing", "green"],
    },
    {
      slug: "vegetal",
      term: "Vegetal",
      aliases: ["green", "grassy", "leafy"],
      lay: "Like fresh green vegetables — snap peas, spinach, asparagus, fresh-cut grass. Bright and grassy.",
      technical:
        "Vegetal notes are the baseline of green tea (especially Japanese steamed greens like sencha) and lightly oxidized 'jade' oolongs. The driver is hexenal and related cis-3-hexenol compounds — the same molecules that smell like fresh-cut grass. Different vegetal notes carry different signals: snap-pea sweetness is a positive marker for pre-Qingming greens; harsh broccoli or spinach overtones often indicate over-extraction or stale leaf; asparagus and seaweed crossover into marine territory. The note fades quickly with age and is one of the first things to go when a green tea sits too long after harvest.",
      related: ["marine", "green", "spicy"],
    },
    {
      slug: "spicy",
      term: "Spicy",
      aliases: ["spice", "warm spice", "pepper"],
      lay: "Like warm spices — cinnamon, clove, black pepper, ginger. Doesn't mean chili-hot; means aromatic and warming.",
      technical:
        "Spicy notes are most prominent in Wuyi rock teas (Rou Gui — literally 'cinnamon' — is named for its hallmark cinnamon-bark warmth), some Yunnan reds, and aged sheng pu'er. The compounds vary widely: eugenol (clove), cinnamaldehyde (cinnamon), and various sesquiterpenes give different teas different spice profiles. In the 6-axis Basic mode, this rolls up with vegetal into the broader 'herbal' category, which captures the green-and-warming family from a higher altitude. A genuine spice note is different from astringent peppery harshness, which is usually a brewing problem rather than a flavor characteristic.",
      related: ["vegetal", "oolong", "herbal"],
    },
    {
      slug: "herbal",
      term: "Herbal",
      aliases: ["herbs", "herbaceous"],
      lay: "Basic-mode category that combines vegetal and spicy — fresh herbs, mild spices, anything green and lively without being a flower or a fruit.",
      technical:
        "In the 12-axis Advanced view, vegetal and spicy are separate axes; in the simplified 6-axis Basic view they roll up into a single Herbal category. The combined axis covers the cross-section between green-leafy character and warm-spice character — fresh thyme, basil, mint, fennel, light pepper. The category is most useful as a coarse filter for newcomers who don't yet hear the distinction between 'snap pea' and 'cinnamon' on a flavor wheel. Once you do, the split into vegetal and spicy carries more useful information. Both views describe the same tea; they just show it at different resolutions.",
      related: ["vegetal", "spicy"],
    },
  ],
};

// =====================================================================
// SECTION 5 — MOUTHFEEL
// =====================================================================

const MOUTHFEEL: GlossarySection = {
  key: "mouthfeel",
  title: "Mouthfeel",
  intro:
    "What the tea feels like, separate from what it tastes like. The texture, the weight, the things that happen in the throat after you swallow.",
  entries: [
    {
      slug: "astringent",
      term: "Astringent",
      aliases: ["astringency", "puckering"],
      lay: "The puckering, drying feeling on your tongue — like an unripe banana or strong red wine. Not bitterness; bitterness is a taste, astringency is a sensation.",
      technical:
        "Astringency is a tactile sensation, not a flavor: tannins (catechins, theaflavins) bind to salivary proteins and create the temporary roughness or grip on the tongue and gums. A small amount adds structure and 'bite' — a tea with no astringency at all often reads as flat. Excessive astringency in young sheng pu'er and high-catechin greens is a common problem; it usually fades with shorter steeps, slightly cooler water, or aging. The line between astringency and bitterness is real but easy to confuse; astringency is felt, bitterness is tasted, and they often arrive together.",
      related: ["drying", "sheng-puer", "green"],
    },
    {
      slug: "oily",
      term: "Oily",
      aliases: ["oily", "unctuous", "viscous"],
      lay: "When the tea has a slick, almost soup-like texture — coats the mouth and feels heavier than water.",
      technical:
        "Oily or unctuous mouthfeel comes from a high concentration of polysaccharides, pectins, and amino acids in the brewed liquor. The cup physically feels viscous — like a light broth or a thin oil. The character is most pronounced in well-made aged sheng pu'er, gushu (ancient-tree) Yunnan, gyokuro at the right temperature, and high-grade Wuyi yancha. It's also one of the qualities that distinguishes 'serious' tea from competent commercial tea, since it correlates with leaf age and growing conditions that can't easily be faked. The term tánghuà gǎn (糖化感) — 'sugary mouthfeel' — overlaps but isn't identical.",
      related: ["full-bodied", "mouth-coating", "sheng-puer"],
    },
    {
      slug: "full-bodied",
      term: "Full-bodied",
      aliases: ["body", "heavy", "thick"],
      lay: "When the tea feels weighty and substantial in the mouth, the way whole milk feels compared to skim milk. Has presence.",
      technical:
        "Body refers to the perceived weight or density of the brewed liquor — distinct from concentration (you can have a strong, thin tea or a mild, full-bodied one). Body comes from extracted solids: polysaccharides, proteins, pectins, and a fraction of catechins. Categories that lean full-bodied include shou pu'er, Wuyi yancha, Yunnan reds, and well-made aged sheng. On our 0–10 mouthfeel axis, body and astringency are scored separately because they vary independently. A 7+ on body without correspondingly high astringency is a marker of well-grown, well-processed leaf.",
      related: ["light-bodied", "oily", "mouth-coating"],
    },
    {
      slug: "light-bodied",
      term: "Light-bodied",
      aliases: ["light", "thin", "delicate"],
      lay: "The opposite of full-bodied — the tea feels closer to water, present but not weighty. Not a flaw; the right shape for some teas.",
      technical:
        "Light-bodied teas don't fill the mouth the way a thick shou or yancha does — they're more transparent, more focused on aromatic detail than on tactile weight. White teas (Silver Needle, Bai Mu Dan), pre-Qingming greens, and some young high-mountain oolongs are intentionally light-bodied; the category is built around delicacy. A light-bodied tea can still have huigan, mineral throat-feel, and complex flavor — body and complexity are not the same axis. The risk is that under-extraction or stale leaf produces 'thin' rather than 'light,' which is a quality difference that takes a few cups to learn to hear.",
      related: ["full-bodied", "white", "green"],
    },
    {
      slug: "huigan",
      term: "Huigan",
      original: "回甘 / huígān",
      aliases: ["hui gan", "returning sweetness"],
      lay: "The returning sweetness — when, a few seconds after you swallow, a soft cooling sweetness rises in the back of your throat unprompted. One of the most prized qualities in tea.",
      technical:
        "Huigan (literally 'returning sweetness') is the after-effect where the throat and back of the mouth produce a clean, slightly cooling sweetness 10–30 seconds after swallowing — separate from any sugar or sweetness in the brewed cup. It's tightly correlated with high-quality leaf, especially in young sheng pu'er, gushu Yunnan, and high-grown oolongs. The exact mechanism isn't fully settled — theories cite catechin breakdown to phloridzin and saliva pH shifts — but the experience is unmistakable once you've felt it. Together with qi, huigan is one of the qualitative markers experienced pu'er drinkers use to evaluate a tea past the surface flavor profile.",
      related: ["sweet", "qi", "sheng-puer", "cooling"],
    },
    {
      slug: "qi",
      term: "Qi (cha qi)",
      original: "茶气 / cháqì",
      aliases: ["cha qi", "chaqi", "tea qi", "tea energy"],
      lay: "The bodily, almost dizzy feeling some strong teas produce — warmth, alertness, a slight buzz. Real and felt, but harder to describe in words than in a cup.",
      technical:
        "Cha qi (茶气, 'tea energy') describes the somatic effect of certain teas — typically gushu sheng pu'er, well-aged sheng, and some high-grown oolongs. Drinkers report warmth in the chest and shoulders, a clarity or lightness in the head, mild perspiration, and occasionally a 'tea drunk' state. Caffeine and theanine combine to produce part of the effect, but devoted drinkers insist there's something beyond stimulant chemistry — sensitivity to it varies, and it's sometimes only noticed after months of regular drinking. Whether you accept the framing or not, qi is part of how serious tea is talked about, and ignoring it cuts off a real dimension of the experience.",
      related: ["huigan", "sheng-puer", "pu-er"],
    },
    {
      slug: "drying",
      term: "Drying",
      aliases: ["dry finish", "dries"],
      lay: "When the tea leaves your mouth feeling dehydrated rather than refreshed. A close cousin of astringency, but more about the after-effect.",
      technical:
        "A drying finish is the lingering sensation of moisture being pulled from the mouth and throat — distinguishable from astringency (the puckering grip during the sip) by its persistence after swallowing. Mild drying is normal and even structural; persistent drying is usually a sign of over-extraction, harsh processing, or lower-quality leaf. The opposite quality — a finish that leaves the mouth feeling watered and salivating — is sometimes called shēngjīn (生津), 'producing fluid,' and is a positive marker. Drying often co-occurs with astringency but doesn't have to; some teas are astringent on the tongue but not drying in the throat.",
      related: ["astringent", "huigan"],
    },
    {
      slug: "cooling",
      term: "Cooling",
      aliases: ["cool", "coolness", "menthol"],
      lay: "A literal cool sensation in the mouth and throat after you swallow — like the aftertaste of mint, but subtler.",
      technical:
        "Coolness is a thermal sensation in the throat that rises after swallowing, attributed in part to volatile compounds (camphor-like sesquiterpenes, menthone-related molecules) and in part to the same neural pathways that respond to actual cold and to capsaicin's opposite. The sensation is most prominent in well-made aged sheng pu'er and high-grown oolongs and is closely linked with huigan — a good cup often produces returning sweetness and coolness together. Some young sheng shows a sharper, almost camphor-mint coolness that mellows with age. Coolness is one of the throat-level qualities that distinguishes serious tea from competent tea.",
      related: ["huigan", "sheng-puer", "lingering-finish"],
    },
    {
      slug: "lingering-finish",
      term: "Lingering finish",
      aliases: ["long finish", "long aftertaste"],
      lay: "When the flavor and feel of the tea stay with you long after you've swallowed — sometimes for minutes. The sign of a tea worth slowing down for.",
      technical:
        "Finish length is one of the simplest tests of tea quality: count the seconds the cup stays present after swallowing, in flavor, sweetness, coolness, or huigan. A 30-second finish is unremarkable; a two-minute finish is a marker of seriously good leaf. Categories that produce long finishes reliably include aged sheng pu'er, gushu Yunnan, Wuyi yancha, and shaded Japanese greens. Finish length tracks roughly with growing conditions (older trees, slower-growing high-altitude leaf) and processing care. A short finish doesn't make a tea bad, but a long one is hard to fake.",
      related: ["huigan", "cooling", "mouth-coating"],
    },
    {
      slug: "mouth-coating",
      term: "Mouth-coating",
      aliases: ["coating", "coats the mouth"],
      lay: "When the tea seems to leave a thin film in the mouth that you can still feel a few minutes later — soft, smooth, present.",
      technical:
        "Mouth-coating describes the tactile residue of polysaccharides, pectins, and other extractables that remain after swallowing — distinct from a long flavor finish, though they often appear together. The sensation is positive: a soft, slightly slippery film across the palate that good leaf produces and weak leaf doesn't. Aged sheng pu'er, gyokuro, and well-made yancha are reliable producers. Excess astringency can mask the effect, which is why short, well-managed gongfu steeps reveal it more cleanly than long western brewing. The Chinese kǒugǎn (口感) — 'mouth-feel' — covers this and the broader textural vocabulary together.",
      related: ["oily", "full-bodied", "lingering-finish"],
    },
  ],
};

// =====================================================================
// EXPORT
// =====================================================================

export const GLOSSARY: GlossarySection[] = [
  TEA_TYPES,
  BREWING_METHODS,
  BREWING_VESSELS,
  FLAVOR_TERMS,
  MOUTHFEEL,
];

// Flat lookup index — built once at module load.
const BY_SLUG: Map<string, GlossaryEntry> = (() => {
  const m = new Map<string, GlossaryEntry>();
  for (const section of GLOSSARY) {
    for (const entry of section.entries) {
      m.set(entry.slug, entry);
    }
  }
  return m;
})();

// Term + alias index, normalized to lowercase for forgiving lookup.
const BY_TERM: Map<string, GlossaryEntry> = (() => {
  const m = new Map<string, GlossaryEntry>();
  const norm = (s: string) => s.trim().toLowerCase();
  for (const section of GLOSSARY) {
    for (const entry of section.entries) {
      m.set(norm(entry.term), entry);
      if (entry.aliases) {
        for (const a of entry.aliases) m.set(norm(a), entry);
      }
    }
  }
  return m;
})();

export function glossaryEntryBySlug(slug: string): GlossaryEntry | undefined {
  return BY_SLUG.get(slug);
}

export function glossaryEntryByTerm(term: string): GlossaryEntry | undefined {
  return BY_TERM.get(term.trim().toLowerCase());
}
