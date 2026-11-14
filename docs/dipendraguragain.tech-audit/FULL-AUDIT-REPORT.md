# dipendraguragain.tech — SEO Audit

**Date:** 2026-10-03 · **Method:** raw-HTML fetch, header inspection, response timing, JSON-LD extraction, real-browser probes (system Chrome via Playwright), WebSearch SERP analysis.

**Read this first:** this audit was run against a deployment that is currently **broken for all real users** (§0).
The health score below is *standing SEO health with the outage excluded*. Fix §0 before reading the rest.

---

## 0. CRITICAL — the site renders an error page for every real visitor

| | |
|---|---|
| **Symptom** | Every page returns HTTP 200 with perfect server HTML, then client JS throws and Next.js's built-in global error boundary replaces the entire page with "This page couldn't load" |
| **Why crawlers see nothing wrong** | The HTML is complete (1,441 words on the homepage) and every surface is correct. The failure is client-side only |
| **Cause** | `resolveSiteUrl()` in `src/data/seo.ts` threw during module evaluation in the **client bundle**. `NEXT_PUBLIC_SITE_URL` is inlined as `http://localhost:3000`, the loopback guard rejected it, and the Vercel fallback vars are server-only (`undefined` in the browser) — so it fell through to the production `throw` |
| **Blast radius** | Total. An uncaught module-scope error takes down the whole React tree |
| **Status** | **Fixed in the working tree, not yet deployed** |

Verified in a real browser before and after:

| | title | body | page errors |
|---|---|---|---|
| Live/deployed build | *(empty)* | "This page couldn't load" | 1 |
| Fixed build, served locally | Web Developer & SEO Specialist in Nepal… | real site content | **0** |

**Two actions required:**

1. Commit `src/data/seo.ts` and redeploy. Because `NEXT_PUBLIC_*` is inlined at build time, only a rebuild fixes it — a restart does nothing.
2. Set `NEXT_PUBLIC_SITE_URL=https://dipendraguragain.tech` in Vercel → Settings → Environment Variables → **Production**. The fix works without this (the browser falls back to its own origin), but the value is wrong in your production environment and will bite again.

### Timeline that matters
An earlier analysis flagged that this site shipped `http://localhost:3000` in its canonicals. That got fixed — the canonical, sitemap, `robots.txt` and `llms.txt` all read correctly now. **The fix introduced a worse bug than the one it solved**, because the replacement validation was stricter on the client than the client can satisfy. That is the single most important lesson in this report: *a guard that fails the build is only safe on the server*.

---

## 1. SEO Health Score: 66 / 100 *(outage excluded — see §0)*

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 74 | 16.3 |
| Content Quality | 23% | 48 | 11.0 |
| On-Page SEO | 20% | 72 | 14.4 |
| Schema / Structured Data | 10% | 78 | 7.8 |
| Performance | 10% | 74 | 7.4 |
| AI Search Readiness | 10% | 58 | 5.8 |
| Images | 5% | 65 | 3.3 |
| **Total** | | | **66.0** |

Business type: **local service + portfolio hybrid** (solo consultant, Kathmandu).

---

## 2. What genuinely works — and it is a lot

Credit where due; several of these are better than typical.

- **Server-side rendering is excellent.** 1,441 visible words in raw homepage HTML, 640 on a blog post, present without JS execution. AI crawlers read everything.
- **Sitemap: 20 URLs, all resolve 200, zero localhost.** Static routes correctly omit `lastmod` rather than assert a fake date.
- **AI crawler access: complete.** Every relevant crawler explicitly allowed with documented in-code intent.
- **URL normalisation:** `/about/` → 308 → `/about`; `http://` → 308 → `https://`. Correct.
- **404 handling:** HTTP 404 with `noindex, nofollow`.
- **Canonicals:** self-referencing and correct on every page checked.
- **Schema graph:** coherent `@id` graph — `#person`, `#website`, `#service`, `#article` — with cross-references rather than duplicated inline properties. Broad coverage: Person, WebSite, ProfessionalService, BlogPosting, Service + OfferCatalog, CreativeWork, BreadcrumbList.
- **Speed:** TTFB 0.23–0.27s, full page in 0.29–0.38s across all page types. Consistent.
- **Recency:** `dateModified` 2026-09-30, three days old. Content under 3 months is ~3× more likely to be cited.
- **No microdata/RDFa conflicts**, single JSON-LD block per page.
- **`sameAs`** correctly populated with LinkedIn, GitHub, Facebook, Instagram.

