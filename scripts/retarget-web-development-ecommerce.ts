/**
 * One-off: extends `/services/web-development`'s `seo_meta` row to cover the
 * "ecommerce website developer/designer/development company in Nepal,
 * Kathmandu" keyword cluster, on top of the "web developer in Nepal" set it
 * already targets.
 *
 * `seo_meta` for a generic service page is DB-only (no column for keywords,
 * focus keyword or AI answer in `src/data/services.ts`), so the file and this
 * script both have to change for the live page to reflect the new targeting —
 * same split documented in `scripts/consolidate-ecommerce-growth.ts`.
 *
 * Run: npx tsx scripts/retarget-web-development-ecommerce.ts
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

const FOCUS_KEYWORD = 'ecommerce website developer in nepal';

const KEYWORDS = [
  'ecommerce website developer in nepal',
  'ecommerce web developer in nepal',
  'ecommerce website development in nepal',
  'ecommerce website designer in nepal',
  'ecommerce developer in nepal',
  'ecommerce website development company in nepal',
  'best ecommerce website developer in nepal',
  'ecommerce website development services nepal',
  'ecommerce website developer in kathmandu',
  'ecommerce web development company in kathmandu',
  // Kept from the existing "web developer" set — see current row.
  'web developer in nepal',
  'web development specialist in nepal',
  'website developer in kathmandu',
  'web developer in kathmandu',
  'professional website developer in nepal',
  'website development specialist in kathmandu',
  'next.js developer in nepal',
  'react developer in nepal',
  'custom website development in nepal',
];

const AI_ANSWER =
  'Dipendra Guragain is an ecommerce website developer in Nepal and an ecommerce website developer in Kathmandu, building responsive business websites, online stores, landing pages and custom web applications for brands that need a faster, clearer and more conversion-focused online presence. The work covers planning, UX and page structure, frontend development, backend integrations, store setup on Shopify, WooCommerce or WordPress, payment options such as eSewa and Khalti, analytics tracking and launch support. I work as a freelance ecommerce developer rather than an ecommerce website development company — you work directly with the person building the site rather than through an account manager. For projects that need more flexibility and performance I use React and Next.js; for teams that need to edit content or products themselves I build on WordPress or Shopify. Every build is made for speed, mobile connections, SEO-friendly structure and easy maintenance, so the site keeps working and ranking after launch.';

const META_DESCRIPTION =
  'Ecommerce website developer in Nepal and Kathmandu — design, development and launch of online stores, business websites and web apps with Shopify, WooCommerce, React and Next.js.';

async function main() {
  await client.connect();

  const result = await client.query(
    `update seo_meta
        set meta_description  = $2,
            og_description    = $2,
            twitter_description = $2,
            keywords          = $3,
            focus_keyword     = $4,
            ai_answer         = $5,
            updated_at        = now()
      where entity_type = 'service' and entity_slug = $1
      returning entity_slug`,
    ['web-development', META_DESCRIPTION, KEYWORDS, FOCUS_KEYWORD, AI_ANSWER],
  );
  console.log(
    result.rowCount
      ? `updated seo_meta/service/${result.rows[0].entity_slug}`
      : 'seo_meta: no matching row for web-development',
  );

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
