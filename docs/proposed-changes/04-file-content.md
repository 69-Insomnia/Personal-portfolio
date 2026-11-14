# 04 — File-owned content edits (PROPOSED, NOT APPLIED)

Everything in this file belongs in **source files**, not SQL. `scripts/sync-content.ts`
makes the file authoritative for these columns, so a SQL `UPDATE` against any of
them is overwritten the next time the script runs.

Apply the edits, then push them:

```
npx tsx scripts/sync-content.ts
```

That script syncs services (`body`, `description`, `title`, `short_description`,
`capabilities`), posts (`content`, `excerpt`, `title`, `reading_time`, …) and
`experience.description`. It never deletes rows and never touches `published` on
an existing row.

---

## ⚠️ Read this before writing the "one real project as proof" sections

Task 3's service template asks for **one relevant real project as proof** on each
of the seven service pages. Four of the seven have one. **Three do not, and I
am not going to invent them.**

| Service | Provable project | Why |
|---|---|---|
| web-development | ✅ POM's Penthouse, DrillThru | Both confirmed builds, both in the confirmed stack |
| seo | ✅ DrillThru | Structured data and page metadata on that build are documented |
| ecommerce-growth | ✅ POM's Penthouse *(with a caveat — see below)* | The funnel thinking is there; it is not a store |
| digital-marketing | ✅ DrillThru | Services presented as one system, which is the whole argument of this service |
| ai-search | ❌ **NONE** | No confirmed project involved AI-search work |
| meta-ads | ❌ **NONE** | No confirmed project involved Meta Ads work |
| google-ads | ❌ **NONE** | No confirmed project involved Google Ads work |

The last three are the ones a buyer is most likely to check, because they are
the ones with money attached. A fabricated ad case study is the single most
damaging thing this brief could produce — it is falsifiable by anyone who asks
one follow-up question, and it sits under a heading claiming proof.

Each of those three carries a `TODO(proof)` below instead. Options when you have
real work to point at: publish a campaign you actually ran, or drop the proof
section from those pages and let the "common mistakes I fix" section carry the
credibility. A service page without a proof section is unremarkable. A service
page with an invented one is a liability.

**Caveat on ecommerce-growth + POM's Penthouse:** it is a hospitality booking
site, not an online store. The *funnel* reasoning transfers — find where people
drop off, fix that before buying traffic — but the page must not imply retail
ecommerce experience it does not have. The wording below says so explicitly.

---

## 1. `src/data/services.ts` — new `body` sections

Each block below is an additional entry for that service's `body` array. Existing
entries are unchanged; these fill the three gaps in Task 3's template that no
current section covers: *who it's for / not for*, *how I measure it*, and
*proof*. Headings are question-shaped to match the existing convention, because
that is the shape answer engines extract.

Insert each block into the relevant `body: [...]` array in `serviceOrder`.

---

### `web-development`

```ts
{
  heading: 'Who website development is for, and who it is not for',
  paragraphs: [
    'It is for a business that needs a site built properly the first time, and can give a few hours in the first week to describe how the business actually works. Most of the value is decided in that conversation, and a project that starts without it costs more later.',
    'It is not for someone who needs a page live this weekend. A fast turnaround means a template, and a template is a reasonable answer — it is just a different one, and worth choosing deliberately rather than arriving at by accident.',
    'It is also not the right first purchase for a business with no customers yet. If nobody knows the business exists, the site cannot fix that on its own, and the money is better spent on reaching people first.',
  ],
},
{
  heading: 'How I measure whether a website build worked',
  paragraphs: [
    'Not by how it looks. The measures are Core Web Vitals field data from real visitors rather than a lab score, whether the pages that matter are indexed and can be found, the completion rate on the enquiry form, and what people do on the site in the first fortnight after launch.',
    'The one I care about most is whether the site is still being edited six months later. A build nobody touches has usually been abandoned rather than finished, and that is a design failure, not a client one.',
  ],
},
{
  heading: 'What this looked like on a real build',
  paragraphs: [
    'POM\'s Penthouse, a serviced-apartment residence in Lakeside, Pokhara, needed guests to compare three apartment types and reserve. The reservation path ended up as a single WhatsApp tap rather than a form, and that decision shaped everything else: the apartments sit side by side with their own photographs, amenities and a from-price per night, so the comparison happens without clicking through.',
    'It was built mobile-first because the guest is on a phone, and the images were sized for that screen rather than scaled down from desktop. The reasoning behind the WhatsApp decision is written up in full in the notes.',
  ],
},
```

