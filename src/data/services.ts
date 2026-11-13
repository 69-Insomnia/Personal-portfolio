import type { EngagementOption, Service } from '@/types';
import {
  aiSearchCapabilities,
  digitalMarketingCapabilities,
  ecommerceCapabilities,
  googleAdsCapabilities,
  metaAdsCapabilities,
  seoCapabilities,
  webDevelopmentCapabilities,
} from '@/data/skills';

/**
 * Service pages.
 *
 * Each `description` is written as a self-contained answer block of roughly
 * 134-167 words, which is the passage length AI citations tend to extract, and
 * it is front-loaded because most citations come from the first third of a
 * page. Each `body` then answers the questions someone actually asks about
 * that service, under question-shaped headings.
 *
 * Titles name the offering, not the role: "SEO Services" rather than "SEO
 * Specialist". The heading is the strongest on-page signal, and the queries
 * this site targets are service-shaped — which is also how `servicesSEO` and
 * `engagementOptions` below already phrase the same work.
 *
 * NOTE: the site reads these from the `services` table, not from this file.
 * Run `npx tsx scripts/sync-content.ts` after editing, or the change will not
 * reach the live site.
 */

/** A service before its position in the list has been turned into its number. */
export type UnnumberedService = Omit<Service, 'index'>;

/**
 * The list, in display order, with NO index on any entry — `numberServices`
 * below derives that from the position here.
 *
 * Each entry used to carry a hand-typed `index`, and it drifted: `ai-search`
 * held "07" while sitting third, so the grid read 01, 02, 07, 03, 04, 05, 06.
 * `src/data/sections.ts` hit this same bug with section eyebrows and fixed it
 * the same way — derive from position, so inserting, removing or reordering an
 * entry renumbers everything downstream instead of silently disagreeing with
 * the render order.
 */
