/**
 * One-off sync of the retargeted `/services/digital-marketing` rows.
 *
 * The page at `/services/digital-marketing` renders its copy from two
 * database rows — `services` (description, body, price) and `seo_meta`
 * (title, description, social copies, keywords, FAQs, `ai_answer`,
 * glossary terms, custom JSON-LD). Editing the repository files alone
 * changes nothing a visitor sees, which is why this script exists rather
 * than a manual UPDATE.
 *
 * The `services` values are imported from `src/data/services.ts` so they are
 * byte-identical to the file `scripts/sync-content.ts` would push — running
 * the regular sync afterwards cannot revert this page's copy. The `seo_meta`
 * values come from `src/data/digital-marketing.ts`, the same module
 * `src/app/services/[slug]/page.tsx` pins this page's head tags and H1 from,
 * so the admin panel and the rendered page cannot quote different metadata.
 *
 * Not touched: `title` and `short_description` (they also render on the
 * `/services` cards, which are out of scope for this retarget), `stats`
 * (no figures were supplied) and `published`/`sort_order` (editorial state).
 *
 * Run: npx tsx scripts/sync-digital-marketing-seo.ts
 */
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { services } from '../src/data/services';
import {
  DM_AI_ANSWER,
  DM_DEFINED_TERMS,
  DM_DESCRIPTION,
  DM_FAQS,
  DM_KEYWORDS,
  DM_TITLE,
} from '../src/data/digital-marketing';

/** The single price the site owner published: audit, strategy and ongoing work. */
const DM_MONTHLY_PRICE = 15000;

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

async function syncServiceRow() {
  const service = services.find((item) => item.slug === 'digital-marketing');
  if (!service) throw new Error('digital-marketing missing from src/data/services.ts');

  const result = await client.query(
    `update services
        set description  = $2,
            body         = $3,
            from_npr     = $4,
            updated_at   = now()
      where slug = $1
      returning slug, from_npr`,
    [
      service.slug,
      service.description,
      JSON.stringify(service.body ?? []),
      DM_MONTHLY_PRICE,
    ],
  );

  if (!result.rowCount) throw new Error('services/digital-marketing row not found');
  console.log(
    `updated services/${service.slug} (from_npr=${result.rows[0].from_npr})`,
  );
}

async function syncSeoRow() {
  const current = await client.query(
    `select entity_signals, custom_json_ld
       from seo_meta
      where entity_type = 'service' and entity_slug = 'digital-marketing'`,
  );
  if (!current.rowCount) throw new Error('seo_meta service/digital-marketing row not found');

  const signals = current.rows[0].entity_signals ?? {};
  const custom = current.rows[0].custom_json_ld ?? {};

  /**
   * `definedTerms` is replaced wholesale (the old first term was
   * "Digital marketing specialist:" — the phrase this retarget removes);
   * everything else in `entity_signals`, including the admin's `knowsAbout`
   * list, is carried through untouched.
   */
  const entitySignals = {
    ...signals,
    definedTerms: DM_DEFINED_TERMS,
  };

  /**
   * The offer's `minPrice` is the figure the page, the pricing page and the
   * `Service` node all quote now. The rest of the admin's node — provider,
   * areaServed, serviceType — is kept as saved, with `serviceType` aligned
   * to the category string the page's `Service` node publishes.
   */
  const offers = custom.offers ?? null;
  const customJsonLd = {
    ...custom,
    serviceType: 'Digital marketing',
    ...(offers
      ? {
          offers: {
            ...offers,
            priceCurrency: 'NPR',
            priceSpecification: {
              ...(offers.priceSpecification ?? {}),
              '@type': 'PriceSpecification',
              minPrice: DM_MONTHLY_PRICE,
              priceCurrency: 'NPR',
            },
          },
        }
      : {}),
  };

  const result = await client.query(
    `update seo_meta
        set meta_title        = $2,
            meta_description  = $3,
            og_title          = $4,
            og_description    = $5,
            twitter_title     = $6,
            twitter_description = $7,
            keywords          = $8,
            focus_keyword     = $9,
            faqs              = $10,
            ai_answer         = $11,
            entity_signals    = $12,
            custom_json_ld    = $13,
            updated_at        = now()
      where entity_type = 'service' and entity_slug = $1`,
    [
      'digital-marketing',
      DM_TITLE,
      DM_DESCRIPTION,
      DM_TITLE,
      DM_DESCRIPTION,
      DM_TITLE,
      DM_DESCRIPTION,
      DM_KEYWORDS,
      'digital marketing expert in Nepal',
      JSON.stringify(DM_FAQS),
      DM_AI_ANSWER,
      JSON.stringify(entitySignals),
      JSON.stringify(customJsonLd),
    ],
  );

  if (!result.rowCount) throw new Error('seo_meta update matched no row');
  console.log('updated seo_meta/service/digital-marketing');
}

async function main() {
  await client.connect();
  await syncServiceRow();
  await syncSeoRow();
}

main()
  .catch((error) => {
    console.error('FAIL:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
