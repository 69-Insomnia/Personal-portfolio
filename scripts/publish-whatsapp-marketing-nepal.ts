/**
 * Publishes "WhatsApp Marketing in Nepal" from `src/data/blog.ts` to the
 * database the live site reads: the `posts` row (inserted first in the list)
 * and its `seo_meta` row (title tag, description, keywords, FAQs, answer).
 *
 * Idempotent: re-running updates the same two rows from the repository.
 *
 * Run: npx tsx scripts/publish-whatsapp-marketing-nepal.ts
 */
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { blogPosts } from '../src/data/blog';

const SLUG = 'whatsapp-marketing-automation-nepal';

const META_TITLE = 'WhatsApp Marketing in Nepal | WhatsApp Marketing Expert Kathmandu';
const META_DESCRIPTION =
  'WhatsApp marketing in Nepal and Kathmandu: Business API automation for enquiries, orders, eSewa and Khalti payments, COD and delivery updates. Full guide.';
const FOCUS_KEYWORD = 'WhatsApp marketing in Nepal';
const KEYWORDS = [
  'WhatsApp Marketing in Nepal',
  'WhatsApp Marketing in Kathmandu',
  'WhatsApp Marketing Expert in Nepal',
  'WhatsApp Marketing Expert in Kathmandu',
  'WhatsApp Business API Nepal',
  'WhatsApp Marketing Automation Nepal',
  'WhatsApp chatbot Nepal',
  'WhatsApp bulk message Nepal',
];
const AI_ANSWER =
  'WhatsApp marketing in Nepal uses the WhatsApp Business API and automation to reply to enquiries instantly, ' +
  'share products and prices, collect orders, send eSewa, Khalti or Fonepay payment links, confirm Cash on ' +
  'Delivery orders and send delivery updates. Dipendra Guragain is a WhatsApp marketing expert in Kathmandu ' +
  'who sets this up for businesses across Nepal.';

async function main() {
  const post = blogPosts.find((p) => p.slug === SLUG);
  if (!post?.content?.length || !post.faqs?.length) throw new Error(`repo entry ${SLUG} incomplete`);

  const env = readFileSync('.env.local', 'utf8');
  const url = env.match(/^POOLER_URL=(.*)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, '');
  if (!url) throw new Error('POOLER_URL not found in .env.local');
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query('begin');

    const exists = await client.query('select 1 from posts where slug=$1', [SLUG]);
    if (exists.rowCount) {
      await client.query(
        `update posts set title=$2, excerpt=$3, category=$4, date=$5, image=$6, content=$7,
           tags=$8, reading_time=$9, updated_at=now() where slug=$1`,
        [SLUG, post.title, post.excerpt, post.category, post.date, post.image, post.content,
          post.tags ?? [], post.readingTime],
      );
      console.log('posts: updated');
    } else {
      const { rows } = await client.query('select coalesce(min(sort_order), 0) - 1 as s from posts');
      await client.query(
        `insert into posts
           (slug, title, excerpt, category, date, image, content, tags, reading_time,
            is_placeholder, published, sort_order, created_at, updated_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,false,true,$10,now(),now())`,
        [SLUG, post.title, post.excerpt, post.category, post.date, post.image, post.content,
          post.tags ?? [], post.readingTime, rows[0].s],
      );
      console.log('posts: inserted');
    }

    const values = [SLUG, META_TITLE, META_DESCRIPTION, KEYWORDS, FOCUS_KEYWORD,
      JSON.stringify(post.faqs), AI_ANSWER];
    const meta = await client.query(
      `select 1 from seo_meta where entity_type='post' and entity_slug=$1`, [SLUG]);
    if (meta.rowCount) {
      await client.query(
        `update seo_meta set meta_title=$2, meta_description=$3, keywords=$4, focus_keyword=$5,
           faqs=$6, ai_answer=$7 where entity_type='post' and entity_slug=$1`, values);
      console.log('seo_meta: updated');
    } else {
      await client.query(
        `insert into seo_meta (entity_type, entity_slug, meta_title, meta_description, keywords,
           focus_keyword, faqs, ai_answer) values ('post',$1,$2,$3,$4,$5,$6,$7)`, values);
      console.log('seo_meta: inserted');
    }
    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('FAIL:', e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
