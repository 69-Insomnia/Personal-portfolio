/**
 * What each service costs, as starting points rather than fixed quotes.
 *
 * ## The one thing to fill in
 *
 * Every `fromNpr` below is `null` on purpose, and a `null` renders as
 * "Contact for a quote" rather than as a number. Nothing here invents a price.
 * When you are ready to publish real figures, replace the `null` with a number
 * of rupees and the page, the meta description and the schema all pick it up —
 * there is nothing else to change.
 *
 * That guard exists because the failure mode of a placeholder is asymmetric. A
 * price that is too low is quoted back at you by every prospect and cannot be
 * un-published from anyone's memory; a missing price costs one enquiry form
 * submission. `null` is the safe default and stays safe if this is ever
 * deployed in a hurry.
 *
 * ## Why this page exists at all
 *
 * "Cost", "price" and "affordable" appear in the URL or title of nearly every
 * page ranking for SEO and web development in Nepal, and this site published
 * no pricing anywhere. It is the one content gap the 2026-10-03 audit called
 * out as both proven and unaddressed: the query cluster is commercial, the
 * intent is late-stage, and a competitor with fewer case studies can outrank a
 * better one simply by answering the question the visitor actually typed.
 *
 * ## How the numbers are structured
 *
 * Two shapes, because the market prices two shapes:
 *
 *  - **One-off** — a build with a defined end. Priced as a project.
 *  - **Monthly** — ongoing work with no end date. Priced as a retainer, and
 *    the price excludes ad spend, which is paid to Google or Meta directly and
 *    is not revenue. Saying that plainly on the page prevents the single most
 *    common misunderstanding in this niche.
 *
 * `includes` is drawn from the same capabilities the service pages already
 * claim, so the two cannot describe different work. `timeline` is only set
 * where a project genuinely has a typical duration; a retainer has none.
 */

export interface PricingTier {
  /** Stable key. Also what the `Offer` schema uses. */
  id: string;
  name: string;
  /** The matching page under `/services`, for internal linking. */
  serviceSlug?: string;
  /**
   * Starting price in Nepali rupees, or `null` to render
   * "Contact for a quote". Never a placeholder string — see the module note.
   */
  fromNpr: number | null;
  /** "one-off" or "per month". Rendered beside the price. */
  unit: string;
  summary: string;
  includes: string[];
  /** Typical duration. Omitted where the work has no defined end. */
  timeline?: string;
  /**
   * True when the figure excludes something the reader would otherwise assume
   * is included — ad spend, third-party costs. Rendered as a visible caveat
   * rather than buried in the paragraph.
   */
  excludesSpend?: boolean;
}

export const oneOffTiers: PricingTier[] = [
  {
    id: 'web-development',
    name: 'Website or web application',
    serviceSlug: 'web-development',
    fromNpr: null,
    unit: 'one-off',
    summary:
      'A marketing site, a web application or an online store, built to load fast on the phones your visitors actually use.',
    includes: [
      'React or Next.js build, or WordPress / Shopify where you need to edit it yourself',
      'Responsive layouts tested on mid-range Android, not just a desktop browser',
      'On-page SEO as part of the build, not as a later fix',
      'Analytics and conversion tracking wired up and verified',
      'Structured data for your business and the pages that need it',
      'Handover notes and a walkthrough of how to edit your own content',
    ],
    timeline: 'Typically 3–8 weeks depending on scope',
  },
  {
    id: 'ecommerce-build',
    name: 'Ecommerce store',
    serviceSlug: 'ecommerce-growth',
    fromNpr: null,
    unit: 'one-off',
    summary:
      'A store built on Shopify or WooCommerce, with the product and category structure that search engines can actually read.',
    includes: [
      'Shopify or WooCommerce setup and theme work',
      'Product and category page structure built for search',
      'Checkout and payment configuration',
      'Product schema and a clean, crawlable category hierarchy',
      'Conversion tracking verified against a real test order',
    ],
    timeline: 'Typically 4–10 weeks depending on catalogue size',
  },
  {
    id: 'seo-audit',
    name: 'SEO audit',
    serviceSlug: 'seo',
    fromNpr: null,
    unit: 'one-off',
    summary:
      'A written technical and content audit of an existing site, ordered by what is worth doing first.',
    includes: [
      'Crawlability, indexation and rendering checks',
      'Page focus and internal linking review',
      'Core Web Vitals and mobile performance',
      'Schema and structured data review',
      'A prioritised action list, sequenced by impact rather than by category',
    ],
    timeline: 'Typically 1–2 weeks',
  },
];

