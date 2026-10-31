// Full keyword pass: centre every page on "Ecommerce Growth Specialist in
// Kathmandu / Nepal" + related terms. Titles kept <= 60 chars (clampTitle
// otherwise cuts them). og_title/og_description mirror the meta so they agree.
// Safe to re-run (upserts by entity_type + entity_slug).
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const clamp = (text, limit) => {
  let t = text.replace(/\s+/g, ' ').replace(/[|,:—–-]+$/, '').trim();
  if (t.length > limit) {
    const cut = t.slice(0, limit + 1);
    const lastSpace = cut.lastIndexOf(' ');
    t = cut.slice(0, lastSpace > 0 ? lastSpace : limit).replace(/[|,:—–-]+$/, '').trim();
  }
  return t;
};

async function auth() {
  const r = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
  });
  if (!r.ok) throw new Error(`auth ${r.status}: ${await r.text()}`);
  return (await r.json()).access_token;
}
const token = await auth();
const api = (path, opts = {}) => fetch(`${URL}/rest/v1/${path}`, {
  ...opts,
  headers: { apikey: KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(opts.headers || {}) },
});

async function save(entity_type, entity_slug, meta_title, meta_description, keywords) {
  const title = clamp(meta_title, 60);
  const desc = clamp(meta_description, 155);
  const body = { meta_title: title, meta_description: desc, keywords, og_title: title, og_description: desc };
  const r = await api(`seo_meta?entity_type=eq.${entity_type}&entity_slug=eq.${entity_slug}`, { method: 'PATCH', body: JSON.stringify(body) });
  const rows = await r.json();
  if (!rows.length) {
    await api('seo_meta', { method: 'POST', body: JSON.stringify({ entity_type, entity_slug, ...body }) });
  }
  console.log(`${entity_type}/${entity_slug.padEnd(20)} [${String(title.length).padStart(2)}] ${title}`);
}

// ---- static pages (hand-tuned) ----
await save('page', 'home',
  'Ecommerce Growth Kathmandu Nepal | Dipendra Guragain',
  'Ecommerce growth specialist in Kathmandu, Nepal. Dipendra Guragain helps online stores scale with SEO, web development and paid ads that convert.',
  ['ecommerce growth specialist in kathmandu', 'ecommerce growth specialist in nepal', 'ecommerce growth expert kathmandu', 'ecommerce seo nepal', 'online store growth nepal', 'ecommerce marketing kathmandu', 'seo and web development nepal', 'google ads nepal']);

await save('page', 'about',
  'About Dipendra Guragain | Ecommerce SEO in Kathmandu',
  'Meet Dipendra Guragain, an ecommerce growth specialist in Kathmandu, Nepal, with a track record in SEO, web development and performance marketing.',
  ['about dipendra guragain', 'ecommerce specialist kathmandu', 'seo expert nepal', 'ecommerce growth consultant', 'web developer kathmandu', 'digital marketing nepal']);

await save('page', 'work',
  'Web & Ecommerce Projects in Nepal | Dipendra Guragain',
  'Selected web development and ecommerce growth projects delivered in Kathmandu, Nepal — SEO, storefronts and paid-ads campaigns with real results.',
  ['ecommerce projects nepal', 'web development kathmandu', 'ecommerce seo case studies', 'online store projects nepal', 'kangra web developer', 'ecommerce growth work']);

await save('page', 'services',
  'Ecommerce SEO, Web Dev & Ads Services in Nepal',
  'Ecommerce growth services in Kathmandu, Nepal: SEO, web development, Google Ads, Meta Ads and AI search optimization to grow your online store.',
  ['ecommerce seo services nepal', 'web development kathmandu', 'google ads nepal', 'meta ads management', 'ai search optimization', 'digital marketing kathmandu', 'ecommerce growth specialist']);

await save('page', 'pricing',
  'SEO, Web Dev & Ads Pricing in Nepal | Dipendra Guragain',
  'Transparent pricing for SEO, web development and paid-ads services in Kathmandu, Nepal. Starter packages for growing ecommerce businesses.',
  ['seo pricing nepal', 'web development cost kathmandu', 'google ads management price', 'ecommerce marketing budget nepal', 'seo services cost kathmandu']);

await save('page', 'blog',
  'SEO & Ecommerce Insights in Nepal | Dipendra Guragain',
  'Practical SEO, GEO and ecommerce growth guides from a specialist in Kathmandu, Nepal — technical SEO, AI search and online-store strategy.',
  ['seo blog nepal', 'ecommerce seo tips', 'geo ai search optimization', 'technical seo guide', 'online store marketing', 'kathmandu seo expert']);

await save('page', 'contact',
  'Contact Dipendra | Ecommerce Growth in Kathmandu, Nepal',
  'Get in touch with Dipendra Guragain, ecommerce growth specialist in Kathmandu, Nepal. Let\u2019s grow your online store with SEO and paid ads.',
  ['contact ecommerce specialist kathmandu', 'hire seo expert nepal', 'ecommerce growth consultation', 'web developer contact kathmandu']);

// ---- projects / posts / services (generated from real content) ----
const projects = await (await api('projects?select=slug,title,category,description&published=eq.true')).json();
for (const p of projects) {
  await save('project', p.slug,
    `${p.title} Case Study | ${p.category} Nepal`,
    p.description || `${p.title} — a ${p.category} project delivered in Kathmandu, Nepal by Dipendra Guragain.`,
    ['web development kathmandu', 'ecommerce website nepal', 'website case study nepal', 'kangra web developer', 'business website kathmandu']);
}

const posts = await (await api('posts?select=slug,title,excerpt&published=eq.true')).json();
for (const b of posts) {
  await save('post', b.slug,
    `${b.title} | Dipendra Guragain`,
    b.excerpt || 'SEO and ecommerce growth insights from Dipendra Guragain, specialist in Kathmandu, Nepal.',
    ['seo tips nepal', 'technical seo', 'ecommerce seo', 'geo ai search optimization', 'digital marketing kathmandu']);
}

const services = await (await api('services?select=slug,title,short_description&published=eq.true')).json();
for (const s of services) {
  await save('service', s.slug,
    `${s.title} | Dipendra Guragain`,
    s.short_description || `${s.title} in Kathmandu, Nepal by Dipendra Guragain, ecommerce growth specialist.`,
    [s.title.toLowerCase(), 'ecommerce growth specialist kathmandu', 'seo services nepal', 'digital marketing kathmandu', 'online store growth nepal']);
}

console.log('\nDone.');
