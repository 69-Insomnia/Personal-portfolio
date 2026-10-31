# 05 — Front-end changes (PROPOSED, NOT APPLIED)

Task 4's code-side items. These are component and data-file changes, not SQL
rows. Nothing here is applied.

---

## 1. `seo_meta` wins over code — **confirmed**

The order Task 4 asks me to verify is correct:

```
getSeo(entityType, slug)      src/lib/content.ts   database, 5-minute revalidate
  -> withSeoMeta(base, meta)  src/data/seo.ts      overlay onto the template
  -> buildMetadata(seo, ...)  src/utils/metadata.ts  emits <head>
```

`withSeoMeta` returns the base template when `meta` is `undefined` — the normal
state for a page nobody has opened in the panel — so a missing row renders
exactly what the code says, and a present row wins field by field. `??` rather
than `||` throughout, so an intentionally blank admin field is indistinguishable
from an untouched one.

**No page overrides the database.** I checked every route that reads `getSeo`.
The one place code wins is by design: `buildMetadata` clamps both title and
description to length, so a database value over 60/158 characters is truncated
on the way out. That is a cap, not an override, but it means **a long
`meta_title` in the panel is not what ships.** Worth knowing before you paste
anything past 60 characters into the admin.

---

## 2. Stats strip — 4 stats, needs to be 3

`src/sections/Stats/index.tsx` currently renders four: case studies, services,
client engagements, and years. Task 4 asks for three, and asks for the numbers
to live in one place.

Service count is the one to drop. It is the only figure on the strip that
describes what is for sale rather than what has been delivered, and "7 services"
is a catalogue size, not an achievement.

**New file — `src/data/stats.ts`:**

```ts
import { projects } from '@/data/projects';
import { experience } from '@/data/experience';
import { profile } from '@/data/profile';

/**
 * The three figures in the homepage stats strip.
 *
 * ## Why this file exists
 *
 * The strip derived its numbers inline from three different data files, which
 * meant the rule about what may appear there — verified figures only, nothing
 * that describes what is for sale — lived nowhere and was re-decided on each
 * edit. One place to look, one place to change.
 *
 * ## What is deliberately absent
 *
 * No revenue, no traffic lift, no client count, no satisfaction percentage, no
 * "years of experience". The strip describes the work on this site, which is
 * the only thing it can prove from where it stands.
 */

/** Delivered case studies. Placeholder rows are not published, so they are not counted. */
const caseStudies = projects.filter((p) => !p.isPlaceholder).length;

/**
 * Months of client work, parsed from the `period` strings.
 *
 * Returns `null` rather than guessing when a period is not in the "N Years" /
 * "N Months" form — a date range like "2023 – 2024" would otherwise be turned
 * into a wrong number by a year subtraction.
 */
function clientMonths(): number | null {
  let months = 0;
  let matched = false;
  for (const item of experience) {
    if (item.isPlaceholder) continue;
    const years = /(\d+)\s*year/i.exec(item.period);
    const mo = /(\d+)\s*month/i.exec(item.period);
    if (!years && !mo) continue;
    matched = true;
    months += years ? Number(years[1]) * 12 : 0;
    months += mo ? Number(mo[1]) : 0;
  }
  return matched && months > 0 ? months : null;
}

/**
 * TODO(verify): DO THE TWO ROLES OVERLAP?
 *
 * The brief left this as "[YES / NO]" and it decides what this figure may say:
 *
 *   - NO overlap  -> the durations add up. 12 months at DrillThru plus 6 on
 *                    POM's Penthouse is 18 months of client work. Set
 *                    ROLES_OVERLAP = false.
 *   - YES overlap -> they cannot be added without double-counting. The honest
 *                    figure is the LONGEST single engagement, which is 12
 *                    months. Set ROLES_OVERLAP = true.
 *
 * Left as `true` deliberately: it is the conservative reading, and it
 * understates rather than overstates. Flip it once you have checked the dates.
 */
const ROLES_OVERLAP = true;

function durationStat(): { value: string; label: string } | null {
  const months = clientMonths();
  if (months === null) return null;

  if (ROLES_OVERLAP) {
    // Longest single engagement, not the sum.
    const longest = Math.max(
      ...experience
        .filter((i) => !i.isPlaceholder)
        .map((i) => {
          const y = /(\d+)\s*year/i.exec(i.period);
          const m = /(\d+)\s*month/i.exec(i.period);
          return (y ? Number(y[1]) * 12 : 0) + (m ? Number(m[1]) : 0);
        }),
      0,
    );
    if (longest <= 0) return null;
    return longest >= 12
      ? { value: `${Math.floor(longest / 12)}+`, label: 'Years of client work' }
      : { value: String(longest), label: 'Months of client work' };
  }

  return months >= 12
    ? { value: `${Math.floor(months / 12)}+`, label: 'Years of client work' }
    : { value: String(months), label: 'Months of client work' };
}

export interface SiteStat {
  value: string;
  label: string;
}

export const siteStats: SiteStat[] = [
  {
    value: String(caseStudies),
    label: 'Case studies, written up in full',
  },
  ...(durationStat() ? [durationStat() as SiteStat] : []),
  {
    // Confirmed: replies go out within 24 hours. A commitment rather than a
    // measurement, and labelled as one.
    value: '24',
    label: 'Hours to a reply, usually sooner',
  },
];
```

