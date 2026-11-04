// Add the Nano Store ecommerce-growth role to the `experience` table.
// Static src/data/experience.ts already has it, but reads are DB-first, so
// the row has to exist here too. Also renumbers sort_order (newest first:
// nano-store 0, drillthru 1, poms-penthouse 2) so the new row renders on top.
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

// 1. Push the two existing rows down so the new one is first.
//    PATCH per-row (PostgREST can't set different values in one bulk patch).
for (const [id, order] of [['drillthru', 1], ['poms-penthouse', 2]]) {
  const r = await call(`experience?id=eq.${id}`, 'PATCH', { sort_order: order });
  if (r.status >= 400) throw new Error(`reorder ${id} ${r.status}: ${JSON.stringify(await r.json)}`);
}
console.log('reordered drillthru=1, poms-penthouse=2');

// 2. Insert the Nano Store row (skip if it already exists).
const exists = await call('experience?id=eq.nano-store&select=id', 'GET');
const rows = await exists.json;
if (exists.status >= 400) throw new Error(`exists check ${exists.status}: ${JSON.stringify(rows)}`);
if (rows.length) {
  console.log('nano-store row already exists — nothing to insert');
} else {
  const ins = await call('experience', 'POST', {
    id: 'nano-store',
    period: '1 Year',
    role: 'Ecommerce Growth Expert',
    company: 'Nano Store',
    description:
      'Worked as an ecommerce growth expert in Nepal at Nano Store (https://nanostore.com.np/), improving ecommerce SEO, product visibility, conversion flow, and paid acquisition across Google Ads and Meta Ads. The role focused on growing qualified traffic, improving store performance, and increasing online sales through data-driven ecommerce growth strategies.',
    technologies: ['Ecommerce Growth', 'SEO', 'Google Ads', 'Meta Ads', 'Conversion Optimization'],
    is_placeholder: false,
    published: true,
    sort_order: 0,
  });
  const body = await ins.json;
  if (ins.status >= 400) throw new Error(`insert ${ins.status}: ${JSON.stringify(body)}`);
  console.log('nano-store inserted:', body[0]?.id);
}

// 3. Verify final order.
const all = await call('experience?select=id,sort_order&order=sort_order', 'GET');
console.log('final order:', (await all.json).map((r) => `${r.id}(${r.sort_order})`).join(' -> '));