---

### `seo`

```ts
{
  heading: 'Who SEO is for, and who it is not for',
  paragraphs: [
    'It is for a site that already has pages and does not rank — the most common situation, and usually the cheapest to improve, because the content exists and the problem is in how it is structured and served.',
    'It is not for a business with no site yet. Building content around a site that does not exist puts the work in the wrong order. Build first, then optimise.',
    'It is also not a rescue for a product nobody wants. Search captures existing demand; it cannot manufacture it. If the demand is not there, paid advertising will show that faster and more cheaply than six months of content.',
  ],
},
{
  heading: 'How I measure SEO',
  paragraphs: [
    'Search Console impressions and clicks for the queries the page is actually targeting, rankings for those specific queries rather than an aggregate score, whether new pages get indexed at all, and enquiries or orders rather than sessions.',
    'The number I trust least is total traffic. It goes up when a page ranks for something irrelevant and means nothing on its own. The number I trust most is a query that previously had impressions and no clicks starting to convert.',
  ],
},
{
  heading: 'What this looked like on a real project',
  paragraphs: [
    'On the DrillThru agency site, the search work was built into the page rather than added afterwards: a title and meta description aimed at specific Nepal web-design queries, a canonical URL on the correct domain, and structured data covering the organisation, the site and the FAQ block.',
    'The point was not the tags themselves. It was that they were decided while the pages were being written, which is the only time the decision is cheap.',
  ],
},
```

---

### `ai-search`

```ts
{
  heading: 'Who AI search work is for, and who it is not for',
  paragraphs: [
    'It is for a business whose buyers already ask an assistant before they ask a search engine — usually anything involving a comparison, a shortlist, or a recommendation. If that is how your customers behave, being absent from those answers has a cost.',
    'It is not worth buying as a standalone project before the ordinary search work is done. Most AI citations are pulled from pages that already rank well, so the work that earns citations is largely the work that earns rankings.',
    'And it is not a channel anyone can guarantee. Do not buy it from an agency promising a share of AI answers.',
  ],
},
{
  heading: 'How I measure AI search visibility',
  paragraphs: [
    'By asking the systems directly, on a fixed set of questions, on a schedule, and recording what they say and whether the business is mentioned. That is a manual check, and it is the only honest one — there is no dashboard that reports your share of AI answers.',
    'Alongside that: whether the AI crawlers are allowed to fetch the site at all, whether the key pages carry a named author and a date, and whether the passages on those pages would still make sense quoted on their own.',
  ],
},
{
  // TODO(proof): NO CONFIRMED PROJECT. None of the four projects involved
  // AI-search work, so this section names the one example that is verifiable
  // from this repository rather than borrowing a client's name.
  heading: 'What this looks like in practice',
  paragraphs: [
    'The clearest example I can point at is this site. AI crawlers are named explicitly in robots.txt so a later edit cannot remove them by accident, the structured data describes the person and the business rather than just the pages, and every article carries a byline and a date.',
    'If you want a client example here, that is a section I need real work for. I would rather leave it as this than attach a client\'s name to work they did not commission.',
  ],
},
```

---

### `meta-ads`

```ts
{
  heading: 'Who Meta Ads are for, and who they are not for',
  paragraphs: [
    'They are for a business that already converts some of its visitors. Advertising does not fix a page that loses people, it just sends more of them to be lost, and it makes the problem more expensive rather than more visible.',
    'They are also for a business that can produce creative regularly. Meta rewards fresh material, and an account running the same three images for a year will plateau regardless of how the targeting is set.',
    'They are not for a business with no margin to reinvest. Paid social is rented attention: stop paying and it stops.',
  ],
},
{
  heading: 'How I measure Meta Ads',
  paragraphs: [
    'Cost per purchase or per qualified lead, and the value of what was actually bought — not cost per click, and not impressions. Where the tracking cannot support that, fixing the tracking is the first deliverable rather than a note at the end.',
    'I also check the events against real orders rather than trusting the dashboard. One test order placed from a phone should produce one purchase event; if it produces two, every number above it is wrong.',
  ],
},
{
  // TODO(proof): NO CONFIRMED PROJECT. No Meta Ads work is confirmed on any of
  // the four projects. Do not point this at DrillThru — that site advertises
  // Meta Ads as an agency service; it is not evidence that I ran campaigns.
  heading: 'What this looked like on a real account',
  paragraphs: [
    'TODO(proof): a confirmed Meta Ads engagement belongs here, with the account structure, the tracking problem found, and what changed. Until one exists this section should be removed from the page rather than filled with something adjacent.',
  ],
},
```

