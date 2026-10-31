/**
 * Read-only snapshot of the content tables, for review before any change.
 *
 * ## Why this uses the anon key and not POOLER_URL
 *
 * `scripts/sync-content.ts` connects with `POOLER_URL`, which is the `postgres`
 * superuser and bypasses row-level security entirely. That is correct for a
 * script whose whole job is to write, and wrong for this one.
 *
 * The anon key has a `select` policy on every table this reads and **no write
 * policy at all** — writes on these tables are granted to `authenticated` only.
 * So a bug in this file cannot damage anything: a stray `.update()` would be
 * refused by the database rather than obeyed. The safety here is enforced by
 * Postgres, not by the author remembering to be careful.
 *
 * ## Why `messages` is not exported
 *
 * It holds real enquiries from real people. Nothing in the review needs them,
 * and a content backup is not a reason to copy them onto a laptop. It is
 * excluded by an explicit list, not by an oversight.
 *
 * Run: node scripts/export-backup.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

/** The tables in scope. `messages` is deliberately absent — see the note above. */
const TABLES = [
  'seo_meta',
  'services',
  'projects',
  'posts',
  'experience',
  'testimonials',
  'site_settings',
  'redirects',
];

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

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = new URL('../backups/', import.meta.url);
mkdirSync(outDir, { recursive: true });

const snapshot = {
  takenAt: new Date().toISOString(),
  project: 'dxhkehmjuwgithhpgsxe',
  note:
    'Read-only export via the anon key. Row counts include unpublished rows, ' +
    'because the anon select policy is `using (true)` and the published filter ' +
    'is applied in application code, not in the database.',
  tables: {},
};

for (const table of TABLES) {
  const { data, error } = await supabase.from(table).select('*');
  if (error) {
    console.error(`FAIL ${table}: ${error.message}`);
    snapshot.tables[table] = { error: error.message };
    continue;
  }
  snapshot.tables[table] = { count: data.length, rows: data };
  console.log(`${table}: ${data.length} rows`);
}

const outFile = new URL(`${stamp}.json`, outDir);
writeFileSync(outFile, JSON.stringify(snapshot, null, 2));
console.log(`\nWrote ${outFile.pathname}`);
