// Publish the e-commerce growth guide as a DB-only post (geo-vs-seo precedent).
// Tables -> bullet lists, sub-questions -> ## headings, third-party stats dropped.
// reading_time is computed from the actual body so it is never overstated.
import { readFileSync } from 'node:fs';

const content = [
  '## The Short Answer',
  'To grow an e-commerce business in 2026, improve four numbers: traffic, conversion rate, average order value, and repeat purchases. First confirm that every sale is profitable. Then get found in Google and AI answers, fix your product pages and checkout, add bundles and upsells, and use email and SMS to bring customers back. Do these in order, because scaling ads before fixing conversion burns cash.',
  'This guide is for store owners, startups, freelancers, agencies, local businesses, service providers, and beginners. All money figures are in Nepali rupees (Rs.), using roughly Rs. 140 per US$1.',

  '## What Does It Mean to Grow an E-commerce Business?',
  'Growing an e-commerce business means increasing profitable revenue from your online store over time. Revenue that loses money on every order is not growth.',
  'Every store follows one formula: Revenue = Traffic x Conversion Rate x Average Order Value x Purchase Frequency.',
  'For example, 10,000 monthly visitors converting at 2% with a Rs. 7,000 average order gives you Rs. 14,00,000. Improve conversion, order value, and repeat purchases by 20% each and you reach about Rs. 24,19,000 without a single extra visitor.',
  '## Key terms',
  '\u2022 Conversion rate (CVR): the percentage of visitors who buy.',
  '\u2022 Average order value (AOV): revenue divided by number of orders.',
  '\u2022 Customer acquisition cost (CAC): what you spend to win one new customer.',
  '\u2022 Customer lifetime value (LTV): total profit a customer brings over time.',
  '\u2022 ROAS: revenue earned per rupee of ad spend.',

  '## What Has Changed for E-commerce in 2026?',
  'Four shifts matter most:',
  '\u2022 AI-assisted discovery. Shoppers increasingly ask ChatGPT, Gemini, Perplexity, and Google AI Overviews what to buy. Brands with clear content, complete product data, and strong reviews are easier for these tools to recommend.',
  '\u2022 Costlier paid traffic. Competition on Meta Ads and Google Ads keeps pushing customer acquisition costs up.',
  '\u2022 First-party data is an asset. Privacy changes make your email and SMS lists more valuable than rented audiences.',
  '\u2022 Social commerce. TikTok Shop, Instagram, and creator content shorten the path from discovery to purchase.',
  'Demand is not the problem. Standing out is.',

  '## Step 1: How Do You Know If Your Store Is Ready to Scale?',
  'Your store is ready to scale when each order is profitable after product cost, shipping, fees, and marketing.',
  '## Which metrics should you track?',
  '\u2022 Conversion rate: orders divided by sessions \u2014 shows if your site turns visitors into buyers.',
  '\u2022 Average order value: revenue divided by orders \u2014 sets how much you can spend to acquire a customer.',
  '\u2022 Contribution margin: revenue minus product cost, shipping and fees \u2014 what is really left per order.',
  '\u2022 CAC: marketing spend divided by new customers \u2014 your cost to win a buyer.',
  '\u2022 LTV to CAC: 3:1 or higher is a common healthy target.',
  '## What is break-even ROAS?',
  'Break-even ROAS is the minimum return on ad spend where you neither profit nor lose on a first order. It equals 1 divided by your contribution margin.',
  'Example: a Rs. 8,400 order leaves Rs. 3,360 after product cost, shipping, and fees. That is a 40% margin, so break-even ROAS is 1 / 0.40 = 2.5. Any campaign below 2.5 loses money on the first sale unless repeat purchases make up the difference. In practice, you must earn at least Rs. 2.50 in sales for every Rs. 1 of ad spend.',
  'Action steps:',
  '\u2022 Install Google Analytics 4 and connect it to your store.',
  '\u2022 Calculate contribution margin for your top 10 products.',
  '\u2022 Set break-even ROAS as your minimum ad target.',

  '## Step 2: How Do You Choose a Niche and Offer That Sells?',
  'Choose a niche where you can name a specific customer, a specific problem, and a clear reason to buy from you instead of a giant marketplace. Narrow beats broad for small stores. "Eco-friendly dog toys for heavy chewers" beats "pet products."',
  'A strong offer includes:',
  '\u2022 Clear positioning that says who it is for.',
  '\u2022 Proof such as reviews and customer photos.',
  '\u2022 Risk reversal such as easy returns or a guarantee.',
  '\u2022 A reason to buy now such as bundles or a free shipping threshold.',
  'How to validate demand quickly:',
  '\u2022 Check Google autocomplete and Google Trends for your product idea.',
  '\u2022 Read the 3-star reviews on competitors\u2019 listings. They reveal unmet needs.',
  '\u2022 Pre-sell or run a small ad test before buying inventory.',

  '## Step 3: How Do You Get More Traffic to Your Store?',
  'Most stores should combine organic search and AI visibility for long-term growth, paid ads for fast testing, and creator content for discovery. Master two channels before adding a third.',
  '## How does SEO grow an online store?',
  'E-commerce SEO gets your category pages, product pages, and blog content ranking for buyer searches. It compounds over time and reduces reliance on ads.',
  '\u2022 Target commercial keywords on category pages ("waterproof hiking backpack") and informational keywords in blog posts ("how to choose a hiking backpack").',
  '\u2022 Write unique product descriptions instead of copying manufacturer text.',
  '\u2022 Meet Google\u2019s Core Web Vitals thresholds: Largest Contentful Paint under 2.5 seconds, Interaction to Next Paint under 200 milliseconds, and Cumulative Layout Shift under 0.1.',
  '\u2022 Add Product schema (price, availability, reviews).',
  '\u2022 Submit your catalog to Google Merchant Center for free product listings.',
  '## What are AEO and GEO?',
  'Answer Engine Optimization (AEO) structures content so search features and assistants can pull a direct answer. Generative Engine Optimization (GEO) increases the chance that AI systems such as ChatGPT, Gemini, and Perplexity mention or cite your brand.',
  'How to apply them to a store:',
  '\u2022 Start buying guides and category pages with a 40-60 word direct answer.',
  '\u2022 Publish comparison tables, which are easy for AI systems to extract.',
  '\u2022 Build review volume with real customer photos.',
  '\u2022 Keep product data complete: titles, prices, stock, shipping, and return policies.',
  '\u2022 Earn mentions on credible third-party sites, because AI tools draw from them.',
  '\u2022 Show expertise with author bios, original photos, and your own data.',
  '\u2022 Refresh key pages at least twice a year and show the update date.',
  'No tactic guarantees an AI recommendation, but these steps improve your odds.',
  '## How should you use paid ads?',
  'Use paid ads to test offers fast and capture existing demand. Start with Google Shopping and retargeting, then test Meta Ads for discovery. Judge every campaign against your break-even ROAS, and test 3-5 creatives on a small budget before scaling.',
  '## How do creators and social media drive sales?',
  'Creator content builds trust faster than brand ads because it shows real use. Send free products to micro-creators (roughly 5,000-50,000 followers) in your niche and ask permission to reuse their content on product pages and in ads.',
  '## Should you sell on marketplaces?',
  'Amazon and Etsy offer built-in demand but charge fees and own the customer relationship. Use them to reach new buyers, then invite those buyers to your email list where platform rules allow.',

  '## Step 4: How Do You Increase Your Conversion Rate?',
  'Increase conversion by removing friction and building trust on the product page, in the cart, and at checkout. Many stores convert around 1-3% of visitors, so small gains matter. Cart abandonment is high, and much of it is fixable.',
  'Product page checklist:',
  '\u2022 High-quality images from several angles, plus video.',
  '\u2022 Price, stock status, and delivery estimate above the fold.',
  '\u2022 Benefit-led copy with specs in a scannable list.',
  '\u2022 Customer reviews with photos.',
  '\u2022 Visible shipping and returns policy.',
  '\u2022 A large, thumb-friendly "Add to cart" button on mobile.',
  'Checkout checklist:',
  '\u2022 Guest checkout.',
  '\u2022 Total cost, including shipping and tax, shown early.',
  '\u2022 Payment options customers prefer (cards, PayPal, Apple Pay, Google Pay).',
  '\u2022 Minimal form fields.',
  '\u2022 Security badges near the pay button.',
  'How to reduce cart abandonment:',
  '\u2022 Reveal shipping costs before checkout.',
  '\u2022 Send a 3-email abandoned cart sequence (1 hour, 24 hours, 72 hours).',
  '\u2022 Speed up your site, especially on mobile.',
  '\u2022 Use exit-intent offers sparingly.',

  '## Step 5: How Do You Increase Average Order Value?',
  'Increase AOV by making it easy and valuable to add more to the cart. Higher AOV lets you spend more on acquisition and stay profitable.',
  '\u2022 Free shipping threshold: "Free shipping over Rs. 10,500" when AOV is Rs. 8,400.',
  '\u2022 Bundles: a skincare routine set priced below the separate items.',
  '\u2022 Cross-sells: "Frequently bought together" on product pages.',
  '\u2022 Post-purchase upsell: a one-click add-on after payment.',
  '\u2022 Volume pricing: buy 2, save 10%.',
  'Set your free shipping threshold about 15-25% above your current AOV, then test.',

  '## Step 6: How Do You Keep Customers Coming Back?',
  'Retention usually costs less than acquisition and often delivers more profit. Build an email and SMS program, reward loyal customers, and make reordering effortless. Email is one of the highest-return channels available to a store.',
  'Start with five automated flows:',
  '\u2022 Welcome series (3-4 emails).',
  '\u2022 Abandoned cart reminders.',
  '\u2022 Post-purchase care tips and review request.',
  '\u2022 Replenishment reminders for consumables.',
  '\u2022 Win-back for customers inactive 60-90 days.',
  'Add a simple loyalty or VIP program, subscribe-and-save for repeat products, and customer service replies within 24 hours. Tools like Klaviyo and Mailchimp integrate with Shopify and WooCommerce.',

  '## Which Growth Channel Fits Your Business?',
  '\u2022 New store, small budget: SEO content, creators, and email capture \u2014 low cash cost that builds lasting assets.',
  '\u2022 Established store (Rs. 7,00,000+/month budget): Google Shopping, Meta retargeting, and email flows \u2014 fast, measurable returns.',
  '\u2022 Local business: Google Business Profile, local SEO, and reviews \u2014 captures "near me" searches.',
  '\u2022 Freelancer or service provider: portfolio SEO, LinkedIn, and case studies \u2014 trust and proof drive sales.',
  '\u2022 Agency: content, case studies, and partnerships \u2014 authority builds inbound leads.',
  '\u2022 Educational institution: program landing pages, webinars, and email nurture \u2014 suits a long consideration cycle.',
  '\u2022 Corporate or B2B: account-based marketing, SEO, and demos \u2014 matches a longer buying journey.',

  '## Which Tools Do You Need?',
  '\u2022 Store platform: Shopify, WooCommerce, BigCommerce, Wix, Squarespace.',
  '\u2022 Analytics: Google Analytics 4 and Google Search Console.',
  '\u2022 Email and SMS: Klaviyo, Mailchimp.',
  '\u2022 Reviews: Judge.me, Trustpilot, Google Customer Reviews.',
  '\u2022 Product feeds: Google Merchant Center.',
  '\u2022 Payments: Stripe, PayPal, Shop Pay.',
  'Beginners learning web development can start with Shopify or WooCommerce, then learn basic HTML, CSS, and theme customization to improve speed and design.',

  '## How Can Service Providers, Freelancers, and Local Businesses Grow Online?',
  'The same formula applies, with "orders" replaced by bookings, leads, or enrollments.',
  '\u2022 Productize your service with fixed-scope packages and clear prices.',
  '\u2022 Publish case studies with real before-and-after numbers.',
  '\u2022 Complete your Google Business Profile and collect reviews.',
  '\u2022 Offer a lead magnet such as a checklist or free consultation to build your email list.',
  '\u2022 Add online booking and payment to shorten the path to commitment.',
  'Schools and institutions: build a landing page per program, answer admissions and fee questions publicly, and use webinars and email nurture.',

  '## What Is a Realistic 90-Day Growth Plan?',
  '## Days 1-30: Foundation',
  '\u2022 Set up GA4 and Search Console.',
  '\u2022 Calculate break-even ROAS.',
  '\u2022 Fix speed, mobile usability, and product pages.',
  '\u2022 Publish clear shipping and returns policies.',
  '\u2022 Launch welcome and abandoned cart emails.',
  '## Days 31-60: Traffic and trust',
  '\u2022 Publish 4-6 answer-first buying guides.',
  '\u2022 Submit your feed to Google Merchant Center.',
  '\u2022 Request reviews from past customers.',
  '\u2022 Start one paid channel on a small budget.',
  '\u2022 Work with 5-10 micro-creators.',
  '## Days 61-90: Optimize and scale',
  '\u2022 Increase spend only on campaigns above break-even ROAS.',
  '\u2022 Test product pages and your free shipping threshold.',
  '\u2022 Launch bundles and a post-purchase upsell.',
  '\u2022 Add replenishment and win-back emails.',
  '\u2022 Refresh your top pages.',
  'Paid ads and email can show results within weeks. SEO and AI visibility usually take several months, so start early.',

  '## What Mistakes Slow E-commerce Growth?',
  '\u2022 Spending on ads without knowing break-even ROAS.',
  '\u2022 Copying manufacturer descriptions.',
  '\u2022 Hiding shipping costs until the last step.',
  '\u2022 Neglecting email and relying on rented audiences.',
  '\u2022 Not tracking properly.',
  '\u2022 Ignoring mobile shoppers.',
  '\u2022 Chasing every channel instead of mastering two.',
  '\u2022 Skipping reviews and social proof.',

  '## Conclusion',
  'Growing an e-commerce business in 2026 is about doing the fundamentals in the right order. Know your numbers, earn traffic through search and AI visibility, convert more visitors, raise order values, and bring customers back. Pick two channels, follow the 90-day plan, and measure everything against break-even ROAS.',
  'Next step: calculate your contribution margin today. It takes 15 minutes and tells you exactly how much you can afford to spend on growth.',
];