const serviceOrder: UnnumberedService[] = [
  {
    slug: 'web-development',
    title: 'Web Development Services',
    shortDescription:
      'Website design and development in Nepal: custom websites, web applications and online stores built with React, Next.js, WordPress and Shopify.',
    description:
      "I am a web developer in Kathmandu, building marketing websites, web applications and online stores. The stack follows the job rather than a preference: React and Next.js where the project needs to be fast and custom, WordPress or Shopify where someone other than me has to edit it after launch. Every build starts with what the site has to do for the business, because a good-looking site that takes four seconds to load on a phone has already failed at the only thing it was for. What that means in practice is a fast, accessible, maintainable build that someone else can pick up later without a rewrite. I work across the front end and the back end, wire the analytics up properly, and stay involved after launch long enough to see how people actually use it.",
    body: [
      {
        heading: 'What does website design and development include?',
        paragraphs: [
          'Most of the work is one of three things: a marketing site that has to explain a business and collect enquiries, a web application that does something specific, or an online store. They have different constraints and I build them differently.',
          'A marketing site is a persuasion problem. The pages have to load fast, read clearly and lead somewhere. An application is a state problem: what happens when two people edit the same record, what happens when the network drops. A store is a trust problem, and everything from the product page to the checkout either builds trust or spends it.',
        ],
      },
      {
        heading: 'How do you choose between Next.js, WordPress and Shopify?',
        paragraphs: [
          'The honest answer is that it depends on who edits the site after I hand it over. If the owner wants to publish blog posts and change copy without calling anyone, WordPress or Shopify will do that better than a custom build, and I will say so even when a custom build would be more interesting work.',
          'React and Next.js make sense when the site has to do something the platforms cannot, when performance is the constraint, or when the design is specific enough that fighting a theme costs more than building it. The stack is a decision about maintenance, not about quality.',
        ],
      },
      {
        heading: 'Do you build the design as well as the code?',
        paragraphs: [
          'Yes. On most projects the same person handles the layout, the type, the responsive behaviour and the front-end build, which removes the handover where a design gets reinterpreted into something slightly worse. Where a designer is already involved I build to their files instead.',
          'Accessibility and Core Web Vitals are part of the build rather than a later pass: real heading structure, focus states that work with a keyboard, images sized and lazy-loaded correctly, and no layout shift when a font or a script arrives late.',
        ],
      },
      {
        heading: 'What happens after launch?',
        paragraphs: [
          'A launch is the point where you start finding out what is wrong, not the point where the work stops. I watch what real visitors do for the first few weeks: which pages they leave from, where the forms get abandoned, what the field data says about speed on the phones people actually use.',
          'That is also when the technical SEO is worth checking, because a site that cannot be crawled or that renders slowly on mobile will not rank no matter how good the copy is. Fixing it at launch is far cheaper than fixing it a year later.',
        ],
      },
    ],
    capabilities: webDevelopmentCapabilities,
    deliverables: [
      'Custom marketing site or web application',
      'Responsive layouts tested on a mid-range Android phone',
      'On-page SEO built in rather than added later',
      'Analytics and conversion tracking wired up and verified',
      'Handover notes and a walkthrough of how to edit it yourself',
    ],
    timeline: '3–8 weeks',
    bestFor: 'A business that needs the site built properly the first time',
    // Published starting price. The UI renders this value in the service card and comparison table.
    fromNpr: 45000,
    icon: 'code',
  },
  {
    slug: 'seo-services',
    title: 'SEO Services',
    seoTitle: 'SEO Services in Nepal | Ecommerce SEO Expert in Kathmandu',
    shortDescription: 'Technical SEO, ecommerce SEO, and conversion-focused growth for stores and businesses in Nepal.',
    description:
      "I provide SEO services for ecommerce brands and businesses across Nepal, focused on technical foundations, search visibility, and revenue impact. The work begins by checking whether search engines can read the site, whether pages load quickly on mobile, and whether each page clearly matches the intent behind the search. From there, I improve keyword targeting, on-page optimisation, content structure, and conversion tracking so the ranking work is tied to actual sales and leads. I also verify whether analytics and conversion data are trustworthy, because optimising against the wrong numbers is one of the fastest ways to lose budget and momentum.",
    body: [
      {
        heading: 'What does SEO actually involve?',
        paragraphs: [
          'Four things, in this order: make the site crawlable, make it fast, make each page about one thing, then build content around what people search for. The order matters because each step depends on the one before it.',
          'It is not a channel you bolt on at the end. When SEO is treated as something that happens to a finished website, most of the leverage is already gone, because the decisions that matter most (URL structure, page focus, how content is organised) were made during the build.',
        ],
      },
      {
        heading: 'Why does the technical work come first?',
        paragraphs: [
          'Because content on a site that cannot be crawled just adds to the pile. I have lost count of the times someone has asked for help ranking, and the real problem was eight existing pages a search engine could not read properly, not a shortage of new ones.',
          'The technical list is short and unglamorous. Can Google fetch the page. Does it render without JavaScript being executed. Is it fast on a mid-range Android phone, which is what most visitors in Nepal are using. Do two pages compete for the same query. None of that requires new content, and all of it caps what new content can achieve.',
        ],
      },
      {
        heading: 'How long before rankings move?',
        paragraphs: [
          'Technical fixes can show up within days if the page was previously blocked or broken. Content and authority work is measured in months, not weeks, and anyone promising otherwise is guessing.',
          'What I will commit to is a shorter list of things worth doing, ordered by impact, and a clear indication of whether each one worked. If a fix does not move anything within a reasonable window, that is information too, and it is better to know it early.',
        ],
      },
      {
        heading: 'Do you work with businesses outside Nepal?',
        paragraphs: [
          'Yes. I am based in Kathmandu and most of my client work has been for businesses in Nepal, but I work remotely and I am used to running projects over written updates rather than meetings.',
          'For local searches the geography matters a great deal, and it is worth being explicit: ranking in the map pack for a Nepali city needs a Google Business Profile and consistent business details, which is a different job from the on-page work.',
        ],
      },
    ],
    capabilities: seoCapabilities,
    deliverables: [
      'Technical audit, with the fixes sequenced by impact',
      'Keyword research and page-level targeting',
      'On-page work on the pages that already exist',
      'Content plan and briefs',
      'Internal linking',
      'Monthly reporting on rankings, traffic and enquiries',
    ],
    // Deliberately longer than the other services. The page's own copy says
    // "Technical fixes can show up within days … content and authority work is
    // measured in months, not weeks", and a shorter figure here would promise
    // something the page then contradicts.
    timeline: '3–6 months before rankings move',
    bestFor: 'A site with pages that exist but do not rank',
    fromNpr: 15000,
    icon: 'search',
  },
  {
    slug: 'ecommerce-growth-expert-nepal',
    title: 'Ecommerce Growth Expert in Nepal',
    seoTitle: 'Ecommerce Growth Expert in Nepal | Shopify SEO, CRO & Google Ads',
    shortDescription:
      'Ecommerce growth expert in Nepal helping online stores rank, convert more visitors, and grow revenue with SEO, CRO and paid media.',
    description:
      'I help ecommerce brands in Nepal grow with a full-funnel strategy built around search visibility, product-page conversion, and profitable acquisition. My work connects SEO, Shopify and WooCommerce optimisation, CRO, and Google and Meta Ads so the store does not just get traffic but turns that traffic into orders. The goal is not isolated channel wins. It is a cleaner path from product discovery to checkout, with clearer data and stronger conversion performance across the store. For Nepal-based retailers, this usually means fixing the pages that already exist before buying more traffic, then scaling only once the funnel is actually converting.',
    body: [
      {
        heading: 'What does an ecommerce growth expert in Nepal actually do?',
        paragraphs: [
          'I work across the whole ecommerce funnel: technical SEO, category and product-page structure, conversion improvements, analytics setup, and campaign strategy. That is how a business grows without leaking customers between discovery, product view, and checkout.',
          'The real work is usually a mix of search improvements and conversion fixes. A store may rank but still struggle because the product pages are weak, mobile UX is poor, or the ads are sending traffic to the wrong landing page. I connect those signals instead of treating them as separate problems.',
        ],
      },
      {
        heading: 'Why do ecommerce brands need a growth specialist instead of just SEO?',
        paragraphs: [
          'SEO brings demand, but conversion closes it. A store can rank well and still underperform if the product pages are thin, the page speed is weak, or the checkout is too slow on mobile. Paid media can also create noise if the landing page is not built for the intent of the click.',
          'That is why I treat growth as one system. Search, page experience, product structure, and paid acquisition all influence revenue. When they are aligned, the store gets more qualified traffic and it converts better once the visitor arrives.',
        ],
      },
      {
        heading: 'How do you work with ecommerce businesses in Kathmandu and Nepal?',
        paragraphs: [
          'Most projects begin with a growth audit: traffic sources, conversion bottlenecks, page quality, product intent, and tracking accuracy. From there, I identify the first issue to fix and the highest-impact improvements to test or implement next.',
          'I work with Shopify, WooCommerce and custom stores across Nepal, with the same goal: stronger rankings, stronger conversion performance, and a sustainable path to more revenue without wasting ad spend.',
        ],
      },
    ],
    capabilities: ecommerceCapabilities,
    deliverables: [
      'Ecommerce growth audit and funnel review',
      'SEO and product-page optimisation roadmap',
      'CRO fixes for higher conversion rate',
      'Google and Meta Ads alignment with store performance',
      'Tracking and reporting that connects traffic to revenue',
    ],
    timeline: '4–10 weeks to improve the funnel; ongoing optimisation after',
    bestFor: 'A Nepal ecommerce business that wants more orders without wasting marketing spend',
    fromNpr: 60000,
    icon: 'shopping-bag',
  },
  {
    slug: 'ecommerce-growth-specialist-kathmandu',
    title: 'Ecommerce Growth Specialist in Kathmandu',
    seoTitle: 'Ecommerce Growth Specialist in Kathmandu | Nepal SEO, CRO & Ads',
    shortDescription:
      'Kathmandu ecommerce growth specialist for stores that need better SEO, conversion, and paid media performance.',
    description:
      'I am an ecommerce growth specialist in Kathmandu, Nepal, helping online stores get found on Google and convert more visitors into customers. I work across search, conversion rate optimisation, page structure, and customer journey improvements so the business grows from a stronger funnel rather than from one-off campaigns. For ecommerce brands, that usually means fixing the search and product page foundation first, then improving the ad traffic and landing pages that feed the order flow. This is a practical model for stores that want better rankings, better conversion performance, and more sustainable growth.',
    body: [
      {
        heading: 'Why businesses in Kathmandu need ecommerce growth support',
        paragraphs: [
          'The problem is rarely just one channel. A store may have traffic but poor conversion, or solid traffic but weak product page intent. Growth work fixes those weak connections so the store can turn more visits into sales.',
          'In Kathmandu and across Nepal, many ecommerce stores struggle because they treat SEO, ads, and UX as separate projects. The better model is one revenue system where search, landing pages, product pages, tracking, and campaigns are designed to work together.',
        ],
      },
      {
        heading: 'What leads to stronger ecommerce growth?',
        paragraphs: [
          'Better product-page structure, cleaner keyword targeting, stronger mobile performance, trust signals, and clearer calls to action all help. Add conversion tracking and better attribution, and the business starts making decisions from evidence rather than guesswork.',
          'This is where a growth specialist adds value. Instead of making one isolated change, the work focuses on the places where the funnel leaks most and the places where the next rupee will produce the strongest return.',
        ],
      },
      {
        heading: 'How do I know if I need help?',
        paragraphs: [
          'If your store gets traffic but not enough orders, or if you are spending on ads without clear ROI, it is a sign the funnel needs review. A growth specialist can diagnose whether the issue is search visibility, page quality, product intent, or attribution quality.',
          'The right fix is the one that improves the actual revenue path. That is what I focus on with Kathmandu and Nepal ecommerce clients.',
        ],
      },
    ],
    capabilities: ecommerceCapabilities,
    deliverables: [
      'Growth audit for Kathmandu and Nepal ecommerce stores',
      'Funnel and conversion diagnosis',
      'Shopify and WooCommerce improvement roadmap',
      'Search and paid media strategy alignment',
      'Monthly performance review for growth actions',
    ],
    timeline: '4–8 weeks for the first growth improvements',
    bestFor: 'An online store in Nepal that needs more qualified traffic and better conversion performance',
    fromNpr: 55000,
    icon: 'target',
  },
  {
    slug: 'ecommerce-growth-specialist-nepal',
    title: 'Ecommerce Growth Specialist in Nepal',
    seoTitle: 'Ecommerce Growth Specialist in Nepal | Shopify, SEO & CRO Expert',
    shortDescription:
      'Ecommerce growth specialist in Nepal for stores that need better SEO, conversion rate, and profitable growth strategy.',
    description:
      'I help ecommerce businesses in Nepal grow with a practical growth system built around SEO, conversion rate optimisation, product-page performance, and paid media alignment. The work is focused on one goal: turning more of the store’s traffic into orders without wasting budget. This means improving product discoverability, fixing conversion bottlenecks on the storefront, and making sure the marketing channels are aligned with what the product page can actually convert. For many online stores in Nepal, the biggest win is not more ads or more keywords alone — it is a clearer funnel and a better store experience.',
    body: [
      {
        heading: 'Why ecommerce stores in Nepal need a growth specialist',
        paragraphs: [
          'Most stores do not fail because they have no product demand. They fail because the funnel leaks at multiple points: weak search visibility, slow or confusing product pages, poor mobile experience, or paid traffic landing on pages that do not match the intent of the click.',
          'When that happens, the business spends more but converts less. A growth specialist brings the system back together so the store can convert the traffic it already has and grow without guesswork.',
        ],
      },
      {
        heading: 'What growth work includes',
        paragraphs: [
          'I review the store’s visibility, product structure, conversion rate, analytics setup, and acquisition strategy. Then I focus on the actions that improve revenue most, whether that is better search performance, a stronger product page, cleaner tracking, or more efficient ad spend.',
          'The aim is not to chase vanity metrics. It is to improve the parts of the funnel that lead to actual sales, repeat orders, and profit.',
        ],
      },
      {
        heading: 'What makes the approach more effective?',
        paragraphs: [
          'Ecommerce growth works best when SEO, CRO, paid media, and store experience are designed together. When they are managed separately, the store often gets conflicting signals, inconsistent reporting, and weak decision-making.',
          'I help businesses in Nepal build that alignment so the same funnel can increase both traffic quality and conversion performance.',
        ],
      },
    ],
    capabilities: ecommerceCapabilities,
    deliverables: [
      'Growth strategy for Nepal ecommerce businesses',
      'Store conversion and traffic quality review',
      'SEO and product-page performance improvements',
      'Ad and landing page strategy alignment',
      'Growth reporting tied to revenue outcomes',
    ],
    timeline: '4–8 weeks for the first major improvements',
    bestFor: 'A Nepal ecommerce brand that wants more qualified traffic and better conversion efficiency',
    fromNpr: 50000,
    icon: 'target',
  },
  {
    slug: 'shopify-seo-nepal',
    title: 'Shopify SEO Nepal',
    seoTitle: 'Shopify SEO Nepal | Ecommerce SEO Expert in Kathmandu',
    shortDescription:
      'Shopify SEO services in Nepal to improve product rankings, category visibility, and ecommerce traffic quality.',
    description:
      'I help Shopify stores in Nepal improve product and category visibility through structured SEO work built for ecommerce. Shopify is a strong platform for online stores, but many stores still lose rankings because the product titles, collection pages, site architecture, metadata, internal links, and mobile speed are not built around buyer intent. My Shopify SEO work focuses on the pages and signals that help searchers discover the right products and convert once they land. That means better search ranking, better storefront structure, and more revenue from the traffic the store already attracts.',
    body: [
      {
        heading: 'Why Shopify SEO is different from a regular website',
        paragraphs: [
          'Shopify stores usually have a large number of product and collection pages competing with each other. If those pages are thin, duplicated, or poorly structured, Google has a difficult time deciding which one should rank.',
          'The best Shopify SEO work starts with intent-based category pages, stronger product copy, better metadata, and cleaner internal linking so the store becomes easier to understand and easier to trust.',
        ],
      },
      {
        heading: 'What do I improve first on Shopify?',
        paragraphs: [
          'I usually start with technical SEO, site speed, crawlability, canonical setup, collection structure, and product-page quality. Then I work on category-level relevance, collection descriptions, and internal links that help Google understand why the page exists.',
          'This is especially important for Nepal ecommerce stores, where buyers often search with both English and Romanized Nepali terms. The content and page structure need to reflect both buyer intent and product context.',
        ],
      },
      {
        heading: 'How does Shopify SEO affect revenue?',
        paragraphs: [
          'More relevant product and collection rankings usually mean more qualified visits. When the store is structured correctly, shoppers arrive with clearer intent and the conversion funnel is more efficient. SEO is not just brand visibility; it is also a stronger path to sales and lower acquisition costs.',
          'I treat Shopify SEO as part of the revenue system, not a separate marketing task. That is how you get compounding results instead of isolated ranking gains.',
        ],
      },
    ],
    capabilities: seoCapabilities,
    deliverables: [
      'Shopify technical SEO audit',
      'Collection and product page optimisation',
      'Internal linking and content planning',
      'Metadata and schema improvements',
      'Tracking and organic traffic review',
    ],
    timeline: '3–6 months for stronger rankings; faster technical fixes possible',
    bestFor: 'A Shopify store in Nepal that wants better organic visibility and better product-page conversion',
    fromNpr: 25000,
    icon: 'search',
  },
  {
    slug: 'woocommerce-seo-nepal',
    title: 'WooCommerce SEO Nepal',
    seoTitle: 'WooCommerce SEO Nepal | SEO for Ecommerce Stores in Kathmandu',
    shortDescription:
      'WooCommerce SEO in Nepal for better product rankings, category visibility, and stronger ecommerce sales from search.',
    description:
      'I provide WooCommerce SEO services for ecommerce businesses in Kathmandu and across Nepal who want more visibility in search and a cleaner path from product discovery to checkout. WooCommerce can be a powerful platform, but many stores lose performance because catalog pages, product titles, category structure, metadata, and technical SEO settings are not aligned with how buyers search. My work focuses on making the store easier for Google to understand and easier for shoppers to trust, which leads to better ranking potential and stronger conversion performance.',
    body: [
      {
        heading: 'What usually blocks WooCommerce rankings?',
        paragraphs: [
          'Thin product descriptions, duplicate category content, poor internal structure, slow mobile performance, weak metadata, and unreadable filter pages are common issues. These problems reduce both search performance and conversion rate.',
          'For WooCommerce stores, the biggest opportunity is usually not just adding more content. It is making the pages that already exist more relevant, more specific, and easier for shoppers to trust.',
        ],
      },
      {
        heading: 'How do I improve WooCommerce SEO?',
        paragraphs: [
          'I audit the technical setup, product and category pages, metadata, internal links, crawl efficiency, and conversion path. Then I improve the most important pages first so the store starts ranking for real buying intent instead of broad, weak terms.',
          'This matters especially in ecommerce, where a product page that ranks for the right keyword but fails to convert is still a missed opportunity. SEO and conversion need to work together.',
        ],
      },
      {
        heading: 'Does WooCommerce SEO help the whole funnel?',
        paragraphs: [
          'Yes. Better ranking is only half the story. A stronger ecommerce funnel also improves product page clarity, mobile usability, shopper confidence, and the likelihood of repeat orders. The work should support both search visibility and purchase confidence.',
          'That is the balance I aim for when working with WooCommerce stores in Nepal.',
        ],
      },
    ],
    capabilities: seoCapabilities,
    deliverables: [
      'WooCommerce technical SEO audit',
      'Product and category SEO improvements',
      'Metadata and category content structure',
      'Internal linking strategy for search and discovery',
      'Conversion-aware SEO improvements for product landing pages',
    ],
    timeline: '3–6 months for sustainable growth; technical fixes can appear faster',
    bestFor: 'A WooCommerce store in Nepal that needs stronger organic visibility and more sales from search traffic',
    fromNpr: 25000,
    icon: 'search',
  },
  {
    slug: 'ai-search',
    title: 'AI Search Optimization',
    shortDescription:
      'AI search visibility: getting mentioned or cited by AI Overviews, ChatGPT and Perplexity.',
    description:
      "I work on AI search visibility: whether AI Overviews, ChatGPT, Perplexity and Copilot mention or cite a business when someone asks about its services. Google's own guidance is blunt about this and worth repeating, because a lot of agencies are selling it as a new discipline: optimising for generative AI search is still SEO, and the labels in circulation — AEO (Answer Engine Optimization), GEO (Generative Engine Optimization), AIO (AI Overviews Optimization), LLMO (Large Language Model Optimization) and LMO — describe overlapping work rather than separate channels. Google also states directly that llms.txt and similar files neither help nor hurt its rankings. What does move it is less exotic. Ranking classically comes first, because most AI citations are pulled from pages that already rank in the top ten. Then original data worth quoting, self-contained answers, dated and attributed content, and a brand that exists outside your own website.",
    body: [
      {
        heading: 'What is AI search optimization?',
        paragraphs: [
          'It is SEO applied to surfaces that answer questions instead of listing links. When someone asks an AI assistant which SEO specialist to hire in Kathmandu, the assistant assembles an answer from sources it already trusts, and the question is whether your business is one of them.',
          'The acronyms you will see quoted at you mostly describe the same work. Answer Engine Optimization and Generative Engine Optimization are the two with real usage; AI Overviews Optimization, Large Language Model Optimization and LMO are later additions describing pieces of the same problem. Treating each as its own service to buy is how a business ends up paying five times for one job.',
        ],
      },
      {
        heading: 'How do AI systems decide what to cite?',
        paragraphs: [
          'Two mechanisms, and they behave differently. Google AI Overviews leans heavily on classic ranking: the large majority of pages it cites are already in the top ten results, so the traditional work feeds it directly.',
          'ChatGPT and Perplexity draw on a wider pool and weight things differently. Both lean on sources that exist off your own site, and studies of AI citations consistently find brand mentions correlate with visibility far more strongly than backlinks do. Presence on Wikipedia, Reddit, YouTube and LinkedIn matters more here than another directory listing.',
        ],
      },
      {
        heading: 'What actually moves AI visibility?',
        paragraphs: [
          'Four things, roughly in order of leverage. Rank well in normal search, because most AI citations come from pages that already do. Write passages that survive being quoted out of context, since a claim that only makes sense beside the paragraph above it will not be extracted. Put a date and a name on your content, because recency and authorship both correlate with citation. And exist elsewhere, which for a person or a small business means the unglamorous work of profiles, answers and mentions.',
          'I have already made the technical side of this site ready: AI crawlers are allowed explicitly in robots.txt, the structured data describes the person and the business, and every page carries a byline.',
        ],
      },
      {
        heading: 'What I will not promise',
        paragraphs: [
          'I will not promise a citation. Nobody controls what an AI assistant says, the systems change monthly, and any agency quoting a guaranteed share of AI answers is describing something they cannot deliver.',
          'What I can do is make the site legible and quotable to systems that read it, fix the technical things that stop it being read at all, and tell you honestly which of the changes were worth the money. If a tactic has no evidence behind it, I would rather say so than bill for it.',
        ],
      },
    ],
    capabilities: aiSearchCapabilities,
    deliverables: [
      'AI crawler access review',
      'Citable passage structure across key pages',
      'Entity and brand signal work',
      'Structured data review',
      'Monitoring of what AI systems currently say about you',
    ],
    timeline: '2–4 months',
    bestFor: 'A business whose buyers already ask AI assistants',
    fromNpr: 20000,
    icon: 'sparkles',
  },
  {
    slug: 'meta-ads',
    title: 'Meta Ads Management',
    shortDescription:
      'Facebook and Instagram campaigns built around audiences, creative testing and real tracking.',
    description:
      "I run Facebook and Instagram campaigns. The work is ordered deliberately: audience structure first, then creative testing, then tracking. Most accounts I look at have the third one wrong, and that is the expensive one. If a purchase event fires twice, or never fires on mobile, every decision after it is made against a number that is wrong, so the budget goes where the reporting says rather than where the customers are. I set up the pixel and events properly before scaling anything, then test creative in disciplined batches instead of guessing at it. Lead generation and ecommerce campaigns are most of what I run, and reporting stays on conversions rather than impressions, because impressions have never paid anyone's invoices.",
    body: [
      {
        heading: 'What does Meta Ads management actually cover?',
        paragraphs: [
          'The account structure, the audiences, the creative pipeline and the measurement. Those four things produce the result; the daily bidding tweaks that agencies like to describe are mostly noise at small budgets.',
          'Audience structure means deciding who sees what and making sure the account does not compete with itself. In Nepal the audiences are smaller than in larger markets, which changes the strategy: fewer, broader buckets usually beat a long list of narrow interests, because narrow audiences exhaust quickly and start showing the same people the same ad.',
        ],
      },
      {
        heading: 'Why fix tracking before spending more?',
        paragraphs: [
          'Because a wrong number is worse than no number. If your reported cost per purchase is half the real one, you will scale the campaign that is losing money and pause the one that works.',
          'The failure modes are dull and common. The purchase event fires on page load as well as on completion. It fires on desktop but not on mobile, which is most of the traffic here. It fires from the test pixel for months because nobody removed it. I check all of this before touching the budget.',
        ],
      },
      {
        heading: 'How is creative testing structured?',
        paragraphs: [
          'One variable at a time, enough spend to mean something, and enough patience not to call it early. Testing four concepts and twelve headlines at once tells you nothing about which change made the difference.',
          'For most small budgets, the creative is the main lever. Audience targeting has been progressively automated by Meta, so the ad itself, and the product page it lands on, do most of the work.',
        ],
      },
    ],
    capabilities: metaAdsCapabilities,
    deliverables: [
      'Audience and campaign structure',
      'Creative testing in controlled batches',
      'Meta Pixel and event setup, verified against a test conversion',
      'Retargeting for people who already engaged',
      'Monthly reporting on cost per result',
    ],
    timeline: 'Setup in 1–2 weeks',
    bestFor: 'A store or lead-generation business already on Instagram and Facebook',
    fromNpr: 25000,
    icon: 'target',
  },
  {
    slug: 'google-ads',
    title: 'Google Ads Management',
    shortDescription: 'Search, Display, YouTube and remarketing campaigns for businesses that want qualified buyers ready to purchase.',
    description:
      "I run Google Ads, and the difference between it and most other channels is intent: the person is already searching for the thing, so most of the work is about not wasting the click. That means tight accounts rather than broad ones, keywords matched to what the landing page actually delivers, and negative keyword lists that get maintained rather than set once and forgotten. I run Search, Display, YouTube and remarketing campaigns, and I would rather spend a week getting conversion tracking right than a month optimising against numbers I do not trust. For a business in Nepal, Search carries most of the value, because it catches demand that already exists. Display and YouTube do a different job, which is keeping a brand in view while someone decides.",
    body: [
      {
        heading: 'What does Google Ads management do differently?',
        paragraphs: [
          'Mostly, they delete things. The first pass on an inherited account is usually removing keywords that were never going to convert, pausing ad groups with no impressions, and rebuilding the negative keyword list.',
          'The second difference is matching the ad to the page. Sending a search for one specific product to a category page is one of the most common and most expensive mistakes in ecommerce, and it is invisible in the ads dashboard because the click did happen. It just did not become anything.',
        ],
      },
      {
        heading: 'Where does the budget usually leak?',
        paragraphs: [
          'Broad match keywords with no negatives, which is Google happily spending on searches you cannot serve. Display placements bundled into a Search campaign. And conversion actions counted twice, which makes a bad campaign look efficient.',
          'In Nepal there is a specific one worth knowing: a lot of search volume is in romanised Nepali rather than English, and campaigns targeting only English miss buyers who are searching for exactly what you sell.',
        ],
      },
      {
        heading: 'Which campaign types are worth running?',
        paragraphs: [
          'Search first, always, because it captures existing demand and it is the only place where the person has already told you what they want. Remarketing second, because it is cheap and the audience is qualified by definition.',
          'Display and YouTube depend on the business. They are awareness tools, and awareness is hard to attribute and easy to overspend on. I will run them when there is a reason to, not because the account looks fuller with them in it.',
        ],
      },
    ],
    capabilities: googleAdsCapabilities,
    deliverables: [
      'Account structure and keyword strategy',
      'Ad copy writing and testing',
      'Negative keyword maintenance',
      'Conversion tracking setup and verification',
      'Landing page recommendations',
    ],
    timeline: 'Setup in 1–2 weeks',
    bestFor: 'A business whose customers are already searching for it',
    fromNpr: 25000,
    icon: 'chart',
  },
  {
    slug: 'ecommerce-growth',
    title: 'Ecommerce Growth Services',
    /**
     * This page is the canonical target for the Nepal and Kathmandu ecommerce
     * growth search cluster. The exact "Ecommerce Growth Specialist in Kathmandu"
     * phrase is kept in the seoTitle so the page title matches high-intent
     * commercial queries without duplicating the homepage H1.
     */
    seoTitle: 'Ecommerce Growth Specialist in Kathmandu | Dipendra Guragain',
    shortDescription:
      'Ecommerce growth expert in Nepal and Kathmandu. Storefront, SEO, product pages, ads and analytics are managed as one funnel for sustainable growth.',
    description:
      'I am an ecommerce growth specialist in Kathmandu helping online stores in Nepal improve traffic quality, conversion rate, and revenue through a single growth system. In practice the work connects storefront performance, product page SEO, paid acquisition, analytics, and conversion optimization so the store keeps converting instead of leaking customers at different points. Most ecommerce problems look like separate issues until you follow the funnel end to end. Traffic falls, ad cost rises, or checkout drops, and the real cause is usually a weak page, unclear product intent, poor mobile UX, or bad tracking that keeps the business guessing. I fix the leak first and then choose the channel changes that actually improve the result.',
    body: [
      {
        heading: 'Why do ecommerce growth problems look like several different issues?',
        paragraphs: [
          'Because each team sees a different symptom. SEO notices a slow product page that cannot rank well. Ads sees a high cost per purchase. The store owner sees fewer completed sales. They are all describing the same leak, but from different parts of the funnel.',
          'That is exactly why growth stalls. The problem is not a single channel failure; it is the missing connection between traffic, page experience, product intent and conversion tracking. I diagnose that entire path before recommending a paid campaign or new content.',
        ],
      },
      {
        heading: 'How does ecommerce SEO differ from a normal website?',
        paragraphs: [
          'A normal website may have a handful of important pages. An ecommerce store has category pages, product pages, collection filters, tags, variants and transactional landing pages, all of which compete for the same search intent. If those pages do not match user search intent, the store cannot scale sustainably.',
          'The biggest issues are usually repetitive product descriptions, thin category pages, poor internal linking, weak mobile performance, inconsistent product page metadata and conversion paths that fail on mobile. In Nepal, one extra challenge is that buyers often search using both English and Romanized Nepali terms, so the page has to serve both search styles naturally without keyword stuffing.',
        ],
      },
      {
        heading: 'What does a growth specialist actually work on?',
        paragraphs: [
          'I look at the full funnel: store speed, product page structure, category intent, search visibility, landing-page messaging, and analytics quality. If conversion tracking is wrong, the business is making decisions from poor data and spending money in the wrong place.',
          'I fix the weak points that actually block growth first, then align SEO, paid media, CRO and merchandising so they reinforce each other instead of working against each other. That is how ecommerce growth becomes repeatable rather than dependent on guesswork.',
        ],
      },
      {
        heading: 'Do you work on Shopify, WooCommerce and custom stores?',
        paragraphs: [
          'Yes. The platform influences the implementation, but not the strategy. The core growth problems are similar across Shopify, WooCommerce and custom storefronts: product intent, load speed, mobile checkout friction, page structure and trust signals.',
          'I work on the areas that matter most for revenue, whether that means storefront changes, category architecture, product copy, tracking setup, or paid campaign alignment. I will explain what can be fixed quickly and what needs a deeper build before we commit.',
        ],
      },
    ],
    capabilities: ecommerceCapabilities,
    deliverables: [
      'Storefront and product page optimization',
      'Category structure built for search and conversion',
      'Checkout and mobile funnel improvements',
      'SEO + paid acquisition aligned as one growth system',
      'Analytics and conversion tracking verified against real customer behavior',
    ],
    timeline: '4–10 weeks for a build, ongoing after',
    bestFor: 'An online store losing people before checkout',
    fromNpr: 60000,
    icon: 'shopping-bag',
  },
  {
    slug: 'digital-marketing',
    title: 'Digital Marketing Services',
    shortDescription:
      'Digital marketing specialist in Nepal: one strategy across content, SEO, paid media and conversion, instead of four separate suppliers.',
    description:
      "I am a digital marketing specialist in Kathmandu, which mostly means refusing to treat content, SEO, paid media and conversion as separate jobs. They get decided together because they only pay off together. An ad that sends traffic to a page which does not answer the query wastes the budget, and a page nobody can find wastes the writing. The question stays the same across all of it: what brings the right visitors, and what turns them into customers. For a business in Nepal that usually means search first, because demand already exists and it is the cheapest demand to capture, then paid media to reach the people who are not searching yet, then the conversion work that stops both from leaking. One person holding all four is not about doing more. It is about not having to reconcile four reports that disagree.",
    body: [
      {
        heading: 'What does a digital marketing specialist actually own?',
        paragraphs: [
          'The plan and the numbers behind it. Which channel gets the next rupee, what each one is expected to return, and what gets cut when it does not deliver.',
          'That is a different job from running four channels well in isolation. When search, ads and content are optimised separately by different people against different targets, the business can hit every one of those targets and still not grow, because none of them was measuring the thing that mattered.',
        ],
      },
      {
        heading: 'Which channel should come first?',
        paragraphs: [
          'For most small businesses in Nepal, search. The demand already exists and someone is already looking, which makes it far cheaper than creating demand from scratch with advertising.',
          'Paid social comes next, once there is something worth sending people to. Advertising a page that does not convert is the most reliable way to conclude, wrongly, that advertising does not work.',
        ],
      },
      {
        heading: 'How do you decide what to stop doing?',
        paragraphs: [
          'By agreeing in advance what each channel is supposed to return, and on what timeline. Without that, nothing ever gets cut, because every channel can produce an anecdote about the time it worked.',
          'I would rather run three things properly than six badly. Most marketing budgets I see are spread thin enough that no single channel has enough data or enough spend to work at all.',
        ],
      },
    ],
    capabilities: digitalMarketingCapabilities,
    deliverables: [
      'One plan across search, ads and content',
      'Channel budget allocation',
      'Conversion work on the pages those channels land on',
      'Analytics you can trust before anything is optimised',
      'A monthly review of what to keep and what to cut',
    ],
    timeline: 'Ongoing, reviewed monthly',
    bestFor: 'A business currently coordinating several suppliers',
    fromNpr: 35000,
    icon: 'megaphone',
  },
];

