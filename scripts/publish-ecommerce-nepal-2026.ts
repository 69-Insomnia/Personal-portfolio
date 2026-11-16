/**
 * One-shot publish step for the DOCX rewrite of
 * "How to Grow Ecommerce in Nepal in 2026".
 *
 * The live site reads the database first (see `readAll` in src/lib/content.ts),
 * so the repository entry alone renders the fallback but not the live page.
 * This applies, in one transaction-free pass:
 *
 *  - `posts`: title (the brief's H1), excerpt, content, tags and reading time
 *    from `src/data/blog.ts`, plus `updated_at = NOW()` so the Article node's
 *    `dateModified` reports the rewrite date (2026-11-16) while `date` keeps
 *    the original publish date (2026-11-02), which the brief also specifies.
 *
 *  - `seo_meta`: the brief's title tag, meta description, focus keyword and
 *    keyword list; the FAQ section as `faqs` (the page renders it and emits
 *    the matching FAQPage node from the same array); two sourced statistics;
 *    and the direct-answer `ai_answer`.
 *
 * Idempotent: each side is skipped when it already matches the repository, so
 * re-running never clobbers itself — but a value edited later in /admin WILL
 * be re-applied by a re-run, because the repository is the source this script
 * publishes from. Column types are read from `information_schema` so `jsonb`
 * columns receive JSON text and `text[]` columns receive a real array.
 *
 * Run from the repo root: npx tsx scripts/publish-ecommerce-nepal-2026.ts
 */
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { blogPosts } from '../src/data/blog';

const SLUG = 'how-to-grow-ecommerce-in-nepal-2026';

/**
 * Key-order-insensitive JSON compare.
 *
 * `jsonb` reorders object keys on storage (by length, then bytewise), so
 * `JSON.stringify(row) === JSON.stringify(target)` is false forever for any
 * object with more than one key — the FAQ guard would report a change on
 * every run. Arrays keep their order in `jsonb`, which is what we want:
 * question order is content, key order is not.
 */
const canonical = (value: unknown): string =>
  JSON.stringify(value, (_key, entry) =>
    entry && typeof entry === 'object' && !Array.isArray(entry)
      ? Object.fromEntries(Object.entries(entry).sort(([a], [b]) => a.localeCompare(b)))
      : entry,
  );

const META_TITLE = 'How to Grow Ecommerce in Nepal in 2026 | Ecommerce Expert';
const META_DESCRIPTION =
  'How to grow ecommerce in Nepal in 2026: legal setup, eSewa and Khalti, delivery, SEO, AI search and ads, from an ecommerce expert in Nepal.';
const FOCUS_KEYWORD = 'how to grow ecommerce in Nepal in 2026';
const KEYWORDS = [
  'how to grow ecommerce in Nepal',
  'how to grow ecommerce in Nepal in 2026',
  'ecommerce expert in Nepal',
  'e-commerce expert in Nepal',
  'E commerce expert in Nepal',
  'ecommerce marketing in Nepal',
];
const AI_ANSWER =
  'To grow ecommerce in Nepal in 2026, register your online business, build a fast mobile-first store, ' +
  'accept eSewa, Khalti, Fonepay and Cash on Delivery, deliver reliably, earn customer trust, and then ' +
  'scale with social commerce, SEO, AI search visibility and measured ads.';
const STATS = [
  {
    value: '30–40%',
    label: "annual growth in Nepal's social commerce over the past five years",
    source: 'Kathmandu Post, August 2026',
  },
  {
    value: '20%',
    label:
      'of online sales in the 2025 holiday season were influenced by AI agents — a global figure, ' +
      'since no Nepal-specific figure is published yet',
    source: 'Salesforce data reported by Hostinger',
  },
];

