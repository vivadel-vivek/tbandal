// Find which elements on a page are pushing the document past its
// client width. Run against any URL + viewport and it reports the
// outermost offending elements with their bounding box.

import { chromium, devices } from "playwright";

const URL = process.argv[2] || "https://two-buds-and-a-leaf.vercel.app/tea/white2tea/menghai-shen-puer-spring-2023";

const browser = await chromium.launch();
const context = await browser.newContext(devices["iPhone 13"]);
const page = await context.newPage();
await page.goto(URL, { waitUntil: "networkidle" });

const offenders = await page.evaluate(() => {
  const cw = document.documentElement.clientWidth;
  const out = [];
  // Walk every element; flag those whose right edge exceeds cw + 1px.
  const all = document.querySelectorAll("*");
  for (const el of all) {
    const r = el.getBoundingClientRect();
    // Skip fixed-positioned elements and their children — those are
    // intentionally off-canvas and don't push document scrollWidth.
    let p = el;
    let isFixedDescendant = false;
    while (p && p !== document.documentElement) {
      const cs = getComputedStyle(p);
      if (cs.position === "fixed" || cs.position === "sticky") {
        isFixedDescendant = true;
        break;
      }
      p = p.parentElement;
    }
    if (isFixedDescendant) continue;
    if (r.right > cw + 1 && r.width > 0) {
      const tag = el.tagName.toLowerCase();
      const cls = el.getAttribute("class")?.slice(0, 80) ?? "";
      const id = el.id ? `#${el.id}` : "";
      const txt = (el.textContent ?? "").trim().slice(0, 60).replace(/\s+/g, " ");
      out.push({
        tag,
        cls,
        id,
        text: txt,
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
      });
    }
  }
  // Filter to "leaf-most" offenders — those whose children also overflow
  // are noise. Keep only elements whose parent is at the same overflow
  // depth or non-overflowing.
  return { cw, offenders: out };
});

console.log(`Viewport client width: ${offenders.cw}`);
console.log(`Total offending elements: ${offenders.offenders.length}`);
console.log("");
console.log("Top 12 widest offenders:");
offenders.offenders
  .sort((a, b) => b.right - a.right)
  .slice(0, 12)
  .forEach((o) => {
    console.log(
      `  ${o.tag}${o.id} right=${o.right} w=${o.width}  cls="${o.cls}"`,
    );
    if (o.text) console.log(`    text: "${o.text}"`);
  });

await browser.close();