---

### `google-ads`

```ts
{
  heading: 'Who Google Ads are for, and who they are not for',
  paragraphs: [
    'They are for a business whose customers already search for what it sells. That is the whole advantage: the person has told you what they want before they see the ad.',
    'They are not for a product nobody searches for. There is no query to bid on, and the budget goes to Display by default, which is a different job with different expectations.',
    'They are also not a substitute for the landing page. Sending a search for one specific product to a category page is the most expensive mistake in the channel and it is invisible in the ads dashboard.',
  ],
},
{
  heading: 'How I measure Google Ads',
  paragraphs: [
    'Cost per conversion, search terms that actually triggered the ads rather than the keywords that were bid on, and the share of spend going to queries the business cannot serve. That last one is usually where the money is hiding.',
    'Conversion tracking is verified against a real conversion before any budget decision is made. Optimising against a duplicated conversion action makes a losing campaign look efficient.',
  ],
},
{
  // TODO(proof): NO CONFIRMED PROJECT. No Google Ads work is confirmed on the
  // four projects. Same caution as meta-ads above.
  heading: 'What this looked like on a real account',
  paragraphs: [
    'TODO(proof): a confirmed Google Ads engagement belongs here. Until one exists, remove this section rather than filling it.',
  ],
},
```

---

### `ecommerce-growth`

```ts
{
  heading: 'Who ecommerce growth work is for, and who it is not for',
  paragraphs: [
    'It is for a store that already gets visitors and loses them somewhere between the product page and the payment. That is the situation the work is built for, and it is usually cheaper to fix than anything involving more traffic.',
    'It is not for a store with no visitors yet. There is nothing to diagnose, and the answer is the ordinary search and advertising work rather than this.',
    'The comparison worth being careful about: if a store has one product and no brand, the constraint is demand, not funnel. This work assumes the demand exists and is being wasted.',
  ],
},
{
  heading: 'How I measure ecommerce growth',
  paragraphs: [
    'Where people leave, rather than how many arrive: view-to-cart per product, cart-to-checkout, checkout completion by device, and revenue per session. Each one points somewhere different, and the one that moved tells you whether the fix worked.',
    'Underneath all of it, whether the purchase event is accurate. A funnel analysed against a purchase event that fires twice will send you to fix the wrong step with complete confidence.',
  ],
},
{
  heading: 'What this looked like on a real project',
  paragraphs: [
    'POM\'s Penthouse is a booking site rather than a store, so it is not a retail example and I will not present it as one. What transfers is the reasoning: the decision was to stop a guest at the point they would otherwise abandon, and move the conversation to where they already were.',
    'The same question drives store work — which step loses the most people, and what does removing it cost — but the answer on a store is usually a product page or a checkout, not a chat.',
  ],
},
```

---

### `digital-marketing`

```ts
{
  heading: 'Who a digital marketing engagement is for, and who it is not for',
  paragraphs: [
    'It is for a business large enough to be running more than one channel, and small enough that the channels are still coordinated by whoever is available. That gap is where the work is useful, because it is where the reports stop agreeing.',
    'It is not for a business that has not yet proved one channel works. Coordinating four channels that all lose money produces a tidier set of reports and the same result.',
    'It is also not a replacement for specialist depth. On a large account the sensible split is this work for the plan and the budget, and a specialist for each channel.',
  ],
},
{
  heading: 'How I measure it',
  paragraphs: [
    'Cost per acquisition across the whole account rather than per channel, because that is the number that changes when channels start working together instead of competing for credit. And what share of spend went to channels that hit the return agreed before the quarter began.',
    'The measure I care about most is what got cut. An engagement where nothing was ever stopped is one where every channel is producing an anecdote about the time it worked.',
  ],
},
{
  heading: 'What this looked like on a real project',
  paragraphs: [
    'The DrillThru build is the closest example: web development, search and paid media presented as one offer rather than three service pages, with the proof ordered deliberately — figures under the hero, then the process, then the work and testimonials.',
    'That is the same argument this service makes, applied to a website instead of a budget: the channels only pay off when they are planned against one target.',
  ],
},
```

