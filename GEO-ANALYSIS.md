# GEO / AI Search Readiness — dipendraguragain.tech

**Analyzed:** 2026-10-03 · **Method:** raw-HTML fetch, no JS execution (what AI crawlers actually see)
**Note:** analyzed while the `localhost:3000` origin bug is live in production. Several scores below
are depressed by that single defect and will move once it's redeployed.

---

## 1. GEO Readiness Score: 54 / 100

| Category | Weight | Score | Weighted | Note |
|---|---|---|---|---|
| Citability | 25% | 60 | 15.0 | Good prose, no statistics, no query-shaped headings |
| Technical Accessibility | 20% | 55 | 11.0 | SSR is excellent; origin bug breaks entity graph |
| Structural Readability | 20% | 65 | 13.0 | Homepage strong, blog posts have zero subheadings |
| Authority & Brand Signals | 20% | 35 | 7.0 | **Largest gap** — no external entity presence at all |
| Multi-Modal Content | 15% | 55 | 8.25 | Images yes, no video/tables/tools |
| **Total** | | | **54.3** | |

### Platform breakdown

| Platform | Score | Reasoning |
|---|---|---|
| Google AI Overviews | 45 | 92% of citations come from top-10 pages. Classic SEO is the gate, and the canonical bug is currently sabotaging it. |
| Google AI Mode | 40 | Broader pool where freshness + entity authority beat position. Freshness is excellent (modified 2026-09-30); entity identity is broken. |
| ChatGPT | 25 | Cites Wikipedia (47.9%) and Reddit (11.3%). Neither exists for this entity. |
| Perplexity | 20 | Cites Reddit (46.7%) and Wikipedia. Same absence. |
| Bing Copilot | 40 | Needs Bing index coverage + IndexNow. No verification done. |

---

## 2. AI Crawler Access — PASS

All relevant AI search crawlers are explicitly allowed in `robots.ts`, and the intent is documented
in-code so a later "block all bots" edit has to be deliberate. This is better than most sites
reviewed.

| Crawler | Status | Notes |
|---|---|---|
| GPTBot | Allowed | ChatGPT web search |
| OAI-SearchBot | Allowed | OpenAI search features |
| ChatGPT-User | Allowed | User-triggered; ignores robots.txt by design |
| ClaudeBot / Claude-User / Claude-SearchBot | Allowed | |
| PerplexityBot / Perplexity-User | Allowed | |
| Google-Extended | Allowed | Governs Gemini / AI Overviews grounding |
| Applebot-Extended | Allowed | Apple Intelligence |
| Bingbot | Allowed | Feeds Copilot |
| CCBot | Allowed | Training-only, not a search surface |

**One optional change:** `CCBot` (Common Crawl) feeds model *training*, not AI *search* citations.
Blocking it removes training exposure at no cost to visibility. Leaving it allowed is defensible if
you want the open-web presence.

---

## 3. llms.txt — Present, well-built, currently poisoned

`/llms.txt` returns HTTP 200 with a genuinely good structure: title, one-line summary, definition
paragraph, contact block, and annotated sections for Services / Selected work / Writing / Pages.

**But every single URL in it is `http://localhost:3000/...`.** For the non-Google AI systems that
*do* read this file, it is currently worse than not having it — it actively publishes dead links to
your content.

Standing guidance, for the record: Google states `llms.txt` is **not needed and does not help or hurt
Google Search visibility**. It is not a Google citation lever. It may serve non-Google systems.
Do not treat it as a ranking play.

---

## 4. Server-Side Rendering — PASS (this is your strongest asset)

The single biggest technical filter for AI crawlers is that **they do not execute JavaScript**.

| Page | Raw HTML size | Visible words in raw HTML | JS required |
|---|---|---|---|
| Homepage | 174 KB | **1,441** | No |
| Blog post | 66 KB | **640** (≈400 article body) | No |

Full headline hierarchy, project descriptions, FAQ answers and article text are all present in the
raw response. Nothing important is hydration-gated. This is correct and uncommon.

---

## 5. Brand Mention Analysis — CRITICAL GAP

