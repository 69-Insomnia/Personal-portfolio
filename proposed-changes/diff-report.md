# diff-report.md

Every change proposed in `proposed-changes/`, with the old value, the new value
and why.

**Read the status column.** Roughly a third of your Task 1 cannot be completed
honestly yet, because it needs `old values` that live in rows I have not been
able to read. Those are marked ⛔ rather than filled with a guess — a diff table
that invents its own "old" column is worse than no diff table, because it reads
as verified.

| Symbol | Meaning |
|---|---|
| ✅ | Old value known (stated in your brief, or provably empty). Ready to review. |
| ◐ | Old value matched by pattern rather than assumed. Idempotent; safe if the value differs. |
| ⛔ | Blocked. Needs the backup, or a fact only you have. |

---

## A. `seo_meta` — nine previously empty rows

Old value for **every** column below is `NULL` / unset, which is what "no title
or description today" means. Values are in `02-seo-meta-new-rows.sql`.

| entity_type | entity_slug | field | old | new | why |
|---|---|---|---|---|---|
| page | about | meta_title | ∅ | `About Dipendra Guragain \| Ecommerce SEO, Kathmandu` (50) | Leads with the query, matches the completed rows' pattern |
| page | about | meta_description | ∅ | 157 chars | Was empty; now a full sentence inside the 140–160 band |
| page | about | ai_answer | ∅ | 82 words | Opens with the identity sentence so it survives being lifted out of the page |
| page | about | faqs | ∅ | 3 questions | "Who is he", "what is different", "does he work abroad" |
| page | contact | meta_title | ∅ | `Contact Dipendra Guragain \| Ecommerce Growth, Kathmandu` (55) | |
| page | contact | custom_json_ld | ∅ | `ContactPage` node | **The only custom node written.** See section D |
| page | contact | ai_answer | ∅ | 71 words | Carries the phone, the email and the 24-hour commitment |
| page | pricing | meta_title | ∅ | `SEO & Website Cost in Nepal \| What Moves the Price` (50) | |
| page | pricing | ai_answer | ∅ | 76 words | **Contains no number.** All prices blank in your brief |
| page | work | meta_title | ∅ | `Selected Work \| Ecommerce and Web Projects in Nepal` (51) | |
| page | work | faqs | ∅ | 3 questions | One answers "are these results verified", which is the real question about a portfolio |
| post | ecommerce-one-system | meta_description | ∃ truncated | 158 chars | Your Task 1 item 5 |
| post | technical-seo-foundations | meta_title | ∃ too long | 50 chars | Your Task 1 item 5 |
| post | technical-seo-foundations | meta_description | ∃ truncated | 151 chars | Your Task 1 item 5 |
| post | whatsapp-booking-site | meta_description | ∃ truncated | 153 chars | Your Task 1 item 5 |
| project | drillthru | meta_title | ∅ | 54 chars | |
| project | drillthru | meta_description | ∃ truncated | 146 chars | Your Task 1 item 5 |
| project | drillthru | faqs | ∅ | 3 questions | The third states that DrillThru's trust figures are theirs, not verified by you |
| project | starglobalvision | meta_description | ∃ truncated | 156 chars | Your Task 1 item 5 |

All nine rows also receive `og_title`, `og_description`, `focus_keyword`,
`keyword_cluster` and `canonical_override`.

**`og_description` now equals `meta_description` on every row**, which Task 6
asks for. Note this is a *change* from today's behaviour for the rows that
already have metadata: `buildMetadata` derives `ogDescription` from
`ogDescription ?? description`, so they already matched unless an admin set them
separately. Setting both explicitly makes it true rather than incidental.

---

## B. `01-bug-fixes.sql`

