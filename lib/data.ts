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
    pathSlug: "menghai-shen-puer-spring-2023",
    name: "Menghai Shen Pu'er", chinese: "普洱生茶 · 勐海",
    type: "Pu'er", region: "Menghai, Yunnan", country: "China",
    year: "Spring 2023", harvest: "Spring",
    elev: 1600, age: "3 years", price: 0.68,
    rarity: 4, vendor: "white2tea",
    gradient: "linear-gradient(135deg,#8B7355 0%,#5C4033 100%)",
    swatch: "#5C4033",
    summary:
      "A rich, honeyed shen with stone fruit on the early steeps and a deep mineral sweetness that lingers. Holds a dozen steeps in a 100ml gaiwan before it gives in.",
    brewing: { style: "Gongfu", ratio: "5g/100ml", temp: "95°C", first: "5s" },
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
        body: "This one keeps revealing itself. Steeps three through five are the heart — that honey-into-stone-fruit moment is exactly what I want from a 3-year Menghai. The huigan reaches well past the cup.",
        date: "Mar 8, 2026", session: "5g · 100ml gaiwan · 95°C · filtered (60 TDS)" },
      james: { rating: 8.7,
        body: "Sweeter than I usually go for, but the texture earns it. Oily on the tongue, a clean cooling finish. I'd shave another second or two off the early steeps and let the back-half breathe — a flash pour at 95 is plenty for this one.",
        date: "Mar 11, 2026", session: "5g · 110ml gaiwan · 95°C · spring water" },
      members: { rating: 8.8, count: 47,
        body: "Members consistently flag the stone-fruit middle and the long, throaty finish. A few asked for shorter early steeps; otherwise broad agreement.",
        date: "Aggregated · 47 ratings" },
    },
  },
  {
    slug: "tieguanyin",
    pathSlug: "tieguanyin-spring-2025",
    name: "Tieguanyin", chinese: "铁观音",
    type: "Oolong", region: "Anxi, Fujian", country: "China",
    year: "Spring 2025", harvest: "Spring",
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
    year: "Spring 2024", harvest: "Pre-Qingming",
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
    rarity: 5, vendor: "Ippodo Tea",
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
        body: "Worth the gram price — you're paying for the shading days and the cultivar, and both come through. The umami front-end resolves into a clean cooling sweetness by steep three. I'd brew it slightly cooler next round.",
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
    url: "https://teadrunk.com/",
  },
  {
    slug: "white2tea", name: "white2tea",
    city: "Beijing", country: "China", continent: "Asia",
    tagline: "Pu'er and oolongs from a small team with strong opinions.",
    body: "Paul Murrin's small operation in Beijing. Excellent shen pu'er, idiosyncratic blending, and clear sourcing notes on every product. Worth the international shipping.",
    rating: 5, swatch: "#A68B3D", teaCount: 31, founded: 2014,
    specialties: ["Pu'er", "Oolong", "Blends"],
    url: "https://white2tea.com/",
  },
  {
    slug: "yunnan-sourcing", name: "Yunnan Sourcing",
    city: "Kunming", country: "China", continent: "Asia",
    tagline: "The comprehensive catalog. The place to learn the landscape.",
    body: "Scott Wilson's enormous catalog is the practical reference for Western buyers. Not every tea is special, but the meta-knowledge — the consistent labeling, the seasonal repeats — is unmatched.",
    rating: 4, swatch: "#8B9A7D", teaCount: 412, founded: 2004,
    specialties: ["Pu'er", "Yunnan black", "Encyclopaedic"],
    url: "https://yunnansourcing.com/",
  },
  {
    slug: "ippodo", name: "Ippodo Tea",
    city: "Kyoto", country: "Japan", continent: "Asia",
    tagline: "Three centuries of Uji greens — gyokuro, matcha, sencha.",
    body: "Ippodo has been selling Japanese tea from Kyoto since 1717. The Uji gyokuro and ceremonial matcha are the practical standards Western buyers measure other producers against. Direct shipping from their Manhattan and online stores.",
    rating: 5, swatch: "#5A7A4D", teaCount: 38, founded: 1717,
    specialties: ["Gyokuro", "Matcha", "Sencha"],
    url: "https://global.ippodo-tea.co.jp/",
  },
];

