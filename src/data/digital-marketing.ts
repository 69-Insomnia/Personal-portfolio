/**
 * Everything the retargeted `/services/digital-marketing` page publishes that
 * is pinned to this one URL rather than read from the database.
 *
 * Every other service renders from `seo_meta`, but this page targets a single
 * keyword pair — "digital marketing expert in Nepal" (primary) and "digital
 * marketing expert in Kathmandu" (secondary) — so its title, description, H1,
 * side note, FAQ set and schema identity live here, where a diff shows them.
 * Two consumers import this module:
 *
 * - `src/app/services/[slug]/page.tsx` — the head tags, the H1, the side
 *   note, the breadcrumb crumb, the About line and the page-scoped JSON-LD
 *   nodes, all behind a `slug === DM_SLUG` check so the other services keep
 *   rendering from the database unchanged.
 * - `scripts/sync-digital-marketing-seo.ts` — pushes the same strings into
 *   the `seo_meta` row so the admin panel cannot quote different metadata for
 *   this URL. Where the two ever disagree, these constants win: the page
 *   spreads them over the resolved SEO data after the database merge.
 *
 * Nothing here is a statistic, a review or a client result. The two results
 * placeholders in the body live in `src/data/services.ts`, clearly marked for
 * the site owner to fill in.
 */

export const DM_SLUG = 'digital-marketing';

/** 65 characters — inside `clampTitle`'s 72, so it ships verbatim. */
export const DM_TITLE =
  'Digital Marketing Expert in Nepal & Kathmandu | Dipendra Guragain';

/**
 * 158 characters — under the brief's 160 cap and inside `clampDescription`'s
 * 140-170 window, so neither clamp rewrites it. The brief's own draft ran 171
 * characters (which the clamp would have truncated); "planned " and the
 * "+977-" prefix were dropped to fit, which is the only change from that text.
 */
export const DM_DESCRIPTION =
  'Digital marketing expert in Nepal, based in Kathmandu. SEO, Google & Meta Ads, content and conversion as one strategy. Free first review. WhatsApp 9840814142.';

/** The single H1, also the last breadcrumb crumb and the WebPage name. */
export const DM_H1 = 'Digital Marketing Expert in Nepal (Kathmandu)';

/** The coral-ruled side note under the H1 — the short version of the page. */
export const DM_SIDE_NOTE =
  'Digital marketing expert in Kathmandu, Nepal: SEO, Google Ads, Meta Ads, content and conversion run as one strategy with one monthly report.';

/** Alt text for the social card, as specified by the brief. */
export const DM_IMAGE_ALT =
  'Digital Marketing Expert in Nepal and Kathmandu – Dipendra Guragain';

/** Short crumb: the H1 reads as a sentence in a trail, this does not. */
export const DM_BREADCRUMB = 'Digital Marketing';

/** The "About the Expert" accent line, which reads `Web Development Expert…` on every other service page. */
export const DM_ABOUT_LINE = 'Digital Marketing Expert in Kathmandu, Nepal';

export const DM_JOB_TITLE = 'Digital Marketing Expert';

/** The six terms the brief specified for this page's `Person` node. */
export const DM_KNOWS_ABOUT = [
  'digital marketing',
  'SEO',
  'Google Ads',
  'Meta Ads',
  'conversion optimisation',
  'AI search optimisation',
];

export const DM_KEYWORDS = [
  'digital marketing expert in Nepal',
  'digital marketing expert in Kathmandu',
  'digital marketing Nepal',
  'digital marketing Kathmandu',
  'digital marketing services Nepal',
  'SEO services in Kathmandu',
  'Google Ads management in Nepal',
  'freelance digital marketing expert Nepal',
];

/** The first-person line under the name in the About card. */
export const DM_AUTHOR_SUMMARY =
  'I run strategy and execution from the same desk: one plan across search, ads, content and conversion, one tracking setup, and one monthly report on enquiries, sales and cost per result. Based in Kathmandu, working with businesses across Nepal.';

/** `serviceType` for this page's `Service` node — the category, not the page title. */
export const DM_SERVICE_TYPE = 'Digital marketing';

/**
 * The passage the `ai_answer` field publishes — the same text `AnswerBlock`
 * renders visibly under the Overview, so the structured answer and the page
 * answer cannot drift apart. Answer-first and front-loaded, because most AI
 * citations are pulled from the first third of a page.
 */
export const DM_AI_ANSWER =
  'Dipendra Guragain is a digital marketing expert based in Kathmandu who helps businesses get more enquiries and sales from Google search, Google Ads, Meta Ads, content and conversion optimisation. One strategy, one tracking setup and one monthly report instead of four separate suppliers. Work starts with a 2-3 week audit, then runs at NPR 15,000 per month, with ad budget paid directly to Google and Meta. The DrillThru case study shows what was changed and what happened next.';

