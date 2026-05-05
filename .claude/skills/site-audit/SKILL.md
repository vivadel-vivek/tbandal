---
name: site-audit
description: Run Lighthouse + axe-core + SEO/AEO checks against the running site (default http://localhost:3000) or a deployed URL. Triggered by /site-audit, "audit the site", "run lighthouse", or "check accessibility". Saves raw reports to .audit/ and returns a prioritized punch list.
---

# Site audit

This skill runs a multi-route Lighthouse audit + accessibility + SEO/AEO checklist against Two Buds and a Leaf. It is **read-only** — produces findings, never edits code.

## Inputs

- `url` (optional) — base URL to audit (default `http://localhost:3000`)
- `routes` (optional) — comma-separated list of paths (default: `/`, `/discover`, `/discover/teas`, `/discover/vendors`, `/tea/gaba-shen`, `/journal`, `/about`)

If no arg is provided, ask the user once whether they want the default route set or a specific URL.

## Process

1. **Confirm server is reachable**:
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" {url}
   ```
   If non-2xx, stop and ask the user to start the dev server (`npm run dev`).

2. **Create the audit directory**:
   ```bash
   mkdir -p .audit
   ```

3. **Run Lighthouse for each route** (Chrome must be installed). Use the headless flag and write JSON output:
   ```bash
   npx --yes lighthouse {fullUrl} \
     --output=json --output-path=.audit/lh-{slug}.json \
     --quiet --chrome-flags="--headless=new --no-sandbox" \
     --only-categories=performance,accessibility,best-practices,seo
   ```

4. **Run an axe-core scan** for each route via Lighthouse's a11y category (Lighthouse already includes axe rules) — no separate run needed unless the user asks for deeper a11y inspection.

5. **Manual SEO/AEO checklist** — fetch the rendered HTML for each route and check:
   - `<title>` exists and is unique per route, length ≤60
   - `<meta name="description">` exists, length ≤155
   - `<link rel="canonical">` present
   - Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`)
   - JSON-LD structured data where appropriate (Article, Product/Review, BreadcrumbList, Organization)
   - Heading hierarchy (one `h1`, no skipped levels)
   - Semantic landmarks (`<main>`, `<nav>`, `<footer>`)
   - Alt text on all `<img>`, accessible labels on `<svg>`/`<object>`

   Fetch with:
   ```bash
   curl -s {fullUrl} > .audit/html-{slug}.html
   ```
   Then grep / inspect for the checklist items.

6. **Compose the report** — markdown punch list ordered by severity (Critical / High / Medium / Low) with file pointers. Save to `.audit/report-{ISO-date}.md` and print the summary.

## Output format

```
## Site audit — {timestamp}

### Scores
| Route             | Perf | A11y | BP  | SEO |
|-------------------|------|------|-----|-----|
| /                 | 91   | 96   | 100 | 100 |
| /tea/gaba-shen    | 88   | 100  | 100 | 96  |
…

### Critical (blocks ship)
- [a11y][/] Hero image has no alt text → app/page.tsx:42
- [seo][/tea/gaba-shen] Missing meta description → app/tea/[slug]/page.tsx generateMetadata

### High (fix this PR)
- …

### Medium (track)
- …

### Suggested next actions
1. …
```

## Notes

- The first run will install Lighthouse via npx; subsequent runs use the cache.
- Reports are gitignored (`.audit/` should be in `.gitignore`).
- This skill is **safe to run repeatedly** — it doesn't modify any project files outside `.audit/`.
- If running on a deployed URL, **never** use `--collect.url` against admin routes or authenticated pages.

## When to escalate

- If Lighthouse won't install (network, Chrome missing, etc.), report the error and suggest `npx --yes lighthouse --version` to verify.
- If the site has client-side routing only and renders blank for crawlers, recommend SSR (Next.js default) before continuing.