---

## 3. Content Quality — 48/100 (weakest category)

Measured from `src/data/blog.ts`:

| Post | Words | Paragraphs | Claims | Actual |
|---|---|---|---|---|
| technical-seo-foundations | 356 | 7 | 5 min read | ~1.8 min |
| whatsapp-booking-site | 305 | 7 | 4 min read | ~1.5 min |
| ecommerce-one-system | 279 | 6 | 5 min read | ~1.4 min |

- **Reading times are overstated 2.7–3.6×.** Inflating a time-to-read is the kind of small dishonesty a reader can check in ten seconds.
- **Zero statistics, zero cited sources** across all three posts. No percentages, no "according to", no external links, no primary sources. This is the single biggest reason pages get passed over for AI citation.
- **Zero H2/H3 subheadings in any article body.** ~350 words of unbroken prose with nothing for a retrieval system to chunk on.
- **All three posts sit far below the 1,500-word blog floor** (a topical-coverage guideline, not a ranking factor — word count is not a direct ranking signal, and a tight 500-word page beats a padded 2,000-word one. The problem is not length, it is that nothing here is *complete*).
- **Content density flagged low** by `content_quality.py`: overall 69/100, information density 0.06, flag `low-density`. Repetition 5/100 and AI-pattern 0/100 are both good — the prose reads human, it is just thin.

### Content accuracy — your own post contradicts your own code

`technical-seo-foundations` tells readers:

> "Organization, WebSite and FAQPage cover most business sites"

**Google retired FAQ rich results for all sites on 2026-05-07.** Your `structured-data.ts` knows this — it carries an explicit comment explaining why `FAQPage` is deliberately absent. So the code is right and the published advice is wrong. On a site selling SEO expertise, that is a trust problem, and it is exactly the passage an AI engine would quote as evidence of your authority.

---

## 4. On-Page — 72/100

- Titles and descriptions are genuinely well-crafted, query-led, and free of brand-first padding. Homepage title leads with the query, not the name — the right call for an entity nobody searches for yet.
- **Headings are marketing-shaped, not query-shaped:** `I Build Websites. Then I Get Them FOUND`, `Build. Optimize. Grow.`, `Three Jobs, Usually Split Between Three People.` Memorable to a human, unextractable for an answer engine.
- 1 × H1, 32 headings, clean hierarchy on the homepage.
- A 7-question FAQ block exists as *content* (question-shaped, self-contained, genuinely citable) and is correctly **not** wrapped in `FAQPage` schema.

---

## 5. Schema — 78/100

Well above average. Gaps, all in the local-service direction:

| Gap | Why it matters |
|---|---|
| `ProfessionalService` has no `telephone` | You display +977-9840814142 prominently. A local service business omitting its phone from schema is leaving the most useful local signal on the floor |
| No `email`, `priceRange`, `geo`, `openingHoursSpecification` | Standard local completeness |
| `BlogPosting.publisher` is a `Person` | Conventionally an `Organization` |
| Stale comment, `structured-data.ts:38` | Claims "Every social link is currently an empty string, so `sameAs` is omitted" — false; 4 links are populated |
| `Person` has no `telephone` | Minor |

Deliberate omissions — `streetAddress`, `aggregateRating` — are correct and documented. No `HowTo`, no `FAQPage`. Good discipline.

---

## 6. Performance — 74/100 *(lab only)*

No Google credentials configured, so **CrUX field data and PageSpeed Insights were unavailable. These are lab numbers, not field data.**

| Page | TTFB | Total | HTML |
|---|---|---|---|
| / | 0.24s | 0.34s | 175 KB |
| /services/seo | 0.25s | 0.31s | 76 KB |
| /blog/technical-seo-foundations | 0.24s | 0.29s | 66 KB |
| /work/poms-penthouse | 0.24s | 0.30s | 66 KB |

