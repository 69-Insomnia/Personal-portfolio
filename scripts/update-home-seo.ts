/**
 * One-off: retarget the homepage SEO row at the "Ecommerce Specialist in
 * Nepal / Ecommerce Expert in Nepal" query pair, and align the Person
 * jobTitle with the same positioning.
 *
 * Only `seo_meta` where entity_type='page' AND entity_slug='home', plus the
 * single `site_settings` row's `person_job_title` (JSON-LD only — the navbar
 * reads `identity.role`, which is untouched). No other page's row is written.
 *
 * Both writes go through `POOLER_URL`: the anon/publishable role passes RLS on
 * SELECT but silently matches zero rows on UPDATE, and the pooler's `postgres`
 * role is what every other script in this folder uses.
 */
import { readFileSync } from 'node:fs';
import { Pool } from 'pg';

const TITLE =
  'Ecommerce Specialist in Nepal | Ecommerce Expert in Nepal';
const DESCRIPTION =
  'Dipendra Guragain is an ecommerce specialist in Nepal and an e-commerce expert in Kathmandu helping online stores grow with SEO, Google Ads, Meta Ads and CRO.';
const AI_ANSWER =
  'Dipendra Guragain is an ecommerce specialist in Nepal and an ecommerce growth expert in Kathmandu. He helps online stores get found on Google, convert more visitors, and grow revenue through SEO, Shopify and WooCommerce optimisation, conversion rate optimisation, and Google and Meta Ads, managed as one funnel with one accountable partner.';
const LLM_SUMMARY =
  'Dipendra Guragain is an e-commerce specialist in Nepal and an ecommerce growth expert in Kathmandu, helping online stores grow through ecommerce SEO, Google Ads, Meta Ads and conversion rate optimisation.';
const FOCUS_KEYWORD = 'ecommerce specialist in nepal';
const KEYWORDS = [
  'ecommerce specialist in nepal',
  'ecommerce expert in nepal',
  'ecommerce specialist in kathmandu',
  'ecommerce expert in kathmandu',
  'ecommerce growth specialist in nepal',
  'ecommerce growth expert in nepal',
  'ecommerce seo specialist in nepal',
  'e-commerce specialist in nepal',
  'e-commerce expert in nepal',
  'ecommerce seo nepal',
  'google ads nepal',
  'meta ads nepal',
];
const KEYWORD_CLUSTER = [
  'Ecommerce specialist Nepal',
  'Ecommerce expert Nepal',
  'Ecommerce specialist Kathmandu',
  'Ecommerce expert Kathmandu',
  'Ecommerce growth specialist Nepal',
  'Ecommerce growth expert Nepal',
  'E-commerce specialist Nepal',
  'E-commerce expert Nepal',
  'Ecommerce SEO specialist Nepal',
  'Ecommerce SEO Nepal',
  'Google Ads Nepal',
  'Meta Ads Nepal',
];
/**
 * Merged into the home graph by `customJsonLdNodes` — the site-wide node at
 * the same `@id` already carries name, description, address and areaServed, so
 * this contributes only what is missing: the service list. Same `@id` is what
 * makes the two union into one `ProfessionalService` instead of reading as two
 * businesses.
 */
const CUSTOM_JSON_LD = {
  '@type': 'ProfessionalService',
  '@id': 'https://dipendraguragain.tech/#service',
  serviceType: [
    'Ecommerce Growth',
    'Ecommerce SEO',
    'Website Development',
    'Paid Advertising',
  ],
};
const PERSON_JOB_TITLE = 'Ecommerce Specialist & Growth Expert in Nepal';

async function main() {
  const envFile = readFileSync('.env.local', 'utf8');
  const dbUrl =
    envFile.match(/^POOLER_URL=(.*)$/m)?.[1]?.trim() ||
    envFile.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim();
  if (!dbUrl) throw new Error('no POOLER_URL in .env.local');

  const pool = new Pool({ connectionString: dbUrl });

  // --- seo_meta (home row only) ---
  // Via the pooler rather than REST: the publishable key's role passes RLS on
  // SELECT but silently matches zero rows on UPDATE.
  const { rows: seoRows } = await pool.query(
    `update seo_meta set
       meta_title = $1,
       meta_description = $2,
       og_title = $1,
       og_description = $2,
       ai_answer = $3,
       llm_summary = $4,
       focus_keyword = $5,
       keywords = $6,
       keyword_cluster = $7,
       custom_json_ld = $8::jsonb,
       updated_at = now()
     where entity_type = 'page' and entity_slug = 'home'
     returning entity_slug`,
    [
      TITLE,
      DESCRIPTION,
      AI_ANSWER,
      LLM_SUMMARY,
      FOCUS_KEYWORD,
      KEYWORDS,
      KEYWORD_CLUSTER,
      JSON.stringify(CUSTOM_JSON_LD),
    ],
  );
  console.log('seo_meta updated:', JSON.stringify(seoRows));

  // --- site_settings.person_job_title (singleton row) ---
  const { rows: settingRows } = await pool.query(
    'update site_settings set person_job_title = $1 returning person_job_title',
    [PERSON_JOB_TITLE],
  );
  console.log('site_settings updated:', JSON.stringify(settingRows));
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
