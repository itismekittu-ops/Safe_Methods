# AEO/SEO Standards

*Replaces `05-aeo-seo.md` and `07-aeo-seo-templates.md`. This is the permanent, living rulebook — every current and future public page/route gets checked against this document. It does not expire when current issues are fixed.*

---

## 1. Purpose & Context

`safemethods.com` was previously a WordPress site describing a different, unrelated business (B2B banking-consulting). It has since been rebuilt as a Vite/React/TypeScript SPA per `02-architecture.md`. This document defines the permanent standards that keep the site correctly discoverable by search engines and AI answer engines going forward — for the current site and every page added after it.

This document does not override any rule in the Constitution, Business Rules, or Observability documents. Where it references data accuracy, `GR-OUT-05` (groundedness) and the Zero Fabrication principle remain binding.

### Actual Site Structure (Verified Against Codebase)

This is a **single-page marketing site**, not a multi-page site with separate About/Contact/How-It-Works/Rates/Consultants/Banks routes. Real routes, confirmed from `src/App.tsx`:

| Route | What it is |
| :--- | :--- |
| `/` | Homepage — contains Hero, Services overview, SafeBot demo, CTA, Blog preview, and **Contact** as sections/anchors (nav links use `scrollToSection()`, not real navigation to a `/contact` URL) |
| `/services` | Currently renders **one hardcoded service** ("Debt Management"), not a listing or category page |
| `/blog` | Currently renders **one hardcoded post**, not a listing page |
| `/login`, `/account`, `/reset-password` | Authenticated/account routes — out of scope for public AEO/SEO work |

