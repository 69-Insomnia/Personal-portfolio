/**
 * One-off: write the owner's target keyword lists (and four weak titles) into
 * `seo_meta`, which is what the live site reads. Touches only `meta_title` and
 * `keywords` on the home row and the seven service rows; nothing else.
 *
 * The keyword lists are the ones in `SERVICE_KEYWORDS` / `homeSEO` in
 * `src/data/seo.ts`, imported so the two cannot drift.
 *
 * Run: npx tsx scripts/update-keyword-targets.ts
 */
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { homeSEO, serviceKeywords } from '../src/data/seo';

const TITLES: Record<string, string> = {
  'seo-services': 'SEO Services in Nepal | Ecommerce SEO Expert in Kathmandu',
  'google-ads': 'Google Ads Expert in Nepal | Management Services in Kathmandu',
  'meta-ads': 'Facebook & Meta Ads Expert in Nepal | Ads Management Kathmandu',
  'ai-search': 'AI SEO Expert in Nepal | AI Search & Local SEO Services',
};

async function main() {
  const env = readFileSync('.env.local', 'utf8');
  const url = env.match(/^POOLER_URL=(.*)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, '');
  if (!url) throw new Error('POOLER_URL not found in .env.local');
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query('begin');
    const home = await client.query(
      `update seo_meta set keywords = $1 where entity_type='page' and entity_slug='home' returning entity_slug`,
      [homeSEO.keywords],
    );
    console.log('home', home.rowCount);
    for (const [slug, keywords] of Object.entries(serviceKeywords)) {
      const r = await client.query(
        `update seo_meta set keywords = $2, meta_title = coalesce($3, meta_title)
         where entity_type='service' and entity_slug=$1 returning entity_slug`,
        [slug, keywords, TITLES[slug] ?? null],
      );
      console.log(slug, r.rowCount);
    }
    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    throw e;
  } finally {
    await client.end();
  }
}
main().catch((e) => { console.error('FAIL:', e instanceof Error ? e.message : e); process.exitCode = 1; });