async function main() {
  const post = blogPosts.find((p) => p.slug === SLUG);
  if (!post?.content?.length || !post.faqs?.length) {
    throw new Error(`repo entry for ${SLUG} is missing content or faqs`);
  }

  const env = readFileSync('.env.local', 'utf8');
  const url =
    env.match(/^POOLER_URL=(.*)$/m)?.[1]?.trim() ||
    env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim();
  if (!url) throw new Error('no POOLER_URL or DATABASE_URL in .env.local');

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const types = await client.query(
      `SELECT table_name, column_name, data_type
         FROM information_schema.columns
        WHERE (table_name = 'posts'
               AND column_name IN ('title', 'excerpt', 'content', 'tags', 'reading_time'))
           OR (table_name = 'seo_meta'
               AND column_name IN ('meta_title', 'meta_description', 'focus_keyword',
                                   'keywords', 'faqs', 'stats', 'ai_answer'))`,
    );
    const typeOf = new Map(
      types.rows.map((r) => [`${r.table_name}.${r.column_name}`, r.data_type as string]),
    );
    const val = (table: string, column: string, value: unknown) => {
      const type = typeOf.get(`${table}.${column}`);
      if (!type) throw new Error(`unknown column ${table}.${column}`);
      return type.startsWith('json') ? JSON.stringify(value) : value;
    };

    // ---------------------------------------------------------------- posts --
    const current = await client.query(
      'SELECT title, excerpt, content, tags, reading_time FROM posts WHERE slug = $1',
      [SLUG],
    );
    if (current.rows.length !== 1) throw new Error(`posts row for ${SLUG} missing`);
    const row = current.rows[0];
    const postsInSync =
      row.title === post.title &&
      row.excerpt === post.excerpt &&
      JSON.stringify(row.content) === JSON.stringify(post.content) &&
      JSON.stringify(row.tags) === JSON.stringify(post.tags) &&
      row.reading_time === post.readingTime;

    if (postsInSync) {
      console.log('posts: already matches the repository — untouched');
    } else {
      const res = await client.query(
        `UPDATE posts
            SET title = $2, excerpt = $3, content = $4, tags = $5,
                reading_time = $6, updated_at = NOW()
          WHERE slug = $1`,
        [
          SLUG,
          post.title,
          post.excerpt,
          val('posts', 'content', post.content),
          val('posts', 'tags', post.tags),
          post.readingTime,
        ],
      );
      console.log(`posts: updated ${res.rowCount} row(s)`);
    }

    // -------------------------------------------------------------- seo_meta --
    const seoCurrent = await client.query(
      `SELECT meta_title, meta_description, focus_keyword, keywords, faqs, stats, ai_answer
         FROM seo_meta WHERE entity_type = 'post' AND entity_slug = $1`,
      [SLUG],
    );
    if (seoCurrent.rows.length !== 1) throw new Error(`seo_meta row for ${SLUG} missing`);
    const seoRow = seoCurrent.rows[0];
    const target: Record<string, unknown> = {
      meta_title: META_TITLE,
      meta_description: META_DESCRIPTION,
      focus_keyword: FOCUS_KEYWORD,
      keywords: KEYWORDS,
      faqs: post.faqs,
      stats: STATS,
      ai_answer: AI_ANSWER,
    };
    const changed = Object.keys(target).filter(
      (column) => canonical(seoRow[column] ?? null) !== canonical(target[column]),
    );

    if (changed.length === 0) {
      console.log('seo_meta: already matches the repository — untouched');
    } else {
      const setClause = changed.map((column, i) => `${column} = $${i + 2}`).join(', ');
      const res = await client.query(
        `UPDATE seo_meta SET ${setClause} WHERE entity_type = 'post' AND entity_slug = $1`,
        [SLUG, ...changed.map((column) => val('seo_meta', column, target[column]))],
      );
      console.log(`seo_meta: updated ${res.rowCount} row(s) — ${changed.join(', ')}`);
    }

    const verify = await client.query(
      `SELECT p.title, p.reading_time, p.updated_at,
              s.meta_title,
              jsonb_array_length(to_jsonb(s.faqs)) AS faqs,
              jsonb_array_length(to_jsonb(s.stats)) AS stats
         FROM posts p JOIN seo_meta s
           ON s.entity_type = 'post' AND s.entity_slug = p.slug
        WHERE p.slug = $1`,
      [SLUG],
    );
    console.table(verify.rows);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
