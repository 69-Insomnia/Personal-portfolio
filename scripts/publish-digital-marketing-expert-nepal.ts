/**
 * One-shot publish step for
 * "Digital Marketing Expert in Nepal: How to Find and Hire the Right Digital
 * Marketing Specialist in Kathmandu (2026 Guide)".
 *
 * The live site reads the database first (see `readAll` in src/lib/content.ts),
 * so the repository entry alone renders the fallback but not the live page.
 * This applies, in one transaction-free pass:
 *
 *  - `posts`: INSERTs the row when it does not exist (the page would otherwise
 *    404), then keeps title, excerpt, category, date, image, content, tags and
 *    reading time in step with `src/data/blog.ts`. `sort_order = -1` puts it at
 *    the head of the list, since every other published row sits at 0 or above.
 *
 *  - `seo_meta`: the title tag, meta description, focus keyword and keyword
 *    list; the eight FAQs as `faqs` (the page renders them and emits the
 *    matching FAQPage node from that same array, which is what keeps schema and
 *    visible text identical); four sourced statistics; the direct-answer
 *    `ai_answer`; and the `og_*`/`twitter_*` set pointing at the cover.
 *
 * Idempotent: each side is skipped when it already matches the repository, so
 * re-running never clobbers itself — but a value edited later in /admin WILL
 * be re-applied by a re-run, because the repository is the source this script
 * publishes from. Column types are read from `information_schema` so `jsonb`
 * columns receive JSON text and `text[]` columns receive a real array.
 *
 * Run from the repo root: npx tsx scripts/publish-digital-marketing-expert-nepal.ts
 */
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { blogPosts } from '../src/data/blog';

const SLUG = 'digital-marketing-expert-nepal';

/**
 * Key-order-insensitive JSON compare.
 *
 * `jsonb` reorders object keys on storage (by length, then bytewise), so a
 * plain stringify comparison is false forever for any object with more than
 * one key — the FAQ guard would report a change on every run. Arrays keep
 * their order in `jsonb`, which is what we want: question order is content,
 * key order is not.
 */
const canonical = (value: unknown): string =>
  JSON.stringify(value, (_key, entry) =>
    entry && typeof entry === 'object' && !Array.isArray(entry)
      ? Object.fromEntries(Object.entries(entry).sort(([a], [b]) => a.localeCompare(b)))
      : entry,
  );

const META_TITLE = 'Digital Marketing Expert in Nepal | Kathmandu Guide 2026';
const META_DESCRIPTION =
  'How to find and hire a digital marketing expert in Nepal: what they do, what it costs in Kathmandu, 8 questions to ask and red flags to avoid.';
const FOCUS_KEYWORD = 'digital marketing expert in Nepal';
const KEYWORDS = [
  'digital marketing expert in Nepal',
  'digital marketing expert in Kathmandu',
  'digital marketing specialist in Nepal',
  'digital marketing consultant Kathmandu',
  'hire digital marketing expert Nepal',
  'digital marketing agency Kathmandu',
];
const OG_IMAGE = `/images/blog-${SLUG}.png`;

/**
 * The answer-first opening of the body, reused verbatim as the direct-answer
 * field. Reusing it rather than writing a second version is the point: an
 * assistant extracting the page and a reader at the top of it should get the
 * same sentence.
 */
const AI_ANSWER =
  'To hire the right digital marketing expert in Nepal, shortlist three specialists, ask each for a ' +
  '2-3 week audit plan and a fixed monthly price, and check they can show real Nepali results before ' +
  'signing anything long. In Kathmandu the ongoing work runs at NPR 15,000 per month, with ad budget ' +
  'paid direct to Google and Meta.';

const STATS = [
  {
    value: '16.6M',
    label: 'internet users in Nepal — 56.0% of the population — as of October 2025',
    source: 'DataReportal, Digital 2026: Nepal',
  },
  {
    value: '14.8M',
    label: 'social media user identities in Nepal, 50.0% of the population',
    source: 'DataReportal, Digital 2026: Nepal',
  },
  {
    value: '96.33%',
    label: 'of search referrals in Nepal go to Google, with mobile carrying 57.13% of web traffic',
    source: 'StatCounter',
  },
  {
    value: '26.76M',
    label: 'digital wallet users in Nepal by Falgun 2081',
    source: 'Nepal Rastra Bank',
  },
];

