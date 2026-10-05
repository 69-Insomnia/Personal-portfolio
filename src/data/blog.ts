import type { BlogPost } from '@/types';

/**
 * Articles. Written from real project work: no invented metrics, no client
 * results that cannot be stood behind.
 *
 * Two conventions in the `content` array:
 *
 *  - A block beginning with `## ` renders as an `<h2>` rather than a paragraph.
 *    See `ArticleBody`. These posts previously shipped as ~350 words of
 *    unbroken prose with no subheadings at all, which gave a reader no
 *    signposts and left an answer engine nothing to chunk on beyond the
 *    paragraphs themselves.
 *
 *  - `readingTime` is the real figure: the body's word count divided by a
 *    deliberately conservative 200 words per minute, rounded up. Every one of
 *    these was previously overstated by two to three times its actual length —
 *    "5 min read" on a 356-word post a reader can finish in under two. A number
 *    a visitor can falsify in ten seconds is not worth the small flattery.
 *    Recount it when the body changes.
 */
export const blogPosts: BlogPost[] = [
  {
    slug: 'technical-seo-foundations',
    title: 'Before You Write Another Blog Post, Fix These Technical Basics',
    excerpt:
      'Sites that "need more content" usually need their existing pages to be crawlable, fast and unambiguous first. Here is the order I check things in, and why content comes last.',
    category: 'SEO',
    date: '12 September 2026',
    readingTime: '3 min read',
    image: '/images/blog-technical-seo-foundations.png',
    tags: ['Technical SEO', 'Core Web Vitals', 'Search Console'],
    content: [
      'Every few weeks someone asks me to look at a site that has stopped ranking, and the assumption is always the same: we need more content. Usually we do not. Usually there are eight or ten existing pages that a search engine cannot read properly, and adding a ninth does not fix that.',
      '## Start With Whether Google Can Read the Page',
      'So I start at the bottom. Can Google fetch the page at all? I check robots.txt, then the rendered HTML rather than the source, because a lot of modern builds ship an empty shell and fill it in with JavaScript. If the content only exists after hydration, you are asking the crawler to do extra work and hoping it bothers.',
      '## One Page, One Job',
      'Next, is each page about one thing? A page trying to rank for web design, SEO, ads and ecommerce at once ranks for none of them well. I map pages to the searches they should own, then look for the ones that overlap. Two pages chasing the same query compete with each other, and the fix is usually to merge them rather than write a third.',
      '## Metadata, Which Is the Cheapest Thing on This List',
      'Then metadata, which is also the most commonly neglected. A title should say what the page is and where you are, not just repeat the brand. A title tag is often the highest-leverage line on a page and usually the last one anyone updates.',
      '## Structured Data, and One Thing to Be Careful About',
      'Structured data comes after that. It will not rank a page on its own, but it changes how the result looks, and better-looking results get clicked. Organization and WebSite cover most business sites, and a service or product page should describe the actual thing it sells. The one worth being careful with is FAQPage: Google stopped showing FAQ rich results for most sites, so marking up a block of questions no longer buys anything in the result. It is not harmful, but it is not the win it is often sold as, and those questions are better spent as real headings in the page copy where a reader will actually see them.',
      '## Speed, Measured on Real Phones',
      'Finally, speed. Not the number in a lab test, the number real visitors get. I look at field data for Core Web Vitals, find the slowest page that also gets traffic, and fix that one first instead of chasing a perfect score across the whole site.',
      '## Why the Order Matters',
      'The order matters. Content is the last lever, not the first, because content on a site that cannot be crawled or understood just adds to the pile.',
    ],
  },
  {
    slug: 'whatsapp-booking-site',
    title: 'Why I Put WhatsApp at the Centre of a Booking Site',
    excerpt:
      'A booking form asks a guest to trust a strange site with their dates. WhatsApp asks them to do what they already do all day. On a recent hospitality build the second option was the obvious one.',
    category: 'Web Development',
    date: '28 August 2026',
    readingTime: '2 min read',
    image: '/images/blog-whatsapp-booking-site.png',
    tags: ['Web Development', 'Mobile First', 'Conversion'],
    content: [
      'The brief was a booking website for a serviced apartment residence in Lakeside, Pokhara, and the first wireframe I drew had a form on it. Dates, guests, name, email, submit. That is what booking websites look like.',
      '## Who Is Actually Booking',
      'Then I thought about who actually books a short stay in a place like that. They are on a phone, often already travelling or about to, and they have a question a form cannot answer: is the room I am looking at free on the dates I want, and can I see the actual room first?',
      '## A Form Hides. A Conversation Does Not.',
      'A form hides behind a submit button. You fill it in, you wait, and you find out later. WhatsApp is a conversation. You ask, someone answers, and they can send you a photo of the room.',
      'So the reservation path became a single tap. No account, no email confirmation loop, no form validation errors on a phone keyboard at eleven at night.',
      '## What That Changed About the Build',
      'That decision shaped the rest of the build. If the enquiry happens in a chat, the site has one job: get someone to that tap with enough confidence to make it. Which means the apartments have to be comparable without clicking through, so three types sit side by side with their own photographs, a plain-language summary, the amenities that matter, and a from-price per night.',
      'Mobile-first stopped being a slogan and became the layout constraint. Photographs sized for a phone screen, an amenities section that scans, a gallery, and a booking button that stays reachable as you scroll.',
      '## When a Checkout Beats a Conversation',
      'Not every business should do this. Sell something with a fixed price and no variables and a checkout will always beat a conversation. But anywhere the customer has a question before they commit, moving that conversation earlier in the flow is usually the right call.',
    ],
  },
  {
    slug: 'ecommerce-one-system',
    title: 'Ecommerce Is One System, Not Four Channels',
    excerpt:
      'The storefront, the search result, the ad and the report get optimised in separate rooms by separate people. The customer only ever experiences them together.',
    category: 'Ecommerce',
    date: '9 August 2026',
    readingTime: '2 min read',
    image: '/images/blog-ecommerce-one-system.png',
    tags: ['Ecommerce', 'Analytics', 'Conversion'],
    content: [
      'Most ecommerce problems arrive described as one problem. Traffic is down. Conversion is down. Ad costs are up. In practice they are usually the same problem wearing different hats.',
      '## One Problem Wearing Four Hats',
      'Take a product page that loads in four seconds on mobile. The SEO person sees a Core Web Vitals issue. The ads person sees a landing page with a high bounce rate and blames the audience. The merchandiser sees a product nobody buys. All three are looking at the same page and none of them are wrong, which is exactly why nobody fixes it.',
      '## Where the Drop Actually Happens',
      'So I try to hold the whole funnel in one view, from the first search to the repeat order, and ask where the drop actually happens. Sometimes it is the page. Sometimes it is the query that brought them there, which means the page is promising something the product does not deliver.',
      '## The Unglamorous Questions',
      'The useful questions are unglamorous. Which products get views but no carts? Which queries land on a page that does not answer them? Which ad sends traffic to a category page when the customer wanted one specific item? Those answers usually point at a fix that costs nothing to ship.',
      '## Fix the Tracking Before Optimising Anything',
      'Analytics has to be trustworthy before any of this works. If the purchase event fires twice, or never fires on mobile, every decision downstream is made against a number that is wrong. I would rather spend a week fixing tracking than a month optimising against bad data.',
      '## Not a Channel Strategy',
      'None of this is a channel strategy. It is just refusing to treat the storefront, the search result, the ad and the report as separate businesses, because the customer never does.',
    ],
  },
];

export const blogCategories = [
  'Web Development',
  'SEO',
  'Google Ads',
  'Meta Ads',
  'Ecommerce',
  'Digital Marketing',
  'Technology',
  'Tutorials',
] as const;

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(post: BlogPost, limit = 2): BlogPost[] {
  return blogPosts.filter((item) => item.slug !== post.slug).slice(0, limit);
}
