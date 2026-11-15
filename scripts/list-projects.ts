/** Dev helper: print current projects sort order from the database. */
import { readFileSync } from 'node:fs';
import pg from 'pg';

const env = readFileSync('.env.local', 'utf8');
const url = env.match(/^POOLER_URL=(.*)$/m)?.[1]?.trim();
if (!url) throw new Error('no POOLER_URL in .env.local');

const client = new pg.Client({ connectionString: url });

async function main() {
  await client.connect();
  try {
    const res = await client.query(
      'SELECT slug, title, sort_order, published FROM projects ORDER BY sort_order NULLS LAST, slug',
    );
    console.table(res.rows);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
