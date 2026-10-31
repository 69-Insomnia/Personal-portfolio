// Publish the Meta Ads post: upsert into posts + a GEO-optimised seo_meta row.
// Reads the post straight from src/data/blog.ts so the DB copy never drifts.
import { readFileSync } from 'node:fs';

const src = readFileSync('src/data/blog.ts', 'utf8');
const eqIdx = src.indexOf('=', src.indexOf('blogPosts'));
const aStart = src.indexOf('[', eqIdx);
let depth = 0, aEnd = -1;
for (let i = aStart; i < src.length; i++) {
  const c = src[i];
  if (c === '[') depth++;
  else if (c === ']') { depth--; if (depth === 0) { aEnd = i; break; } }
}
const posts = eval('(' + src.slice(aStart, aEnd + 1) + ')');
const post = posts.find((p) => p.slug === 'meta-ads-whatsapp-chats-nepal');
if (!post) throw new Error('post not found in blog.ts');
console.log(`extracted: "${post.title}" | ${post.content.length} blocks | ${post.faqs.length} faqs`);

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const authR = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { apikey: KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
});
if (!authR.ok) throw new Error(`auth ${authR.status}: ${await authR.text()}`);
const token = (await authR.json()).access_token;

const call = (path, method, body) =>
  fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers: { apikey: KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, json: r.json() }));

async function upsert(table, filter, body) {
  const upd = await call(`${table}?${filter}`, 'PATCH', body);
  const rows = await upd.json;
  if (upd.status >= 400) throw new Error(`${table} PATCH ${upd.status}: ${JSON.stringify(rows)}`);
  if (rows.length) return 'updated';
  const ins = await call(table, 'POST', body);
  const j = await ins.json;
  if (ins.status >= 400) throw new Error(`${table} POST ${ins.status}: ${JSON.stringify(j)}`);
  return 'inserted';
}

// 1. posts row
const p = await upsert('posts', `slug=eq.${post.slug}`, {
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  category: post.category,
  date: post.date,
  reading_time: post.readingTime,
  image: post.image,
  content: post.content,
  tags: post.tags,
  image_alt: 'Meta Ads messaging case study — WhatsApp conversations for a Nepal ecommerce store',
  is_placeholder: false,
  published: true,
  sort_order: 0,
});
console.log('posts:', p);

// 2. seo_meta row (GEO-optimised)
const metaTitle = post.title; // 53 chars, keyword-led
const metaDescription =
  'How three boosted reels started 306 WhatsApp chats for $0.09 each for a Kathmandu camera store \u2014 a real Meta Ads messaging case study from Nepal.';
const aiAnswer =
  'Meta Ads messaging campaigns can start WhatsApp conversations for a fraction of a cent when the objective, creative and offer line up. In one Nepal ecommerce case, three boosted reels for a Kathmandu camera store selling DJI gear with cash on delivery spent $22.62 in total and started 306 WhatsApp conversations, an average of about $0.07 each, with the active campaign at $0.09 per conversation on a $5 daily budget. The campaigns used the Messages objective rather than traffic or engagement, and the creative was phone-shot product video carrying the price, a cash-on-delivery line and a prompt to message on WhatsApp. The single metric that decides whether such a campaign is worth scaling is the cost per messaging conversation started, not the view count.';
const source = 'Meta Ads Manager campaign report (Nanostore, October 2026)';

const m = await upsert('seo_meta', `entity_type=eq.post&entity_slug=eq.${post.slug}`, {
  entity_type: 'post',
  entity_slug: post.slug,
  meta_title: metaTitle,
  meta_description: metaDescription,
  og_title: metaTitle,
  og_description: metaDescription,
  focus_keyword: 'meta ads nepal',
  keywords: [
    'meta ads nepal',
    'whatsapp marketing nepal',
    'facebook messaging ads',
    'meta ads case study',
    'ecommerce ads kathmandu',
    'cost per messaging conversation',
    'boosted reels nepal',
    'meta ads messaging objective',
  ],
  keyword_cluster: [
    'whatsapp marketing kathmandu',
    'facebook ads for messages',
    'meta ads messaging objective',
    'cash on delivery ecommerce nepal',
    'boosted reels nepal',
  ],
  ai_answer: aiAnswer,
  llm_summary:
    'Real Nepal case study: three Meta messaging campaigns started 306 WhatsApp chats for about $0.09 each on a $5/day budget for a Kathmandu camera store.',
  stats: [
    { label: 'WhatsApp conversations started (3 campaigns)', value: '306', source },
    { label: 'Cost per messaging conversation', value: '$0.09', source },
    { label: 'Total ad spend', value: '$22.62', source },
    { label: 'Views across campaigns', value: '46,315', source },
    { label: 'Daily budget', value: '$5.00', source },
  ],
  faqs: post.faqs,
  entity_signals: {
    knowsAbout: ['Meta Ads', 'WhatsApp Marketing', 'Paid Social Advertising', 'Ecommerce', 'Nepal', 'Cash on Delivery'],
  },
  noindex: false,
  nofollow: false,
});
console.log('seo_meta:', m);
console.log('Done.');
