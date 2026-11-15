/**
 * One-shot publish step for the Resthru case study.
 *
 * The live site reads the database first (see `readAll` in src/lib/content.ts),
 * so the repository entry alone renders the detail page but not the grid card.
 * This inserts the project row at the SECOND position — the order the brief
 * asked for — and adds the `seo_meta` overrides for the detail page title.
 *
 * Idempotent: if the row exists it is left untouched (including its position),
 * and the `seo_meta` upsert only fills a row whose `meta_title` is still empty,
 * so re-running never clobbers an edit made in /admin/seo. The shift of the
 * existing rows by +1 runs only when the row is actually inserted, so a second
 * run cannot keep pushing the other projects down.
 *
 * Run from the repo root: npx tsx scripts/insert-resthru.ts
 */
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { projects } from '../src/data/projects';

const SLUG = 'resthru';
const META_TITLE = 'Resthru | Restaurant Management System Case Study';
const FOCUS_KEYWORD = 'restaurant management system';
const KEYWORDS = [
  'restaurant management system',
  'restaurant management system in Nepal',
  'QR code ordering system',
];

const env = readFileSync('.env.local', 'utf8');
const url = env.match(/^POOLER_URL=(.*)$/m)?.[1]?.trim() || env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim();
if (!url) throw new Error('no POOLER_URL or DATABASE_URL in .env.local');

const client = new pg.Client({ connectionString: url });

async function main() {
  const project = projects.find((p) => p.slug === SLUG);
  if (!project) {
    throw new Error(`"${SLUG}" is missing from src/data/projects.ts`);
  }

  await client.connect();

  try {
    const existing = await client.query('SELECT slug, sort_order FROM projects WHERE slug = $1', [SLUG]);
    if (existing.rows.length > 0) {
      console.log(
        `projects row for ${SLUG} already exists at sort_order ${existing.rows[0].sort_order} — untouched`,
      );
    } else {
      // Position 2: everything currently sitting at or after slot 2 moves down
      // by one so Resthru lands directly after the first project. Runs before
      // the insert and only in the branch where the row is missing, so the
      // ordering stays stable across re-runs.
      const shift = await client.query(
        'UPDATE projects SET sort_order = sort_order + 1 WHERE sort_order >= 1',
      );
      const { rowCount } = await client.query(
        `INSERT INTO projects (
           slug, title, category, secondary_categories, description, image,
           technologies, year, overview, challenge, approach, development,
           marketing, results, link, is_placeholder, published, sort_order
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           $7, $8, $9, $10, $11, $12,
           $13, $14, $15, $16, true, 1
         )`,
        [
          project.slug,
          project.title,
          project.category,
          project.secondaryCategories ?? [],
          project.description,
          project.image,
          project.technologies,
          project.year ?? null,
          project.overview ?? null,
          project.challenge ?? null,
          project.approach ?? null,
          project.development ?? null,
          project.marketing ?? null,
          JSON.stringify(project.results ?? []),
          project.link ?? null,
          project.isPlaceholder ?? false,
        ],
      );
      console.log(
        `inserted project row (${rowCount}) at sort_order 1; shifted ${shift.rowCount} existing rows down`,
      );
    }

    const seo = await client.query(
      `INSERT INTO seo_meta (entity_type, entity_slug, meta_title, meta_description, focus_keyword, keywords)
       VALUES ('project', $1, $2, $3, $4, $5)
       ON CONFLICT (entity_type, entity_slug)
       DO UPDATE SET
         meta_title = EXCLUDED.meta_title,
         meta_description = EXCLUDED.meta_description,
         focus_keyword = EXCLUDED.focus_keyword,
         keywords = EXCLUDED.keywords,
         updated_at = now()
       WHERE seo_meta.meta_title IS NULL`,
      [SLUG, META_TITLE, project.description, FOCUS_KEYWORD, KEYWORDS],
    );
    console.log(
      seo.rowCount === 1
        ? 'seo_meta row upserted'
        : 'seo_meta row already had a title — left untouched',
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