/** Plain-language entity summary used by `/llms.txt` and AI-oriented tooling. */
export const DM_LLM_SUMMARY =
  'Digital marketing service for Nepal businesses, delivered by Dipendra Guragain from Kathmandu. Covers SEO, Google Ads, Meta Ads, content and conversion optimisation with a 2-3 week audit and ongoing monthly work starting at NPR 15,000, excluding separately paid ad budgets.';

/**
 * The nine visible FAQs — the four this page already had (with the price
 * conflict fixed and "specialist" renamed to "expert") plus the five the
 * brief asked for.
 *
 * `faqPageNode` builds its `FAQPage` node from this exact array, which is
 * what keeps the schema's text identical to the visible text `FaqBlock`
 * renders — a mismatch between the two is treated by search engines as a
 * claim the page does not support. Every answer is 40-70 words and starts
 * with the answer itself.
 */
export const DM_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: 'What does a digital marketing expert do?',
    answer:
      'A digital marketing expert plans and runs the channels that bring customers to a business online: content, search engine optimization, paid media and conversion improvement. I treat them as one strategy, so each channel supports the others and the whole effort is judged on enquiries and sales rather than clicks.',
  },
  {
    question: 'Why combine content, SEO, paid media and conversion?',
    answer:
      'They only pay off together. An ad that sends traffic to a page that does not answer the query wastes the budget, and a page nobody can find wastes the writing. Planning them as one system also gives you a single report instead of four that disagree.',
  },
  {
    question: 'Why should Nepali businesses start with search?',
    answer:
      'Search captures demand that already exists, and it is the cheapest demand to win. Paid media then reaches people who are not searching yet, and conversion work stops both channels from leaking visitors. Starting with search gives you the clearest picture of what customers actually want.',
  },
  {
    question: 'How much does digital marketing cost in Nepal?',
    answer:
      'Digital marketing with me is NPR 15,000 per month, covering the 2-3 week audit and strategy first and then the ongoing monthly work. Your ad budget is separate and is paid directly to Google and Meta. The audit settles which channels you actually need before anything is committed.',
  },
  {
    question: 'Who is the best digital marketing expert in Nepal?',
    answer:
      'The best digital marketing expert in Nepal ties every channel to enquiries and sales, shows real case studies rather than impressions, and reports on one set of numbers you can check. That is how I work — the DrillThru case study shows what was changed and what happened next, in the same format I would report for you.',
  },
  {
    question: 'How do I hire a digital marketing expert in Kathmandu?',
    answer:
      'Send a short brief through the contact page or WhatsApp 9840814142. I reply with what I would look at first, then a 2-3 week audit so the strategy is based on your real data. You get one plan and one price — NPR 15,000 per month — before any ongoing work starts.',
  },
  {
    question: 'Should I hire a freelance digital marketing expert or an agency in Nepal?',
    answer:
      'If you want one person accountable for the numbers rather than an account manager relaying them, hire a freelance digital marketing expert in Nepal. An agency suits businesses that need several specialists at once and a bigger team. As a freelancer I run strategy and execution myself, so nothing is lost between handovers.',
  },
  {
    question: 'How long does digital marketing take to show results in Nepal?',
    answer:
      'Paid ads on Google and Meta can bring enquiries within weeks of going live, because you are buying demand that already exists. SEO and content take roughly three to six months to rank and compound. The 2-3 week audit sets the realistic timeline for your market, and the monthly review tracks against it.',
  },
  {
    question: 'Do you work with businesses outside Kathmandu?',
    answer:
      'Yes. I work remotely across Nepal with businesses in Lalitpur, Bhaktapur, Pokhara, Biratnagar, Chitwan and elsewhere. Everything runs over WhatsApp, email and scheduled calls, and the audit and monthly report work the same way they would if you were sitting across the table in Kathmandu.',
  },
];

/**
 * The glossary terms for this page's `entity_signals.definedTerms`.
 *
 * The first term used to be "Digital marketing specialist:", which is both
 * the phrase this retarget replaces and a definition the page no longer uses
 * to describe its author. The other two terms were already accurate and are
 * restated here only because the field is replaced wholesale.
 */
export const DM_DEFINED_TERMS = [
  {
    name: 'Digital marketing expert:',
    description:
      'a professional who plans and runs online channels such as content, search, paid media and conversion improvement as one coordinated strategy.',
  },
  {
    name: 'Paid media:',
    description:
      'advertising you pay for, such as Google Ads and Meta Ads, used to reach people who are not yet searching for your product or service.',
  },
  {
    name: 'Conversion rate optimization (CRO):',
    description:
      'improving a website so a larger share of its visitors complete a desired action, such as buying a product or sending an enquiry.',
  },
];
