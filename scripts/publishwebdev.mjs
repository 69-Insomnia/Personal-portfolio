// Rank /services/web-development on eight web-development keywords (this page
// only — title and short_description are left alone because they also render
// on the home page's services cards and the /services listing).
//   1. professional website developer in nepal   5. professional web developer in nepal
//   2. web developer in nepal                    6. full stack developer in nepal
//   3. website developer in nepal                7. web designer in nepal
//   4. freelance web developer in nepal          8. website developer in kathmandu
// Plus "web development specialist in nepal".
// Touches: services (overview + body) and seo_meta (service/web-development).
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

async function patchRow(table, filter, body) {
  const upd = await call(`${table}?${filter}`, 'PATCH', body);
  const rows = await upd.json;
  if (upd.status >= 400) throw new Error(`${table} PATCH ${upd.status}: ${JSON.stringify(rows)}`);
  if (!rows.length) throw new Error(`${table}: no row matched ${filter}`);
  return rows;
}

// ---------- services row: overview + body ----------
const sRes = await call('services?slug=eq.web-development', 'GET');
if (sRes.status >= 400) throw new Error(`GET services ${sRes.status}`);
const service = (await sRes.json)[0];
if (!service) throw new Error('service web-development missing');

// Overview: keyword 1 + Kathmandu framing, then keyword 6 mid-paragraph.
let desc = service.description;
const anchorA = 'I am a web developer in Kathmandu, building marketing websites, web applications and online stores.';
if (!desc.includes(anchorA)) throw new Error('overview anchor A not found');
desc = desc.replace(
  anchorA,
  'I am a professional website developer in Nepal — a freelance web developer based in Kathmandu — building marketing websites, web applications and online stores.',
);
const anchorB = 'I work across the front end and the back end, wire the analytics up properly';
if (!desc.includes(anchorB)) throw new Error('overview anchor B not found');
desc = desc.replace(
  anchorB,
  'As a full stack developer in Nepal, I work across the front end and the back end, wire the analytics up properly',
);

// Body: keyword 7 appended to the design section, plus a new keyword section
// carrying keywords 5 and 4 as an H2 question (the shape answer engines extract).
const body = (service.body || []).map((sec) => ({ heading: sec.heading, paragraphs: [...sec.paragraphs] }));
const design = body.find((sec) => sec.heading === 'Do you build the design as well as the code?');
if (!design) throw new Error('design section not found');
design.paragraphs[design.paragraphs.length - 1] +=
  ' That is also what a web designer in Nepal does here: the mockup and the build are the same job, so nothing gets reinterpreted on the way to production.';

if (!body.some((sec) => sec.heading === 'Why hire a professional web developer in Nepal?')) {
  body.splice(1, 0, {
    heading: 'Why hire a professional web developer in Nepal?',
    paragraphs: [
      'Because one person takes it from the first sketch to the live site: the same professional web developer in Nepal who designs the pages also writes the code, wires up the analytics and checks the speed on a real phone. Nothing gets lost in a handover between three suppliers.',
      'As a freelance web developer in Nepal, that also means you talk directly to the person building the site. Decisions take hours instead of days, the scope stays what we agreed, and the price does not grow because a project manager joined a call.',
    ],
  });
}

await patchRow('services', 'slug=eq.web-development', { description: desc, body });
console.log('services: overview + body updated | sections:', body.length);

// ---------- seo_meta row ----------
const mRes = await call('seo_meta?entity_type=eq.service&entity_slug=eq.web-development', 'GET');
if (mRes.status >= 400) throw new Error(`GET seo_meta ${mRes.status}`);
const meta = (await mRes.json)[0];
if (!meta) throw new Error('seo_meta service/web-development missing');

const metaTitle = 'Web Developer in Nepal | Website Design and Development';
if (metaTitle.length > 60) throw new Error(`meta_title ${metaTitle.length} > 60`);

const metaDescription =
  'Professional website developer in Nepal building fast custom websites and online stores — or a website developer in Kathmandu for local business. Free quote.';
if (metaDescription.length > 160) throw new Error(`meta_description ${metaDescription.length} > 160`);

