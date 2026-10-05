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
    icon: 'code',
  },
  {
    slug: 'seo',
    title: 'SEO Services',
    shortDescription: 'Technical SEO, keyword research and content work for businesses in Nepal.',
    description:
      "I do SEO for businesses across Nepal, based in Kathmandu. The job is to make a site findable for the searches that bring customers, and then to show that it worked. That starts with technical foundations, because nothing survives on top of a broken base: whether a crawler can read the page, whether it renders in under two seconds on a phone, and whether each page is about one thing. Only then does keyword and content work make sense. I also handle the part most audits skip, which is whether your conversion tracking fires correctly. Optimising against a number that is wrong costs more than doing nothing, and it is the most common problem I find on sites that already spend on SEO.",
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
    icon: 'target',
  },
  {
    slug: 'google-ads',
    title: 'Google Ads Management',
    shortDescription: 'Search, Display, YouTube and remarketing campaigns aimed at people already looking.',
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
    icon: 'chart',
  },
  {
    slug: 'ecommerce-growth',
    title: 'Ecommerce Growth Specialist',
    shortDescription:
      'Ecommerce growth specialist in Nepal. Storefront, ecommerce SEO, product pages, ads and analytics run as one funnel rather than four projects.',
    description:
      'I am an ecommerce growth specialist based in Kathmandu, working with online stores in Nepal and remotely. In practice the job means treating the storefront, product pages, ecommerce SEO, advertising and analytics as one system rather than four projects owned by four people. Most ecommerce problems arrive described as a single problem. Traffic is down, or conversion is down, or ad costs are up, and it usually turns out to be the same problem wearing different hats. A product page that takes four seconds to load on mobile is an SEO issue, an advertising issue and a merchandising issue at once, and because three people each see a different symptom, nobody fixes it. So I start by finding where people actually drop off, using the funnel rather than an opinion, and fix that before sending more traffic into a leaking store.',
    body: [
      {
        heading: 'Why do ecommerce problems look like several problems?',
        paragraphs: [
          'Because each specialist sees the symptom their tool measures. The SEO sees a Core Web Vitals failure. The ads manager sees a high bounce rate and blames the audience. The merchandiser sees a product with views and no carts.',
          'All three are describing the same page and none of them is wrong. That is exactly why it goes unfixed: the problem is not inside anybody\'s remit, so it sits in the gap between them.',
        ],
      },
      {
        heading: 'How does ecommerce SEO differ from optimising a normal website?',
        paragraphs: [
          'Because the pages multiply. A store with two hundred products has two hundred pages that each need a title and a description matching what the product actually is, plus the category pages above them — and the categories are usually what should be ranking for the broad terms, not the individual products.',
          'The failures repeat across almost every store I look at. Product pages that inherit the manufacturer description, so every shop selling the same item publishes the same words and none of them is the original. Category pages with no content at all, competing on nothing but internal links. Filter and sort parameters generating thousands of crawlable URLs that dilute the pages that matter. Missing product structured data, so price and availability cannot appear in the result even when the page ranks.',
          'Nepali stores add one of their own: product names written in romanised Nepali on the page and in English in the title, so neither version is complete. Both belong on the page when both are how people search.',
        ],
      },
      {
        heading: 'What does the funnel work actually involve?',
        paragraphs: [
          'Unglamorous questions with specific answers. Which products get views but no carts. Which queries land on a page that does not answer them. Which ad sends someone to a category when they wanted one item. Which step of checkout has the highest abandonment.',
          'Those answers usually point at a fix that costs nothing to ship, which is why I look for them before proposing new campaigns. Buying more traffic for a store that loses people at checkout is an expensive way to stay where you are.',
        ],
      },
      {
        heading: 'Do you work on Shopify and WooCommerce?',
        paragraphs: [
          'Yes, and on custom storefronts. The platform changes what is easy, not what matters. The things that decide whether a store grows (page speed, product page clarity, search visibility, checkout friction, trustworthy analytics) are the same on every platform.',
          'Where the platform does matter is in what I can change directly. On Shopify and WooCommerce some fixes are configuration and some need code; on a custom build it is all code. I will tell you which before quoting.',
        ],
      },
    ],
    capabilities: ecommerceCapabilities,
    icon: 'shopping-bag',
  },
  {
    slug: 'digital-marketing',
    title: 'Digital Marketing Specialist',
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
    href: '/services/seo',
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
