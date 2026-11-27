/**
 * One-off: append search-shaped FAQs to `seo_meta.faqs` for the home page and
 * every service page, so the owner's target phrases appear in visible copy
 * (and the matching FAQPage schema) in natural sentences — not as a keyword
 * list. Existing FAQs are kept; a question already present is not duplicated.
 *
 * Rules the copy follows: no invented prices, client results or rankings, and
 * "best" is never claimed — it is answered as "how to judge".
 *
 * Run: npx tsx scripts/add-keyword-faqs.ts
 */
import { readFileSync } from 'node:fs';
import pg from 'pg';

type Faq = { question: string; answer: string };

const FAQS: Record<string, { type: 'page' | 'service'; faqs: Faq[] }> = {
  home: {
    type: 'page',
    faqs: [
      {
        question: 'Are you an ecommerce consultant in Nepal?',
        answer:
          'Yes. I work as an ecommerce consultant in Nepal and an ecommerce consultant in Kathmandu, and as an ecommerce business consultant when a store needs a plan before it needs more work: what to fix, in what order, and what it should cost.',
      },
      {
        question: 'What does an ecommerce strategist in Kathmandu do?',
        answer:
          'An ecommerce strategist in Kathmandu decides where a store should spend its time and money: which products and pages to push, which channels to use, and how to measure the result. I do that as part of the work, then carry it out.',
      },
      {
        question: 'Do you work as an ecommerce marketing expert in Nepal?',
        answer:
          'Yes. As an ecommerce marketing expert in Nepal and ecommerce marketing specialist in Kathmandu, I run SEO, Google Ads and Meta Ads for online stores, measured by orders and revenue rather than clicks.',
      },
      {
        question: 'Can you manage my online store as an ecommerce management expert in Nepal?',
        answer:
          'I can run the growth side of an online store: the website, search, ads, tracking and reporting. As an ecommerce expert in Kathmandu I do not handle stock or delivery, but I make sure the store, the traffic and the numbers work together.',
      },
    ],
  },
  'web-development': {
    type: 'service',
    faqs: [
      {
        question: 'Do you offer ecommerce website development in Kathmandu?',
        answer:
          'Yes. I am an ecommerce web developer in Nepal offering ecommerce website development in Kathmandu and ecommerce website design in Nepal: product structure, checkout, payments, speed and SEO foundations, built for mid-range phones.',
      },
      {
        question: 'How do I choose the best web developer in Nepal?',
        answer:
          'Ignore anyone who simply claims to be the best web developer in Nepal or the best website developer in Kathmandu. Look at live sites they built, how fast those sites load on a phone, whether they rank, and whether you can edit them yourself. Judge me the same way through the projects on this site.',
      },
      {
        question: 'Can I hire a web developer in Kathmandu for a custom website?',
        answer:
          'Yes. You can hire me as a freelance web developer in Nepal for custom website development in Nepal, from business websites to web applications. As a professional website developer in Kathmandu I provide website development services in Nepal with one point of contact from brief to launch.',
      },
      {
        question: 'Are you an ecommerce website development company in Nepal?',
        answer:
          'I work as an independent developer rather than an ecommerce website development company in Nepal, which means you deal directly with the person building the site. For custom ecommerce website development in Nepal that keeps costs down and decisions fast.',
      },
    ],
  },
  'seo-services': {
    type: 'service',
    faqs: [
      {
        question: 'Are you an SEO expert in Kathmandu?',
        answer:
          'Yes. I am an SEO expert in Kathmandu and SEO specialist in Nepal, working as an SEO consultant in Nepal and Kathmandu on technical SEO, content and ecommerce SEO. I also work as an SEO freelancer in Nepal for businesses that do not need an agency.',
      },
      {
        question: 'What do your ecommerce SEO services in Nepal include?',
        answer:
          'As an ecommerce SEO expert in Nepal and ecommerce SEO specialist in Kathmandu, I work on category and product pages, site structure, internal links, speed and structured data. I am a Shopify SEO expert in Nepal and a WooCommerce SEO expert in Kathmandu, so the fixes match the platform.',
      },
      {
        question: 'How do I find the best SEO expert in Nepal?',
        answer:
          'Be wary of anyone who calls themselves the best SEO expert in Nepal or guarantees rankings. A professional SEO consultant in Nepal should show you an audit, explain the plan in plain language and report on traffic and leads. That is how I work.',
      },
      {
        question: 'Do you offer technical SEO and website SEO services in Kathmandu?',
        answer:
          'Yes. As a technical SEO expert in Kathmandu I fix crawling, indexing, speed, structured data and site architecture. Website SEO services in Kathmandu and SEO services in Nepal start with that technical base before content and links.',
      },
    ],
  },
  'digital-marketing': {
    type: 'service',
    faqs: [
      {
        question: 'Are you a digital marketing consultant in Nepal?',
        answer:
          'Yes. I work as a digital marketing consultant in Nepal and Kathmandu and as a digital marketing specialist in Nepal, planning and running SEO, Google Ads, Meta Ads and conversion work as one strategy.',
      },
      {
        question: 'Do you offer digital marketing services in Nepal as a freelancer?',
        answer:
          'Yes. I provide digital marketing services in Nepal as a digital marketing freelancer in Kathmandu, so you work directly with the person doing the work, with one monthly report.',
      },
    ],
  },
  'google-ads': {
    type: 'service',
    faqs: [
      {
        question: 'Are you a Google Ads expert in Nepal?',
        answer:
          'Yes. I am a Google Ads expert in Nepal and Google Ads specialist in Kathmandu, offering Google Ads management services in Nepal for Search, Display, YouTube and remarketing, with conversion tracking set up before optimisation.',
      },
      {
        question: 'Do you manage Google Ads and Meta Ads together?',
        answer:
          'Yes. As a Google Ads expert in Kathmandu I also run Meta Ads, so Google Ads and Meta Ads share one budget plan, one set of conversion tracking and one report.',
      },
    ],
  },
  'meta-ads': {
    type: 'service',
    faqs: [
      {
        question: 'Are you a Facebook Ads expert in Nepal?',
        answer:
          'Yes. I am a Facebook Ads expert in Nepal and Kathmandu and a Meta Ads expert in Nepal, offering Facebook Ads management services in Nepal for Facebook and Instagram campaigns built on audience structure, creative testing and accurate tracking.',
      },
      {
        question: 'What does a Meta Ads specialist in Kathmandu do?',
        answer:
          'A Meta Ads specialist in Kathmandu plans campaigns, builds audiences, tests creative and checks tracking, then moves budget toward what produces orders or leads. I also run Google Ads, so Google Ads and Meta Ads work from the same numbers.',
      },
    ],
  },
  'ai-search': {
    type: 'service',
    faqs: [
      {
        question: 'Are you an AI SEO expert in Nepal?',
        answer:
          'Yes. I am an AI SEO expert in Nepal and AI SEO specialist in Kathmandu, offering AI SEO services in Nepal that help businesses get mentioned and cited by AI Overviews, ChatGPT and Perplexity.',
      },
      {
        question: 'What are generative engine optimization services in Nepal?',
        answer:
          'Generative engine optimization services in Nepal make a business easier for AI systems to find, understand and quote: strong classic SEO, self-contained answers, structured data and brand presence beyond your own site. It is still SEO, applied to AI search.',
      },
      {
        question: 'Can a ChatGPT SEO expert in Nepal get my business into ChatGPT answers?',
        answer:
          'No one can guarantee it. As a ChatGPT SEO expert in Nepal and AI SEO expert in Kathmandu, I improve the signals these systems rely on and monitor what they say about you, but I do not promise citations.',
      },
    ],
  },
  'ecommerce-growth': {
    type: 'service',
    faqs: [
      {
        question: 'Are you an ecommerce growth expert in Kathmandu?',
        answer:
          'Yes. I am an ecommerce growth expert in Kathmandu and ecommerce growth specialist in Nepal, running the store, search, ads and analytics as one system so traffic, conversion rate and revenue improve together.',
      },
    ],
  },
  'shopify-woocommerce-wordpress': {
    type: 'service',
    faqs: [
      {
        question: 'Are you a Shopify developer in Nepal?',
        answer:
          'Yes. I am a Shopify developer in Nepal and Shopify developer in Kathmandu, and a Shopify expert in Nepal for store setup, themes, payments and speed. I also offer Shopify website development in Kathmandu for new stores and redesigns.',
      },
      {
        question: 'Do you work as a WooCommerce developer in Kathmandu?',
        answer:
          'Yes. I am a WooCommerce developer in Nepal and WooCommerce developer in Kathmandu, building stores that need control over checkout and local payment gateways.',
      },
      {
        question: 'Do you offer WordPress website development in Nepal?',
        answer:
          'Yes. As a WordPress developer in Nepal and WordPress developer in Kathmandu, I build business and content sites that your team can edit without a developer.',
      },
    ],
  },
  'cro-website-optimisation': {
    type: 'service',
    faqs: [
      {
        question: 'Are you a CRO expert in Kathmandu?',
        answer:
          'Yes. I am a CRO expert in Nepal and Kathmandu and an ecommerce CRO specialist in Kathmandu, offering conversion rate optimization services in Nepal for online stores and lead-generation sites.',
      },
      {
        question: 'Do you offer website speed optimization services in Nepal?',
        answer:
          'Yes. Website speed optimization services in Nepal and website performance optimization in Kathmandu are part of this work: faster pages on mobile, better Core Web Vitals, and fewer visitors lost before the page loads.',
      },
      {
        question: 'Do you provide website audit services in Nepal?',
        answer:
          'Yes. Website audit services in Nepal cover speed, SEO, tracking and the conversion path. As an ecommerce conversion optimization expert in Nepal, I use the audit to drive ecommerce website optimization in Kathmandu in order of impact.',
      },
    ],
  },
  'local-seo': {
    type: 'service',
    faqs: [
      {
        question: 'Are you a local SEO expert in Kathmandu?',
        answer:
          'Yes. I am a local SEO expert in Nepal and Kathmandu, offering local SEO services in Nepal for shops, clinics, restaurants and service businesses that need to be found nearby.',
      },
      {
        question: 'What does a Google Maps SEO expert in Kathmandu do?',
        answer:
          'A Google Maps SEO expert in Kathmandu improves how a business appears in map results: a complete Google Business Profile, consistent contact details, local pages and an honest review process.',
      },
    ],
  },
};

async function main() {
  const env = readFileSync('.env.local', 'utf8');
  const url = env.match(/^POOLER_URL=(.*)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, '');
  if (!url) throw new Error('POOLER_URL not found in .env.local');
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query('begin');
    for (const [slug, { type, faqs }] of Object.entries(FAQS)) {
      const r = await client.query(
        'select faqs from seo_meta where entity_type=$1 and entity_slug=$2',
        [type, slug],
      );
      if (!r.rowCount) {
        console.log('MISSING row', type, slug);
        continue;
      }
      const current: Faq[] = r.rows[0].faqs ?? [];
      const seen = new Set(current.map((f) => f.question.trim().toLowerCase()));
      const added = faqs.filter((f) => !seen.has(f.question.trim().toLowerCase()));
      await client.query(
        'update seo_meta set faqs=$3 where entity_type=$1 and entity_slug=$2',
        [type, slug, JSON.stringify([...current, ...added])],
      );
      console.log(`${slug}: +${added.length} (now ${current.length + added.length})`);
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
