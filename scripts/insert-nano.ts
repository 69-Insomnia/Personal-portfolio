/**
 * One-shot publish step for the Nano Store case study.
 *
 * The live site reads the database first (see `readAll` in src/lib/content.ts),
 * so the repository entry alone renders the detail page but not the grid card,
 * and the title tag falls back to the generic template. This adds the missing
 * project row and the `seo_meta` overrides — run it only after the commit
 * carrying `/images/project-nanostore.png` has deployed, since the row points
 * at that file.
 *
 * Idempotent: an existing project row is left untouched, and the `seo_meta`
 * upsert only fills a row whose `meta_title` is still empty, so re-running
 * never clobbers an edit made in /admin/seo.
 *
 * Run from the repo root: npx tsx scripts/insert-nano.ts
 */
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { projects } from '../src/data/projects';

const SLUG = 'nano-store-ecommerce-seo';
const META_TITLE = 'E-commerce SEO Expert in Nepal | Nano Store Case Study';
const FOCUS_KEYWORD = 'e-commerce SEO expert in Nepal';
const KEYWORDS = [
  'e-commerce SEO expert in Nepal',
  'e-commerce growth expert in Nepal',
  'e-commerce specialist in Nepal',
];

const project = projects.find((p) => p.slug === SLUG);
if (!project) {
  throw new Error(`"${SLUG}" is missing from src/data/projects.ts`);
}

const env = readFileSync('.env.local', 'utf8');
const url = env.match(/^POOLER_URL=(.*)$/m)?.[1]?.trim() || env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim();
if (!url) throw new Error('no POOLER_URL or DATABASE_URL in .env.local');

const client = new pg.Client({ connectionString: url });
await client.connect();

try {
  const existing = await client.query('SELECT slug FROM projects WHERE slug = $1', [SLUG]);
  if (existing.rows.length > 0) {
    console.log(`projects row for ${SLUG} already exists — untouched`);
  } else {
    const min = await client.query('SELECT COALESCE(MIN(sort_order), 1) AS m FROM projects');
    const sortOrder = Number(min.rows[0].m) - 1;
    const { rowCount } = await client.query(
      `INSERT INTO projects (
         slug, title, category, secondary_categories, description, image,
         technologies, year, overview, challenge, approach, development,
         marketing, results, link, is_placeholder, published, sort_order
       ) VALUES (
         $1, $2, $3, $4, $5, $6,
         $7, $8, $9, $10, $11, $12,
         $13, $14, $15, $16, true, $17
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
        sortOrder,
      ],
    );
    console.log(`inserted project row (${rowCount}) at sort_order ${sortOrder}`);
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
