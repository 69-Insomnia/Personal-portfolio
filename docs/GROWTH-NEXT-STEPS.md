# Growth next steps — the work that is not on the website

**Written:** 2026-10-06
**Context:** this follows the 2026-10-03 audit in `dipendraguragain.tech-audit/` and the
GEO analysis in `GEO-ANALYSIS.md`.

---

## Read this first

The goal is to rank for the commercial cluster around:

- ecommerce expert in Nepal
- marketing expert in Nepal
- SEO expert in Nepal
- Meta and Google Ads expert in Nepal

**Your website is not the bottleneck.** All five service pages already exist, are
server-rendered, carry question-shaped H2s, and sit in a coherent schema graph. Your
technical SEO is better than most of the agencies you are competing against.

The three things that actually decide those rankings, in order:

| Lever | Who can do it | Status |
|---|---|---|
| Google Business Profile (local pack) | You | **Not done — highest value** |
| Topical depth (cluster content) | Me | Pricing page done; cluster next |
| Authority (links, mentions) | You | Not done |

Everything below is listed in the order it will move the needle.

---

## 1. Google Business Profile — do this first

**Why this is #1.** For commercial queries with local intent — and most
"*service* in Nepal" / "*service* in Kathmandu" searches carry it — Google shows a map
pack *above* every organic result. A map pack has three slots. Right now you are not in
it and cannot be, because there is no profile. No amount of on-page work outranks a map
pack you are absent from.

**Time to impact:** verification usually takes a few days to two weeks; visibility in the
pack typically builds over 4–12 weeks after that as reviews and photo activity accumulate.

### Setup

1. Go to **business.google.com** and sign in with the Google account you want to own
   this permanently. Use a business-owned account, not a personal one you might lose
   access to.
2. **Business name:** `Dipendra Guragain` — and *nothing else*. No "| Web Developer
   Nepal", no keyword stuffing. Google suspends listings for that, and a suspension costs
   you far more than the keyword ever earned.
3. **Category — this is the single most important field.** You get one primary category
   and it decides which queries you can appear for.
   - Primary: **Internet marketing service** (covers SEO + ads, which is the bulk of
     your commercial intent)
   - Or **Website designer** if you would rather lead with the build work
   - Secondary: add the other one, plus **Marketing agency**, **Web designer**, and
     **Advertising agency**
   - Do not add categories you cannot actually serve. Irrelevant categories dilute
     relevance rather than broadening reach.
4. **Service area:** you can operate as a service-area business and hide your street
   address — correct for you, since there is no premises to visit. Set
   **Kathmandu** as the base and add the areas you genuinely serve. Nepal-wide is
   honest; adding specific cities you have never worked in is not.
5. **Service list:** add each service as its own entry with a description, taken from
   the copy already on your `/services` pages so the two cannot disagree. This is a
   direct relevance signal and most competitors leave it half-empty.
6. **Website:** link to `https://dipendraguragain.tech`. Use a tracked URL
   (`?utm_source=gbp&utm_medium=organic`) so you can tell whether the profile is
   producing anything.
7. **Verification:** Google will offer postcard, phone, email or video depending on
   category and location. Video verification is now common for service businesses —
   be ready to show your workspace, your tools and your work. Do not use a virtual
   address or a mail-forwarding service; that is the most common cause of suspension in
   this niche.

### After it is live — the part that actually ranks

A verified profile with three photos and no activity will not rank. The signals that
move the pack:

