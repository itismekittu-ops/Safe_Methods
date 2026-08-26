# AEO/SEO Remediation Checklist

*Replaces `06-aeo-seo-implementation-plan.md`. This is a one-time punch list for the current known issues found in the live audit — not a permanent standard. Once every box is checked, archive this document; `05-aeo-seo-standards.md` governs everything going forward.*

**Audit finding this responds to:** the live site currently returns no server-rendered content to crawlers, and Google's index still shows stale content from a prior WordPress site describing an unrelated business.

**Format reference:** exact syntax for every technical item below is in `05-aeo-seo-standards.md`, Sections 3–4. This document only tracks *what* needs doing and *in what order* — it doesn't repeat the formats.

---

## How to Use This

Every item is tagged:
- 🤖 **Bolt task** — implementable in code
- 🧑 **Human task** — only you can do this (dashboard logins, outreach, content review); Bolt should not attempt these

**Work top to bottom.** Phase 0 blocks everything else. Phase 1's reindex step has a strict dependency — do not skip ahead.

---

## Phase 0 — Critical Fixes (Do First)

- [ ] 🤖 Implement SSR or static prerendering for all public marketing routes (home, about, contact, how-it-works, rates, consultants, banks). Chat/authenticated routes unaffected. *(`05` §3.1)*
- [ ] 🤖 Add unique title + meta description + OG/Twitter tags per route, present in the prerendered HTML. *(`05` §3.2-3.3)*
- [ ] 🤖 Add `robots.txt` allowing crawl of all public routes, referencing the sitemap. *(`05` §3.5)*
- [ ] 🤖 Add `sitemap.xml` auto-generated from the live route list. *(`05` §3.6)*

**Gate check:** Raw HTTP fetch (`curl`, not DevTools) of every public route returns real, unique content and metadata. Do not proceed until this is true.

---

## Phase 1 — Identity Recovery

- [ ] 🧑 Audit Google Search Console and Bing Webmaster Tools for indexed WordPress-era URLs (`/wp-content/`, `/wp-admin/`, `/category/*`, `/tag/*`, old permalinks). Produce a written list.
- [ ] 🤖 Implement 301 redirects from each legacy URL to its nearest current equivalent, using the list above; clean 404/410 for anything with no equivalent.
- [ ] 🧑 **Only after Phase 0 is live in production:** request re-indexing via URL Inspection in Search Console for key pages. *(Requesting this before Phase 0 ships causes Google to confirm the page as empty — worse than the current stale cache. Do not skip this ordering.)*
- [ ] 🧑 Correct business identity on third-party surfaces: Google Business Profile, directories, aggregators (e.g. Crunchbase/Tracxn-style listings), old backlinks, LinkedIn company page.

**Gate check:** No legacy WordPress content reachable or indexed anywhere; correct content re-indexing requested at the right time.

---

## Phase 2 — Build Real Signal

- [ ] 🤖 Add JSON-LD structured data (`Organization`, `FinancialService`, `FAQPage` where applicable) sourced live from real data. *(`05` §3.7)*
- [ ] 🤖 + 🧑 Write answer-ready Q&A content blocks (What is Safe Methods / Is it free / How are rankings determined / Bank affiliation) — Bolt builds the structure, you verify the copy is accurate. *(`05` §4.2)*
- [ ] 🤖 Publish `llms.txt`. *(`05` §4.1)*
- [ ] 🤖 Add live-rendered "last updated" timestamps to rate content. *(`05` §4.6)*
- [ ] 🤖 + 🧑 Build out real About/team content — Bolt implements, you supply real bios/credentials/disclosures. No placeholder text may remain anywhere on the site.

**Gate check:** An AI system asked "what is Safe Methods" can find accurate structured facts and plain-text answers directly in the site's HTML.

---

## Sign-Off

Once all three phases are checked:
- [ ] Full pass of the Ongoing Verification Checklist in `05-aeo-seo-standards.md` §7, run against every public page
- [ ] This document is archived — future work is governed by `05-aeo-seo-standards.md` alone
