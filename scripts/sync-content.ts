/**
 * Pushes edited copy from `src/data/*` into the Supabase rows the site
 * actually renders.
 *
 * `src/lib/content.ts` reads the database first and only falls back to the
 * static files when a table is empty, so editing `src/data/services.ts` alone
 * changes nothing a visitor sees. That gap is easy to miss because the copy in
 * the repo and the copy on the site look like the same source — which is how
 * the live site spent months serving "Web Development Specialist" as its H1
 * while the repository said "Web Development Services", and how
 * `/services` (which reads the file) came to disagree with
 * `/services/web-development` (which reads the table) about the same service.
 *
 * Both tables are upserted, so adding an entry to the static file creates its
 * row.
 *
 * ## Two notes on `published` and `sort_order`
 *
 * `published` is set on insert and never touched on update. That is editorial
 * state: a content sync must not quietly re-publish something that was switched
 * off.
 *
 * `sort_order` IS synced, which is a change from how this script used to work.
 * The previous version left it alone on the grounds that reordering is an
 * editorial decision. In practice the orders had simply drifted from the files
 * — the posts table was serving oldest-first against a file whose own comment
 * says "newest first", and the services table had `ai-search` last when the
 * file documents it third, which is also why `/services` and the service
 * detail pages listed the same seven services in two different orders. The
 * file is the source of truth for order now, same as it is for copy.
 *
 * **The consequence:** reordering in `/admin` will be overwritten by the next
 * run of this script. Reorder in `src/data/services.ts` or `src/data/blog.ts`
 * instead, and sync.
 *
 * Run: npx tsx scripts/sync-content.ts
 */
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { blogPosts } from '../src/data/blog';
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

async function syncServices() {
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
         icon              = excluded.icon,
         sort_order        = excluded.sort_order
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
    console.log(`${verb} services/${service.slug}`);
  }
}

/**
 * Posts carry the article body as `text[]`, which is what `ArticleBody` reads
 * the `## ` heading markers out of — so the structured body reaches the live
 * site through this column and nowhere else.
 *
 * `reading_time` is synced for the same reason as the body: the values in the
 * table were the old, inflated ones, and a reading time that disagrees with the
 * article it labels is worse than not showing one.
 */
async function syncPosts() {
  for (const [position, post] of blogPosts.entries()) {
    const result = await client.query(
      `insert into posts
         (slug, title, excerpt, category, date, reading_time, image, content,
          tags, is_placeholder, published, sort_order)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11)
       on conflict (slug) do update set
         title          = excluded.title,
         excerpt        = excluded.excerpt,
         category       = excluded.category,
         date           = excluded.date,
         reading_time   = excluded.reading_time,
         image          = excluded.image,
         content        = excluded.content,
         tags           = excluded.tags,
         is_placeholder = excluded.is_placeholder,
         sort_order     = excluded.sort_order
       returning (xmax = 0) as inserted`,
      [
        post.slug,
        post.title,
        post.excerpt,
        post.category,
        post.date,
        post.readingTime,
        post.image,
        post.content ?? [],
        post.tags ?? [],
        post.isPlaceholder === true,
        position,
      ],
    );
    const verb = result.rows[0]?.inserted ? 'inserted' : 'updated ';
    console.log(`${verb} posts/${post.slug}`);
  }
}

async function syncExperience() {
  for (const item of experience) {
    const result = await client.query(
      `update experience set description = $2 where id = $1 returning id`,
      [item.id, item.description],
    );
    console.log(result.rowCount ? `updated  experience/${item.id}` : `MISSING  experience/${item.id}`);
  }
}

async function main() {
  await client.connect();
  await syncServices();
  await syncPosts();
  await syncExperience();
}

main()
  .catch((error) => {
    console.error('FAIL:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