| # | table | slug / scope | field | old | new | why | status |
|---|---|---|---|---|---|---|---|
| 1 | seo_meta | post `geo-vs-seo-how-to-get-your-website-cited-by-ai-search` | custom_json_ld | contains `/blog/geo-vs-seo-ai-search` | `/blog/geo-vs-seo-how-to-get-your-website-cited-by-ai-search` | Wrong path in `@id` and `url`; structured data disagreed with the canonical | ✅ |
| 3a | services | any title matching `%Specialist  Kathmandu%` | title | double space | `Specialist in Kathmandu` | Double space *and* missing preposition | ◐ |
| 3b | services | any title matching `%Specialist Kathmandu%` | title | single space, no "in" | `Specialist in Kathmandu` | Same junction, single space | ◐ |
| 3c | services | all rows with run-on whitespace | title | e.g. `X  Y` | `X Y`, trimmed | General guard; no-op on clean rows | ◐ |
| 4 | seo_meta | service `web-development` | stats | label `internet users in Nepal, October 202516` | `… October 2025` | Stray `16`, likely a 2016 edit that left a digit | ◐ |
| 8 | services | all 7 | `price_from` / `price_currency` | — | — | **Columns do not exist.** The real column is `from_npr integer`. No currency column | ⛔ figures |
| 2 | — | — | — | — | — | Root cause identified in code, not data. See section C | ⛔ redirects |
| 6a | seo_meta | 7 service rows | `custom_json_ld` | `priceSpecification` / `minPrice` blocks | **removed** | All prices blank, so the required change is removal, not substitution. Structure-agnostic: strips the key at any depth, so it needs no knowledge of the node layout | ◐ |
| 6b | seo_meta | any row whose `faqs` quote a price | `faqs[].answer` | sentence containing `from NPR <n>` / `Rs. <n>` | `Pricing depends on scope. Send a short brief for a quote.` | Your wording from the brief. `[^.]*` cannot cross a full stop, so it replaces the price sentence and not its neighbours | ◐ |
| 6c | services | 7 rows | `description`, `body` | any NPR/Rs. figure | must be fixed in `src/data/services.ts` | File-owned; a SQL edit here is reverted by the next `sync-content.ts` | ⛔ |
| 6d | seo_meta | 7 rows | price audit table | 45000 / 5000 / 2000 / 1000 | — | The **table** still needs the blobs. Figures from your brief are recorded in `01` | ⛔ |
| 7 | seo_meta | 11 existing rows | keyword_cluster | unknown | reassigned | "seo cost in nepal" appears in three clusters | ⛔ |

**On item 3's `digital-marketing` row:** your brief says the title reads
`Specialist  Kathmandu` and should read `Specialist in Kathmandu`. Statements 3a
and 3b cover both the double-space and single-space forms of that junction, so
the fix lands whichever it turns out to be. I did not hardcode the full expected
title, because the rest of the string is a value I have not seen.

**On item 4's jsonb rewrite:** it walks the array with `ORDER BY ordinality` so
entry order survives, and is guarded by an `EXISTS` on the bad label, so it
cannot disturb the other stats entries on that row.

---

## C. The `/services/seo` finding — cause is in the repo, not the database

Task 1 item 2 asks which URL resolves. I could not read `redirects`, so I cannot
answer that. What I can tell you is that the **cause is a stale slug in your
source file**, and it is fixable without touching the database.

`src/data/services.ts` says `seo`. The database row says `seo-services`.
`services/[slug]/page.tsx` resolves database-first and falls back to the file, so
`/services/seo` still resolves — from the file — and `generateStaticParams`
pre-renders both:

```js
const slugs = new Set([...services.map(s => s.slug), ...live.map(s => s.slug)]);
```

The file's own comment records what this produced in production: two live URLs,
different content, each canonicalising to itself, with the footer linking to one
and `sitemap.xml` publishing the other.

| Change | Where | Status |
|---|---|---|
| `slug: 'seo'` → `'seo-services'` | `src/data/services.ts` | ✅ proposed in `04` §5 |
| `engagementOptions[1].href` | `src/data/services.ts` | ✅ |
| `HOMEPAGE_SLUGS` includes `'seo'` | `src/sections/Services/index.tsx` | ✅ |
| link maps referencing `/services/seo` | `02`, `03` | ✅ |
| a redirect row for the old URL | `redirects` table | ⛔ read first |

**No redirect statement is proposed.** If one already exists, a second is how a
chain starts, and that table has chain-collapsing triggers because it has
happened before.

`Footer.tsx` and the `/services` grid need no edit — both read the same static
array, so they follow the slug automatically.

---

## D. `custom_json_ld` — one node instead of five

Your Task 2 asks for `Person` (about), `ContactPage` + `ProfessionalService`
(contact), `Article` (posts) and `CreativeWork` (projects). **Four of those five
would duplicate markup the code already emits:**

| Requested node | Already emitted by | Where |
|---|---|---|
| `Person` | `personNode()` at `#person` | `SiteJsonLd`, `JsonLd.tsx:59` — site-wide |
| `ProfessionalService` | `professionalServiceNode()` at `#service` | same |
| `Article` | `articleNode(post)` at `${url}/#article` | `blog/[slug]/page.tsx:123` — per post |
| `CreativeWork` | `projectNode(project)` at `${url}/#project` | `work/[slug]/page.tsx:129` — per project |

`JsonLd.tsx` documents this exact duplication being removed once already: *"An
earlier version had this component always prepend the base graph, which meant
every page emitted Person, WebSite and ProfessionalService a second time."*

Two nodes describing one thing under different `@id`s leaves a consumer choosing
which is authoritative — worse than emitting neither. So **only `ContactPage` is
written**, and it references the existing entities by `@id` rather than
restating them.

