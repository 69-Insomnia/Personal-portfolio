import type { FAQ } from '@/types';

/**
 * The questions that actually arrive by email, in the order they tend to.
 *
 * Trimmed from nine. Three of the old ones (do you manage Meta Ads, do you
 * manage Google Ads, do you provide SEO) were variations on one question and
 * made the block feel padded rather than thorough.
 *
 * ## How these are written
 *
 * Each answer is two or three sentences, and the first sentence answers the
 * question rather than introducing it. That shape is deliberate: it is what a
 * featured snippet and an AI answer engine extract, and a paragraph that only
 * makes sense beneath the question above it cannot be quoted.
 *
 * The same array is rendered on the page and published as the `FAQPage`
 * node — see `faqPageNode` in `src/lib/structured-data.ts`. One copy of the
 * text means the visible questions and the structured data cannot disagree.
 *
 * **[ADD DETAIL] markers are places a real figure belongs.** No price, timeline
 * or result is invented here. An unsourced claim on a page selling measurement
 * is the first thing a careful buyer checks, and it is the one thing the site's
 * own audit warns against.
 */
export const faqs: FAQ[] = [
  {
    question: 'What services do you provide?',
    answer:
      'Ecommerce growth work: store audits, ecommerce SEO, Meta and Google Ads, conversion optimisation and email marketing. Most engagements use three or four of those together, because they only pay off when they are planned as one funnel rather than four separate projects.',
  },
  {
    question: 'Do you build custom websites, or work with WordPress and Shopify?',
    answer:
      'Both, and the choice follows the job. Shopify or WooCommerce when someone other than me has to edit the store afterwards; React or Next.js when the project needs to be fast and bespoke. A store build starts from NPR [ADD DETAIL: price].',
  },
  {
    question: 'Do you work with ecommerce businesses?',
    answer:
      'Yes, and it is where most of my work sits. Storefront, product pages, search visibility, paid ads and analytics are treated as one funnel, and the reporting is against revenue rather than traffic or impressions.',
  },
  {
    question: 'Can you improve a website that already exists?',
    answer:
      'Often that is the whole job. Performance, search visibility and the conversion path are reviewed first, then I tell you which changes are worth making and which would only feel productive. A standalone audit starts from NPR [ADD DETAIL: price].',
  },
  {
    question: 'Do you manage paid ads?',
    answer:
      'Meta and Google, including audience structure, creative testing, retargeting and conversion tracking. Tracking is usually fixed before more budget is spent, because a reported cost per purchase that is wrong by half sends the budget to the campaign that is losing money.',
  },
  {
    question: 'Can you work with clients outside Nepal?',
    answer:
      'Yes. I work remotely with stores outside Nepal and am used to running projects over written updates rather than meetings, which suits most time-zone gaps. Nepal-based clients are served the same way, from Kathmandu.',
  },
  {
    question: 'How do I start a project with you?',
    answer:
      'Send a short note through the contact form or on WhatsApp describing the store and the problem. You will get a reply with the questions I still need answered and a suggested first step — usually an audit before anything is changed.',
  },
];
