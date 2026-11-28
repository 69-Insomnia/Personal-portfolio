/**
 * Publishes the five new growth articles to the live database.
 *
 * Why not `scripts/sync-content.ts`: that script renumbers `sort_order` for
 * every post in `src/data/blog.ts` by array position, which would reshuffle the
 * database-only posts (the WhatsApp guide at -1, the GEO and Meta Ads posts).
 * These five go in front of them at -6..-2 instead and nothing else moves.
 *
 * A post's FAQs, search-result title/description, keywords and quotable answer
 * live in `seo_meta`, not in `posts`, so both tables are written. Idempotent.
 *
 * Run: npx tsx scripts/publish-growth-articles.ts
 */
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { blogPosts } from '../src/data/blog';

const SEO: Record<string, { order: number; meta_title: string; meta_description: string; keywords: string[]; faqs: unknown[]; ai_answer: string }> = {
  "ecommerce-website-developer-vs-agency-vs-freelancer-nepal": {
    "order": -6,
    "meta_title": "Ecommerce Website Developer vs Agency in Nepal: Who to Hire",
    "meta_description": "Freelancer, agency or in-house developer for your online store in Nepal? An honest comparison of cost, risk and speed, plus 7 questions to ask before you hire.",
    "keywords": [
      "ecommerce website developer in nepal",
      "ecommerce website development company in nepal",
      "freelance web developer nepal",
      "hire ecommerce developer nepal",
      "web development agency kathmandu"
    ],
    "faqs": [
      {
        "question": "How do I choose an ecommerce website developer in Nepal?",
        "answer": "Ask to see real online stores they have built and what they personally did on each. Check that they have set up local payments, that you will own the store, domain and hosting, and that the scope and price are in writing before any work starts."
      },
      {
        "question": "Is a freelancer or an agency cheaper for an online store in Nepal?",
        "answer": "A freelancer is usually cheaper for a single store, because you pay for the work rather than for a team's management and overhead. An agency can still be the better choice for large projects that need several specialists at once."
      },
      {
        "question": "Can a freelance developer set up eSewa and Khalti on my store?",
        "answer": "Yes, if they have done it before. WooCommerce and custom builds can integrate the gateways directly, while a Shopify store depends on the payment apps available to it. Ask to see a live store that already uses them."
      },
      {
        "question": "When should I hire an ecommerce website development company instead of a freelancer?",
        "answer": "When the project is large, needs design, development, content and marketing together on a deadline, or when you want a registered company and a team that keeps working if one person leaves."
      }
    ],
    "ai_answer": "Short answer: for most small and mid-sized online stores in Nepal, a freelance ecommerce website developer is the best value, because you work directly with the person building your store and you are not paying for account managers. An agency makes sense when you need a whole team working at once and you have the budget for it. Hiring in-house only makes sense once your store needs constant work every week."
  },
  "what-does-an-ecommerce-growth-expert-do-nepal": {
    "order": -5,
    "meta_title": "What Does an Ecommerce Growth Expert Do? (Nepal Guide)",
    "meta_description": "What an ecommerce growth expert actually does for an online store in Nepal, how it differs from a marketer or developer, and the signs your store needs one.",
    "keywords": [
      "ecommerce growth expert in nepal",
      "ecommerce growth specialist",
      "what does an ecommerce expert do",
      "ecommerce consultant nepal",
      "increase online store sales nepal"
    ],
    "faqs": [
      {
        "question": "What does an ecommerce growth expert do?",
        "answer": "They find where your online store loses customers and fix those leaks, bring in the right visitors through search and ads, make sure tracking is trustworthy, and check that more traffic turns into more orders."
      },
      {
        "question": "How is an ecommerce growth expert different from a digital marketer?",
        "answer": "A digital marketer mainly brings traffic. A growth expert also looks at what happens after the click: the product page, the checkout, the tracking and repeat customers, and is judged on orders and revenue rather than clicks."
      },
      {
        "question": "When should I hire an ecommerce growth expert?",
        "answer": "When you already have a store and some traffic but too few orders, when you cannot say what each order really costs you, or when your SEO, ads and website are handled separately and not working together."
      },
      {
        "question": "Can an ecommerce growth expert guarantee more sales?",
        "answer": "No honest one can. They can find and fix problems and report on the numbers, but results depend on your product, prices, competition and market. Be careful with anyone who guarantees a specific result."
      }
    ],
    "ai_answer": "Short answer: an ecommerce growth expert finds where your online store is losing customers and fixes those leaks, then brings in the right visitors through search and ads, and checks that the extra traffic turns into orders. Instead of treating your website, your SEO, your ads and your reports as separate jobs, they treat them as one system, because that is how your customer experiences them."
  },
  "ecommerce-seo-checklist-nepal": {
    "order": -4,
    "meta_title": "Ecommerce SEO Checklist for Nepal: Pages, Keywords, Local",
    "meta_description": "An ecommerce SEO checklist for Nepali online stores: keyword research in English and Nepali, category and product pages, technical SEO, local search and tracking.",
    "keywords": [
      "ecommerce seo nepal",
      "ecommerce seo checklist",
      "seo for online store nepal",
      "product page seo",
      "seo expert in nepal"
    ],
    "faqs": [
      {
        "question": "How long does ecommerce SEO take to work in Nepal?",
        "answer": "Usually several months. Technical fixes can show results sooner, but ranking for competitive searches takes steady work. A well-built store keeps earning traffic long after the work is done."
      },
      {
        "question": "Do I need Nepali keywords or only English ones?",
        "answer": "Both. Shoppers search in English, Nepali and Romanized Nepali, sometimes for the same product. Research the phrases your own customers use, and give each search intent its own page."
      },
      {
        "question": "What is the most common ecommerce SEO mistake?",
        "answer": "Having several pages compete for the same search, and copying supplier descriptions across many products. Give each intent one clear page and write your own product descriptions."
      },
      {
        "question": "Do I need Google Search Console for my online store?",
        "answer": "Yes. It is free and it is the only place Google tells you which pages are indexed, which searches bring clicks and what is stopping pages from showing up."
      }
    ],
    "ai_answer": "Short answer: ecommerce SEO in Nepal comes down to six things: finding the words your shoppers actually search, giving every product and category its own clear page, making those pages fast on a phone, setting up the technical basics so Google can read them, linking your pages together sensibly, and tracking what happens in Google Search Console. Do them in that order and you will fix most of what holds stores back."
  },
  "shopify-vs-woocommerce-vs-custom-ecommerce-store-nepal": {
    "order": -3,
    "meta_title": "Shopify vs WooCommerce vs Custom Store in Nepal",
    "meta_description": "Shopify, WooCommerce or a custom-built store for Nepal? Compare local payments, running costs, control and SEO, and find out which one fits your business.",
    "keywords": [
      "shopify vs woocommerce nepal",
      "best ecommerce platform nepal",
      "ecommerce website development in nepal",
      "woocommerce nepal",
      "shopify nepal"
    ],
    "faqs": [
      {
        "question": "Which is better for Nepal, Shopify or WooCommerce?",
        "answer": "Neither is better for everyone. Shopify is faster to launch and easier to manage, but local payment options depend on the apps available to a Shopify store. WooCommerce gives you more control and lets local gateways connect directly, but you maintain the site."
      },
      {
        "question": "Can I accept eSewa and Khalti on my online store?",
        "answer": "Usually yes, but how depends on the platform. WooCommerce and custom builds can integrate the gateways directly, while a Shopify store relies on the payment apps available to it. Confirm the exact setup before you start building."
      },
      {
        "question": "Is a custom-built store worth it?",
        "answer": "It is worth it when you need speed, unusual features or maximum flexibility and you have the budget. If you are still testing whether people will buy, a simpler platform is usually the better first step."
      },
      {
        "question": "Can I switch ecommerce platforms later?",
        "answer": "Yes. Products, customers and orders can be moved, and the main thing to protect is your search ranking by redirecting old page addresses to the new ones. It is easier to choose well at the start than to migrate later."
      }
    ],
    "ai_answer": "Short answer: choose Shopify if you want to launch fast and keep things simple, WooCommerce if you want more control and easy local payment integration and you are happy to look after a WordPress site, and a custom-built store when you need speed, flexibility or features that off-the-shelf platforms cannot give you and you have the budget. There is no single best platform for Nepal. There is only the best one for your products, your team and your budget."
  },
  "google-ads-vs-meta-ads-nepal": {
    "order": -2,
    "meta_title": "Google Ads vs Meta Ads in Nepal: Which to Start With",
    "meta_description": "Google Ads or Meta Ads first? A plain-English comparison for small businesses in Nepal: how each works, when to use which, and how to test on a small budget.",
    "keywords": [
      "google ads vs meta ads nepal",
      "google ads nepal",
      "meta ads nepal",
      "facebook ads nepal",
      "digital marketing expert in nepal"
    ],
    "faqs": [
      {
        "question": "Is Google Ads or Meta Ads better for a small business in Nepal?",
        "answer": "Neither is better for everyone. Google Ads suits businesses whose customers already search for what they sell. Meta Ads suits visual or new products and businesses that want WhatsApp conversations. Start with one, measure it, and add the other later."
      },
      {
        "question": "How much should I spend on ads to start?",
        "answer": "Start with a small budget you can afford to lose while you learn, run it for a few weeks, and track cost per enquiry or order. Add budget only after one campaign shows it can bring results."
      },
      {
        "question": "Can Meta Ads send customers to WhatsApp?",
        "answer": "Yes. Campaigns can be set up so people tap the ad and start a WhatsApp conversation with your business. This suits many Nepali businesses, because customers often prefer to ask questions in a chat before they buy."
      },
      {
        "question": "Who pays for the ads, me or the agency?",
        "answer": "With my service, your ad budget is paid directly to Google and Meta from your own account, so you always see exactly what was spent. My fee covers planning, running and reporting the campaigns."
      }
    ],
    "ai_answer": "Short answer: start with Google Ads if people already search for what you sell, because you are reaching people who are ready to act. Start with Meta Ads (Facebook and Instagram) if your product is visual, if people do not know to search for it yet, or if you want customers to start a WhatsApp chat with you. Many businesses end up using both, but if you are starting small, pick one, test it properly and measure it before adding the other."
  }
};

