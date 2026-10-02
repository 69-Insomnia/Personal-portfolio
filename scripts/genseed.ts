/**
 * Generates supabase/seed.sql from the static src/data content so a single
 * SQL application (Management API or dashboard) leaves the CMS fully stocked.
 * Run: npx tsx scripts/genseed.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { projects } from '../src/data/projects';
import { blogPosts } from '../src/data/blog';
import { experience } from '../src/data/experience';
import { testimonials } from '../src/data/testimonials';
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
  { table: 'posts', rows: blogPosts as unknown as Record<string, unknown>[] },
  { table: 'experience', rows: experience as unknown as Record<string, unknown>[] },
  { table: 'testimonials', rows: testimonials as unknown as Record<string, unknown>[] },
  { table: 'services', rows: services as unknown as Record<string, unknown>[] },
];

const out: string[] = [
  '-- Seed data generated from src/data/*.ts (see scripts/genseed.ts).',
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

const dest = resolve(process.cwd(), 'supabase/seed.sql');
writeFileSync(dest, out.join('\n'), 'utf8');
console.log(`wrote ${dest} (${out.join('\n').length} bytes)`);
