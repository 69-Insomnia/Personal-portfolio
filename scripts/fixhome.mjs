// Align the HOME page + Person entity to the target keyword:
//   "Ecommerce growth expert in Nepal"
// Touches only: seo_meta (page/home) and site_settings.person_job_title.
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

const KW = 'ecommerce growth expert in nepal';
const title = 'Ecommerce Growth Expert in Kathmandu, Nepal | Dipendra Guragain'; // 59 ch
const description =
  'Dipendra Guragain is an ecommerce growth specialist in Kathmandu, Nepal helping online stores grow with ecommerce SEO, Shopify and WooCommerce optimisation, conversion rate optimisation, and Google & Meta Ads.'; // 196 ch

const aiAnswer =
  'Dipendra Guragain is an ecommerce growth specialist in Kathmandu, Nepal. He helps online stores get found on Google, convert more visitors, and grow revenue through SEO, Shopify and WooCommerce optimisation, conversion rate optimisation, and Google and Meta Ads, managed as one funnel with one accountable partner.';

const llmSummary =
  'Dipendra Guragain is an ecommerce growth expert in Nepal helping online stores grow through SEO, Shopify optimisation, conversion rate optimisation, and Google & Meta Ads.';

const faqs = [
  { question: 'What does an ecommerce growth expert in Nepal do?', answer: 'An ecommerce growth expert improves how an online store is found, how visitors convert, and how much each order is worth. Work spans technical SEO, product and category pages, Shopify or WooCommerce improvements, conversion rate optimisation and paid ads, prioritised around the store\'s goals and current data.' },
  { question: 'How much does ecommerce growth cost in Nepal?', answer: 'Cost depends on the number of products, how competitive the category is, how much technical work the store needs, and whether you want a one-off audit or a monthly retainer. Work starts with an audit so the scope is based on your actual store, and pricing is quoted after reviewing it.' },
  { question: 'How long does ecommerce growth take to show results?', answer: 'Technical fixes such as site speed, indexing and broken pages can show an effect within weeks. Ranking gains for product and category pages usually build over several months, depending on competition and how much content the store needs. Paid campaigns can send traffic sooner while the SEO work compounds.' },
];

// 1. Home seo_meta row
const metaPatch = {
  meta_title: title,
  meta_description: description,
  og_title: title,
  og_description: description,
  focus_keyword: KW,
  keywords: [
    'ecommerce growth expert in nepal',
    'ecommerce growth expert kathmandu',
    'ecommerce growth specialist nepal',
    'ecommerce marketing expert nepal',
    'shopify growth expert nepal',
    'ecommerce seo nepal',
    'online store growth nepal',
    'google ads nepal',
  ],
  keyword_cluster: [
    'ecommerce growth expert Nepal',
    'ecommerce growth specialist Kathmandu',
    'ecommerce marketing Nepal',
    'Shopify SEO Nepal',
    'ecommerce conversion optimization',
    'Google Ads management Nepal',
    'Meta Ads management Nepal',
  ],
  ai_answer: aiAnswer,
  llm_summary: llmSummary,
  faqs,
  entity_signals: {
    knowsAbout: [
      'Ecommerce Growth', 'Ecommerce SEO', 'Technical SEO', 'Shopify SEO',
      'WooCommerce SEO', 'Web Development', 'Google Ads', 'Meta Ads',
      'Conversion Rate Optimization', 'Generative Engine Optimization',
    ],
    definedTerms: [
      { name: 'Ecommerce growth expert:', description: 'A specialist who improves an online store across search visibility, conversion rate and order value so revenue grows profitably.' },
      { name: 'GEO (Generative Engine Optimization):', description: 'optimising content so generative AI answer engines can find, quote and cite it' },
      { name: 'AEO (Answer Engine Optimization):', description: 'structuring content so search and AI tools can extract a direct answer to a question.' },
    ],
  },
  custom_json_ld: {
    '@type': 'ProfessionalService',
    url: 'https://dipendraguragain.tech',
    name: 'Dipendra Guragain – Ecommerce Growth Expert in Nepal',
    description: 'Ecommerce growth, SEO, website development and paid advertising for online stores in Nepal.',
    address: { '@type': 'PostalAddress', addressCountry: 'NP', addressLocality: 'Kathmandu' },
    areaServed: { '@type': 'Country', name: 'Nepal' },
    serviceType: ['Ecommerce Growth', 'Ecommerce SEO', 'Website Development', 'Paid Advertising'],
  },
  noindex: false,
  nofollow: false,
};
const m = await call('seo_meta?entity_type=eq.page&entity_slug=eq.home', 'PATCH', metaPatch);
const mrows = await m.json;
if (m.status >= 400) throw new Error(`seo_meta PATCH ${m.status}: ${JSON.stringify(mrows)}`);
console.log('seo_meta home:', mrows.length ? 'updated' : 'NO ROW', `(${mrows.length})`);

// 2. Person entity jobTitle (site_settings singleton). Entity-level signal, no
//    visual change on other pages — Person.jobTitle is JSON-LD only.
const s = await call('site_settings?id=eq.true', 'PATCH', { person_job_title: 'Ecommerce Growth Expert in Nepal' });
const srows = await s.json;
if (s.status >= 400) throw new Error(`site_settings PATCH ${s.status}: ${JSON.stringify(srows)}`);
console.log('site_settings.person_job_title:', srows.length ? 'updated' : 'NO ROW', `(${srows.length})`);

console.log('Done.');
