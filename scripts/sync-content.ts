/**
 * Pushes edited copy from `src/data/*` into the Supabase rows the site
 * actually renders.
 *
 * `src/lib/content.ts` reads the database first and only falls back to the
 * static files when a table is empty, so editing `src/data/services.ts` alone
 * changes nothing a visitor sees. That gap is easy to miss because the copy in
 * the repo and the copy on the site look like the same source.
 *
 * Services are upserted, so adding a service to the static file creates its
 * row. The DO UPDATE deliberately omits `published` and `sort_order` — those
 * are editorial state that belongs to the database, and a content sync should
 * not quietly re-publish something that was switched off or undo a reorder.
 *
 * Run: npx tsx scripts/sync-content.ts
 */
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { services } from '../src/data/services';
import { experience } from '../src/data/experience';

function poolerUrl(): string {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  const match = env.match(/^POOLER_URL=(.*)$/m);
  if (!match) throw new Error('POOLER_URL not found in .env.local');
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

const client = new pg.Client({
  connectionString: poolerUrl(),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();

  for (const [position, service] of services.entries()) {
    const result = await client.query(
      `insert into services
         (slug, service_index, title, short_description, description, body,
          capabilities, icon, published, sort_order)
       values ($1, $2, $3, $4, $5, $6, $7, $8, true, $9)
       on conflict (slug) do update set
         service_index     = excluded.service_index,
         title             = excluded.title,
         short_description = excluded.short_description,
         description       = excluded.description,
         body              = excluded.body,
         capabilities      = excluded.capabilities,
         icon              = excluded.icon
       returning (xmax = 0) as inserted`,
      [
        service.slug,
        service.index,
        service.title,
        service.shortDescription,
        service.description,
        JSON.stringify(service.body ?? []),
        service.capabilities,
        service.icon,
        position,
      ],
    );
    const verb = result.rows[0]?.inserted ? 'inserted' : 'updated ';
    console.log(`${verb} ${service.slug}`);
  }

  for (const item of experience) {
    const result = await client.query(
      `update experience set description = $2 where id = $1 returning id`,
      [item.id, item.description],
    );
    console.log(result.rowCount ? `updated  ${item.id}` : `MISSING  ${item.id}`);
  }
}

main()
  .catch((error) => {
    console.error('FAIL:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
