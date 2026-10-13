# Ecommerce Growth Specialist in Kathmandu: SEO Audit and Action Plan

**Prepared for:** Dipendra Guragain
**Site reviewed:** https://dipendraguragain.tech/
**Date:** 13 October 2026
**Target query:** "ecommerce growth specialist in Kathmandu"

> **Note on this file.** The audit below is reproduced as it was supplied, so it stays
> the record of what was recommended and when. A short addendum at the end records which
> items this repository already satisfies, which need a decision, and one finding that
> could be confirmed in the code. Do not edit the audit body — add to the addendum.

---

## Summary

The foundation of the site is good: it is clean, built on Next.js, has dedicated service
pages (including `/services/ecommerce-growth`) and a blog, and shows a real name, photo
and contact details. However, it is currently positioned as a web developer and SEO
specialist, not as an ecommerce growth specialist in Kathmandu. Google and AI search tools
rank a site for what it clearly proves, so the gaps below matter.

The goal: rank on Google and get cited by AI search (Google AI Mode, ChatGPT, Perplexity)
for "ecommerce growth specialist in Kathmandu."

## What Is Holding the Site Back

1. **Mixed positioning.** The title tag says "Ecommerce Growth Specialist in Nepal," but
   the visible label says "Web Developer / SEO Specialist," and the hero says "I Build
   Websites. Then I Get Them Found." Google sees conflicting signals.
2. **"Kathmandu" is missing from the title tag and H1.** The target is "in Kathmandu," but
   the title only says "Nepal."
3. **No real ecommerce proof.** The four projects are a hotel, a travel agency, an agency
   site and a consultancy. None is an online store with sales or traffic results. This is
   the biggest gap for this keyword.
4. **No numbers.** Case studies describe features but do not give results such as traffic
   growth, orders or ROAS.
5. **Testimonials are not testimonials.** The "What Clients Say" section describes what was
   built. It contains no quotes from clients, so it adds little trust.
6. **The meta keywords tag does nothing.** Google ignores it. Remove it.
7. **Thin content on the target topic.** There are only 4 posts, and none is about
   ecommerce growth for Nepali stores.
8. **Thin off-site presence.** Only LinkedIn, GitHub, Facebook and Instagram are visible.
   There is no Google Business Profile, directory listings or reviews.

## Step-by-Step Fix

### Step 1: Fix the positioning on the homepage

- **Title tag:** Ecommerce Growth Specialist in Kathmandu | Dipendra Guragain
- **Meta description:** Dipendra Guragain is an ecommerce growth specialist in Kathmandu.
  Ecommerce SEO, Meta & Google Ads, and Shopify/WooCommerce store builds that turn
  visitors into customers.
- **Top label:** change "Web Developer/SEO Specialist/Kathmandu, Nepal" to
  "Ecommerce Growth Specialist / Kathmandu, Nepal".
- **H1:** Ecommerce Growth Specialist in Kathmandu. Keep "I Build Websites. Then I Get Them
  Found" as the subheading.
- **Intro paragraph:** "I'm Dipendra Guragain, an ecommerce growth specialist in Kathmandu.
  I build online stores, fix the SEO that gets them found, and run Meta and Google Ads that
  turn visitors into customers."
- Use the same line in the footer, LinkedIn headline, Facebook and Instagram bios, and
  GitHub profile.

### Step 2: Make /services/ecommerce-growth the money page

- **Title:** Ecommerce Growth Specialist in Kathmandu | Services
- Include what you do (audit, SEO, ads, CRO, reporting), your process, who it is for, FAQs,
  and a clear call to action.
- Link to it from the homepage hero and the navigation with the anchor text "Ecommerce
  growth specialist in Kathmandu."

### Step 3: Get real ecommerce proof (most important)

- Take on 1 to 2 online stores, even at a discount or for free in exchange for a case study.
  Ideal: a Nepali Shopify or WooCommerce store.
- Record before and after numbers from Search Console, GA4 and Meta Ads: organic clicks,
  orders, conversion rate, ROAS and cost per purchase.
- Publish each as `/work/[store-name]` with the problem, what you did, and the result, with
  screenshots.
- Only publish numbers you can prove.

### Step 4: Replace the testimonials section

- Ask each client for a 2 to 3 sentence quote with name and role, and ideally a Google or
  LinkedIn recommendation.
- Move the current project descriptions into the Work section.

### Step 5: Add structured data

- **Homepage:** Person, ProfessionalService (areaServed: Kathmandu, Nepal), WebSite and
  FAQPage, with `sameAs` pointing to LinkedIn, GitHub, Facebook and Instagram.
- **Service pages:** Service. **Blog posts:** Article with author.
- Test everything in Google's Rich Results Test.

### Step 6: Write Nepal-specific ecommerce content

Publish 8 to 10 posts, each starting with a 2 to 3 sentence direct answer:

1. Ecommerce SEO for Nepali Online Stores
2. Meta Ads for Ecommerce in Nepal: Budget and Targeting
3. COD vs eSewa vs Khalti: What Converts Best?
4. Shopify vs WooCommerce for Nepal
5. How Much Does an Ecommerce Website Cost in Nepal?
6. Abandoned-Cart Email Setup for Small Stores
7. Ecommerce Audit Checklist
8. How to Track Ecommerce Conversions with GA4 and Meta Pixel

Link every post to `/services/ecommerce-growth`, and link back to the posts from that page.

### Step 7: Build the off-site footprint

- Create and verify a Google Business Profile (service-area business) using the same entity
  sentence.
- Update the LinkedIn headline to: "Ecommerce Growth Specialist in Kathmandu |
  SEO · Meta Ads · Google Ads."
- Create profiles on Upwork, Clutch, Sortlist and Nepali business directories, with
  identical name, phone and wording.