The per-page value the brief is reaching for lives in `entity_signals.knowsAbout`
and `faqs` instead, both of which are additive and collide with nothing.

---

## E. Files produced

| File | Contents |
|---|---|
| `scripts/export-backup.mjs` | Read-only export, anon key. Excludes `messages` |
| `proposed-changes/01-bug-fixes.sql` | Items 1, 3, 4 written; 2, 6, 8 analysed |
| `proposed-changes/02-seo-meta-new-rows.sql` | Nine rows |
| `proposed-changes/03-content-drafts.sql` | Six draft posts, media alts, testimonial drafts, link map |
| `proposed-changes/04-file-content.md` | 20 service body sections, 3 excerpts, About story, 4 lessons paragraphs, slug fix |
| `proposed-changes/05-front-end-changes.md` | Stats strip, date rendering, `lessons` rendering, Task 4 verification |
| `proposed-changes/diff-report.md` | This file |

**Nothing has been applied to your database.** No SQL has been run.

---

## F. Where the mechanism matters — do not apply these as SQL

`scripts/sync-content.ts` makes the **files** authoritative for these columns.
A SQL `UPDATE` against any of them is overwritten on the next sync run:

| Table | File-owned |
|---|---|
| `services` | `title`, `short_description`, `description`, `body`, `capabilities`, `icon`, `service_index`, `sort_order` |
| `posts` | `title`, `excerpt`, `category`, `date`, `reading_time`, `image`, `content`, `tags`, `is_placeholder`, `sort_order` |
| `experience` | `description` |

`projects` and `testimonials` are **not** synced, so SQL is correct for those.

This is why the service body sections and post excerpts in `04` are file edits
followed by `npx tsx scripts/sync-content.ts`, and not SQL.

**One reassurance about the six drafts in `03`:** `syncPosts` upserts only the
three posts in `blog.ts`, never deletes, and its `ON CONFLICT DO UPDATE`
deliberately omits `published`. A draft stays a draft across a sync.

---

## G. Facts, prices and numbers still needed from you

### Blocking the remaining Task 1 work

1. **Do the two roles overlap?** You left this as `[YES / NO]`. It decides
   whether the stats strip may say 18 months (no overlap) or must say 1 year
   (overlap). `05` §2 defaults to the conservative answer.
2. **Seven service prices + the standalone audit price.** All blank. While blank,
   every price in `custom_json_ld` gets its `minPrice` block removed and every
   affected FAQ sentence becomes *"Pricing depends on scope. Send a short brief
   for a quote."*
3. **`projects.lessons`** — approve the column, or tell me where the text goes.

### Blocking content

4. **Six post images**, at `/images/blog-<slug>.png`. `posts.image` is
   `NOT NULL`, so the rows cannot be published without them.
5. **Four testimonial quotes**, each with a name and a job title. The rows are
   drafted empty and unpublished.
6. **A Meta Ads, Google Ads and AI-search project**, or confirmation that those
   three proof sections should be dropped. Without one I have left
   `TODO(proof)` and an instruction to remove the section.

### To verify before publishing

7. **DataReportal figures** in the home, services and web-development rows —
   16.6M internet users (Oct 2025), 89.3% social media use, 32.4M mobile
   connections. Re-check against the Digital 2026 Nepal report.
8. **"Answer passage usually 134 to 167 words"** in the GEO post. Cite a source
   or soften it. Your own schema comment repeats the figure, so if it changes it
   changes in two places.
9. **`FACTS` array on `/about`** — *"Currently: Building client sites and running
   search and paid campaigns, alongside a BCA."* A claim about now, which I
   cannot verify and left untouched.
10. **The GEO post's `canonical_override`** — confirm it already matches the real
     319-character slug. Statement 1 in `01` fixes the JSON-LD but not the
     canonical.

### Unverified by construction

11. **`keyword_cluster` overlap.** Eleven rows have clusters I have not read.
    The four assignments in `02` are guesses about what is already taken.
12. **Nothing in this session was built, typechecked, linted, link-checked or
    JSON-LD-validated.** Bash was unavailable for every attempt — eighteen
    failures. Every SQL statement and every code change here is reviewed by eye.

---

## H. Security — flagged, not touched

`scripts/dbtest.mjs` line 3 contains a **plaintext postgres superuser password**
and the file is **tracked in git**:

```
postgresql://postgres:<redacted>@db.dxhkehmjuwgithhpgsxe.supabase.co:5432/postgres
```

`.gitignore` covers `.env*` but not `scripts/`. That credential is in your repo
history, so deleting the file is not sufficient — **rotate the password in the
Supabase dashboard**, then delete the file. It bypasses row-level security
entirely, so anyone with repository access has unrestricted read and write on
every table, including `messages`.

I did not use it, modify it, or read its value.
