/**
 * Publishes the filled-in Results section to `services.body` for
 * `/services/digital-marketing`.
 *
 * The page reads `body` from Supabase (`getServices` in src/lib/content.ts,
 * with no file fallback on a failed read), so editing `src/data/services.ts`
 * alone changes nothing a visitor can see. This updates the jsonb in place —
 * the `Results` section only, so an admin edit made to any other section
 * between runs is left alone.
 *
 * Idempotent: a run that finds the section already matching reports "untouched"
 * and writes nothing.
 *
 * Run from the repo root: npx tsx scripts/publish-digital-marketing-results.ts
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pg = require('pg');

const SLUG = 'digital-marketing';
const SECTION = 'Results';

/**
 * Kept in step with `src/data/services.ts` by hand — the two must match or the
 * repository fallback and the live page disagree.
 */
const PARAGRAPHS = [
  'Results here are reported as enquiries, sales and cost per result against the timeframe they took — never as impressions or clicks. Recent results:',
  'A camera and drone retailer — a Meta “Get more messages” campaign sending shoppers straight to WhatsApp: 143 messaging conversations started at NPR 5–7 each, in two days.',
  'My own website — SEO work: around 2,000 monthly visits from organic search within four months.',
];

/** Order-insensitive compare; `jsonb` reorders object keys on storage. */
const canonical = (value: unknown): string =>
  JSON.stringify(value, (_key, entry) =>
    entry && typeof entry === 'object' && !Array.isArray(entry)
      ? Object.fromEntries(Object.entries(entry).sort(([a], [b]) => a.localeCompare(b)))
      : entry,
  );

async function main() {
  const env = readFileSync('.env.local', 'utf8');
  const url =
    env.match(/^POOLER_URL=(.*)$/m)?.[1]?.trim() ||
    env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim();
  if (!url) throw new Error('no POOLER_URL or DATABASE_URL in .env.local');

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const current = await client.query('SELECT body FROM services WHERE slug = $1', [SLUG]);
    if (current.rows.length !== 1) throw new Error(`services row for ${SLUG} missing`);

    const body = current.rows[0].body as Array<{ heading: string; paragraphs: string[] }>;
    const index = body.findIndex((section) => section.heading === SECTION);
    if (index === -1) {
      throw new Error(
        `no "${SECTION}" section — headings found: ${body.map((s) => s.heading).join(', ')}`,
      );
    }

    if (canonical(body[index].paragraphs) === canonical(PARAGRAPHS)) {
      console.log(`${SLUG} / ${SECTION}: already matches — untouched`);
    } else {
      const next = body.map((section, i) =>
        i === index ? { ...section, paragraphs: PARAGRAPHS } : section,
      );
      const res = await client.query(
        `UPDATE services
            SET body = $2::jsonb, updated_at = NOW()
          WHERE slug = $1`,
        [SLUG, JSON.stringify(next)],
      );
      console.log(`${SLUG} / ${SECTION}: updated ${res.rowCount} row(s)`);
    }

    const verify = await client.query(
      `SELECT section->>'heading' AS heading, section->'paragraphs' AS paragraphs
         FROM services, jsonb_array_elements(body) AS section
        WHERE slug = $1 AND section->>'heading' = $2`,
      [SLUG, SECTION],
    );
    console.log('\nPublished section:');
    verify.rows[0]?.paragraphs.forEach((p: string, i: number) => console.log(`  ${i}. ${p}`));

    const leftovers = await client.query(
      `SELECT slug FROM services WHERE body::text LIKE '%ADD REAL RESULT%'`,
    );
    console.log(
      '\nservices still carrying a placeholder:',
      leftovers.rows.map((r: { slug: string }) => r.slug).join(', ') || 'none',
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