`preload_check.py`: **50/100** — LCP image not marked `fetchpriority="high"` (0 found), no `<script type="speculationrules">` for prefetch/prerender. Fonts are self-hosted and preloaded correctly; no bfcache killers detected.

Homepage HTML at 175 KB is on the large side for a portfolio — mostly inlined RSC payload.

---

## 7. AI Search / GEO — 58/100

- **Server-side rendering:** pass, and it is the strongest single asset here.
- **Crawler access:** pass, complete.
- **`llms.txt`:** present, well-structured, all URLs now absolute and correct. Per Google's AI optimization guide, `llms.txt` is **not** needed for Google Search and does not help or hurt visibility — it may serve non-Google systems. Not a ranking lever; do not invest further in it.
- **Brand mentions: the real gap.** Search for `"Dipendra Guragain"` returns no professional result — only an unrelated dating profile, an unrelated developer's résumé, and a different Upwork developer. Brand mentions correlate ~3× more strongly with AI visibility than backlinks; YouTube mentions are the strongest measured signal (~0.737), Reddit and Wikipedia high. You have none of the three. LinkedIn/GitHub profiles exist but do not surface.
- **No statistics worth quoting** anywhere — see §3.
- **Multi-modal:** images only. No video, no tables, no charts, no interactive tools.

---

## 8. Local SEO

- NAP: phone, WhatsApp and email are present and consistent in the page copy. No street address — appropriate and documented for a service-area business.
- **Google Business Profile: not found via available search.** Caveat: the search tool is US-region and covers Nepali local listings poorly, so this is *not* evidence that no listing exists. **Verify manually** — if you do not have a GBP, claiming one is the highest-value local action available to you.
- **Do not build location pages at scale.** You are one person covering Nepal. A handful of genuinely differentiated pages may be justified; dozens are not. The quality gates exist because mass location pages are the classic doorway-page pattern.
- Realistic local action: claim/complete GBP, add `telephone` + `geo` + `areaServed` to `ProfessionalService`, and get listed in Nepali business directories.

---

## 9. Competitive / SERP reality (WebSearch)

Two different SERPs demand two different things, and your site only matches one:

