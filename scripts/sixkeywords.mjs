// Rank the HOME page on six keywords:
//   1. ecommerce growth expert in Nepal        (focus/title/H1/hero/footer — already live)
//   2. ecommerce growth specialist in Kathmandu
//   3. ecommerce growth consultant Nepal
//   4. ecommerce growth expert in Kathmandu    (Introduction + FAQ — already live)
//   5. ecommerce marketing expert in Nepal
//   6. ecommerce specialist in Kathmandu
// This script covers the meta layer: description, keywords, clusters,
// ai_answer, llm_summary and the visible Quick-answers FAQs.
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

const cur = await call('seo_meta?entity_type=eq.page&entity_slug=eq.home', 'GET');
if (cur.status >= 400) throw new Error(`GET ${cur.status}`);
const row = (await cur.json)[0];
if (!row) throw new Error('home seo_meta row missing');

// 1+6 in the SERP snippet: primary keyword plus the thinnest-covered Kathmandu variant.
const description =
  'Dipendra Guragain is an ecommerce growth expert in Nepal and ecommerce specialist in Kathmandu, helping online stores grow with SEO, Shopify, CRO and ads.';
if (description.length > 160) throw new Error(`meta_description ${description.length} > 160`);

// The six exact keywords, plus two that already existed and still support them.
const keywords = [
  'ecommerce growth expert in nepal',
  'ecommerce growth specialist in kathmandu',
  'ecommerce growth consultant nepal',
  'ecommerce growth expert in kathmandu',
  'ecommerce marketing expert in nepal',
  'ecommerce specialist in kathmandu',
  'ecommerce seo nepal',
  'google ads nepal',
];

const keywordCluster = [
  'Ecommerce growth expert Nepal',
  'Ecommerce growth expert Kathmandu',
  'Ecommerce growth specialist Kathmandu',
  'Ecommerce growth consultant Nepal',
  'Ecommerce marketing expert Nepal',
  'Ecommerce specialist Kathmandu',
  'Shopify SEO Nepal',
  'Google Ads management Nepal',
];

// ai_answer is the paragraph AnswerBlock renders under the hero and the
// WebPage abstract engines quote — weave in keywords 2 and 5.
let aiAnswer = row.ai_answer || '';
const anchorA = 'an ecommerce growth expert in Nepal, based in Kathmandu, who helps';
if (!aiAnswer.includes(anchorA)) throw new Error('ai_answer anchor A not found');
aiAnswer = aiAnswer.replace(
  anchorA,
  'an ecommerce growth expert in Nepal and an ecommerce growth specialist in Kathmandu who helps',
);
const anchorB = 'Google and Meta Ads, treated as one funnel rather than separate projects.';
if (!aiAnswer.includes(anchorB)) throw new Error('ai_answer anchor B not found');
aiAnswer = aiAnswer.replace(
  anchorB,
  'Google and Meta Ads — the work of an ecommerce marketing expert in Nepal — treated as one funnel rather than separate projects.',
);

// llm_summary carries keyword 3 (consultant) exactly, apostrophe included so
// the substring "ecommerce growth consultant Nepal" is present verbatim.
const llmSummary =
  "Dipendra Guragain is an ecommerce growth expert in Nepal and the ecommerce growth consultant Nepal's online stores hire, based in Kathmandu, helping them grow through SEO, Shopify optimisation, conversion rate optimisation, and Google & Meta Ads.";

const faqs = [...(row.faqs || [])];
const upsertFaq = (question, answer) => {
  const i = faqs.findIndex((f) => f.question === question);
  if (i >= 0) faqs[i] = { question, answer };
  else faqs.push({ question, answer });
};

// Keyword 3 — rewrite the existing cost question to the consultant phrasing.
const costIdx = faqs.findIndex((f) => f.question === 'How much does ecommerce growth cost in Nepal?');
if (costIdx >= 0) {
  faqs[costIdx] = {
    question: 'How much does an ecommerce growth consultant in Nepal cost?',
    answer:
      'The cost of an ecommerce growth consultant in Nepal depends on the number of products, how competitive the category is, how much technical work the store needs, and whether you want a one-off audit or a monthly retainer. Work starts with an audit so the scope is based on your actual store, and pricing is quoted after reviewing it.',
  };
}
// Keyword 2
upsertFaq(
  'Are you an ecommerce growth specialist in Kathmandu?',
  'Yes. Based in Kathmandu, I work as an ecommerce growth specialist with stores across the valley and remotely — storefront, product pages, ecommerce SEO, paid campaigns and analytics handled as one system rather than four separate projects.',
);
// Keyword 5
upsertFaq(
  'What does an ecommerce marketing expert in Nepal do?',
  'An ecommerce marketing expert in Nepal connects search, content and paid campaigns to revenue: SEO and product pages that earn traffic, Google and Meta Ads that capture demand, and conversion fixes that turn visits into orders. That is the scope I work in for stores in Nepal and abroad.',
);
// Keyword 6
upsertFaq(
  'What does an ecommerce specialist in Kathmandu do?',
  'An ecommerce specialist in Kathmandu runs the day-to-day growth of an online store — platform and speed fixes, product page SEO, tracking, and campaign setup across Google and Meta. I do this for stores in Kathmandu Valley and remotely across Nepal.',
);

const patch = {
  meta_description: description,
  og_description: description,
  keywords,
  keyword_cluster: keywordCluster,
  ai_answer: aiAnswer,
  llm_summary: llmSummary,
  faqs,
};

const m = await call('seo_meta?entity_type=eq.page&entity_slug=eq.home', 'PATCH', patch);
const mrows = await m.json;
if (m.status >= 400) throw new Error(`PATCH ${m.status}: ${JSON.stringify(mrows)}`);
console.log('description', description.length, 'chars | keywords:', keywords.length, '| clusters:', keywordCluster.length, '| faqs:', faqs.length);
console.log('Done.');
