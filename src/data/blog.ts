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
    slug: 'meta-ads-whatsapp-chats-nepal',
    title: 'Meta Ads That Start WhatsApp Chats for $0.09 in Nepal',
    excerpt:
      'Three boosted reels for a Kathmandu camera store started 306 WhatsApp conversations for about $22 in ad spend. Here is how those messaging campaigns are built, what each number means, and how to decide which ad to scale.',
    category: 'Meta Ads',
    date: '30 October 2026',
    readingTime: '8 min read',
    image: '/og-image.png',
    tags: ['Meta Ads', 'WhatsApp Marketing', 'Ecommerce', 'Nepal', 'Paid Social'],
    content: [
      'Most Meta Ads advice is written for someone with a big budget and a credit-card funnel. This is not that. This is three boosted reels for a camera store in Kathmandu that sells DJI gear with cash on delivery all over Nepal, where the whole point of the ad is to start a WhatsApp conversation \u2014 because that is where the sale actually happens.',
      '## The result, up front',
      'Across the three campaigns the store ran in October, the ads were seen 46,315 times and started 306 WhatsApp conversations. Total spend was $22.62, which works out to roughly $0.07 per conversation across all three, with the single active campaign sitting at $0.09. That was on a $5-a-day budget. These are not cherry-picked numbers from a huge account; they are what a small, well-targeted messaging campaign returns when the creative and the offer line up.',
      '## What a messaging ad actually is',
      'When you build a campaign in Meta Ads Manager you pick an objective. Most people pick traffic or engagement, because those are the ones they have heard of. The objective that matters for a store like this one is Messages. A messages ad puts your product in someone\u2019s feed, and the call to action is a single tap that opens a WhatsApp, Messenger or Instagram chat with your business. No landing page, no form. The conversation is the conversion.',
      '## Why WhatsApp and not a landing page, in Nepal',
      'Because of cash on delivery. When a customer pays on delivery they are trusting a shop they have never met to send the right product to their door. That trust does not come from a product page; it comes from talking to a human. They want to ask whether the camera is genuine, if there is a warranty, whether it can reach Pokhara, and what the final price is with VAT. A WhatsApp chat answers all of that in thirty seconds. A checkout form answers none of it.',
      '## The three campaigns, and what they returned',
      'The active campaign, started on 30 October, advertised a DJI Osmo Action Camera. It spent $5.68 over two days, was viewed 14,053 times by 8,511 people, and started 60 messaging conversations at $0.09 each. Behind that headline sat 12,884 video plays, 4,921 post engagements, 93 link clicks and 83 reactions \u2014 signals that the creative was resonating, even though conversations were the only number that paid.',
      'The campaign started on 26 October promoted a wider range of DJI drones. It reached 22,792 views and 13,472 viewers and started 135 conversations for $10.64 spent. Meta flagged it with a nudge to scale, which is a good sign that the cost per conversation had earned more budget.',
      'The third campaign, from 8 October, covered DJI combos and action cameras. It drew 9,470 views from 6,172 viewers and started 111 conversations for $6.30, and now shows as not delivering. Whatever stopped it \u2014 a paused budget, an ended schedule, or simply fatigue \u2014 the lesson is the same: you judge a messaging campaign by its cost per conversation, not by the views it racked up along the way.',
      '## The numbers that matter, and the ones that do not',
      'Messaging conversations started is the point. These are real people who tapped the ad and opened a chat with the business.',
      'Cost per messaging conversation started is the single number to judge the whole campaign by. In the active campaign it was $0.09. If that number climbs over a few days, something in the creative or the audience has drifted.',
      'Views and viewers are easy to confuse. Views count every single play; viewers count people. The active campaign\u2019s 14,053 views from 8,511 viewers means many people watched more than once, which is usually a good sign for the hook.',
      'Video plays, post engagements, link clicks and reactions tell you the creative landed, but none of them pay the bills. They are clues about why the cost per conversation is what it is, not goals in themselves.',
      '## The creative is a phone-shot reel, not a studio ad',
      'All three ads are boosted reels \u2014 short vertical videos filmed on a phone showing the real product, the price, a line about cash on delivery all over Nepal, and a prompt to message on WhatsApp. The hook lands in the first two seconds. There is no agency gloss. On a feed full of polished ads, something that looks like a friend filmed it stops the thumb, and an honest product demo does the selling.',
      '## Five dollars a day, and when to raise it',
      'Every campaign ran on a $5 daily budget with a continuous duration, and that is on purpose. A small budget on a tight, well-defined audience buys you data cheaply. You are not trying to dominate the feed; you are trying to find the one ad that earns a conversation for pennies before you pour money into it.',
      'Meta will eventually suggest scaling \u2014 "add $5 to your daily budget to get more results each day with a low cost per messaging conversation started," as it did on the 26 October campaign. Take that advice only once the cost per conversation has held steady for a few days and you have the stock and the chat capacity to handle more messages. Raising the budget on an ad that is still finding its audience usually just spends more for the same result.',
      '## Reading the dashboard without fooling yourself',
      'A campaign can show 22,792 views, look like a hero, and still cost twice as much per conversation as a quieter one. Views are not the goal. Before you pause anything, look at the cost per conversation and whether those conversations are turning into orders. The temptation is to keep the ad with the big view count and cut the small one; more often the small, cheap one is the one actually making money.',
      '## The mistakes that make messaging ads fail',
      'Optimising for the wrong objective is the big one. Traffic and likes look good in a screenshot and produce no chats. Send people to WhatsApp instead of a slow landing page.',
      'Creative with no price, no cash-on-delivery line and no WhatsApp prompt wastes the impression \u2014 the viewer has to guess, and guessing means scrolling.',
      'Pausing an ad before it has spent enough to learn is the other common error. Meta needs a little data to find the right people; cutting a campaign after $2 often throws away the learning.',
      'And scaling an unproven ad because the views look exciting spends money faster than it makes conversations.',
      '## Key takeaways',
      'Use the Messages objective, not traffic or engagement, if a conversation is how you sell.',
      'Line the ad up with how people already buy: in Nepal that means WhatsApp and cash on delivery.',
      'Judge every campaign by cost per conversation, not by views.',
      'Start at about $5 a day, and scale only once the cost per conversation has been stable for a few days.',
      'Keep the creative an honest, phone-shot product demo with the price, the COD line and a clear prompt to message.',
    ],
    faqs: [
      {
        question: 'What is a Meta messaging ad?',
        answer:
          'A messaging ad is a Meta (Facebook or Instagram) campaign using the Messages objective. It appears in the feed with a call to action that opens a WhatsApp, Messenger or Instagram chat with the business, so the conversion is a conversation rather than a landing-page click.',
      },
      {
        question: 'How much does a WhatsApp conversation cost from Meta Ads?',
        answer:
          'In the campaigns described here, a messaging conversation cost as little as $0.09. The real figure varies with audience, creative and country, but messaging campaigns are typically the cheapest way to start a qualified chat.',
      },
      {
        question: 'What budget do I need to start Meta Ads?',
        answer:
          'About $5 a day is enough to gather useful data on a well-targeted audience. The goal at that level is to find the ad with the lowest cost per conversation before increasing spend.',
      },
      {
        question: 'Why use WhatsApp instead of a landing page for ecommerce in Nepal?',
        answer:
          'Cash on delivery means customers want to confirm the product, warranty, delivery and final price with a real person before paying. A WhatsApp chat answers those questions in seconds, which a checkout form cannot.',
      },
      {
        question: 'Which objective should a messaging campaign use?',
        answer:
          'Use the Messages objective. Traffic and engagement objectives produce clicks and likes but do not optimise for conversations, which are the actual goal for this kind of store.',
      },
      {
        question: 'How do I know which ad to scale?',
        answer:
          'Scale an ad once its cost per conversation has stayed low and stable for several days and you can handle more messages. Meta\u2019s "scale this ad" suggestion is a useful signal, but only act on it when the underlying cost per conversation is genuinely strong.',
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