const LLM_SUMMARY =
  'Hiring guide for a digital marketing expert in Nepal: what the role covers, what it costs ' +
  '(NPR 15,000/month after a 2-3 week audit), eight questions to ask, and red flags to avoid.';

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
               AND column_name IN ('title', 'excerpt', 'category', 'date', 'image',
                                   'content', 'tags', 'reading_time', 'sort_order',
                                   'published'))
           OR (table_name = 'seo_meta'
               AND column_name IN ('meta_title', 'meta_description', 'focus_keyword',
                                   'keywords', 'faqs', 'stats', 'ai_answer',
                                   'og_title', 'og_description', 'og_image',
                                   'twitter_title', 'twitter_description',
                                   'twitter_image', 'llm_summary'))`,
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
      'SELECT title, excerpt, category, date, image, content, tags, reading_time, sort_order FROM posts WHERE slug = $1',
      [SLUG],
    );

    if (current.rows.length === 0) {
      const res = await client.query(
        `INSERT INTO posts
           (slug, title, excerpt, category, date, image, content, tags, reading_time,
            is_placeholder, published, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, true, -1, NOW(), NOW())`,
        [
          SLUG,
          post.title,
          post.excerpt,
          post.category,
          post.date,
          post.image,
          val('posts', 'content', post.content),
          val('posts', 'tags', post.tags),
          post.readingTime,
        ],
      );
      console.log(`posts: inserted ${res.rowCount} row (sort_order = -1)`);
    } else {
      const row = current.rows[0];
      const postsInSync =
        row.title === post.title &&
        row.excerpt === post.excerpt &&
        row.category === post.category &&
        row.date === post.date &&
        row.image === post.image &&
        JSON.stringify(row.content) === JSON.stringify(post.content) &&
        JSON.stringify(row.tags) === JSON.stringify(post.tags) &&
        row.reading_time === post.readingTime &&
        row.sort_order === -1;

      if (postsInSync) {
        console.log('posts: already matches the repository — untouched');
      } else {
        const res = await client.query(
          `UPDATE posts
              SET title = $2, excerpt = $3, category = $4, date = $5, image = $6,
                  content = $7, tags = $8, reading_time = $9, sort_order = -1,
                  published = true, updated_at = NOW()
            WHERE slug = $1`,
          [
            SLUG,
            post.title,
            post.excerpt,
            post.category,
            post.date,
            post.image,
            val('posts', 'content', post.content),
            val('posts', 'tags', post.tags),
            post.readingTime,
          ],
        );
        console.log(`posts: updated ${res.rowCount} row(s)`);
      }
    }

    // -------------------------------------------------------------- seo_meta --
    const seoCurrent = await client.query(
      `SELECT meta_title, meta_description, focus_keyword, keywords, faqs, stats,
              ai_answer, og_title, og_description, og_image,
              twitter_title, twitter_description, twitter_image, llm_summary
         FROM seo_meta WHERE entity_type = 'post' AND entity_slug = $1`,
      [SLUG],
    );

    const target: Record<string, unknown> = {
      meta_title: META_TITLE,
      meta_description: META_DESCRIPTION,
      focus_keyword: FOCUS_KEYWORD,
      keywords: KEYWORDS,
      faqs: post.faqs,
      stats: STATS,
      ai_answer: AI_ANSWER,
      og_title: META_TITLE,
      og_description: META_DESCRIPTION,
      og_image: OG_IMAGE,
      twitter_title: META_TITLE,
      twitter_description: META_DESCRIPTION,
      twitter_image: OG_IMAGE,
      llm_summary: LLM_SUMMARY,
    };

    if (seoCurrent.rows.length === 0) {
      const columns = Object.keys(target);
      const setClause = columns.map((column, i) => `$${i + 2}`).join(', ');
      const res = await client.query(
        `INSERT INTO seo_meta (entity_type, entity_slug, ${columns.join(', ')})
         VALUES ('post', $1, ${setClause})`,
        [SLUG, ...columns.map((column) => val('seo_meta', column, target[column]))],
      );
      console.log(`seo_meta: inserted ${res.rowCount} row`);
    } else {
      const seoRow = seoCurrent.rows[0];
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
    }

    const verify = await client.query(
      `SELECT p.title, p.category, p.date, p.reading_time, p.sort_order, p.published,
              s.meta_title, s.og_image,
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
