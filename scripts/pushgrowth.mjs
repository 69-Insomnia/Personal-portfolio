// Section A of the four-keyword ranking strategy: plural-variant coverage
// for "e-commerce growth experts in Nepal" and "e-commerce growth
// specialists in Kathmandu", both of which appeared ZERO times in the live
// HTML while the singulars ranked.
//   - page/home: title/description synced with the enforced code values,
//     ai_answer gains both plural phrases, keywords/clusters gain variants.
//   - service/ecommerce-growth: title unblocked so the exact phrase
//     "growth specialist in Kathmandu" is contiguous (the old title put the
//     brand name between "Specialist" and "in Kathmandu"), plus description,
//     focus keyword, three plural FAQs, ai_answer and llm_summary.
// Home plural FAQs live in HOME_KEYWORD_FAQS (src/app/page.tsx) because the
// home page merges DB + code; the service page reads the DB row alone.
// Re-runnable: every write is a full overwrite of the field.
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const authR = await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { apikey: KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
});
if (!authR.ok) throw new Error(`auth ${authR.status}: ${await authR.text()}`);
const token = (await authR.json()).access_token;
const headers = { apikey: KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };

async function patch(entityType, entitySlug, body) {
  const r = await fetch(`${BASE}/rest/v1/seo_meta?entity_type=eq.${entityType}&entity_slug=eq.${entitySlug}`, {
    method: 'PATCH', headers, body: JSON.stringify(body),
  });
  const rows = await r.json();
  if (r.status >= 400) throw new Error(`PATCH ${entityType}/${entitySlug} ${r.status}: ${JSON.stringify(rows)}`);
  if (!rows.length) throw new Error(`no row for ${entityType}/${entitySlug}`);
  return rows[0];
}
async function get(entityType, entitySlug) {
  const r = await fetch(`${BASE}/rest/v1/seo_meta?select=*&entity_type=eq.${entityType}&entity_slug=eq.${entitySlug}`, { headers });
  const rows = await r.json();
  if (!rows.length) throw new Error(`no row for ${entityType}/${entitySlug}`);
  return rows[0];
}

// ---------- page/home ----------
const home = await get('page', 'home');

const homeTitle = 'E-commerce Growth Expert in Nepal | Specialists in Kathmandu';
if (homeTitle.length > 60) throw new Error(`home title ${homeTitle.length} > 60`);

const homeDesc =
  'E-commerce growth expert in Nepal and e-commerce growth specialists in Kathmandu: ecommerce SEO, Meta Ads and CRO for stores that need measurable growth.';
if (homeDesc.length > 160) throw new Error(`home desc ${homeDesc.length} > 160`);

// ai_answer: both plural phrases in one sentence, spliced in before the
// engagement paragraph so the answer still reads as prose. Guarded so a
// second run does not splice the sentence in twice — the anchor survives
// the first insertion.
const homeAnswerAnchor = 'treated as one funnel rather than separate projects.';
if (!home.ai_answer.includes(homeAnswerAnchor)) throw new Error('home ai_answer anchor not found');
const homeAnswer = home.ai_answer.includes('Businesses comparing e-commerce growth experts')
  ? home.ai_answer
  : home.ai_answer.replace(
  homeAnswerAnchor,
  homeAnswerAnchor +
    ' Businesses comparing e-commerce growth experts in Nepal or e-commerce growth specialists in Kathmandu are usually comparing exactly that range: one person accountable for strategy and execution instead of four suppliers.',
);

const homeKeywords = [
  ...new Set([
    ...(home.keywords ?? []),
    'e-commerce growth expert in nepal',
    'e-commerce growth experts in nepal',
    'e-commerce growth specialist in kathmandu',
    'e-commerce growth specialists in kathmandu',
    // Already ranking on Google per the client — kept in the metadata so a
    // rewrite elsewhere cannot quietly drop it.
    'e-commerce growth specialists in nepal',
  ]),
];
const homeClusters = [
  ...new Set([
    ...(home.keyword_cluster ?? []),
    'E-commerce growth expert Nepal',
    'E-commerce growth experts Nepal',
    'E-commerce growth specialist Kathmandu',
    'E-commerce growth specialists Kathmandu',
  ]),
];

