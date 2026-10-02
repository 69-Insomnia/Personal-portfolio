import type { FAQ } from '@/types';

/**
 * The questions that actually arrive by email, in the order they tend to.
 *
 * Trimmed from nine. Three of the old ones (do you manage Meta Ads, do you
 * manage Google Ads, do you provide SEO) were variations on one question and
 * made the block feel padded rather than thorough.
 */
export const faqs: FAQ[] = [
  {
    question: 'What services do you provide?',
    answer:
      'Web development, SEO, paid ads and ecommerce work. Most projects use three or four of those together, which is usually the point: they only pay off when they are planned as one thing.',
  },
  {
    question: 'Do you build custom websites, or work with WordPress and Shopify?',
    answer:
      'Both, and the choice follows the job. React and Next.js when the project needs to be fast and bespoke; WordPress, Shopify or WooCommerce when someone other than me has to edit it afterwards.',
  },
  {
    question: 'Do you work with ecommerce businesses?',
    answer:
      'Yes, and it is where most of my work sits. Storefront, product pages, search visibility, ads and analytics, treated as one funnel rather than four separate projects.',
  },
  {
    question: 'Can you improve a website that already exists?',
    answer:
      'Often that is the whole job. I look at performance, search and the conversion path first, then tell you which changes are worth making and which ones would just feel productive.',
  },
  {
    question: 'Do you manage paid ads?',
    answer:
      'Meta and Google, including audience structure, creative testing, retargeting and conversion tracking. I will usually want to fix tracking before we spend more budget.',
  },
  {
    question: 'Can you work with clients outside Nepal?',
    answer:
      'Yes. I work remotely and I am used to running projects over written updates rather than meetings, which suits most time-zone gaps fine.',
  },
  {
    question: 'How do I start a project with you?',
    answer:
      'Send a short note through the contact form or by email describing what you are trying to build or fix. You will get a reply with the questions I still need answered and a suggested first step.',
  },
];
