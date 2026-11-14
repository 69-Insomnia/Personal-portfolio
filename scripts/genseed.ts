/**
 * Generates supabase/seed.sql from the static src/data content so a single
 * SQL application (Management API or dashboard) leaves the CMS fully stocked.
 * Run: npx tsx scripts/genseed.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { projects } from '../src/data/projects';
import { blogPosts } from '../src/data/blog';
import { experience } from '../src/data/experience';
import { services } from '../src/data/services';

const NAME_MAP: Record<string, string> = {
  index: 'service_index',
  shortDescription: 'short_description',
  readingTime: 'reading_time',
  isPlaceholder: 'is_placeholder',
  secondaryCategories: 'secondary_categories',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

function toColumn(name: string): string {
  if (NAME_MAP[name]) return NAME_MAP[name];
  return name.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function pgString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function pgArray(items: string[]): string {
  const body = items
    .map((item) => {
      const needsQuote = /[\s{},"'\\]/.test(item) || item === '';
      const escaped = item.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return needsQuote ? `"${escaped}"` : escaped;
    })
    .join(',');
  return `'{${body}}'`;
}

function pgValue(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return pgString(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return `'{}'`;
    if (value.every((v) => typeof v === 'string')) return pgArray(value as string[]);
    // jsonb fallback (should not happen for text[] columns)
    return `${pgString(JSON.stringify(value))}::jsonb`;
  }
  if (typeof value === 'object') return `${pgString(JSON.stringify(value))}::jsonb`;
  throw new Error(`Unsupported value type: ${typeof value}`);
}

const TABLES: { table: string; rows: Record<string, unknown>[] }[] = [
  { table: 'projects', rows: projects as unknown as Record<string, unknown>[] },
  {
    table: 'posts',
    // FAQs are stored in seo_meta.faqs, not a posts table column.
    rows: blogPosts.map(({ faqs: _faqs, ...post }) => post) as unknown as Record<string, unknown>[],
  },
  { table: 'experience', rows: experience as unknown as Record<string, unknown>[] },
  {
    table: 'services',
    // SEO title overrides are template metadata, not a services table column.
    rows: services.map(({ seoTitle: _seoTitle, ...service }) => service) as unknown as Record<string, unknown>[],
  },
];

const out: string[] = [
  '-- Seed data generated from src/data/*.ts (see scripts/genseed.ts).',
  '-- Requires the Supabase schema migrations to be applied first.',
  '-- Idempotent: ON CONFLICT DO NOTHING, so re-running never overwrites admin edits.',
  '',
];

for (const { table, rows } of TABLES) {
  const allColumns = new Set<string>();
  const rowColumns: string[][] = [];
  for (const row of rows) {
    const cols = Object.keys(row)
      .filter((key) => row[key] !== undefined)
      .map(toColumn);
    cols.forEach((c) => allColumns.add(c));
    rowColumns.push(cols);
  }
  const columns = [...allColumns];
  const values = rows.map((row, i) => {
    const colSet = new Set(rowColumns[i]);
    const cells = columns.map((col) => {
      if (!colSet.has(col)) return 'default';
      const original = Object.keys(row).find((k) => toColumn(k) === col);
      return original ? pgValue(row[original]) : 'default';
    });
    return `  (${cells.join(', ')})`;
  });
  out.push(
    `insert into public.${table} (${columns.join(', ')}) values`,
    `${values.join(',\n')}`,
    'on conflict do nothing;',
    '',
  );
}

const articleFaqs = blogPosts.filter((post) => post.faqs?.length);
if (articleFaqs.length > 0) {
  out.push(
    '-- Article FAQs live in seo_meta, not the posts table.',
    'insert into public.seo_meta (entity_type, entity_slug, faqs) values',
    articleFaqs
      .map((post) => `  ('post', ${pgString(post.slug)}, ${pgValue(post.faqs)})`)
      .join(',\n'),
    "on conflict (entity_type, entity_slug) do update set faqs = excluded.faqs where public.seo_meta.faqs is null or public.seo_meta.faqs = '[]'::jsonb;",
    '',
  );
}

const dest = resolve(process.cwd(), 'supabase/seed.sql');
const seedSql = out.join('\n');
writeFileSync(dest, seedSql, 'utf8');
console.log(`wrote ${dest} (${seedSql.length} bytes)`);

/**
 * Build one safe, paste-and-run bootstrap from the canonical migration chain
 * plus the content seed above. Auth users are intentionally not created here:
 * create the admin in Supabase Auth so no password or password hash is shipped
 * in a SQL file.
 */
const migrationDir = resolve(process.cwd(), 'supabase/migrations');
const init = readFileSync(resolve(migrationDir, '20260928001000_init.sql'), 'utf8');
const authMarker = '-- ------------------------------------------------------------- admin user ---';
const authSection = init.indexOf(authMarker);
if (authSection < 0) {
  throw new Error('Could not locate the legacy Auth-user section in the initial migration.');
}

const safeInit =
  init.slice(0, authSection) +
  '-- Auth users are created in Supabase Auth; credentials are never seeded from SQL.\n';
const migrationFiles = [
  '20261005001000_seo_layer.sql',
  '20261006001000_seo_admin.sql',
  '20261010001000_seo_geo_layer.sql',
];
const currentMigrations = migrationFiles.map((file) =>
  readFileSync(resolve(migrationDir, file), 'utf8'),
);
const faqMarker = '-- Article FAQs live in seo_meta, not the posts table.';
const faqStart = seedSql.indexOf(faqMarker);
const contentSeed = faqStart >= 0 ? seedSql.slice(0, faqStart) : seedSql;
const faqSeed = faqStart >= 0 ? seedSql.slice(faqStart) : '';

const contentSeoRows = `
-- Ensure metadata editor rows exist for seeded dynamic content. Values remain
-- NULL so the application's current SEO templates stay authoritative.
insert into public.seo_meta (entity_type, entity_slug)
select 'project', slug from public.projects where published = true
on conflict (entity_type, entity_slug) do nothing;

insert into public.seo_meta (entity_type, entity_slug)
select 'post', slug from public.posts where published = true
on conflict (entity_type, entity_slug) do nothing;

insert into public.seo_meta (entity_type, entity_slug)
select 'service', slug from public.services where published = true
on conflict (entity_type, entity_slug) do nothing;
`;

const combined = [
  '-- ============================================================',
  '-- Complete Supabase bootstrap: schema, security, storage, and current content.',
  '-- Generated from supabase/migrations and src/data by scripts/genseed.ts.',
  '-- Run in Supabase Dashboard > SQL Editor on a fresh project.',
  '-- Safe to rerun: schema is additive and content inserts preserve existing rows.',
  '-- No Auth user, password, API key, or private contact-message data is included.',
  '-- After running, create the admin account in Supabase Dashboard > Authentication > Users.',
  '-- This is a repository-source bootstrap, not a dump of live database state.',
  '-- ============================================================',
  '',
  '-- 1. supabase/migrations/20260928001000_init.sql (Auth user provisioning omitted)',
  safeInit,
  ...currentMigrations.flatMap((sql, index) => [
    `-- ${index + 2}. ${migrationFiles[index]}`,
    sql,
  ]),
  '-- 5. Current site content from src/data',
  contentSeed,
  contentSeoRows,
  faqSeed,
  "notify pgrst, 'reload schema';",
  '',
].join('\n');

const combinedPath = resolve(process.cwd(), 'supabase/combined.sql');
writeFileSync(combinedPath, combined, 'utf8');
console.log(`wrote ${combinedPath} (${combined.length} bytes)`);
