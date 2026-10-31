/**
 * Prints a compact audit of the live content tables to STDOUT.
 *
 * ## Why this exists alongside `export-backup.mjs`
 *
 * `export-backup.mjs` writes a full JSON snapshot to `backups/`. That is the
 * right artifact to keep, and it is useless if the shell that runs it cannot
 * write to disk or if the result cannot be read back. This prints instead, so
 * the answer arrives in the terminal — and, run with a `!` prefix in a Claude
 * Code session, in the conversation itself.
 *
 * ## Why the output is deliberately narrow
 *
 * A full dump of 22 `seo_meta` rows with their jsonb blobs, seven service bodies
 * and the post contents is tens of thousands of words and would bury the four
 * facts that are actually outstanding. So this prints exactly what is needed to
 * finish the pending work, and nothing else:
 *
 *   - which `seo_meta` rows are empty, and the exact length of the ones that
 *     are not (the 50-60 / 140-160 check)
 *   - every `redirects` row, which is the only place that says whether
 *     `/services/seo` 308s or serves a duplicate
 *   - service slugs, `from_npr`, and titles with whitespace made visible
 *   - every price figure found anywhere in a jsonb column, with its location —
 *     the contradiction between the ai-search FAQ and its schema
 *   - every `keyword_cluster`, to assign the overlaps
 *
 * ## Safety
 *
 * The anon key has a `select` policy on these tables and **no write policy at
 * all** — writes are granted to `authenticated` only — so a bug here cannot
 * damage anything. `messages` is excluded by an explicit list: it holds real
 * enquiries from real people and nothing in this audit needs them.
 *
 * Run: node scripts/status-report.mjs
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function env(name) {
  const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  const match = raw.match(new RegExp(`^${name}=(.*)$`, 'm'));
  if (!match) throw new Error(`${name} not found in .env.local`);
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

const supabase = createClient(
  env('NEXT_PUBLIC_SUPABASE_URL'),
  env('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

/** Collapses whitespace for display and reports the raw length first. */
const len = (v) => (typeof v === 'string' ? v.length : 0);
const clip = (v, n = 70) => {
  if (typeof v !== 'string') return '';
  const s = v.replace(/\s+/g, ' ').trim();
  return s.length > n ? `${s.slice(0, n)}…` : s;
};
const flag = (n) => (n >= 50 && n <= 60 ? 'ok ' : '!!!');
const flagDesc = (n) => (n >= 140 && n <= 160 ? 'ok ' : '!!!');

async function rows(table, select = '*') {
  const { data, error } = await supabase.from(table).select(select);
  if (error) {
    console.log(`  ERROR: ${error.message}`);
    return [];
  }
  return data ?? [];
}

const line = (s = '') => console.log(s);

// ---------------------------------------------------------------- seo_meta ---
line('='.repeat(78));
line('SEO_META — ' + new Date().toISOString());
line('='.repeat(78));

const seo = await rows('seo_meta');
line(`rows: ${seo.length}`);
line('');

line('--- TITLE / DESCRIPTION LENGTHS (target 50-60 / 140-160) ---');
for (const r of [...seo].sort((a, b) =>
  `${a.entity_type}/${a.entity_slug}`.localeCompare(`${b.entity_type}/${b.entity_slug}`),
)) {
  const t = len(r.meta_title);
  const d = len(r.meta_description);
  line(
    `  ${r.entity_type.padEnd(7)} ${String(r.entity_slug).padEnd(48)} ` +
      `T:${flag(t)}${String(t).padStart(3)}  D:${flagDesc(d)}${String(d).padStart(3)}`,
  );
}

line('');
line('--- EMPTY / PRESENT FIELDS ---');
for (const r of seo) {
  const has = (k) => (r[k] === null || r[k] === undefined ? '·' : 'X');
  const clusters = Array.isArray(r.keyword_cluster) ? r.keyword_cluster.length : 0;
  line(
    `  ${r.entity_type.padEnd(7)} ${String(r.entity_slug).padEnd(48)} ` +
      `title:${has('meta_title')} desc:${has('meta_description')} ` +
      `og:${has('og_title')} ogd:${has('og_description')} ` +
      `focus:${has('focus_keyword')} cluster:${String(clusters).padStart(2)} ` +
      `ai:${has('ai_answer')} faqs:${has('faqs')} stats:${has('stats')} ` +
      `jsonld:${has('custom_json_ld')} canon:${has('canonical_override')} ` +
      `noindex:${r.noindex ? 'Y' : '·'}`,
  );
}

line('');
line('--- focus_keyword ---');
for (const r of seo) {
  if (r.focus_keyword) line(`  ${r.entity_type}/${r.entity_slug}: ${r.focus_keyword}`);
}

