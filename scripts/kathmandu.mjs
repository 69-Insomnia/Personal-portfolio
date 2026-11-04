// Add the city variant — "ecommerce growth expert in Kathmandu" — alongside the
// country variant on the HOME seo_meta row. Nepal stays primary (focus_keyword,
// meta_title, H1, hero, footer); Kathmandu goes into description, ai_answer,
// llm_summary, one new FAQ, keywords and clusters.
// Touches only: seo_meta (page/home).
import { readFileSync } from 'node:fs';

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

// Read current row first so faqs/keywords are extended, not overwritten.
const cur = await call('seo_meta?entity_type=eq.page&entity_slug=eq.home', 'GET');
if (cur.status >= 400) throw new Error(`GET ${cur.status}`);
const row = (await cur.json)[0];
if (!row) throw new Error('home seo_meta row missing');
console.log('current meta_description len:', (row.meta_description || '').length);

const description =
  'Dipendra Guragain is an ecommerce growth expert in Nepal based in Kathmandu, helping online stores grow with SEO, Shopify, CRO and Google & Meta Ads.';
console.log('new meta_description len:', description.length);
if (description.length > 160) throw new Error('meta_description over 160 chars');

const aiAnswer = (row.ai_answer || '').replace(
  'Dipendra Guragain is an ecommerce growth expert in Nepal who helps',
  'Dipendra Guragain is an ecommerce growth expert in Nepal, based in Kathmandu, who helps',
);
if (aiAnswer === row.ai_answer) throw new Error('ai_answer anchor not found');

const llmSummary = (row.llm_summary || '').replace(
  'an ecommerce growth expert in Nepal helping',
  'an ecommerce growth expert in Nepal, based in Kathmandu, helping',
);
if (llmSummary === row.llm_summary) throw new Error('llm_summary anchor not found');

const kathmanduFaq = {
  question: 'Who is the ecommerce growth expert in Kathmandu?',
  answer: 'Dipendra Guragain, an ecommerce growth expert based in Kathmandu, Nepal. He works with online stores across Nepal and remotely — ecommerce SEO, Shopify and WooCommerce improvements, conversion rate optimisation, and Google and Meta Ads — treating the storefront, search and paid media as one system.',
};
const faqs = (row.faqs || []).some((f) => f.question === kathmanduFaq.question)
  ? row.faqs
  : [...row.faqs, kathmanduFaq];

const keywords = (row.keywords || []).includes('ecommerce growth expert in kathmandu')
  ? row.keywords
  : [...row.keywords, 'ecommerce growth expert in kathmandu'];

const clusters = (row.keyword_cluster || []).includes('Ecommerce growth expert Kathmandu')
  ? row.keyword_cluster
  : [...row.keyword_cluster, 'Ecommerce growth expert Kathmandu'];

const patch = {
  meta_description: description,
  og_description: description,
  ai_answer: aiAnswer,
  llm_summary: llmSummary,
  faqs,
  keywords,
  keyword_cluster: clusters,
};

const m = await call('seo_meta?entity_type=eq.page&entity_slug=eq.home', 'PATCH', patch);
const mrows = await m.json;
if (m.status >= 400) throw new Error(`PATCH ${m.status}: ${JSON.stringify(mrows)}`);
console.log('seo_meta home: updated —', mrows.length, 'row(s), faqs:', faqs.length, ', keywords:', keywords.length);
console.log('Done.');