// ai_answer: keywords 2 + 6 in the opening, specialist + professional in the tail.
let aiAnswer = meta.ai_answer || '';
const anchorC = 'Dipendra Guragain provides web development services in Kathmandu, Nepal, building';
if (!aiAnswer.includes(anchorC)) throw new Error('ai_answer anchor C not found');
aiAnswer = aiAnswer.replace(
  anchorC,
  'Dipendra Guragain is a web developer in Nepal and a freelance full stack developer based in Kathmandu, building',
);
const anchorD = 'The work covers the front end and back end, API integration, headless CMS setups and analytics tracking configured correctly from day one.';
if (!aiAnswer.includes(anchorD)) throw new Error('ai_answer anchor D not found');
aiAnswer = aiAnswer.replace(
  anchorD,
  'The work covers the front end and back end, API integration, headless CMS setups and analytics tracking configured correctly from day one — the range of a web development specialist in Nepal, delivered by one professional website developer in Nepal who also handles the design.',
);

const llmSummary =
  'Web developer in Nepal Dipendra Guragain: freelance web development from Kathmandu — custom websites, web applications and online stores on React, Next.js, WordPress and Shopify, from NPR 45,000.';

const faqs = [...(meta.faqs || [])];
const upsertFaq = (question, answer) => {
  const i = faqs.findIndex((f) => f.question === question);
  if (i >= 0) faqs[i] = { question, answer };
  else faqs.push({ question, answer });
};

upsertFaq(
  'Why should I hire a web developer in Nepal instead of an agency?',
  'You get one person accountable for the result — design, code, speed and analytics — without the handovers and markups an agency adds. For a small or medium business, a web developer in Nepal working directly with you usually means faster decisions, a fixed scope and a price that does not move once the project starts.',
);
upsertFaq(
  'Do you work as a freelance web developer in Nepal?',
  'Yes. I am a freelance web developer in Nepal based in Kathmandu, working with businesses across Nepal and remotely. You talk directly to the person building the site, which keeps decisions quick and the scope exactly what we agreed.',
);
upsertFaq(
  'Are you a full stack developer in Nepal?',
  'Yes. As a full stack developer in Nepal I handle both the front end — the layout, responsiveness and performance visitors see — and the back end: databases, APIs, integrations and deployments. One person owning both sides is why the site launches without gaps between design and build.',
);
upsertFaq(
  'Do you also work as a web designer in Nepal?',
  'Yes. Design and build are the same service here: layout, typography, responsive behaviour and the front-end code are handled by one web designer in Nepal rather than passed between a design team and a development team.',
);
upsertFaq(
  'Who is the website developer in Kathmandu?',
  'Dipendra Guragain, a website developer in Kathmandu building marketing websites, web applications and online stores with React, Next.js, WordPress and Shopify — available for projects in Kathmandu Valley and across Nepal.',
);

const keywords = [
  'professional website developer in nepal',
  'web developer in nepal',
  'website developer in nepal',
  'freelance web developer in nepal',
  'professional web developer in nepal',
  'full stack developer in nepal',
  'web designer in nepal',
  'website developer in kathmandu',
  'web development specialist in nepal',
];

const keywordCluster = [
  'Professional website developer Nepal',
  'Web developer Nepal',
  'Website developer Nepal',
  'Freelance web developer Nepal',
  'Professional web developer Nepal',
  'Full stack developer Nepal',
  'Web designer Nepal',
  'Website developer Kathmandu',
  'Web development specialist Nepal',
  'Shopify developer nepal',
  'WordPress developer kathmandu',
  'Next.js developer nepal',
];

const signals = meta.entity_signals || {};
const knowsAbout = Array.isArray(signals.knowsAbout) ? [...signals.knowsAbout] : [];
for (const term of ['Web Design', 'Full Stack Development']) {
  if (!knowsAbout.includes(term)) knowsAbout.push(term);
}

const patch = {
  meta_title: metaTitle,
  meta_description: metaDescription,
  og_title: metaTitle,
  og_description: metaDescription,
  focus_keyword: 'web developer in nepal',
  keywords,
  keyword_cluster: keywordCluster,
  ai_answer: aiAnswer,
  llm_summary: llmSummary,
  faqs,
  entity_signals: { ...signals, knowsAbout },
  noindex: false,
  nofollow: false,
};

const m = await patchRow('seo_meta', 'entity_type=eq.service&entity_slug=eq.web-development', patch);
console.log('seo_meta: updated | title', metaTitle.length, 'ch | desc', metaDescription.length, 'ch | faqs:', faqs.length, '| keywords:', keywords.length);
console.log('Done.');
