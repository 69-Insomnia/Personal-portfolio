// One-off: fix global title_suffix misconfig + optimize the home page SEO
// around "Ecommerce Growth Specialist in Kathmandu / Nepal". Safe to re-run.
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

async function auth() {
  const r = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
  });
  if (!r.ok) throw new Error(`auth ${r.status}: ${await r.text()}`);
  return (await r.json()).access_token;
}

const PATCH = (table, query, body, token) =>
  fetch(`${URL}/rest/v1/${table}?${query}`, {
    method: 'PATCH',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(body),
  });

const token = await auth();

// 1. Global settings: empty the suffix (it duplicated the brand), clean the fallback title.
const settings = {
  title_suffix: '',
  default_meta_title: 'Ecommerce Growth Specialist in Kathmandu | Dipendra Guragain',
  default_meta_description:
    'Dipendra Guragain is an ecommerce growth specialist in Kathmandu, Nepal, helping businesses grow with SEO, web development and paid advertising.',
};
const s = await PATCH('site_settings', 'id=eq.true', settings, token);
console.log('site_settings ->', s.status, (await s.text()).slice(0, 120));

// 2. Home page SEO, centered on the primary keyword (titles kept <= 60 chars).
const metaTitle = 'Ecommerce Growth Specialist in Kathmandu | Dipendra Guragain'; // 60 chars
const metaDescription =
  'Looking for an ecommerce growth specialist in Kathmandu, Nepal? Dipendra Guragain helps local businesses grow with SEO, web development and paid ads.'; // ~152 chars
const keywords = [
  'ecommerce growth specialist in kathmandu',
  'ecommerce growth specialist in nepal',
  'ecommerce growth expert kathmandu',
  'ecommerce seo specialist nepal',
  'ecommerce marketing kathmandu',
  'online business growth nepal',
  'ecommerce consultant kathmandu',
  'seo and web development nepal',
];
const home = {
  meta_title: metaTitle,
  meta_description: metaDescription,
  keywords,
  og_title: metaTitle,
  og_description: metaDescription,
};
const h = await PATCH('seo_meta', 'entity_type=eq.page&entity_slug=eq.home', home, token);
console.log('seo_meta home ->', h.status, (await h.text()).slice(0, 120));

// Verify read-back.
const v = await fetch(`${URL}/rest/v1/seo_meta?select=meta_title,meta_description,og_title,keywords&entity_type=eq.page&entity_slug=eq.home`, {
  headers: { apikey: KEY, Authorization: `Bearer ${token}` },
});
const [row] = await v.json();
console.log('read-back meta_title :', row.meta_title, `(${row.meta_title.length} chars)`);
console.log('read-back og_title   :', row.og_title);
console.log('read-back keywords   :', row.keywords?.length, 'terms');