export const POSTS: Post[] = [
  {
    slug: "second-steep", cat: "Brewing", title: "On the second steep",
    excerpt: "Why the first cup is rarely the best one — and how to read what the leaves are telling you.",
    author: "Vivek", date: "Mar 14, 2026", readTime: 6,
    grad: "linear-gradient(135deg,#D4B06A 0%,#722F37 100%)",
    related: ["gaba-shen", "tieguanyin"],
    body: "The first cup is a handshake. You're checking that the leaves are awake, that the water is right, that your kettle hasn't done something strange. Almost nothing about a tea is decided in the first thirty seconds.\n\nThe second steep is where the conversation starts. By then the leaves have unfurled fully — they've stopped offering their surface and started offering their shape. The tannins arrive but haven't taken over. The aromatics, which on the first pour are still mostly bound up in the dry leaf, finally come loose into the cup.\n\nI don't trust anyone who rates a tea off a single steep. Not because the first cup is wrong — it's just incomplete. It's the cover photo. The session is the book.\n\n## Reading the leaves\n\nThe second steep is a diagnostic. It tells you what you did with the first one, and what to do with the third.\n\nIf your second steep is bitter — actually bitter, not strong — it usually means the first was too short. The leaves are still hungry. They held back compounds that should have come out across two pours and are now dumping them into one. Add three or four seconds to the first steep next session, or drop your temperature one notch.\n\nIf your second steep is thinner than your first, you've over-extracted on the front end. You pulled too much, too fast. Pour faster on steep one, or use less leaf, or — if you're being honest with yourself — accept that your gaiwan is bigger than you think it is.\n\nIf the second steep is the best one of the session, congratulations. That's where the tea is, and you've found it. The advice from there is straightforward: keep the third short, save the fourth for someone you like, and write down what you did.\n\n## Two recent examples\n\nThe Menghai shen we keep coming back to — the spring 2023 white2tea — is a textbook second-steep tea, except it's actually a third-steep tea. Steep one is closed. Steep two opens the door. Steeps three through five are the heart, and that's where the honey-into-stone-fruit transition happens. If you stop a session after the first cup you'll write off a tea that's still warming up. If you flash-pour the first three you'll miss the same window from the other side. The second steep is your read on whether the leaf is ready, and on a young-ish shen the answer is usually almost.\n\nThe Tea Drunk Tieguanyin is the opposite. The orchid is loudest on steeps two and three; if cup two isn't fragrant, the water was too hot or the leaf-to-water ratio is wrong. With a green-style Anxi the second steep should be the most aromatic of the session. If it isn't, you've set the session up to disappoint.\n\nDifferent teas, opposite shapes — but the diagnostic is the same. The second cup tells you whether you're on the right track.\n\n## Water, briefly\n\nI'll keep this short because I'll write a longer thing about it eventually. The second steep also reads your water. Filtered water around 50–70 ppm TDS lets a tea show its mid-range; tap water at 200+ flattens the second cup specifically — the first comes through on aromatics alone, the third on tannin, but the middle gets eaten. If your second steeps consistently feel muffled and you can't figure out why, that's the first place I'd look. Before the kettle, before the gaiwan, before the leaf.\n\n## What to do with the information\n\nThe practical part. I keep a small notebook by the kettle and write three things per session: what the second steep tasted like, what the first one tasted like, and what I'd change. Not a review. A note to my next self.\n\nAfter a few sessions on the same tea you stop guessing. You learn that the white2tea Menghai wants a longer first pour at 95, that the Tieguanyin wants a shorter one at 92, that the gyokuro doesn't follow any of these rules because gyokuro is a different game played in a different vessel. The second steep is what teaches you that, faster than anything else.\n\nThe third steep is where the tea performs. The second is where it tells the truth.",
  },
  {
    slug: "tea-drunk-morning", cat: "Vendor Spotlight", title: "A morning with Tea Drunk",
    excerpt: "Shunan Teng's small Manhattan shop quietly redefined what direct-from-the-mountain looks like in the West.",
    author: "James", date: "Feb 28, 2026", readTime: 9,
    grad: "linear-gradient(135deg,#8B9A7D 0%,#2D3A2E 100%)",
    related: ["tieguanyin", "longjing"],
    body: "I came to tea from coffee, which means I came in with the wrong expectations. I expected a shop. A counter, a menu, a tip jar, a barista with strong opinions about origin. Tea Drunk on East 7th Street is not that. It's a small room with a long wooden bar, a wall of tins, and — if you arrive at the right hour — Shunan Teng pouring water at one end of it, talking softly about a mountain you've never heard of.\n\nI walked over on a cold Tuesday morning in February. The shop opens at eleven. I was the second person there.\n\n## The room\n\nIt's smaller than the photos suggest. The bar seats maybe eight if everyone is friendly. A few low stools by the window. The lighting is warm and a little dim, which is the right call — fluorescent overheads would make the whole place feel like a pharmacy. The tins behind the bar are labeled in handwriting. There's no menu in the conventional sense. You sit down and someone asks what you've been drinking lately, and the session goes from there.\n\nMy session started with a Tieguanyin from the spring harvest — the green-style Anxi we have on the site. Shunan brewed it herself: 6g in a 110ml gaiwan, water just off the boil, fast pours. The first cup was a little closed; the second cup was the one. Orchid, butter, that toasted-rice middle. I had three steeps before I asked her anything, because I didn't want to interrupt the tea.\n\n## What direct sourcing actually means\n\nTea Drunk has been around since 2013. Shunan grew up in China, came to the US, and at some point decided the gap between what was being sold as Chinese tea in the West and what was actually being made in the villages was wide enough to do something about. So she goes. Twice a year, sometimes three times. Wuyi, Anxi, the pu'er mountains, Longjing villages outside Hangzhou. She buys from the people who picked the leaves.\n\nThis sounds like marketing copy when you write it down, and to be fair, every Western tea vendor over a certain price point claims something like it. The difference at Tea Drunk, as far as I can tell from the outside, is the specificity. The Longjing on the site isn't from Hangzhou — it's from a particular village, a particular elevation, a particular harvest window. Pre-Qingming, picked before the seasonal cutoff that local growers actually observe rather than the one Western importers tend to round to. When I asked her about the pea-sweetness of that tea, she answered with a date and a weather report.\n\nI don't want to oversell this. Plenty of vendors source carefully. What's distinct here is that Shunan is the same person who picks the leaves at origin and pours the water in front of you in Manhattan. The supply chain has one human in it. That's rare.\n\n## The price\n\nLet's talk about it honestly because I don't think the post is useful if I don't.\n\nTea Drunk is expensive. Not cartoonish — there are vendors selling thousand-dollar cakes and Tea Drunk doesn't, in my experience, play in that tier — but a session at the bar is not a four-dollar pour-over and the retail tins are priced like the work that went into them. The Tieguanyin we have on the site runs around forty cents a gram, which puts a 25g tin in the thirty-to-forty-dollar range. The Longjing is similar. That's a meaningful step up from the supermarket-grade Anxi you can find for a quarter the price.\n\nIs it worth it. That's a real question and the answer depends on what you want from a tea. If you're drinking a cup a day and you don't want to think about it, it isn't. If you want to understand what a green-style Anxi can do when it's harvested and processed by people who know exactly what they're trying to make, it is. I am, increasingly, in the second camp, and I'm honest enough about it to know the camp has its own kind of self-justification.\n\nWhat I can say without qualification is that I haven't been disappointed by a tea from Tea Drunk yet, and I have been disappointed by teas at every other price tier I've bought into. The hit rate is the thing you're paying for.\n\n## Sitting at the bar\n\nThe Tieguanyin moved into a Longjing — the same one we have on the site, pre-Qingming, brewed in a tall glass grandpa-style because that's how it should be drunk. Watching her brew it that way was a small correction to my Western-trained instinct to gongfu everything. Some greens want the simplicity of a glass and a long, slow steep. The Longjing is one of them. Three grams, hot water poured down the side, the leaves sinking and rising and sinking and giving up their pea-sweetness in the first ninety seconds.\n\nWe talked about a few teas I'd been drinking, including a couple she'd never heard of, which was nice — she didn't pretend otherwise. She asked about Vivek's pu'er habit and made a small face about Menghai shen specifically. I'm paraphrasing but the gist was: she likes Yiwu more, and she has reasons. I'll let him fight that one out with her another time.\n\nBy the third tea I'd lost about an hour and a half. There was no clock pressure, no cycling of customers — the room just stayed quiet and the next tea got brewed. At some point I realized I hadn't checked my phone, which I think is the actual product Tea Drunk is selling.\n\n## A few practical notes\n\nIf you're going for the first time. Go on a weekday morning if you can; weekends fill up. Don't over-prepare; sit down and let her drive. Bring cash for the tip jar even though it's not a coffee shop. The retail tins are fine to buy on a first visit but the experience to optimize for is the bar session, not the takeaway.\n\nIf you can't go in person. The website does most of what the bar does in terms of sourcing transparency — origin, elevation, harvest, picker — and the prices are the same as in the shop. Shipping is reasonable within the US. I've ordered the Longjing twice without ever being in New York and gotten exactly the tea I expected.\n\n## The part I keep thinking about\n\nThe morning ended with Shunan rinsing the gaiwan and saying, almost as an aside, that the goal of the shop is for people to learn what their tea is supposed to taste like. Not what she thinks it should taste like — what the tea, made well, at origin, by the person who knows it best, actually is. Once you've had that benchmark, the rest of your tea life is calibration. You can buy at every price tier afterward and you'll know what you're paying for.\n\nThat's a more honest framing than most vendors offer, and it's the reason I keep going back. The forty cents a gram isn't for the tea. It's for the calibration.",
  },
  {
    slug: "gongfu-isnt", cat: "Culture", title: "What gongfu isn't",
    excerpt: "It's not a recipe, and it's not a competition. A short defense of brewing slowly because it's nice to.",
    author: "Vivek", date: "Feb 11, 2026", readTime: 4,
    grad: "linear-gradient(135deg,#A8B49C 0%,#6B4E3D 100%)",
    related: ["gyokuro"],
    body: "There's a kind of post you see on the tea forums, and increasingly on YouTube, where someone in a clean apartment with a soft-focus rain track sets up a gaiwan, a fairness pitcher, a tea boat, three cups they will not use, and a digital scale, and proceeds to brew tea as if filing an audit. Gram-precise leaf. Five-second pour. Eight-second pour. Twelve. Twenty. The video is fifteen minutes long. The viewer is meant to take notes.\n\nI like watching these. I do not think they are gongfu.\n\nGongfu cha — 工夫茶 — translates roughly as tea made with effort, or care, or attention. The character set the practice grew out of is Chaoshan, in eastern Guangdong, where the original idea was that you sat down with a tiny pot and a tiny cup and you took your time. The pot was small because the leaf was strong. The cup was small because you were pouring often. The whole apparatus was scaled to the conversation you were having with the people across from you. It was social. It was unhurried. It was, fundamentally, about not being rushed.\n\nThat is the part the YouTube version loses. The protocol is a means; somewhere on the way to the West it became the end.\n\n## The recipe problem\n\nA recipe is a useful thing for a beginner. Five grams in a hundred milliliters at ninety-five degrees with a five-second first pour is a perfectly fine starting point for most pu'er. The trouble is when the recipe becomes the practice. You see people brew the same tea for a year without ever lengthening the third steep, because the chart didn't say to. You see people pull out a scale for a tea they've made fifty times. You see people apologize for not having the right cup.\n\nNone of this is wrong, exactly. It just isn't gongfu. It's brewing-by-procedure. The Chaoshan grandfather pouring his tea in the back of a herbal medicine shop wasn't running a flowchart. He was paying attention.\n\nPaying attention is harder than the flowchart, which is why we made the flowchart.\n\n## What it actually asks of you\n\nWhat gongfu actually asks is that you watch the tea. Smell the wet leaf after the rinse and decide whether it's open. Look at the color of the first pour against the white interior of the cup. Notice when the third steep is thinner than the second and respond by lengthening, not by sticking to the script. Decide, in real time, whether to push for an eighth steep or call the session at six because the leaf is tired and so are you.\n\nThe whole point is responsiveness. The protocol is a starting condition. If you brewed every tea identically you would be, at best, an unusually expensive vending machine.\n\n## The Japanese counterpoint\n\nJames keeps a kyusu and a stash of gyokuro on his counter and treats both with what I would call gongfu attention, even though no one watching him would describe what he's doing as gongfu. Five grams in 60ml, water at 55 degrees — really 55, he uses a thermometer — ninety seconds, and the resulting cup is a thimbleful of green broth that tastes nothing like tea as most people understand the word.\n\nIs that gongfu. By the strict reading, no — different country, different vessel, different lineage. By the spirit of the thing, absolutely. He is paying total attention to a small amount of leaf in a small amount of water and a small cup, and the result is a session that takes thirty minutes and yields maybe 200ml of liquid. The vessel is Japanese. The disposition is the same.\n\nIf gongfu is a noun — the Chaoshan apparatus, the specific gestures — then no, gyokuro isn't gongfu. If it's a verb, in the way the original phrase suggests, then James drinking a 1.20-a-gram Uji gyokuro at 55 degrees on a Sunday morning is doing exactly what the phrase is supposed to mean.\n\n## The defense\n\nSo the defense is this. Brew slowly because you like to. Use the scale if you find it grounding; put it away if it makes you anxious. Run the same gaiwan for a year and learn what it does. Skip the tea boat. Use whatever cups you have. Pay attention.\n\nThe protocol matters less than the disposition, and the disposition is what gongfu was always pointing at. It's not a recipe. It's not a competition. It's a way of sitting at a table with some leaves and some water and not being in a hurry.",
  },
  {
    slug: "yunnan-altitudes", cat: "Origin", title: "Reading altitude in a Yunnan cup",
    excerpt: "Below 1200m, above 1800m: what changes, what doesn't, and why we keep asking.",
    author: "James", date: "Jan 30, 2026", readTime: 7,
    grad: "linear-gradient(135deg,#5C4033 0%,#8B7355 100%)",
    related: ["gaba-shen", "dianhong"],
    body: "Every Yunnan tea on every vendor site I've ever bought from lists an elevation. 1200m. 1600m. 1900m. The number is offered the way wineries list a vintage — as if it explains everything, as if you'll know what to do with it. Most of the time it's a fact you nod at and move past.\n\nI've been trying for about a year now to figure out what the number is actually worth. The short answer is: more than nothing, less than people imply, and only in combination with a lot of other things.\n\n## What altitude does to a leaf\n\nThe biological story is straightforward and only partly relevant.\n\nHigher elevation means cooler average temperatures and a shorter growing window. The plant grows slower. Slower growth means more time to develop the secondary compounds — amino acids, aromatic precursors, polyphenols — that make tea taste like something. The leaves are smaller, denser, and chemically richer per gram than the same cultivar grown at lower altitude.\n\nAltitude also brings stronger UV, more cloud cover in the mornings, more diurnal temperature swing. All of which the plant responds to, and all of which ends up in the cup if you're paying attention.\n\nBelow about 1200m in Yunnan you are usually in plantation country — flat-ish ground, terraced rows, mechanized picking, faster growth. Above 1800m you are usually in older forest — wild-arbor or ancient-tree material, hand-picked, harder to access. The cup-side differences people attribute to altitude are partly altitude and partly all of those other variables that come with it.\n\n## Two from the cellar\n\nWe have two Yunnan teas on the site and they make a useful pair.\n\nThe first is the white2tea Menghai shen — spring 2023, 1600m, three years aging. The second is a Dianhong Gold from Fengqing, autumn 2023, 1500m. Neither is at the extremes. Both are from established sourcing, both from second-tier elevations as far as Yunnan goes — high enough to matter, not high enough to be marketed as a singular thing.\n\nA hundred meters of elevation difference shouldn't, in theory, do much. But the teas tell different stories, and the stories are partly about altitude and partly about everything else.\n\nThe Menghai shen is a leaf-driven tea. The aromatics on the second steep are layered — honey, stone fruit, a wet-stone mineral note underneath. The huigan reaches well past the cup, which Vivek has mentioned in his notes more than once. That long-finishing throat sweetness is the marker people most reliably attribute to high-elevation arbor material; the chemistry has to do with the polyphenol-to-amino-acid ratio that cooler-grown leaves develop, but the phenomenology is just that the tea keeps working after you've swallowed it.\n\nThe Dianhong is a processing-driven tea. Cocoa, malt, sweet-potato roundness. It's a fully-oxidized black, which means a lot of what made it into the leaf has been transformed by the rolling and oxidation and finish-firing. You can absolutely taste that this is good leaf — it has a depth and a clean finish you don't get from plantation Dianhong — but the altitude story is less audible. The processing has rounded over the edges that, in the shen, are where the elevation lives.\n\nSame province. A hundred meters apart. Different conversations.\n\n## The shen difference\n\nThis is the practical conclusion I've come to. Altitude matters most in teas that are processed minimally, and least in teas that are processed heavily. A pu'er — particularly a sheng — is essentially raw leaf, lightly killed-green and sun-dried; whatever the leaf had going in, you can mostly still taste it. A Dianhong has been through a full oxidation cycle. The leaf is still in there, but you're tasting the leaf through a developed character.\n\nThis is why the pu'er world is so altitude-obsessed and the Dianhong world is comparatively quiet about it. The market has figured out, intuitively, where the variable carries weight.\n\nIt's also why I don't completely trust elevation numbers in marketing copy for heavily-processed teas. A 1900m Dianhong is presumably better than an 800m one — the leaf going in is better — but the gap will be smaller than the equivalent gap in a sheng, and the cup-side reasons will be harder to point at.\n\n## What altitude doesn't tell you\n\nA short list of things that matter at least as much, and sometimes more.\n\nCultivar. The varietal of the tea plant — Yunnan large-leaf assamica, in most of these cases, but with significant subvarietal variation — affects everything from the amino acid profile to the leaf size to the aromatic top notes.\n\nAge of the trees. Ancient-tree material from 1500m can outperform young-tree material from 1900m on most days I've tested it. The root system goes deeper, the mineral uptake is different, the leaf is denser.\n\nAspect and shade. North-facing slope versus south-facing slope changes the diurnal swing more than 200 meters of elevation does. Forest canopy on a 1700m garden may produce a leaf more like a 1900m clearing than like its own 1700m neighbors.\n\nThe weather that year. The number on the website is permanent. The vintage isn't.\n\nProcessing. Mentioned above; can't be over-emphasized.\n\n## So why do we keep asking\n\nBecause altitude is the variable that's easiest to measure and put on a label, and because at the high end it really does correlate with the thing we're trying to find — leaf that the plant worked hard for. If you don't know anything else about a Yunnan tea, the elevation is a reasonable proxy for source quality. The error bars are wide but the signal is real.\n\nThe trouble starts when people treat the number as the answer rather than the proxy. A 2000m elevation on a vendor card tells you the tea probably came from somewhere serious. It does not tell you the tea is good. The leaf could still be plantation cultivar, processed badly, picked at the wrong window, stored wrong on its way across the ocean.\n\nThe Menghai shen we drink is a 1600m tea that drinks like a high-elevation tea because the rest of the variables — old-arbor material, careful processing, three years of patient storage — line up. The Dianhong is a 1500m tea that drinks like a competent black because the processing is doing most of the work and the elevation is along for the ride.\n\nWhich is, in the end, how I'd suggest reading the number on the card. As a starting condition, not a verdict. A tea grown high has a head start. What it does with the head start is a separate question, and the only way to answer it is to brew the tea and pay attention to what shows up in the second cup.",
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