const faqs = [
  { question: 'How long does it take to grow an e-commerce business?', answer: 'Most stores need 6-12 months for steady growth. Ads and email can produce sales in weeks, while SEO and AI search visibility typically take 3-6 months or more.' },
  { question: 'How much should I spend on marketing?', answer: 'A common starting range is 10-20% of revenue, but break-even ROAS matters more than any percentage. Spend only what your contribution margin supports. For example, a store earning Rs. 5,00,000 a month would start with about Rs. 50,000-Rs. 1,00,000 for marketing.' },
  { question: 'What is a good e-commerce conversion rate?', answer: 'Many stores convert roughly 1-3% of visitors. Results vary by industry, price, and traffic source, so compare yourself to your own past performance first.' },
  { question: 'What is the fastest way to increase online sales?', answer: 'Set up an abandoned cart email flow, add a free shipping threshold, run retargeting ads, and fix obvious checkout friction. These improve results from traffic you already have.' },
  { question: 'How do I get my products recommended by ChatGPT, Gemini, and Perplexity?', answer: 'Publish clear, factual product and comparison content, keep product data complete, build genuine reviews, and earn mentions on credible sites. Nothing guarantees a recommendation, but these steps improve your chances.' },
  { question: 'Is SEO or paid advertising better for a new store?', answer: 'Use both for different jobs. Paid ads give fast data and sales, while SEO builds cheaper long-term traffic.' },
  { question: 'How do I reduce cart abandonment?', answer: 'Show total costs early, offer guest checkout, support popular payment methods, speed up your site, and send a 3-email recovery sequence. Unexpected extra costs and forced account creation are common causes.' },
  { question: 'Can a service business use e-commerce strategies?', answer: 'Yes. Package your services, sell them with online booking and payment, collect reviews, and nurture leads by email.' },
  { question: 'Which e-commerce platform is best for beginners?', answer: 'Shopify is a common choice for ease of use. WooCommerce suits people who already use WordPress and want more control.' },
  { question: 'How do I measure whether growth is profitable?', answer: 'Track contribution margin, CAC, LTV, and the LTV:CAC ratio, not just revenue.' },
];

