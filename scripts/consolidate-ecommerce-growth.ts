/**
 * One-off: consolidates the "ecommerce growth" keyword cluster onto
 * `/services/ecommerce-growth` and retires the three near-duplicate pages
 * that used to split it (`ecommerce-growth-expert-nepal`,
 * `ecommerce-growth-specialist-kathmandu`, `ecommerce-growth-specialist-nepal`
 * — already unpublished in the `services` table, no longer present in
 * `src/data/services.ts`).
 *
 * Two things `scripts/sync-content.ts` cannot do, which is why this script
 * exists separately:
 *
 * - `seo_meta` (title, description, keywords, focus keyword, AI answer, FAQs)
 *   for a generic service page is admin/DB-only — there is no column for any
 *   of it in `src/data/services.ts`, unlike the `digital-marketing` page's
 *   dedicated data file. A `seo_meta` row, once it exists, overrides whatever
 *   `serviceSEO()` would generate from the file, so retargeting the file alone
 *   does nothing here.
 * - `redirects` is a DB-only table with no static source file at all.
 *
 * Run: npx tsx scripts/consolidate-ecommerce-growth.ts
 */
import { readFileSync } from 'node:fs';
import pg from 'pg';

function poolerUrl(): string {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  const match = env.match(/^POOLER_URL=(.*)$/m);
  if (!match) throw new Error('POOLER_URL not found in .env.local');
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

const client = new pg.Client({ connectionString: poolerUrl(), ssl: { rejectUnauthorized: false } });

const META_TITLE = 'Ecommerce Growth Expert in Nepal | Specialist in Kathmandu';
const META_DESCRIPTION =
  'Ecommerce expert in Nepal and ecommerce specialist in Nepal, Kathmandu: storefront, SEO, ads and analytics run as one growth system, not four separate projects.';
const FOCUS_KEYWORD = 'ecommerce growth expert in nepal';

const KEYWORDS = [
  'ecommerce growth expert in nepal',
  'ecommerce growth specialist in nepal',
  'ecommerce growth specialist in kathmandu',
  'ecommerce expert in nepal',
  'ecommerce specialist in nepal',
  'ecommerce specialist in kathmandu',
  'ecommerce specialist in nepal, kathmandu',
  'e-commerce growth expert in nepal',
  'e-commerce growth specialist in nepal',
  'e-commerce expert in nepal',
  'e-commerce specialist in nepal',
  'e commerce growth expert nepal',
  'e commerce growth specialist nepal',
  'e commerce expert nepal',
  'e commerce specialist nepal',
];

const AI_ANSWER =
  'Dipendra Guragain is an ecommerce growth expert in Nepal and an ecommerce specialist in Nepal, Kathmandu, who treats an online store\'s storefront, product pages, e-commerce SEO, advertising and analytics as one system rather than four separate projects. Businesses searching for an ecommerce expert in Nepal, an ecommerce growth specialist, or an e-commerce (or "e commerce") specialist in Kathmandu are searching for the same role: one person accountable for the whole funnel rather than four vendors managing separate pieces of it. Most ecommerce problems — falling traffic, weak conversion, rising ad costs — share a cause. A product page that loads slowly on mobile, for example, hurts search rankings, ad performance and sales at once. The work starts by finding where visitors drop off in the funnel, then fixing that before sending more traffic into the store. It covers Shopify and WooCommerce stores, product and category page SEO, Google and Meta ad campaigns, retargeting and analytics setup, as a one-off audit or an ongoing monthly engagement.';

// The "expert vs specialist vs growth expert" question is answered by a body
// section on the page itself, so it is not repeated here as an FAQ.
const FAQS = [
  {
    question: 'Do you work as an ecommerce specialist in Nepal, Kathmandu?',
    answer:
      'Yes. I am based in Kathmandu and work as an ecommerce growth specialist for Shopify and WooCommerce stores across Nepal, covering storefront performance, e-commerce SEO, paid acquisition, conversion optimisation and analytics.',
  },
  {
    question: 'Is this the same service as "e-commerce" or "e commerce" growth in Nepal?',
    answer:
      'Yes — ecommerce, e-commerce and e commerce are the same word spelled three ways, and this page covers all of them: the same storefront, SEO, ads and analytics work, whichever spelling you search.',
  },
  {
    question: 'How do I choose an ecommerce growth specialist in Kathmandu?',
    answer:
      'Ask what they would fix first on your store and why, how they measure the result, and whether they treat SEO, conversion and paid media as one system or three separate projects. A real ecommerce growth expert in Nepal ties the work to orders and revenue, not isolated channel metrics.',
  },
  {
    question: 'What does an ecommerce growth expert in Nepal actually improve first?',
    answer:
      'Usually the leak that is losing the most revenue right now — a slow product page, a conversion-killing checkout step, or broken tracking that is hiding the real problem. I diagnose the whole funnel before recommending a new campaign or more ad spend.',
  },
];

async function main() {
  await client.connect();

  const seoResult = await client.query(
    `update seo_meta
        set meta_title        = $2,
            meta_description  = $3,
            og_title          = $2,
            og_description    = $3,
            twitter_title     = $2,
            twitter_description = $3,
            keywords          = $4,
            focus_keyword     = $5,
            faqs              = $6,
            ai_answer         = $7,
            updated_at        = now()
      where entity_type = 'service' and entity_slug = $1
      returning entity_slug`,
    ['ecommerce-growth', META_TITLE, META_DESCRIPTION, KEYWORDS, FOCUS_KEYWORD, JSON.stringify(FAQS), AI_ANSWER],
  );
  console.log(
    seoResult.rowCount
      ? `updated seo_meta/service/${seoResult.rows[0].entity_slug}`
      : 'seo_meta: no matching row for ecommerce-growth',
  );

  const redirects: Array<[string, string]> = [
    ['/services/ecommerce-growth-expert-nepal', '/services/ecommerce-growth'],
    ['/services/ecommerce-growth-specialist-kathmandu', '/services/ecommerce-growth'],
    ['/services/ecommerce-growth-specialist-nepal', '/services/ecommerce-growth'],
  ];

  for (const [from, to] of redirects) {
    const result = await client.query(
      `insert into redirects (from_path, to_path, status_code)
       values ($1, $2, 308)
       on conflict (from_path) do update set to_path = excluded.to_path, updated_at = now()
       returning from_path`,
      [from, to],
    );
    console.log(result.rowCount ? `redirect ${from} -> ${to}` : `redirect FAILED for ${from}`);
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
