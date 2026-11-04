// One-off: add a standalone "website developer in nepal" instance to the
// Kathmandu FAQ answer (it previously appeared only inside the longer
// "professional website developer in nepal" phrase). Re-runnable: matches by
// question text and rewrites the answer to the same fixed text.
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

const g = await fetch(`${BASE}/rest/v1/seo_meta?entity_type=eq.service&entity_slug=eq.web-development`, { headers });
const row = (await g.json())[0];
if (!row) throw new Error('seo_meta row missing');

const answer =
  'Dipendra Guragain is a website developer in Nepal based in Kathmandu, building marketing websites, web applications and online stores with React, Next.js, WordPress and Shopify — available for projects in Kathmandu Valley and across Nepal.';
const faqs = row.faqs.map((f) =>
  f.question === 'Who is the website developer in Kathmandu?' ? { question: f.question, answer } : f,
);
if (!row.faqs.some((f) => f.question === 'Who is the website developer in Kathmandu?')) {
  throw new Error('target FAQ not found');
}

const p = await fetch(`${BASE}/rest/v1/seo_meta?entity_type=eq.service&entity_slug=eq.web-development`, {
  method: 'PATCH', headers, body: JSON.stringify({ faqs }),
});
if (p.status >= 400) throw new Error(`PATCH ${p.status}: ${await p.text()}`);
console.log('FAQ answer updated — faqs:', faqs.length);