export const monthlyTiers: PricingTier[] = [
  {
    id: 'seo',
    name: 'SEO retainer',
    serviceSlug: 'seo',
    fromNpr: null,
    unit: 'per month',
    summary:
      'Ongoing technical, on-page and content work for a site that already exists, reported against rankings and enquiries.',
    includes: [
      'Technical SEO maintenance and fixes',
      'Keyword research and page-level targeting',
      'On-page work on existing pages',
      'Content planning and briefs',
      'Internal linking',
      'A monthly report on rankings, traffic and enquiries',
    ],
  },
  {
    id: 'google-ads',
    name: 'Google Ads management',
    serviceSlug: 'google-ads',
    fromNpr: null,
    unit: 'per month',
    summary:
      'Search, Display, YouTube and remarketing campaigns, managed against conversions rather than impressions.',
    includes: [
      'Account structure and keyword strategy',
      'Ad copy writing and testing',
      'Negative keyword maintenance',
      'Conversion tracking setup and verification',
      'Landing page recommendations',
      'Monthly reporting against cost per conversion',
    ],
    excludesSpend: true,
  },
  {
    id: 'meta-ads',
    name: 'Meta Ads management',
    serviceSlug: 'meta-ads',
    fromNpr: null,
    unit: 'per month',
    summary:
      'Facebook and Instagram campaigns built around audience structure, disciplined creative testing and tracking that is actually correct.',
    includes: [
      'Audience structure and campaign setup',
      'Creative testing in controlled batches',
      'Meta Pixel and event setup, verified',
      'Retargeting for people who already engaged',
      'Monthly reporting against cost per result',
    ],
    excludesSpend: true,
  },
  {
    id: 'digital-marketing',
    name: 'Digital marketing retainer',
    serviceSlug: 'digital-marketing',
    fromNpr: null,
    unit: 'per month',
    summary:
      'Search, paid media, content and conversion held in one plan, for a business that would otherwise be coordinating four separate people.',
    includes: [
      'One plan across search, ads and content',
      'Channel budget allocation',
      'Conversion work on the pages those channels land on',
      'Analytics you can trust before any of it is optimised',
      'A monthly review of what to keep and what to cut',
    ],
  },
  {
    id: 'ai-search',
    name: 'AI search visibility',
    serviceSlug: 'ai-search',
    fromNpr: null,
    unit: 'per month',
    summary:
      'Work on whether AI Overviews, ChatGPT and Perplexity mention or cite your business when someone asks about your services.',
    includes: [
      'AI crawler access and technical readiness',
      'Citable passage structure across key pages',
      'Entity and brand signal work',
      'Structured data review',
      'Monitoring of what AI systems currently say about you',
    ],
  },
];

/**
 * What actually moves the number, in the order it usually moves it.
 *
 * Written as questions because that is how the query is phrased and how an
 * answer engine extracts a passage. Every factor here is real and visible from
 * outside the project — none of it is a reason invented to justify a quote.
 */
export const pricingFactors: { question: string; answer: string }[] = [
  {
    question: 'What changes the price of a website in Nepal?',
    answer:
      'Three things, in order. How many distinct page templates there are, because a five-page marketing site and a booking system with accounts are not the same job even when both are "a website". Whether anything is custom, since a theme configured well costs a fraction of a bespoke interface. And who edits it after launch, because a site the owner can update themselves needs a different build than one that comes back to me for every text change.',
  },
  {
    question: 'What changes the price of SEO?',
    answer:
      'The state of the site you already have, and how competitive your keywords are. A site that is crawlable and fast needs content and linking work; a site with an indexation problem needs that fixed before anything else is worth paying for, and the first month often produces no visible ranking movement because the work was foundational. Local keywords in a single city are cheaper to rank for than national ecommerce terms, which is the honest reason two businesses can be quoted differently for what sounds like the same service.',
  },
  {
    question: 'Is ad spend included in the management fee?',
    answer:
      'No, and this is the most common misunderstanding in the market. The management fee pays for the work; the ad budget is paid directly to Google or Meta and is entirely separate. A monthly management fee plus a monthly ad budget are two different numbers, and a proposal that merges them is usually hiding one of them.',
  },
  {
    question: 'Do you charge less for a smaller project?',
    answer:
      'Yes, but only to the point where the work is still worth doing properly. The floor is set by what a project needs to be finished and maintained, not by what a client can afford, and a discount that removes the testing or the tracking produces a site that looks finished and does not perform. Where the budget genuinely does not fit, the honest answer is a smaller scope rather than the same scope for less.',
  },
];

/**
 * Renders a starting price, or the fallback when none is set.
 *
 * Nepal groups digits in lakhs and crores, not thousands, so `en-IN` is used
 * rather than `en-US` — "NPR 1,50,000" is what a reader here expects and
 * "NPR 150,000" reads as foreign. The currency code is written explicitly
 * rather than using `style: 'currency'`, which would emit "NPR" only in
 * locales that define it and fall back to a bare number in the rest.
 */
export function formatNpr(amount: number | null): string | null {
  if (amount === null) return null;
  return `NPR ${new Intl.NumberFormat('en-IN').format(amount)}`;
}

/** True when at least one real price exists, so the page can drop its caveat. */
export const hasPublishedPrices = [...oneOffTiers, ...monthlyTiers].some(
  (tier) => tier.fromNpr !== null,
);