**"SEO services Nepal" — you match.** The SERP is dominated by personal-brand consultant sites ([rankwithnaresh.com](https://rankwithnaresh.com/seo-services-nepal/), [sumanstha.com](https://sumanstha.com/seo-freelancer-vs-seo-agency-in-nepal/), [amanmishra.com.np](https://amanmishra.com.np/affordable-seo-services-nepal/)) — the same page type as yours. This is your winnable ground.

**"Hire web developer Nepal" — you do not match.** That SERP is marketplaces and directories: [Upwork](https://www.upwork.com/hire/wordpress-developers/np/), [DesignRush](https://www.designrush.com/agency/software-development/nodejs), [Clutch](https://clutch.co/profile/genesis-web-technology), [Guru](https://www.guru.com/freelancers/bal-krishna-thapa-magar). No individual portfolio site ranks. Competing there on a personal site is a page-type mismatch — the correct response is not more content, it is repositioning toward queries where a consultant site is the expected result.

**Competitor content architecture:** Naresh Thapa ranks with a **topic cluster** — a services page, a local-SEO page, an ecommerce-SEO page and a standalone guide, interlinked. You have one SEO service page and three short posts. That gap is the concrete, winnable one.

**Pricing transparency is a ranking theme** in this niche. "Cost", "price" and "affordable" appear in the ranking URLs and titles of nearly every competitor. You publish no pricing.

---

## 10. Technical — 74/100

| Issue | Severity |
|---|---|
| `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy` all **missing** | Medium — not ranking factors, but clickjacking and MIME-sniffing exposure. `Strict-Transport-Security: max-age=63072000` is present and correct |
| `www.dipendraguragain.tech` does not resolve (connection failure) | Low — no duplicate-content risk, but a UX dead end if anyone types `www.` |
| `/index` returns 200 | Low — canonicalises correctly to `/`, so harmless |
| `X-Powered-By: Next.js` | Low — minor fingerprinting |
| No `hreflang` | **Correct** — single-language site |
| `/admin` returns 200 with `noindex, nofollow, nocache`, no content leak | Pass |

---

## 11. Backlinks

Tier 0 (Common Crawl + verification only — **no Moz or Bing key configured**, so no DA/PA, no referring-domain list, no anchor distribution; those are not measurable and were not estimated).

Domain does not appear in the Common Crawl graph (`cc-main-2026-jan-feb-mar`): PageRank, harmonic centrality and host count all `null`. For a site this young that is **expected and largely meaningless** — it reflects age and scale, not a defect.

Not checked: whether your four client sites credit-link back to you. That is the most likely legitimate link source in this niche and a cheap win — worth doing manually.

---

## 12. Priority Action Plan

### Phase 1 — now
1. **Deploy the client-crash fix** (§0). Nothing else matters until real users can see the site.
2. **Set `NEXT_PUBLIC_SITE_URL=https://dipendraguragain.tech`** in Vercel Production.
3. **Resubmit `sitemap.xml`** in Search Console once deployed.

### Phase 2 — this week
4. **Correct the `FAQPage` advice** in `technical-seo-foundations`. It is the one item on your site that is actively wrong.
5. **Fix the reading times** or drop them. 5 min → ~2 min.
6. **Add `telephone`, `email`, `geo` and `areaServed` to `ProfessionalService`** — you display a phone number and omit it from schema.
7. **Claim/verify your Google Business Profile.**
8. Add the five missing security headers.

### Phase 3 — this month
9. **Add H2 subheadings to all three posts**, phrased as the question a person would type, with 134–167-word answer blocks underneath. Fixes structure and citability at once.
10. **Add one sourced statistic per post.** Highest-leverage content change available.
11. **Mark the LCP image `fetchpriority="high"`.**
12. **Fix the stale comment** at `structured-data.ts:38`.
13. **Add a pricing/cost page** — the niche's proven ranking theme and your biggest content gap.

### Phase 4 — ongoing
14. **Start a YouTube channel.** Strongest measured correlation with AI citation, thin competition in Nepali web-dev content.
15. **Ask four clients for a credit link.**
16. Refresh posts on a schedule — recency is a genuine citation lever and cheap at your volume.

---

## 13. How to know any of this worked

Each recommendation, with its falsification check:

| Action | How you'd know it failed |
|---|---|
| Deploy fix | Load the site in a normal browser; if you see "This page couldn't load", it failed |
| Env var | View source on the live homepage; `canonical` must not be localhost |
| Sitemap resubmit | Search Console reports "Submitted URL not found" or rejects it |
| FAQPage correction | The string "FAQPage" still appears in your published advice |
| Statistics | A post still contains no number a reader could check |
| H2 structure | The article body still has zero `<h2>` elements |
| GBP | Searching your business name in Google Maps returns no listing |
| Brand mentions | `"Dipendra Guragain"` still returns nothing professional |

**Leading indicator to watch without re-running any of this:** Search Console impressions for the query cluster around "SEO services Nepal" / "SEO expert Kathmandu". Rising impressions before rising clicks means the content work is landing and rankings are following.

---

## 14. Limitations of this audit

Stated plainly so the score is not over-read:

- **Full parallel subagent audit failed** — the inference gateway returned `503` then `402 Budget pool quota exhausted`. All 13 agent dispatches died. This audit was run inline instead. Coverage is therefore narrower than a full audit: no Lighthouse/CrUX field data, no live backlink API, no geo-grid, no full automated crawl.
- **Performance figures are lab measurements**, not field data. No Google API credentials are configured.
- **Screenshots were unusable** — the runtime's `capture_screenshot.py` uses `wait_until="networkidle"`, and the installed Playwright browser build (1228) does not match what the runtime expects (1234). Visual/mobile assessment could not be completed. The above-fold and mobile-rendering categories are **not** covered.
- **Scores are heuristics, not Google-internal signals.** No third-party tool has access to Google's ranking data. Validate against Search Console.
- **`images` scored 65 without full assessment** — alt text, formats and dimensions were not exhaustively checked.
