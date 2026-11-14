/**
 * One-time seed: makes sure every service that exists in this repository also
 * exists as a row — so removing the static-file fallback from the public pages
 * cannot lose content.
 *
 * ## What it does
 *
 * For each entry in `src/data/services.ts` it inserts a row **only if no row
 * with that slug exists** (`on conflict (slug) do nothing`). A row that
 * already exists is not touched in any way: not its copy, not its order, not
 * its publication state. This is deliberately the opposite of
 * `scripts/sync-content.ts`, which upserts and therefore overwrites — the
 * database holds newer edits than the file (real timelines, real prices),
 * and a script run "to be safe" must never push the repository's copy over
 * them.
 *
 * ## What it does NOT do
 *
 * - **It does not publish.** Missing rows are created as drafts
 *   (`published = false`). Whether something goes live is an editorial
 *   decision made in /admin, not a side effect of running a script. In the
 *   normal case — a database that already holds the live services — this
 *   script inserts nothing at all.
 * - **It does not write comparison fields.** `deliverables`, `timeline`,
 *   `best_for` and `from_npr` are owned by the admin panel; the file's values
 *   for them are the placeholders this repository shipped with (see the long
 *   note in `sync-content.ts`). A draft row without them renders no table
 *   until someone fills them in, which is correct.
 *
 * ## When to run it
 *
 * Once, now — and again only if a service is ever added to the file and you
 * want it created as a draft automatically. Safe to re-run: existing rows are
 * skipped. Note that re-running after you have *deleted* a row in /admin will
 * re-create it as a draft, because the file still lists it — so treat this as
 * a seed, not as a sync.
 *
 * Run: npx tsx scripts/seed-services.ts
 */
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { services } from '../src/data/services';

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

async function seedServices() {
  let inserted = 0;
  for (const [position, service] of services.entries()) {
    const result = await client.query(
      `insert into services
         (slug, service_index, title, short_description, description, body,
          capabilities, icon, published, sort_order)
       values ($1, $2, $3, $4, $5, $6, $7, $8, false, $9)
       on conflict (slug) do nothing
       returning slug`,
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
    if (result.rowCount) {
      inserted += 1;
      console.log(`inserted services/${service.slug} (draft)`);
    } else {
      console.log(`exists   services/${service.slug} (left untouched)`);
    }
  }
  console.log(
    inserted > 0
      ? `\n${inserted} row(s) created as drafts — publish the ones you want live from /admin/services.`
      : '\nNothing to do: every service already has a row.',
  );
}

async function main() {
  await client.connect();
  await seedServices();
}

main()
  .catch((error) => {
    console.error('FAIL:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
