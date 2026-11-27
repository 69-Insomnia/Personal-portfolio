/**
 * One-off: publish the three new service pages (Shopify/WooCommerce/WordPress,
 * CRO & website optimisation, local SEO) to the database the site reads.
 *
 * Inserts the `services` rows and their `seo_meta` rows. Deliberately does NOT
 * write the comparison-table columns (`deliverables`, `timeline`, `best_for`,
 * `from_npr`): those hold real prices and timelines owned by the admin panel,
 * and none exist for these services yet. Fill them in at /admin/services.
 *
 * Idempotent: re-running updates the same rows.
 *
 * Run: npx tsx scripts/add-three-service-pages.ts
 */
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { services } from '../src/data/services';
import { serviceKeywords } from '../src/data/seo';

const SLUGS = ['shopify-woocommerce-wordpress', 'cro-website-optimisation', 'local-seo'];

const FAQS: Record<string, { question: string; answer: string }[]> = {
  'shopify-woocommerce-wordpress': [
    {
      question: 'Should I choose Shopify or WooCommerce for my store in Nepal?',
      answer:
        'Shopify is quicker to launch and needs less maintenance. WooCommerce gives more control over checkout and local payment gateways but needs more upkeep. The right one depends on how you sell and who will run the store day to day.',
    },
    {
      question: 'Can you redesign my existing WordPress or WooCommerce site?',
      answer:
        'Yes. I audit the current site first, then repair or rebuild it, keeping the URLs and content that already earn search traffic so a redesign does not lose rankings.',
    },
    {
      question: 'Will my store be fast on mobile?',
      answer:
        'Speed on mid-range phones is part of the build: optimised images, lean themes and few blocking scripts. I measure it before and after so you can see the difference.',
    },
  ],
  'cro-website-optimisation': [
    {
      question: 'What is conversion rate optimization?',
      answer:
        'It is the work of increasing the share of visitors who buy, enquire or book, by finding where they leave the site and fixing those points in order of likely impact.',
    },
    {
      question: 'Can you guarantee a conversion increase?',
      answer:
        'No. The result depends on the site and its traffic. I make changes one at a time where possible, measure each, and keep or revert it based on the result.',
    },
    {
      question: 'What does a website audit include?',
      answer:
        'Mobile speed and Core Web Vitals, product and landing page review, the checkout or enquiry flow, tracking accuracy and technical issues, with a prioritised list of fixes.',
    },
  ],
  'local-seo': [
    {
      question: 'How do I get my business on Google Maps?',
      answer:
        'Create and verify a complete Google Business Profile with accurate categories, hours and photos, keep your name, address and phone number consistent online, and collect genuine reviews.',
    },
    {
      question: 'Can you guarantee a top Google Maps position?',
      answer:
        'No one can. I improve the factors that influence local ranking and report on views, calls and direction requests, but I do not promise a position or a date.',
    },
    {
      question: 'Do you buy reviews or create extra listings?',
      answer:
        'No. Fake reviews and fake listings can get a profile suspended. I set up an honest process for asking real customers for reviews.',
    },
  ],
};

async function main() {
  const env = readFileSync('.env.local', 'utf8');
  const url = env.match(/^POOLER_URL=(.*)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, '');
  if (!url) throw new Error('POOLER_URL not found in .env.local');
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query('begin');
    const { rows } = await client.query('select coalesce(max(sort_order), -1) as m from services');
    let sort = Number(rows[0].m) + 1;

    for (const slug of SLUGS) {
      const s = services.find((x) => x.slug === slug);
      if (!s) throw new Error(`missing in services.ts: ${slug}`);

      const existing = await client.query('select sort_order from services where slug=$1', [slug]);
      const order = existing.rowCount ? existing.rows[0].sort_order : sort++;

      await client.query(
        `insert into services
           (slug, service_index, title, short_description, description, body,
            capabilities, icon, published, sort_order)
         values ($1,$2,$3,$4,$5,$6,$7,$8,true,$9)
         on conflict (slug) do update set
           service_index=excluded.service_index, title=excluded.title,
           short_description=excluded.short_description, description=excluded.description,
           body=excluded.body, capabilities=excluded.capabilities, icon=excluded.icon`,
        [
          s.slug, s.index, s.title, s.shortDescription, s.description,
          JSON.stringify(s.body ?? []), s.capabilities, s.icon, order,
        ],
      );

      const kw = serviceKeywords[slug] ?? [];
      const title = s.seoTitle ?? s.title;
      const found = await client.query(
        `select 1 from seo_meta where entity_type='service' and entity_slug=$1`,
        [slug],
      );
      if (found.rowCount) {
        await client.query(
          `update seo_meta set meta_title=$2, meta_description=$3, keywords=$4,
             focus_keyword=$5, faqs=$6
           where entity_type='service' and entity_slug=$1`,
          [slug, title, s.shortDescription, kw, kw[1] ?? kw[0], JSON.stringify(FAQS[slug])],
        );
      } else {
        await client.query(
          `insert into seo_meta
             (entity_type, entity_slug, meta_title, meta_description, keywords, focus_keyword, faqs)
           values ('service', $1, $2, $3, $4, $5, $6)`,
          [slug, title, s.shortDescription, kw, kw[1] ?? kw[0], JSON.stringify(FAQS[slug])],
        );
      }
      console.log('ok', slug);
    }
    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('FAIL:', e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