// Real reading time: body words / 200 wpm, rounded up.
const bodyWords = content.concat(faqs.map((f) => f.question + ' ' + f.answer)).join(' ').split(/\s+/).filter(Boolean).length;
const readingTime = `${Math.ceil(bodyWords / 200)} min read`;
console.log('words:', bodyWords, '-> readingTime:', readingTime, '| blocks:', content.length, '| faqs:', faqs.length);

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const authR = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { apikey: KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
});
if (!authR.ok) throw new Error(`auth ${authR.status}: ${await authR.text()}`);
const token = (await authR.json()).access_token;

const call = (path, method, body) =>
  fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers: { apikey: KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, json: r.json() }));

async function upsert(table, filter, body) {
  const upd = await call(`${table}?${filter}`, 'PATCH', body);
  const rows = await upd.json;
  if (upd.status >= 400) throw new Error(`${table} PATCH ${upd.status}: ${JSON.stringify(rows)}`);
  if (rows.length) return 'updated';
  const ins = await call(table, 'POST', body);
  const j = await ins.json;
  if (ins.status >= 400) throw new Error(`${table} POST ${ins.status}: ${JSON.stringify(j)}`);
  return 'inserted';
}

const slug = 'how-to-grow-ecommerce-business';
const title = 'How to Grow an E-commerce Business in 2026: A Complete Guide';
const metaDescription =
  'Learn how to grow an e-commerce business in 2026 with a 6-step plan covering profit, traffic, AI search visibility, conversion, order value, and retention.';