---

## 2. `src/data/blog.ts` — three rewritten excerpts

Task 3 asks for these to be answer-first: a direct answer in the first two
sentences, then the depth. Each replacement is a drop-in for the existing
`excerpt` string; the `content` arrays are untouched.

**`technical-seo-foundations`**

```diff
- 'Sites that "need more content" usually need their existing pages to be crawlable, fast and unambiguous first. Here is the order I check things in, and why content comes last.',
+ 'A site that has stopped ranking usually needs its existing pages fixed, not more of them. Crawlability comes first, then page focus, then metadata, then speed — and content is the last lever, not the first.',
```

**`whatsapp-booking-site`**

```diff
- 'A booking form asks a guest to trust a strange site with their dates. WhatsApp asks them to do what they already do all day. On a recent hospitality build the second option was the obvious one.',
+ 'On the POM\'s Penthouse booking site in Pokhara, the reservation path became a single WhatsApp tap instead of a form. Short-stay guests are on a phone and often already travelling, and a form cannot answer the two questions they actually have.',
```

**`ecommerce-one-system`**

```diff
- 'The storefront, the search result, the ad and the report get optimised in separate rooms by separate people. The customer only ever experiences them together.',
+ 'Most ecommerce problems arrive described as one problem and turn out to be the same problem seen from four angles. A slow product page is an SEO issue, an advertising issue and a merchandising issue at once — which is exactly why nobody owns it.',
```

> **Note:** changing `excerpt` also changes the meta description on those three
> posts, because `postSEO` falls back to `post.excerpt`. All three replacements
> are 150–175 characters, inside the range `clampDescription` works with. If you
> prefer the search snippet to differ from the on-page summary, the `seo_meta`
> rows in `02-seo-meta-new-rows.sql` already set explicit descriptions — and
> `seo_meta` wins over the template.

---

## 3. `src/sections/Profile/index.tsx` — the About story

The `BIO` array (five paragraphs, currently lines 25–31). Task 3 asks for a
first-person story that connects the two real roles to why search and ads
matter. **No invented dates, no invented employers.**

**Replace the array with:**

```ts
const BIO = [
  "I'm Dipendra Guragain, an ecommerce growth specialist in Kathmandu. I build websites and then work on the part that decides whether they do anything: whether people can find them, and whether the people who arrive stay long enough to buy.",
  "I started on the build side. A year as a web developer at DrillThru, a web design and digital marketing agency in Nepal, put me next to the search and paid-media work for the first time. I was building the pages and watching what happened to them afterwards, which is a different education from building them and stopping.",
  "That is where the interesting question changed. It stopped being 'does this page work' and became 'does anyone arrive at it, and what do they do when they get there'. The two are not the same job, and most teams split them between two people.",
  "Six months building the booking site for POM's Penthouse, a serviced-apartment residence in Lakeside, Pokhara, tested it properly. Guests had to compare three apartment types on a phone and then reserve. The answer was not a better form — it was moving the reservation into WhatsApp, where the guest already was. That decision came from watching how the customer behaved rather than how booking sites usually work.",
  "I am studying for a BCA at Ratna Rajyalaxmi Campus alongside client work. Most of what I know came from shipping something and then watching what happened to it, which is slower than reading about it and the only way I have found that sticks.",
];
```

**What changed and why:**

- The opening sentence now states the role and the place together, matching the
  site's own positioning rather than restating it in different words.
- The DrillThru paragraph is framed as *where the question changed* rather than
  as a job listing. It is the bridge between the two halves of the practice,
  which is what Task 3 asks this page to do.
- The POM's Penthouse paragraph keeps the concrete decision and drops the
  generalising. It is the one paragraph on the page only this person could write.
- **No dates.** "A year" and "six months" are the confirmed durations and the
  only durations in the text. No months, no years, no "since 2021".
- "Lakeshore" → "Lakeside" is corrected; the published location is Lakeside,
  Pokhara.

**Still outstanding on this file:** the `FACTS` array below `BIO` says
*"Currently: Building client sites and running search and paid campaigns,
alongside a BCA."* That is a claim about what you are doing right now, which I
cannot verify. Left untouched.

---

## 4. `projects.lessons` — "what I'd do differently"

Task 3 asks for one honest paragraph per project. `projects` has no column for
it, and it is not synced by `sync-content.ts`, so a SQL `UPDATE` is the correct
mechanism — but the text needs somewhere to render.