- **Reviews.** Volume, recency and the owner's replies. Ask your four existing clients
  (DrillThru, Trip Zone, Star Global Vision, POM's Penthouse) directly — you already
  have the relationship. Aim for the first five within a month; five reviews puts you
  ahead of most of the Nepal pack. Reply to every one, including the negative ones.
- **Photos.** Add real ones — your screen with client work on it, the Kathmandu
  workspace, screenshots of results. Geotagging is not a thing, but genuine location
  context in the image helps human trust. Aim for 10+ initially, then add a few monthly.
- **Posts.** Weekly is ideal, monthly is the floor. Repurpose the blog posts and the
  pricing page — Google treats posted content as freshness on the profile.
- **Q&A.** Seed the questions people actually ask you ("How much does SEO cost in
  Nepal?", "Do you work with clients outside Kathmandu?") and answer them yourself.
  Anyone can post a question on your profile, so you want yours there first.
- **NAP consistency.** Your name, phone (`+977-9840814142`) and email must match
  exactly across your site, the profile, LinkedIn, GitHub and any directory. The phone
  is already in your footer and contact page — do not let the formats drift.

### Verify, don't assume

Search Google Maps for `web developer Kathmandu` and `SEO Kathmandu` in a private
window. Look at the three businesses in the pack: their review counts, their primary
category, what their profiles contain. That is your actual competition, and it is
beatable — most Nepali profiles in this niche are thin.

---

## 2. Client credit links

**Why.** You have essentially no backlinks. The audit names this as your most likely
legitimate link source, and it is the cheapest authority you will ever get, because the
relationship already exists.

### What to ask for

One link per site, from the **footer**, pointing at `https://dipendraguragain.tech`.

- **Not** `nofollow` — check after it is added by viewing the page source and searching
  for `rel="nofollow"` on the link.
- Anchor text should be your **name**, not "best web developer Nepal". Keyword-stuffed
  anchor text from client sites is a link-scheme pattern, and four sites doing it at once
  is a footprint. `Dipendra Guragain` is what a real credit looks like.
- Ideally on a page that is itself linked from the homepage, so it is not buried.

### The message

> Hi [name],
>
> Quick favour — I've added [project] to my portfolio and I'm trying to get my own site
> ranking for web development work in Nepal. Would you mind adding a small credit in
> your site footer, something like:
>
> `Site by Dipendra Guragain` → https://dipendraguragain.tech
>
> A plain link is perfect, no styling needed. Happy to do the same for you if it's ever
> useful — and if you'd rather not, no problem at all.
>
> Thanks,
> Dipendra

That framing works because it is specific, it is small, it offers reciprocity, and it
gives an easy no. Vague asks ("can you link to me?") get ignored; asks with the exact
link text and destination get done.

### What NOT to do

Do not buy links, do not use a "submit your site to 500 directories" service, and do not
swap links with unrelated Nepali sites at scale. In a market this small these are easy to
detect and the downside is a manual action on the whole domain — which would undo the
technical foundation that is currently your best asset.

---

## 3. The one thing to fill in on the website

`src/data/pricing.ts` — every `fromNpr` is `null`, which renders as "Contact for a
quote" rather than inventing a number. Change `null` to a figure in rupees and the page,
its meta description and the `OfferCatalog` schema all update together.

The page currently tells visitors its figures are "still being finalised". That is honest
but it is also a weaker ranking signal than a real number, because every page ranking for
"SEO cost in Nepal" publishes one. Filling in three or four starting figures is the
highest-leverage five minutes available to you right now.

---

## 4. What is still open

| Action | Effort | Impact |
|---|---|---|
| Google Business Profile | ~1 hour | **Highest** |
| Ask four clients for credit links | ~20 min | High |
| Fill in starting prices | ~5 min | High (unblocks the pricing page's full value) |
| Add one sourced statistic per blog post | ~2h/post | High for AI citation |
| Start a YouTube channel | ongoing | High — strongest measured AI-citation signal |
| Refresh posts every 3–6 months | ~30 min/post | Medium, and cheap at your volume |

The YouTube item is worth taking seriously despite the effort. It carries the strongest
measured correlation with AI citation of any signal, and Nepali web-development content
is a genuinely thin niche. Screen-recorded walkthroughs of the technical checks you
already describe in writing would be enough — you do not need to be on camera.