const p = await upsert('posts', `slug=eq.${slug}`, {
  slug, title,
  excerpt: 'A 6-step, profit-first plan to grow an e-commerce store in 2026 \u2014 traffic, AI search visibility, conversion, average order value and retention, with a realistic 90-day roadmap.',
  category: 'Ecommerce',
  date: '31 October 2026',
  reading_time: readingTime,
  image: '/og-image.png',
  image_alt: 'How to Grow an E-commerce Business in 2026 \u2014 a 6-step complete guide',
  content,
  tags: ['Ecommerce', 'SEO', 'Conversion', 'AI Search', 'Retention'],
  is_placeholder: false, published: true, sort_order: 0,
});
console.log('posts:', p);

const aiAnswer =
  'To grow an e-commerce business in 2026, work on four numbers in order: traffic, conversion rate, average order value, and repeat purchases. Confirm every sale is profitable first using contribution margin and break-even ROAS, then get found in Google and AI answers, fix your product pages and checkout, add bundles and upsells, and use email and SMS to bring customers back. Scaling paid ads before fixing conversion wastes money, so foundation comes before traffic. A practical framework is a 90-day plan: days 1-30 for analytics, speed and policies; days 31-60 for answer-first content, reviews and one paid channel; days 61-90 to scale whatever beats break-even ROAS and to add retention flows.';