Brand mentions correlate **~3x more strongly with AI visibility than backlinks** (Ahrefs, Dec 2025,
75,000 brands).

| Signal | Correlation | Present? |
|---|---|---|
| YouTube mentions | ~0.737 (strongest) | **No** — `socialLinks.youtube` is empty |
| Reddit mentions | High | **No** — nothing found |
| Wikipedia presence | High | **No** |
| LinkedIn presence | Moderate | Profile exists; does not surface in search |
| Domain Rating / backlinks | ~0.266 (weak) | Not assessed |

A search for `"Dipendra Guragain" web developer Nepal` returns **no** professional result. The only
name match is an unrelated dating profile. Your LinkedIn and GitHub profiles exist but carry too
little authority to surface.

**Schema note:** `sameAs` is correctly populated with LinkedIn, GitHub, Facebook and Instagram —
but there is a stale comment at `src/lib/structured-data.ts:38` claiming *"Every social link is
currently an empty string, so `sameAs` is omitted."* That is no longer true and will mislead the
next person to touch the file.

---

## 6. Passage-Level Citability

**Optimal citation passage: 134–167 words. ~44% of AI citations come from the first 30% of a page.**

**Working:**
- Homepage opens with a self-contained definition inside the first ~40 words: *"I'm a web developer
  in Kathmandu. I build the site, then do the search and paid work that brings people to it…"* ✓
- The 7-item "Questions, Answered" block is genuinely citable Q&A content, question-shaped and
  self-contained. Correctly **not** wrapped in `FAQPage` schema (Google retired FAQ rich results for
  all sites on 2026-05-07).
- Blog paragraphs are self-contained and can stand alone without surrounding context ✓
- Claims are specific and non-generic ("a product page that loads in four seconds on mobile") ✓

**Failing:**
- Blog paragraphs run 50–70 words — **below** the 134–167 optimal block. Too short to be the
  extracted answer on their own.
- **Zero statistics with sources.** No numbers, no cited studies, no primary sources anywhere.
  This is the most common reason a page is passed over in favour of a competitor's.
- **No query-shaped headings.** Current H2s are marketing-shaped:
  `I Build Websites. Then I Get Them FOUND` · `Build. Optimize. Grow.` ·
  `Three Jobs, Usually Split Between Three People.`
  Memorable to a human, unextractable for an answer engine. They do not match how anyone phrases a
  query.

---

## 7. Structural Readability

**Homepage — strong.** 1 × H1, 32 headings, clean H1→H2→H3 nesting, lists present.

**Blog posts — weak.** The article body renders as ~400 words of flat prose with **zero H2/H3
subheadings**. Only "Related Articles" and the CTA carry heading tags. There is nothing for a
retrieval system to chunk on, so the post competes as a single undifferentiated block.

No tables anywhere on the site. Comparative data (project before/after, service scope, cost ranges)
is exactly what gets lifted into AI answers and tables are the format it lifts most readily.

**Accuracy issue worth fixing:** the post *"Before You Write Another Blog Post, Fix These Technical
Basics"* advises using `FAQPage` for business sites. Google retired FAQ rich results for all sites on
2026-05-07. Your own content is recommending a deprecated practice — which is a real liability once
AI systems start citing that post as your expertise.

---

## 8. Entity Graph — broken by the origin bug

JSON-LD coverage is genuinely good — better than most sites this size:

`Person` · `ProfessionalService` · `WebSite` · `PostalAddress` · `BlogPosting` · `WebPage` ·
`BreadcrumbList` · `Service` (with `OfferCatalog`) · `CreativeWork`

**But every `@id` is `http://localhost:3000/#person`.** The `Person` node, the `BlogPosting` author
reference (`"author":{"@id":"http://localhost:3000/#person"}`), and the breadcrumb graph all point
at an origin that does not exist. Entity resolution across AI surfaces depends on stable, resolvable
`@id` values — this is the mechanism by which an answer engine knows that the author of your blog
post and the business on your homepage are the same entity. Right now that link is severed.

Counts on live HTML: **18 localhost references on the homepage, 36 on the blog post.**

---

