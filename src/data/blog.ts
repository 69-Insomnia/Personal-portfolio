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
    slug: 'how-to-grow-ecommerce-in-nepal-2026',
    title: 'How to Grow Ecommerce in Nepal in 2026: The Complete Step-by-Step Guide',
    excerpt:
      'To grow an ecommerce business in Nepal in 2026, build a mobile-first store, accept local payments, improve delivery, win trust, and rank for Nepali and English searches.',
    category: 'Ecommerce',
    date: '1 November 2026',
    readingTime: '12 min read',
    image: '/images/blog-ecommerce-one-system.png',
    tags: ['Ecommerce', 'Nepal', 'SEO', 'Digital Marketing'],
    content: [
      'Nepal is one of the fastest-moving ecommerce opportunities in South Asia because the market is still early, mobile-first and highly trust driven. Most shoppers are still buying offline, which means the businesses that get the basics right can grow quickly without needing a giant budget.',
      '## 1. Why Nepal\'s ecommerce market is growing',
      'The country has a large and increasingly digital population, strong smartphone adoption and growing comfort with wallet apps and online transactions. At the same time, most retail still happens offline, so the opportunity is not saturation — it is a market that is still finding its shape.',
      'Fast-growing categories include electronics, fashion, home goods, wellness products, daily essentials and hobby items. The winners are usually the businesses that combine good mobile experiences, clear pricing, trust and local delivery.',
      '## 2. Understand the Nepali online shopper',
      'Your audience is often mobile-only, price-conscious and skeptical until they see proof. That means the store needs to feel simple, honest and useful on a 4G connection. Shoppers compare prices across Daraz, Facebook and local stores, and they are especially careful about product authenticity, damaged deliveries and refund issues.',
      'Language matters too. Many people search in English, Nepali and Romanized Nepali. A page that speaks only to one version of the market leaves revenue on the table. A good ecommerce business in Nepal should answer common questions in a way that feels local and clear.',
      '## 3. Build a mobile-first online store',
      'Your website is the engine of growth. It should load fast, show prices clearly and make checkout simple. A product page needs large, real photos, honest descriptions, delivery information and a clear return policy before the customer even reaches the cart.',
      'The best setup for many sellers is a custom website plus one marketplace. A marketplace gives reach; your own website gives margin and customer data. Use the marketplace to win awareness and your site to convert more efficiently and build a relationship you own.',
      '## 4. Offer the payment methods people actually use',
      'If you want to win in Nepal, you need payment options that fit the market. The strongest setup is a mix of eSewa, Khalti, Fonepay and cash on delivery. For many buyers, COD still matters because trust is the first barrier, not the final one.',
      'Use a small discount for prepaid orders, confirm COD orders by phone or WhatsApp and keep a close eye on return-to-origin orders by city or courier. That lets you make the channel smoother without avoiding the method entirely.',
      '## 5. Solve delivery and logistics',
      'Delivery is often where a good product turns into a bad customer experience. Use at least two courier partners, be realistic about timing and always share shipping updates. Same-day or next-day service works in Kathmandu Valley, while outside the valley, a more realistic 2 to 5 day range is often healthier than overpromising.',
      'Packing quality matters just as much as shipping speed. Damaged products create refunds, complaints and lost trust. In time, opening a small fulfillment point in Pokhara, Biratnagar, Butwal or Chitwan can unlock stronger growth in regional cities.',
      '## 6. Use social commerce to drive demand',
      'In Nepal, social media often starts the buying journey. Facebook, Instagram and TikTok are not just brand channels — they are frequently the front door. Use short product videos, real use cases, before-and-after content and customer comments to create trust quickly.',
      'The goal is not to stay forever on social media. It is to move the buyer to your website, WhatsApp or email list where you own the relationship. That makes the channel more efficient and less dependent on one platform.',
      '## 7. Rank on Google with local SEO',
      'SEO pays off best when you target the exact queries buyers already use. Examples include "buy [product] online in Nepal", "best [product] price in Nepal" and "[product] in Kathmandu". Add local variants in Nepali and Romanized Nepali so you capture both language patterns.',
      'On-page basics matter: one clear H1 per page, unique product descriptions, strong image alt text, internal linking, clean URLs and proper local business information. Create and complete your Google Business Profile, keep your details consistent across the web and ask happy customers for Google reviews.',
      '## 8. Get found in AI search and answer engines',
      'AI search is changing how people discover products. Searchers increasingly ask direct questions like "What payment methods work in Nepal?" or "Which ecommerce platform is best for a local store?" Pages that answer clearly, use question-style headings and include practical, source-backed details have a better chance of being surfaced.',
      'The best AI-friendly pages are structured, specific and useful. They answer early, cite credible information and show real business details such as author identity, location and service information.',
      '## 9. Build trust before you scale spend',
      'Trust is the biggest growth lever in Nepali ecommerce. Customers want proof before they buy. Use real reviews with photos, display your PAN or VAT information, show a clear return policy and be quick to respond to complaints.',
      'One well-handled issue can build trust more than ten perfect ads. That is why honest, polished service and clear shipping information matter as much as marketing.',
      '## 10. Run the right campaigns and measure the right metrics',
      'Plan seasonal campaigns around Dashain, Tihar, wedding season and New Year sales. Send order updates, restock alerts and WhatsApp reminders to customers who already are interested. Referral bonuses and loyalty offers can improve repeat purchases without making the brand look discount-driven.',
      'The metric mix matters. Track conversion rate, cart abandonment, cost per acquisition, COD rejection rate and repeat purchase rate. If a channel brings traffic but nothing converts, it is not a winning channel yet.',
      '## 11. Follow the legal and tax basics',
      'Keep your registrations, PAN, VAT obligations and billing records in order. If you are importing products or dealing with cross-border sales, check customs and foreign-exchange requirements with official sources or a qualified accountant. Compliance is not glamorous, but it protects scale.',
      '## Your 90-day action plan',
      'In the first 30 days, fix your store, add local payment options and build your Google Business Profile. In the next 30 days, publish helpful articles, improve your top product pages and start small social campaigns. In the last 30 days, double down on the channels that convert and improve your fulfillment and follow-up process.',
      'The businesses that grow fastest are not the most complicated ones. They are the ones that make buying easy, remove friction and earn trust one order at a time.',
    ],
    faqs: [
      {
        question: 'Is ecommerce profitable in Nepal in 2026?',
        answer:
          'Yes, it can be. The biggest opportunities are for businesses that combine local payment support, strong mobile UX, realistic delivery and trust-building content.',
      },
      {
        question: 'What is the best payment method for an online store in Nepal?',
        answer:
          'Offer several. eSewa, Khalti and Fonepay cover most digital payers, while cash on delivery remains important for customers who still prefer to pay after receiving the order.',
      },
      {
        question: 'How can I get more customers outside Kathmandu?',
        answer:
          'Improve delivery coverage, offer prepaid discounts, write local-language content and run city-targeted ads for growing markets like Pokhara, Biratnagar and Butwal.',
      },
      {
        question: 'How long does SEO take to work in Nepal?',
        answer:
          'Usually 3 to 6 months for meaningful search growth, depending on the product category, keyword competition and content quality.',
      },
    ],
  },
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
    faqs: [
      {
        question: 'What should I check before writing more content?',
        answer:
          'Check that existing pages can be crawled and read in the rendered HTML, then review page focus, metadata, structured data and real-phone performance.',
      },
      {
        question: 'What is the recommended order for technical SEO checks?',
        answer:
          'Start with crawlability and rendering, then check whether each page has one clear job, review metadata and structured data, and assess speed using field data where available.',
      },
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
    faqs: [
      {
        question: 'When is WhatsApp a useful booking option?',
        answer:
          'It suits bookings where a guest has questions before committing, such as checking availability or asking to see a room. A direct conversation can answer those questions before the booking decision.',
      },
      {
        question: 'When is a checkout better than a conversation?',
        answer:
          'For a product with a fixed price and no variables, a checkout is the better route. A conversation is more useful when customers need answers before they can commit.',
      },
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
    faqs: [
      {
        question: 'Why treat ecommerce as one system instead of separate channels?',
        answer:
          'Customers experience the storefront, search result, ads and reporting together. A problem on one product page can affect search, ad performance and conversion at the same time.',
      },
      {
        question: 'What should be checked before optimizing ecommerce campaigns?',
        answer:
          'Verify that analytics events, especially purchase tracking, fire correctly across devices. Campaign decisions made from duplicate or missing events rely on inaccurate data.',
      },
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