const m = await upsert('seo_meta', `entity_type=eq.post&entity_slug=eq.${slug}`, {
  entity_type: 'post', entity_slug: slug,
  meta_title: title,
  meta_description: metaDescription,
  og_title: title,
  og_description: metaDescription,
  focus_keyword: 'how to grow an ecommerce business',
  keywords: ['ecommerce growth', 'how to grow ecommerce', 'ecommerce seo', 'ecommerce conversion rate', 'average order value', 'ai search visibility', 'ecommerce growth strategy 2026', 'ecommerce marketing nepal'],
  keyword_cluster: ['ecommerce growth strategy', 'increase ecommerce conversion rate', 'raise average order value', 'ecommerce customer retention', 'aeo geo ecommerce', 'ecommerce 90 day plan'],
  ai_answer: aiAnswer,
  llm_summary: 'A 6-step guide to growing an e-commerce business in 2026: profit-first foundation, search and AI visibility, conversion, average order value and retention, with a 90-day plan.',
  faqs,
  entity_signals: { knowsAbout: ['Ecommerce', 'Search Engine Optimization', 'Conversion Rate Optimization', 'AI Search Visibility', 'Email Marketing', 'Digital Marketing'] },
  noindex: false, nofollow: false,
});
console.log('seo_meta:', m);
console.log('Done.');