- Ask client sites (DrillThru, Star Global Vision, Trip Zone, POM's Penthouse) to link back,
  for example with a "Website by Dipendra Guragain" footer link.
- Request Google reviews from every client.

### Step 8: Technical checks

- Submit `sitemap.xml` in Search Console and request indexing for the homepage, service
  pages and posts.
- Make sure `robots.txt` does not block Googlebot or AI crawlers.
- Check Core Web Vitals in PageSpeed Insights.
- Make sure the FAQ answers are in the page HTML (not hidden behind JavaScript) and match
  the FAQPage schema.
- Fix the small "MMeta Pixel" label glitch in the Marketing tools list.

### Step 9: Test and track

Every 2 weeks, search these in Google AI Mode, ChatGPT and Perplexity:

- "ecommerce growth specialist in Kathmandu"
- "best ecommerce SEO expert in Nepal"
- "Meta ads expert Kathmandu"

Also watch impressions and clicks for those queries in Search Console.

## Timeline

- **Week 1–2:** Steps 1, 2, 5 and 8
- **Week 2–4:** Step 7 (Google Business Profile, LinkedIn, directories)
- **Month 1–3:** Steps 3, 4 and 6
- **Month 3–6:** reviews, links and updates; first AI mentions often appear in this window

## Key Takeaway

A web developer who clearly proves ecommerce growth results can outrank a generic
"ecommerce expert." The proof in Step 3 matters most: real ecommerce case studies with real
numbers, supported by consistent positioning and a strong off-site presence.

---

# Addendum — status against this repository

Added 13 October 2026, when this audit was filed. Read this before starting Step 1, so no
item is done twice or done in a way the codebase argues against.

## Already satisfied

| Audit item | Where |
|---|---|
| Step 5 — Person, ProfessionalService, WebSite nodes | `src/lib/structured-data.ts` builds all three; `SiteJsonLd` mounts them on every public route. `ProfessionalService` already carries `areaServed` for Kathmandu and Nepal. |
| Step 5 — `sameAs` for LinkedIn, GitHub, Facebook, Instagram | `profile.socialLinks`, filtered to non-empty values and threaded into the `Person` node. |
| Step 5 — Service node on service pages | `serviceNode()`, with `OfferCatalog` and — when a price is published — an `Offer` carrying `priceSpecification.minPrice`. |
| Step 5 — Article with author on posts | `articleNode()`, author referenced by `@id` to the site-wide `Person`. |
| Step 8 — robots.txt allows Googlebot and AI crawlers | `src/app/robots.txt/route.ts` names GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, Bingbot and CCBot explicitly. |
| Step 8 — FAQ answers in the HTML | The FAQ renders through native `<details>`, so every answer is in the DOM whether or not a panel is open. See `homepage.html` and `GeoBlocks.tsx`. |

## Already done, but not yet deployed

`homepage.html` at the repository root is a complete rebuild for this exact positioning:
title, meta description, top label, H1 and intro paragraph all match Step 1 word for word,
and the FAQ block matches the `FAQPage` node in its JSON-LD.

**It is not live.** It sits outside the Next app, so Vercel does not serve it. Step 1 is
written, not shipped — porting it into `src/app/page.tsx` is the remaining work, and it is a
positioning decision before it is a code change: the current homepage targets
*Web Developer & SEO Specialist*, which is a different query cluster, and the five service
routes this audit assumes (`/services/ecommerce-seo`, `/services/meta-google-ads`,
`/services/ecommerce-website-development`, `/services/email-marketing`) do not exist yet.

## One item that contradicts an existing decision

**Step 5 asks for `FAQPage` on the homepage.** Google retired FAQ rich results for all sites
on **7 May 2026**, and `src/lib/structured-data.ts` carries an explicit note explaining why
that node is absent from the graph. The Q&A *content* is retained and is genuinely what
answer engines extract; the schema earns nothing.

Include it or not, but decide deliberately — the current site omits it, `homepage.html`
includes it, and the two now disagree.

## Confirmed in code — one real bug

**Step 8's "MMeta Pixel" glitch is real.** `src/data/skills.ts` lists `Meta Pixel` under
Marketing, and `toolLogos` has no entry for it — Simple Icons has never carried a mark, as
the comment there notes. `toPlatformTool` therefore returns the name with no logo, and
`ToolMark` falls back to a lettered monogram. The chip renders a **"M" tile immediately
followed by the text "Meta Pixel"**, which reads as "MMeta Pixel".

Fix is either a mark in `public/logos/` plus a `toolLogos` entry, or dropping the name from
the category list.

## Confirmed in code — one item worth acting on

**Step 6 (meta keywords).** The audit says Google ignores the keywords tag, which is correct.
The site does still emit one: `buildMetadata` in `src/utils/metadata.ts` passes `keywords`
through to the `<head>`, and every page supplies a list. It is harmless and costs nothing,
but it is also dead weight and one line to remove if you want it gone.

## Items that need a decision or off-site work, not code

- **Steps 3 and 4** — real ecommerce case studies and real client quotes. Nothing in this
  repository can supply these, and inventing them is the one thing the audit itself warns
  against. This is correctly identified as the highest-value item.
- **Step 6** — eight to ten new posts. The publishing pipeline exists; the writing does not.
- **Step 7** — Google Business Profile, directory listings, client backlinks, reviews. All
  entirely off-site.

## Carried over from earlier audits in this repository

These are open from `FULL-AUDIT-REPORT.md` and `GEO-ANALYSIS.md` and are not repeated in this
audit, but are still outstanding: unresolved duplicate URLs where the database and the repo
disagree on a slug, a price shown in a service page's spec table that contradicts the figure
in its own FAQ, and a blog-post publishing issue whose cause is not yet confirmed.