/**
 * Numbers a list by position, so `index` always matches where the entry is
 * actually rendered.
 *
 * Exported because `src/lib/content.ts` reads services from the database and
 * has to apply the same rule — the table's `service_index` column is no longer
 * read, so a row stored as "07" while sorted third can no longer contradict the
 * card it renders as.
 */
export function numberServices(list: UnnumberedService[]): Service[] {
  return list.map((service, position) => ({
    ...service,
    index: String(position + 1).padStart(2, '0'),
  }));
}

export const services: Service[] = numberServices(serviceOrder);

export const engagementOptions: EngagementOption[] = [
  {
    title: 'Website Development',
    summary: 'A site that loads fast and is easy to hand over.',
    href: '/services/web-development',
  },
  {
    title: 'SEO',
    summary: 'Technical fixes and content that earn the right search traffic.',
    href: '/services/seo-services',
  },
  {
    title: 'AI Search',
    summary: 'Being legible to AI Overviews, ChatGPT and Perplexity.',
    href: '/services/ai-search',
  },
  {
    title: 'Meta & Google Ads',
    summary: 'Campaigns measured by conversions, not impressions.',
    href: '/services/meta-ads',
  },
  {
    title: 'Ecommerce Growth',
    summary: 'The whole funnel, from product page to repeat order.',
    href: '/services/ecommerce-growth',
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export function getRelatedServices(slug: string, limit = 3): Service[] {
  return services.filter((service) => service.slug !== slug).slice(0, limit);
}