**Then `src/sections/Stats/index.tsx`** drops its local `clientMonths()` and the
inline array, and renders `siteStats` instead. The `dl`/`ul` structure, the
`Reveal` stagger and the `lg:grid-cols-4` grid all stay — only the source of the
array changes. The grid should become `lg:grid-cols-3` to match three items;
leaving four columns with three items puts an empty cell at the end.

---

## 3. Date rendering — required companion to the ISO change

Task 3 asks for `posts.date` to be stored as ISO (`YYYY-MM-DD`). `isoDate()`
already reads that form without parsing, and `displayDate()` already converts it
back for humans — but **neither call site that prints a date uses it**:

```diff
  // src/components/cards/BlogCard.tsx:36
- <span className="text-muted">{post.date}</span>
+ <span className="text-muted">{displayDate(post.date) ?? post.date}</span>
```

```diff
  // src/components/common/AuthorByline.tsx:55
- <time dateTime={published}>{post.date}</time>
+ <time dateTime={published}>{displayDate(post.date) ?? post.date}</time>
```

Without this, every new post shows `2026-10-16` on its card and byline.

The `?? post.date` fallback matters: `displayDate` returns `undefined` for a
string it cannot parse, and falling back to the raw value is better than
rendering nothing. The three existing posts store `"12 September 2026"`, which
`displayDate` parses correctly — so they keep rendering exactly as they do now.

`import { displayDate } from '@/utils/dates'` is needed in both files.

---

## 4. `projects.lessons` — rendering, if you approve the column

Only needed if you take the column recommendation in `04-file-content.md` §4.

```diff
  // src/lib/content.ts — mapProject
+   lessons: strOr(row.lessons),
```

```diff
  // src/types/index.ts — Project
+   /** What I would do differently on a second pass. */
+   lessons?: string;
```

```diff
  // src/app/work/[slug]/page.tsx — alongside the existing results block
+ {project.lessons ? (
+   <Reveal>
+     <section className="border-t border-line pt-6">
+       <h2 className="text-h3">What I&apos;d do differently</h2>
+       <p className="measure mt-5 leading-relaxed text-muted">{project.lessons}</p>
+     </section>
+   </Reveal>
+ ) : null}
```

---

## 5. Task 4 items already satisfied — no change needed

| Requirement | Where | State |
|---|---|---|
| Hero H1 is the keyword phrase | `src/sections/Hero/index.tsx:30` | ✅ Both sentences sit inside the `<h1>` |
| Hero tools strip removed | same file | ✅ `DashboardPanel` gone with it |
| Tools appear once, in Stack | `src/sections/Technologies/index.tsx` | ✅ Sole consumer of `technologyCategories` |
| Testimonials render nothing without quote + name + company | `publishableTestimonials` in `src/data/testimonials.ts` | ✅ Empty state instead of blank cards |
| `sitemap.xml` lists only canonical, published URLs | `src/app/sitemap.ts` | ✅ Excludes `noindex` and `canonical_override`; builds slugs from the same readers the pages use |
| `robots.txt` allows the seven named crawlers | `src/app/robots.txt/route.ts` | ✅ Names all seven plus six more |
| `/llms.txt`, no ranking claim | `src/app/llms.txt/route.ts` | ✅ Exists and disclaims ranking effect in its own comments |

**One wording note.** Task 4 gives the hero display line as "Built, found, sold."
Your site currently reads "Stores that load fast, rank well, and close the sale."
— the longer version you approved when we chose that direction. Both are
sentence case and neither matches the reference site; the short one is punchier
and the long one is easier to read at 4rem. Your call, and it is a one-line
change to `DISPLAY_LINES` in the hero if you want the short form.

---

## Applying this

1. Add `src/data/stats.ts`, update `src/sections/Stats/index.tsx`.
2. Add the `displayDate` import and call in both date call sites.
3. Optional: `lessons` column + the three-line render.
4. `npx tsc --noEmit && npm run build` — none of this is typechecked yet.

**Everything in this file is unverified.** I could not run the build, the
typecheck, or the dev server at any point in this session, so these are
reviewed by eye and not by compiler.