## 9. Top 5 Highest-Impact Changes

Ordered by impact-per-effort.

**1. Ship the origin fix and redeploy.** *(Critical, ~5 min, blocked on you)*
Everything in §3 and §8 flows from this one defect. Set `NEXT_PUBLIC_SITE_URL` to
`https://dipendraguragain.tech` in Vercel → Production, redeploy (it's build-time inlined), then
resubmit the sitemap in Search Console. Expect the score to jump ~8–10 points on its own.

**2. Add statistics with sources to every blog post.** *(High, ~2h/post)*
Highest-leverage citability lever available. One specific, sourced number per post turns a
forgettable paragraph into a quotable one. "Core Web Vitals field data showed X on Y pages
(Search Console, site Z)" beats any amount of polished prose.

**3. Restructure blog posts with question-shaped H2s.** *(High, ~1h/post)*
Chunk each post into 3–5 H2 sections phrased as the question a person would actually type
("How do I know if my site is crawlable?"). Lengthen the answer under each to 134–167 words. This
simultaneously fixes §6 and §7.

**4. Start a YouTube presence.** *(High impact, ongoing)*
YouTube mentions carry the **strongest** measured correlation with AI citations (~0.737). Nepali
web-development and SEO content is a thin niche. Even short screen-recorded walkthroughs of the
technical checks you already describe in writing would give you the entity signal you're entirely
missing.

**5. Add comparison tables.** *(Medium, ~30min/page)*
Service scope, project outcome, or Nepal-market cost ranges. Tables are disproportionately likely
to be lifted into AI answers, and you currently have none.

---

## 10. Schema Recommendations

| Action | Priority | Detail |
|---|---|---|
| Fix all `@id` values | Critical | Resolves with the origin fix — no code change needed |
| Verify `sameAs` renders | Done | Confirmed live with 4 platforms |
| Add `YouTube` to `socialLinks` | High | Once a channel exists; feeds `sameAs` |
| Add `DefinedTerm` / `knowsAbout` expansion | Medium | Widen entity surface for topical association |
| Consider `Person.image` | Medium | Portrait helps entity disambiguation in AI answers |
| **Do not add `FAQPage`** | — | Retired for all sites 2026-05-07. Keep the Q&A *content*, drop the idea of the schema. |
| Use `QAPage` for genuine user Q&A | Low | Only if you add real user-submitted questions |

---

## 11. Content Reformatting — Specific Passages

**Homepage H2s** — rewrite for extraction, keep the voice:

| Current | Suggested |
|---|---|
| `I Build Websites. Then I Get Them FOUND` | `What Does a Web Developer in Nepal Actually Do?` |
| `Three Jobs, Usually Split Between Three People.` | `Web Development, SEO and Paid Ads: Why They Work as One System` |
| `Build. Optimize. Grow.` | `How a Project Runs: Build, Optimize, Grow` |
| `Questions, Answered` | `FAQs: Hiring a Web Developer and SEO Specialist in Nepal` |

**Blog post opens** — publish the date and the answer in the first 60 words:

> *"Most sites that stop ranking don't need more content. They need the eight pages they already
> have to be crawlable. Here's the order I check things in — robots.txt first, content last."*

That is a 134–167 word block waiting to happen, and it leads with the counterintuitive claim rather
than burying it in paragraph three.

---

## 12. Recency — PASS

`datePublished` 2026-09-12 · `dateModified` 2026-09-30. Content under three months old is ~3x more
likely to be cited; pages left stale 6+ months lose citation eligibility. You are well inside the
window. **Treat this as a program, not a one-off** — a scheduled refresh cadence is among the
highest-leverage GEO plays available, and it costs almost nothing at your content volume.

---

## Summary

The foundation is better than the score suggests. SSR is genuinely excellent, schema coverage is
broad, AI crawlers are correctly allowlisted, and recency is ideal. **Two things are holding
everything back:** a single origin defect that severs the entity graph and is capped at a one-line
config change, and the complete absence of external entity presence — no YouTube, no Reddit, no
Wikipedia, no statistics worth quoting. The first is a redeploy. The second is the actual work.