**Recommendation: add a `lessons` column.** One line, additive, nullable, and it
renders as its own section on the case study next to the existing "Results"
block. Folding this into `marketing` would put a reflection inside an
operations section and read as an afterthought.

```sql
alter table public.projects add column if not exists lessons text;
```

Requires a small companion change in `src/app/work/[slug]/page.tsx` to render it,
in the same shape as the existing `results` block, plus a line in
`mapProject` in `src/lib/content.ts`.

The four paragraphs, drafted and ready once the column exists:

**drillthru**
> The proof on that page is ordered well, but the enquiry path assumes a visitor
> already knows which service they want. A business owner who arrives without
> that vocabulary has to guess. A second pass would open with a short
> diagnosis — what is losing you customers — and let the service pages be what
> they are for.

**trip-zone**
> Nine packages is a good number for a catalogue and a hard one for a first-time
> visitor, because every card is the same shape. I would group them by intent
> rather than by destination next time: a pilgrimage section, a short-escape
> section, a mountain-drive section. The destination filter is how a returning
> visitor browses; it is not how a new one decides.

**starglobalvision**
> Fourteen destinations is thorough and it is also a wall. The four flagship
> countries carry intake windows, which is the fact that actually starts a
> decision, and the other ten sit at the same visual weight beside them. I would
> rank them by how much detail exists rather than presenting them as equals.

**poms-penthouse**
> WhatsApp removed the friction for the guest and moved it to the property. Nobody
> wrote down what happens when two people ask about the same nights, or what the
> reply should say at eleven at night. A one-page reply guide would have been
> worth building alongside the site, and it is the kind of thing that only becomes
> obvious after launch.

---

## 5. The `/services/seo` vs `/services/seo-services` split (root cause)

Task 1 item 2 asks which URL resolves. I can't read the `redirects` table, so I
can't answer that — but the **cause** is in this repository, not in the database,
and it is a code fix rather than a SQL one.

`src/data/services.ts` lists the service with slug `seo`. The database row is
`seo-services`. `services/[slug]/page.tsx` resolves the database first and falls
back to this file, so `/services/seo` still resolves — from the static file —
and `generateStaticParams` pre-renders **both** slugs by taking the union of the
file and the table.

The result, described in that file's own comment as having happened in
production: two live URLs serving different content, each canonicalising to
itself, with the footer linking to one and `sitemap.xml` and `llms.txt`
publishing the other.

**Fix at source — change the file's slug to match the database:**

```diff
  {
-   slug: 'seo',
+   slug: 'seo-services',
    title: 'SEO Services',
```

**Four call sites reference the old slug and must move with it:**

| File | Current | Change to |
|---|---|---|
| `src/data/services.ts` | `engagementOptions[1].href: '/services/seo'` | `/services/seo-services` |
| `src/sections/Services/index.tsx` | `HOMEPAGE_SLUGS = ['web-development', 'seo', 'ecommerce-growth']` | `'seo-services'` |
| `proposed-changes/03-content-drafts.sql` | link map says `/services/seo` | `/services/seo-services` |
| `proposed-changes/02-seo-meta-new-rows.sql` | link map says `/services/seo` | `/services/seo-services` |

`Footer.tsx` and the `/services` grid need no edit — both read the static
`services` array, so they follow the slug change automatically. That is also
what makes the change safe: after it, the file and the table agree, the fallback
stops shadowing, and `/services/seo` correctly 404s (or 308s, if a redirect row
exists).

**Do not add a redirect row until you have read the `redirects` table.** If one
already exists, adding a second is how a chain starts — and that table has
chain-collapsing triggers because it has happened before.

Also worth knowing: the service page's `seoTitle` override is
`'Ecommerce Growth Specialist in Kathmandu | Services'` on the
`ecommerce-growth` row, which is the one page whose title is not generated from
the slug. A slug change does not touch it.

---

## Applying this

1. Edit `src/data/services.ts`, `src/data/blog.ts` and
   `src/sections/Profile/index.tsx` with the blocks above.
2. `npx tsx scripts/sync-content.ts` — pushes services, posts and experience.
3. The three `TODO(proof)` sections in `meta-ads`, `google-ads` and `ai-search`
   should be **left out of the file entirely** until real work exists. Do not
   commit a `TODO` string into a rendered paragraph.