await patch('page', 'home', {
  meta_title: homeTitle,
  og_title: homeTitle,
  meta_description: homeDesc,
  og_description: homeDesc,
  ai_answer: homeAnswer,
  keywords: homeKeywords,
  keyword_cluster: homeClusters,
});
console.log(`home: title ${homeTitle.length}ch | desc ${homeDesc.length}ch | keywords ${homeKeywords.length} | clusters ${homeClusters.length}`);

// ---------- service/ecommerce-growth ----------
const eg = await get('service', 'ecommerce-growth');

const egTitle = 'Ecommerce Growth Specialist in Kathmandu | Dipendra Guragain';
if (egTitle.length > 60) throw new Error(`eg title ${egTitle.length} > 60`);

const egDesc =
  'Ecommerce growth specialist in Kathmandu and Nepal: storefront, ecommerce SEO, product pages, ads and analytics run as one funnel rather than four projects.';
if (egDesc.length > 160) throw new Error(`eg desc ${egDesc.length} > 160`);

// ai_answer: plural sentence after the opening claim.
const egAnchor = 'who treats an online store\'s storefront, product pages, ecommerce SEO, advertising and analytics as one system rather than four separate projects.';
if (!eg.ai_answer.includes(egAnchor)) throw new Error('eg ai_answer anchor not found');
const egAnswer = eg.ai_answer.includes('Businesses comparing e-commerce growth specialists in Kathmandu')
  ? eg.ai_answer
  : eg.ai_answer.replace(
  egAnchor,
  egAnchor +
    ' Businesses comparing e-commerce growth specialists in Kathmandu or e-commerce growth experts in Nepal are comparing that same system: one owner for the funnel rather than four vendors.',
);

const egLlm =
  'Ecommerce growth specialist in Kathmandu Dipendra Guragain: Shopify and WooCommerce stores, product SEO, Google and Meta ads and analytics run as one funnel — one of the e-commerce growth experts in Nepal for online store growth.';

// Three plural-shaped FAQs; the third answers list intent (the "shortlist"
// reading of a plural query) directly.
const egFaqs = [
  ...(eg.faqs ?? []).filter((f) =>
    ![
      'What does an e-commerce growth specialist in Kathmandu do?',
      'Who are the best e-commerce growth experts in Nepal?',
      'How do I choose an e-commerce growth expert in Nepal?',
    ].includes(f.question),
  ),
  {
    question: 'What does an e-commerce growth specialist in Kathmandu do?',
    answer:
      'An e-commerce growth specialist in Kathmandu works on the whole funnel: storefront speed and UX, product and category page SEO, Google and Meta campaigns, and the analytics that show what changed. Fixing those together is why sales can move without raising the ad budget.',
  },
  {
    question: 'Who are the best e-commerce growth experts in Nepal?',
    answer:
      'The e-commerce growth experts in Nepal worth shortlisting show what they changed and what happened next — traffic quality, conversion rate, repeat purchases and revenue. This practice works that way: one person owning SEO, ads, CRO and analytics for online stores in Nepal.',
  },
  {
    question: 'How do I choose an e-commerce growth expert in Nepal?',
    answer:
      'Ask what would be fixed first and why, how it will be measured, and what a realistic timeline looks like. An e-commerce growth expert in Nepal should answer in plain language and tie the work to sales rather than rankings alone.',
  },
];

const egKeywords = [
  ...new Set([
    ...(eg.keywords ?? []),
    'e-commerce growth specialist in kathmandu',
    'e-commerce growth specialists in kathmandu',
    'e-commerce growth experts in nepal',
  ]),
];
const egClusters = [
  ...new Set([
    ...(eg.keyword_cluster ?? []),
    'E-commerce growth specialist Kathmandu',
    'E-commerce growth specialists Kathmandu',
    'E-commerce growth experts Nepal',
  ]),
];

await patch('service', 'ecommerce-growth', {
  meta_title: egTitle,
  og_title: egTitle,
  meta_description: egDesc,
  og_description: egDesc,
  focus_keyword: 'ecommerce growth specialist in kathmandu',
  ai_answer: egAnswer,
  llm_summary: egLlm,
  faqs: egFaqs,
  keywords: egKeywords,
  keyword_cluster: egClusters,
});
console.log(`ecommerce-growth: title ${egTitle.length}ch | desc ${egDesc.length}ch | faqs ${egFaqs.length} | keywords ${egKeywords.length}`);
console.log('Done.');
