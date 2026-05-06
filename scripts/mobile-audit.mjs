// Mobile audit capture — runs Playwright over the production build and
// saves screenshots + a JSON snapshot per route per viewport. Feeds the
// persona evaluation agents so they can review the rendered UI without
// each spawning their own browser.
//
// Usage:  node scripts/mobile-audit.mjs [baseUrl]
//         (default baseUrl = https://two-buds-and-a-leaf.vercel.app)

import { chromium, devices } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE = process.argv[2] || "https://two-buds-and-a-leaf.vercel.app";
const OUT_DIR = "audit-artifacts";

const ROUTES = [
  { path: "/",                                                            slug: "home" },
  { path: "/discover",                                                    slug: "discover" },
  { path: "/discover/teas",                                               slug: "discover-teas" },
  { path: "/discover/vendors",                                            slug: "discover-vendors" },
  { path: "/discover/teaware",                                            slug: "discover-teaware" },
  { path: "/discover/teaware/jingdezhen-100ml-gaiwan",                    slug: "teaware-detail" },
  { path: "/discover/glossary",                                           slug: "glossary" },
  { path: "/tea/white2tea/menghai-shen-puer-spring-2023",                 slug: "tea-detail" },
  { path: "/tea/white2tea/menghai-shen-puer-spring-2023/log",             slug: "session-log" },
  { path: "/journal",                                                     slug: "journal" },
  { path: "/journal/second-steep",                                        slug: "journal-post" },
  { path: "/about",                                                       slug: "about" },
  { path: "/recommendations",                                             slug: "recommendations" },
  { path: "/member",                                                      slug: "member" },
  { path: "/for-vendors",                                                 slug: "for-vendors" },
];

// Mobile = iPhone-class portrait; desktop = a typical laptop width.
// We only need two viewports to validate "mobile pass survived" + "no
// regression on desktop".
const VIEWPORTS = [
  { name: "mobile",  device: devices["iPhone 13"] },
  { name: "desktop", profile: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 } },
];

async function captureRoute(browser, viewport, route) {
  const context = await browser.newContext(viewport.device ?? viewport.profile);
  const page = await context.newPage();

  const consoleMessages = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    }
  });

  const url = BASE + route.path;
  let status = null;
  try {
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    status = response?.status() ?? null;
  } catch (err) {
    status = `error: ${err.message}`;
  }

  // Collect a small DOM/meta snapshot. This is what the persona agents
  // will read — the screenshot is the visual companion.
  const snapshot = await page.evaluate(() => {
    const text = (sel) =>
      Array.from(document.querySelectorAll(sel))
        .map((el) => el.textContent?.trim().replace(/\s+/g, " "))
        .filter(Boolean);

    const meta = {};
    document.querySelectorAll("meta").forEach((el) => {
      const k = el.getAttribute("name") ?? el.getAttribute("property");
      if (k) meta[k] = el.getAttribute("content");
    });

    // Element-counts that are useful for a11y/SEO:
    const counts = {
      h1: document.querySelectorAll("h1").length,
      h2: document.querySelectorAll("h2").length,
      h3: document.querySelectorAll("h3").length,
      img: document.querySelectorAll("img").length,
      imgWithoutAlt: Array.from(document.querySelectorAll("img"))
        .filter((i) => !i.hasAttribute("alt"))
        .length,
      buttonsWithoutLabel: Array.from(document.querySelectorAll("button"))
        .filter((b) => !b.textContent?.trim() && !b.getAttribute("aria-label"))
        .length,
      links: document.querySelectorAll("a").length,
      forms: document.querySelectorAll("form").length,
    };

    // Touch-target check: any interactive element <44px square is a risk
    // on mobile. Capture the worst offenders so the persona can flag.
    const small = [];
    Array.from(document.querySelectorAll("button, a, input[type='checkbox']"))
      .forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.width < 32 && r.height > 0 && r.height < 32) {
          small.push({
            tag: el.tagName.toLowerCase(),
            text: (el.textContent ?? el.getAttribute("aria-label") ?? "").trim().slice(0, 40),
            w: Math.round(r.width),
            h: Math.round(r.height),
          });
        }
      });

    // Detect horizontal overflow — the canonical mobile-broken signal.
    const html = document.documentElement;
    const overflow = {
      scrollWidth: html.scrollWidth,
      clientWidth: html.clientWidth,
      overflows: html.scrollWidth > html.clientWidth + 1,
    };

    return {
      title: document.title,
      h1: text("h1")[0] ?? null,
      h2: text("h2").slice(0, 5),
      meta: {
        description: meta["description"] ?? null,
        themeColor: meta["theme-color"] ?? null,
        ogTitle: meta["og:title"] ?? null,
        ogDescription: meta["og:description"] ?? null,
        manifest: !!document.querySelector("link[rel='manifest']"),
        appleTouchIcon: !!document.querySelector("link[rel='apple-touch-icon']"),
      },
      counts,
      smallTargets: small.slice(0, 8),
      overflow,
    };
  });

  // Full-page screenshot at the captured viewport.
  const shotName = `${route.slug}.png`;
  const shotPath = join(OUT_DIR, viewport.name, shotName);
  await page.screenshot({ path: shotPath, fullPage: true });

  await context.close();

  return {
    url,
    path: route.path,
    slug: route.slug,
    viewport: viewport.name,
    status,
    screenshot: shotPath,
    snapshot,
    consoleErrors: consoleMessages,
  };
}

async function main() {
  await mkdir(join(OUT_DIR, "mobile"), { recursive: true });
  await mkdir(join(OUT_DIR, "desktop"), { recursive: true });

  const browser = await chromium.launch();
  const results = { base: BASE, runAt: new Date().toISOString(), routes: [] };

  for (const viewport of VIEWPORTS) {
    for (const route of ROUTES) {
      process.stdout.write(`[${viewport.name}] ${route.path} ... `);
      const res = await captureRoute(browser, viewport, route);
      results.routes.push(res);
      const overflow = res.snapshot?.overflow?.overflows ? " ⚠ OVERFLOW" : "";
      console.log(`${res.status}${overflow}`);
    }
  }

  await browser.close();
  await writeFile(
    join(OUT_DIR, "audit-summary.json"),
    JSON.stringify(results, null, 2),
  );
  console.log(`\nDone. Artifacts in ${OUT_DIR}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