line('');
line('--- keyword_cluster (item 7: find the overlaps) ---');
const clusterIndex = new Map();
for (const r of seo) {
  const list = Array.isArray(r.keyword_cluster) ? r.keyword_cluster : [];
  if (list.length) line(`  ${r.entity_type}/${r.entity_slug}: ${list.join(' | ')}`);
  for (const k of list) {
    const key = String(k).toLowerCase().trim();
    if (!clusterIndex.has(key)) clusterIndex.set(key, []);
    clusterIndex.get(key).push(`${r.entity_type}/${r.entity_slug}`);
  }
}
line('');
line('--- DUPLICATED KEYWORDS (used by more than one row) ---');
for (const [k, where] of clusterIndex) {
  if (where.length > 1) line(`  "${k}" -> ${where.join(', ')}`);
}

line('');
line('--- DUPLICATE TITLES / OG TITLES ---');
for (const field of ['meta_title', 'og_title']) {
  const seen = new Map();
  for (const r of seo) {
    const v = r[field];
    if (!v) continue;
    if (!seen.has(v)) seen.set(v, []);
    seen.get(v).push(`${r.entity_type}/${r.entity_slug}`);
  }
  let found = false;
  for (const [v, where] of seen) {
    if (where.length > 1) {
      found = true;
      line(`  ${field}: "${clip(v)}" -> ${where.join(', ')}`);
    }
  }
  if (!found) line(`  ${field}: no duplicates`);
}

// ------------------------------------------------------------------ prices ---
line('');
line('--- PRICE FIGURES FOUND IN seo_meta (item 6) ---');
const priceRe = /(?:NPR|Rs\.?)\s?[\d,]+(?:\s?k)?|"minPrice"\s*:\s*\d+|"price"\s*:\s*"?[\d,]+"?/gi;
let priceHits = 0;
for (const r of seo) {
  for (const field of ['custom_json_ld', 'faqs', 'stats', 'ai_answer', 'meta_description']) {
    const v = r[field];
    if (v === null || v === undefined) continue;
    const text = typeof v === 'string' ? v : JSON.stringify(v);
    const hits = text.match(priceRe);
    if (hits) {
      priceHits += hits.length;
      const uniq = [...new Set(hits)];
      line(`  ${r.entity_type}/${r.entity_slug} [${field}]: ${uniq.join(', ')}`);
    }
  }
}
if (!priceHits) line('  none found');

// ----------------------------------------------------------------- redirects ---
line('');
line('--- REDIRECTS (item 2: does /services/seo 308?) ---');
const redirects = await rows('redirects');
line(`rows: ${redirects.length}`);
for (const r of redirects) {
  line(
    `  ${String(r.from_path ?? r.path ?? r.source ?? '?').padEnd(44)} -> ` +
      `${String(r.to_path ?? r.target ?? r.destination ?? '?').padEnd(44)} ` +
      `${r.status_code ?? r.code ?? ''}  hits:${r.hit_count ?? '·'}`,
  );
}
const seoRedirect = redirects.filter((r) =>
  JSON.stringify(r).includes('/services/seo'),
);
line(
  seoRedirect.length
    ? `  >>> /services/seo HAS a redirect row (branch (a) — the URL 308s)`
    : `  >>> /services/seo has NO redirect row (branch (b) — both URLs serve 200)`,
);

// ------------------------------------------------------------------ services ---
line('');
line('--- SERVICES ---');
const services = await rows('services');
for (const s of services) {
  // Whitespace made visible so a double space or a trailing space is obvious.
  const rawTitle = typeof s.title === 'string' ? s.title : '';
  const marked = rawTitle.replace(/ /g, '·');
  const issues = [];
  if (/ {2,}/.test(rawTitle)) issues.push('DOUBLE-SPACE');
  if (rawTitle !== rawTitle.trim()) issues.push('UNTRIMMED');
  line(
    `  ${String(s.slug).padEnd(20)} from_npr:${String(s.from_npr ?? 'NULL').padEnd(8)} ` +
      `${issues.length ? issues.join(',') + ' ' : ''}title:${marked}`,
  );
}
line('');
line('  slugs present: ' + services.map((s) => s.slug).join(', '));

// --------------------------------------------------------------------- posts ---
line('');
line('--- POSTS ---');
const posts = await rows('posts');
for (const p of posts) {
  line(
    `  ${String(p.slug).padEnd(52)} pub:${p.published ? 'Y' : 'n'} ` +
      `date:${JSON.stringify(p.date)} rt:${p.reading_time} ` +
      `excerpt:${len(p.excerpt)} paras:${Array.isArray(p.content) ? p.content.length : 0}`,
  );
  if (typeof p.excerpt === 'string') line(`      "${clip(p.excerpt, 100)}"`);
}

line('');
line('='.repeat(78));
line('END. Copy this whole block back into the session.');
line('='.repeat(78));
