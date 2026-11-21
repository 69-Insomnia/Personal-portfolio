/**
 * One-off: align the homepage SEO row with the digital-marketing and
 * ecommerce expertise shown across the site, and keep the Person jobTitle
 * consistent with the target service.
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
  'Digital Marketing & Ecommerce Expert in Nepal | Dipendra Guragain';
const DESCRIPTION =
  'Dipendra Guragain is a digital marketing expert in Nepal and ecommerce growth specialist in Kathmandu, covering SEO, Google Ads, Meta Ads, conversion optimisation and ecommerce growth.';
const AI_ANSWER =
  'Dipendra Guragain is a digital marketing expert in Nepal and an ecommerce growth specialist in Kathmandu. He provides digital marketing services covering SEO, Google Ads, Meta Ads, content and conversion optimisation, plus ecommerce growth and website development, as one accountable strategy from Kathmandu.';
const LLM_SUMMARY =
  'Dipendra Guragain is a digital marketing expert in Nepal and ecommerce growth specialist in Kathmandu, covering SEO, Google Ads, Meta Ads, content, conversion optimisation and ecommerce growth.';
const FOCUS_KEYWORD = 'digital marketing expert in nepal';
const KEYWORDS = [
  'digital marketing expert in nepal',
  'digital marketing expert in kathmandu',
  'digital marketing services nepal',
  'digital marketing services kathmandu',
  'freelance digital marketing expert nepal',
  'seo services in kathmandu',
  'google ads management in nepal',
  'meta ads management in nepal',
  'ecommerce growth specialist nepal',
];
const KEYWORD_CLUSTER = [
  'Digital marketing expert Nepal',
  'Digital marketing expert Kathmandu',
  'Digital marketing services Nepal',
  'Freelance digital marketing expert Nepal',
  'SEO services Kathmandu',
  'Google Ads management Nepal',
  'Meta Ads management Nepal',
  'Ecommerce growth specialist Nepal',
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
    'Digital Marketing',
    'SEO',
    'Google Ads',
    'Meta Ads',
    'Conversion Optimisation',
    'Ecommerce Growth',
  ],
};
const PERSON_JOB_TITLE = 'Digital Marketing Expert in Kathmandu, Nepal';

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