function poolerUrl(): string {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  const match = env.match(/^POOLER_URL=(.*)$/m);
  if (!match) throw new Error('POOLER_URL not found in .env.local');
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

const client = new pg.Client({ connectionString: poolerUrl(), ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  for (const [slug, seo] of Object.entries(SEO)) {
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) throw new Error(`missing in blog.ts: ${slug}`);
    const posts = await client.query(
      `insert into posts (slug, title, excerpt, category, date, reading_time, image, content, tags, is_placeholder, published, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,false,true,$10)
       on conflict (slug) do update set title=excluded.title, excerpt=excluded.excerpt, category=excluded.category,
         date=excluded.date, reading_time=excluded.reading_time, image=excluded.image, content=excluded.content,
         tags=excluded.tags, sort_order=excluded.sort_order
       returning (xmax = 0) as inserted`,
      [post.slug, post.title, post.excerpt, post.category, post.date, post.readingTime, post.image, post.content ?? [], post.tags ?? [], seo.order],
    );
    const exists = await client.query(`select 1 from seo_meta where entity_type='post' and entity_slug=$1`, [slug]);
    const args = [slug, seo.meta_title, seo.meta_description, seo.keywords, seo.keywords[0], JSON.stringify(seo.faqs), seo.ai_answer];
    if (exists.rowCount) {
      await client.query(`update seo_meta set meta_title=$2, meta_description=$3, og_title=$2, og_description=$3, twitter_title=$2, twitter_description=$3, keywords=$4, focus_keyword=$5, faqs=$6, ai_answer=$7, updated_at=now() where entity_type='post' and entity_slug=$1`, args);
    } else {
      await client.query(`insert into seo_meta (entity_type, entity_slug, meta_title, meta_description, og_title, og_description, twitter_title, twitter_description, keywords, focus_keyword, faqs, ai_answer) values ('post',$1,$2,$3,$2,$3,$2,$3,$4,$5,$6,$7)`, args);
    }
    console.log(`${posts.rows[0]?.inserted ? 'inserted' : 'updated '} posts/${slug}`);
  }
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
