// Drop "Specialist" from the five service titles that carry it — it read as
// a job title rather than a service on the cards. The same field is the H1,
// the /services listing entry, the footer link and the breadcrumb, so one
// PATCH covers every visible spot.
//
// What deliberately does NOT change: each page's `seo_meta.meta_title`,
// description and FAQs keep their "specialist" keyword phrases — those are
// metadata, not visible copy, and they are what ranks the pages.
// `custom_json_ld.name` moves with the title so schema.org matches the H1.
//
// New titles:
//   seo-services       SEO Specialist in Kathmandu        -> SEO Services in Kathmandu
//   meta-ads           Meta Ads Management Specialist      -> Meta Ads Management
//   google-ads         Google Ads Specialist               -> Google Ads Management
//   ecommerce-growth   Ecommerce Growth Specialist         -> Ecommerce Growth Services
//   digital-marketing  Digital Marketing Specialist        -> Digital Marketing Services
//
// Static fallbacks in src/data/services.ts are edited alongside this script
// so the no-database path shows the same words. Re-runnable: fixed targets.
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
if (!authR.ok) throw new Error(`auth ${authR.status}`);
const token = (await authR.json()).access_token;
const headers = { apikey: KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };

const RENAMES = {
  'seo-services': 'SEO Services in Kathmandu',
  'meta-ads': 'Meta Ads Management',
  'google-ads': 'Google Ads Management',
  'ecommerce-growth': 'Ecommerce Growth Services',
  'digital-marketing': 'Digital Marketing Services',
};

async function patch(path, body) {
  const r = await fetch(`${BASE}/rest/v1/${path}`, { method: 'PATCH', headers, body: JSON.stringify(body) });
  const rows = await r.json();
  if (r.status >= 400) throw new Error(`PATCH ${path} ${r.status}: ${JSON.stringify(rows)}`);
  if (!rows.length) throw new Error(`no row matched ${path}`);
  return rows;
}

for (const [slug, title] of Object.entries(RENAMES)) {
  const rows = await patch(`services?slug=eq.${slug}`, { title });
  console.log(`services.${slug}: "${rows[0].title}"`);

  // Schema name follows the visible H1; the rest of the JSON-LD object
  // (offers, areaServed, …) is untouched.
  const g = await fetch(`${BASE}/rest/v1/seo_meta?select=custom_json_ld&entity_type=eq.service&entity_slug=eq.${slug}`, { headers });
  const meta = (await g.json())[0];
  if (meta?.custom_json_ld?.name) {
    await patch(`seo_meta?entity_type=eq.service&entity_slug=eq.${slug}`, {
      custom_json_ld: { ...meta.custom_json_ld, name: title },
    });
    console.log(`  jsonld.name: "${title}"`);
  }
}
console.log('Done.');