**Implications for this document:**
- All "public marketing routes" references below mean `/`, `/services`, `/blog` — not the larger assumed set.
- Contact information lives inside a homepage section, not an independently indexable URL. This is a real discoverability limitation (a search/AI engine can't rank or cite "Safe Methods contact page" as its own result) — worth product discussion later, but not something to paper over by inventing a route.
- `/services` and `/blog` rendering only one static item each is a separate, real limitation: if more services or posts are added later without dynamic routing (e.g. `/services/:slug`), they will collide on the same URL. Flagged here for future awareness, out of scope for current remediation.

---

## 2. Core Principles (Non-Negotiables)

* **Crawlable-First Architecture:** Every public marketing/informational route must return meaningful, indexable HTML on the first HTTP response — not only after client-side JavaScript execution.
* **Accuracy Over Reach:** No page, meta tag, structured-data field, or AI-answer content block may state a rate, statistic, or claim that isn't real and current.
* **One Source of Truth, One Identity:** No legacy, placeholder, or stale content may coexist silently with current content anywhere on the site.
* **AI-Citability:** Content must be structured so AI answer engines can accurately summarize and cite Safe Methods without executing JavaScript.
* **No Cloaking:** What crawlers see and what human users see must be identical content.
* **No Unfilled Placeholders in Production:** Any template value (in this document or elsewhere) marked as a placeholder must be replaced with real, verified content before shipping. This is the exact failure that caused the original problem — never repeat it.

---

## 3. Technical SEO Standards

### 3.1 Rendering
**Requirement (`SEO-TECH-01`):** Server-side rendering or static prerendering for every public marketing route — currently `/`, `/services`, `/blog` (see "Actual Site Structure" above). Chat/authenticated routes (`/login`, `/account`, `/reset-password`) may remain client-rendered. If new public routes are added later, they inherit this requirement automatically — do not wait for this document to be re-updated.
**Verification:** Raw HTTP fetch (`curl` or "view source" — not DevTools rendered view) returns real, complete HTML content.

### 3.2 Title & Meta Description
**Requirement (`SEO-TECH-02`):** Unique title and meta description per route, no defaults or duplicates.
**Format:**
```html
<title>[Primary Keyword/Value Prop] | Safe Methods</title>
<meta name="description" content="[120-160 characters, specific to this page, written as real ad copy]">
```
Example: `<title>Compare Financial Advice From Multiple Institutions | Safe Methods</title>`

### 3.3 Open Graph / Twitter Cards
**Requirement (`SEO-TECH-03`):** OG and Twitter Card tags on every public route.
**Format:**
```html
<meta property="og:title" content="[page title]">
<meta property="og:description" content="[page description]">
<meta property="og:image" content="https://safemethods.com/[route-specific-image].jpg">
<meta property="og:url" content="https://safemethods.com/[exact-route-path]">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```
`og:image` should be a real, relevant image (1200×630px) — not a generic default reused everywhere.

### 3.4 Canonical Tags
**Requirement (`SEO-TECH-04`):**
```html
<link rel="canonical" href="https://safemethods.com/[exact-current-route]">
```
One consistent trailing-slash convention site-wide.

### 3.5 `robots.txt`
**Requirement (`SEO-TECH-05`):** Present at domain root, allowing crawl of all public routes.
**Format:**
```
User-agent: *
Allow: /

Sitemap: https://safemethods.com/sitemap.xml
```
Only add `Disallow` for routes that genuinely shouldn't be crawled — never carry over old WordPress disallow rules for paths that no longer exist.

### 3.6 `sitemap.xml`
**Requirement (`SEO-TECH-06`):** Auto-generated at build time from the actual route list — never hand-maintained.
**Format:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://safemethods.com/</loc>
    <lastmod>[YYYY-MM-DD]</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- One <url> block per real public route -->
</urlset>
```
Submit to Google Search Console and Bing Webmaster Tools whenever routes change.

### 3.7 Structured Data (JSON-LD)
**Requirement (`SEO-TECH-07`):** `Organization` on every page; `FinancialService` on relevant pages; `FAQPage` only where matching visible Q&A content exists; `BreadcrumbList` where applicable. Values must come from the same live source as the rendered page — never a separately hardcoded copy.
**Format:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Safe Methods",
  "url": "https://safemethods.com",
  "logo": "https://safemethods.com/[logo-path].png",
  "description": "[accurate description]",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "[real number]",
    "contactType": "customer service",
    "email": "[real email]"
  }
}
</script>
```
FAQPage schema text must exactly match the visible on-page text — mismatches are treated as manipulative by search engines and undermine AI trust too.

### 3.8 Semantic HTML & Accessibility Basics
**Requirement (`SEO-TECH-08`/`09`):** One `<h1>` per page, logical heading hierarchy, descriptive `alt` text on all meaningful images.

### 3.9 Performance
**Requirement (`SEO-TECH-10`/`11`):** Page load `< 2 seconds` (per `02-architecture.md`), passing Core Web Vitals, HTTPS enforced site-wide, no mixed content. Verify against production, prerendered pages via Lighthouse/PageSpeed — not local dev builds.

---

## 4. AEO (Answer Engine Optimization) Standards

### 4.1 `llms.txt`
**Requirement (`AEO-01`):** Present at domain root, factual, kept in sync with real site content.
**Format:**
```markdown
# Safe Methods

> [One-paragraph accurate summary: what Safe Methods is, who it serves, how it works]

## What We Do
[2-4 sentences on the actual value proposition]

## Key Pages
- [Homepage](https://safemethods.com/): [one-line description]
- [About](https://safemethods.com/about): [one-line description]
- [How It Works](https://safemethods.com/how-it-works): [one-line description]

## Important Facts
- [e.g., "Not affiliated with any single bank or lender"]
- [e.g., "Rankings generated from posted rates, not paid placement"]
```

### 4.2 Answer-Ready Content Blocks
**Requirement (`AEO-02`):** Direct, self-contained answers to likely questions, visible in prerendered HTML, not buried in the chat.
**Format:**
```html
<section>
  <h2>Is Safe Methods free to use?</h2>
  <p>[Direct, complete, accurate 1-3 sentence answer]</p>
</section>
```
Write each block as if an AI system will lift only that paragraph with no other context — it must be correct and complete alone.

### 4.3 No JS-Only Answer-Critical Content
**Requirement (`AEO-03`):** Anything that matters for how AI engines describe the business must exist in prerendered HTML.

### 4.4 E-E-A-T / Trust Signals
**Requirement (`AEO-04`):** Real team/consultant bios, verifiable contact info, clear disclosures — all reachable without JS. Financial (YMYL) content is held to the highest scrutiny tier by both search and AI systems.

### 4.5 Consistent NAP
**Requirement (`AEO-05`):** Name, Address, Phone consistent across the site, Google Business Profile, and any directory listings.

### 4.6 Freshness Signals
**Requirement (`AEO-06`):**
```html
<p class="text-sm text-muted">Rates last updated: [rendered dynamically from rates.updated_at]</p>
```
Never a static string — always rendered from the live `rates` table.

---

## 5. Content & Trust Standards

* **`CONTENT-01`:** Educational content must be visually/structurally separated from anything resembling personalized advice (Constitution's "Explainable AI"; `EVAL-DIM-06`).
* **`CONTENT-02`:** No implied guaranteed outcomes or unverifiable "best rate" claims — rankings come strictly from the rates table (`RANK-01`/`RANK-02`), never marketing framing.
* **`CONTENT-03`:** Every page must state, in reachable text, that human consultation is available/encouraged (Constitution's "Encourage Second Opinions").
* **Redirect format** (for any future URL changes, not just the current WordPress migration):
```
/old-path/     /new-path     301
```

---

## 6. Performance & Governance Targets

| Metric | Target | Source |
| :--- | :--- | :--- |
| Page Load Time | `< 2 seconds` | `02-architecture.md`, verified on production |
| Public routes with valid meta/OG/structured data | 100% | Section 3 |
| Indexed pages match live routes | 100%, zero orphaned URLs | Ongoing hygiene |
| AI-answer accuracy spot-check | No fabricated/outdated claims detected | `GR-OUT-05` |

---

## 7. Ongoing Verification Checklist

Run this against any new page before launch, and periodically against the whole site.

- [ ] Raw HTTP fetch returns real, complete HTML (not JS-dependent)
- [ ] Unique title + meta description present
- [ ] OG/Twitter tags present and rendering correctly in a preview debugger
- [ ] Canonical tag present
- [ ] Page included in `sitemap.xml`, not blocked in `robots.txt`
- [ ] Structured data present (where applicable) and validated via Google Rich Results Test
- [ ] One `<h1>`, logical heading order, descriptive `alt` text
- [ ] Lighthouse/PageSpeed confirms `< 2s` load and passing Core Web Vitals
- [ ] No placeholder text anywhere on the page
- [ ] Any rate/data content shows a live, dynamically-rendered freshness timestamp
- [ ] Page content matches any corresponding `llms.txt` or structured-data claims exactly
