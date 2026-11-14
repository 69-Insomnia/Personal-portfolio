-- ============================================================================
-- 03-content-drafts.sql  —  PROPOSED, NOT APPLIED
-- ============================================================================
--
-- Everything here is a DRAFT. Nothing is published, nothing is applied. Review,
-- edit, then run what you accept.
--
-- ## What this file contains, and what it deliberately does not
--
-- This file holds the INSERT-ONLY work from Task 3: the six new posts, their
-- media alt-text rows, and the empty testimonial draft rows. Those need no
-- knowledge of your current rows, so they could be drafted before the backup.
--
-- It does NOT yet contain the UPDATE-style drafts (about story, project
-- "what I'd do differently" paragraphs, service body gaps, the three rewritten
-- excerpts). Those rewrite existing rows, and a change without its `old value`
-- is not reviewable — that is the whole point of your diff-report requirement.
-- They follow once `scripts/export-backup.mjs` has run.
--
-- ## Safety
--
-- - Drafts only: `published = false` on every row inserted here.
-- - Idempotent: `on conflict (slug) do nothing`, so re-running is safe and can
--   never clobber a row you have since edited.
-- - Nothing touches `messages` or `redirects`.
-- - Wrapped in a transaction: if any statement fails, none of it lands.
--
-- ## Two constraints you need to know about before running this
--
-- 1. `posts.image` is NOT NULL. You have not supplied artwork for six new
--    posts, so each row below carries the path the image SHOULD live at
--    (`/images/blog-<slug>.png`) plus a TODO. These are drafts, so nothing
--    renders and nothing breaks today — but the file must exist before you
--    publish the post, or the card and the article hero will both 404.
--    I have deliberately NOT pointed them at an existing article's artwork:
--    a post about Nepali export quietly illustrated with the WhatsApp post's
--    image is the kind of thing that ships and nobody notices for a month.
--
-- 2. `posts.date` is `text` and is rendered RAW by `BlogCard.tsx:36` and
--    `AuthorByline.tsx:55`. You asked for ISO (YYYY-MM-DD) in new rows, which
--    is the right storage format — `isoDate()` already reads it without
--    parsing, and `displayDate()` already converts it back for humans. But
--    neither of those call sites uses `displayDate()` today, so an ISO value
--    would print as "2026-10-16" on the card and the byline.
--    COMPANION EDIT REQUIRED, proposed separately:
--        BlogCard.tsx      {post.date}                  -> {displayDate(post.date) ?? post.date}
--        AuthorByline.tsx  <time>{post.date}</time>     -> <time>{displayDate(post.date) ?? post.date}</time>
--    Without that edit, every new post shows a machine date. With it, the three
--    existing posts (which store "12 September 2026") keep rendering exactly as
--    they do now, because `displayDate` parses that form too.
--
-- ## Facts discipline
--
-- Every claim below comes from the four real projects, the confirmed stack, or
-- general mechanics of the platforms involved. No fees, no limits, no
-- turnaround figures, no results, no client names beyond the four you named.
-- Places where a real figure belongs carry `-- TODO(verify)` in this file and
-- never appear in the rendered text.
-- ============================================================================

begin;

-- ---------------------------------------------------------------- 1 of 6 ---
-- Ask-first shape: the checklist is ordered by what actually blocks indexing,
-- not by effort. Angle is the romanised-Nepali product-name problem, which is
-- specific to this market and which no generic SEO checklist covers.

insert into public.posts
  (slug, title, excerpt, category, date, reading_time, image, tags, content, published, is_placeholder, sort_order)
values (
  'nepali-store-google-checklist',
  $t$How to get a Nepali online store found on Google$t$,
  $t$A checklist ordered by what actually blocks indexing, not by effort. The first four items cost nothing and fix most stores I look at; the last two are where the growth is.$t$,
  'Ecommerce',
  '2026-10-16',
  '5 min read',
  -- TODO(asset): create this file before publishing, or link an existing image.
  '/images/blog-nepali-store-google-checklist.png',
  array['Ecommerce SEO', 'Shopify', 'WooCommerce', 'Product Pages'],
  array[
    $p$Most Nepali stores I look at do not have a traffic problem. They have a page that cannot be read properly, and a handful of others competing with each other for the same search. Both are fixable this week.$p$,
    $p$This is the order I work through, and the order matters — each step depends on the one above it.$p$,
    $p$## 1. Check whether the product page is in the HTML at all$p$,
    $p$Open a product page, right-click, and choose View Page Source. Then search that source for the product name. If it is not there, the page is being assembled by JavaScript after the HTML arrives, and you are asking a crawler to do extra work and hoping it bothers.$p$,
    $p$This is the first thing I check because it invalidates everything downstream. There is no point tuning a title tag on a page a crawler never sees the content of.$p$,
    $p$## 2. Give every product a title that matches how people actually search$p$,
    $p$This is where Nepali stores lose the most ground, and it is a problem I have not seen written up anywhere.$p$,
    $p$A store owner writes the product name in romanised Nepali, because that is what their customers type into the chat. Then they write the title tag in English, because that feels more professional. So the page says "Chiya Dana" in the heading and "Tea Leaves" in the title, and neither version is complete. Someone searching either way lands on a page that only half-matches.$p$,
    $p$Both belong on the page. The heading can carry the romanised form, the title can carry the English one, and the description can use both in a sentence. You are not choosing a language for your store — you are covering two ways the same person searches on two different days.$p$,
    $p$## 3. Write your own product descriptions$p$,
    $p$If you are selling a product that other shops also sell, you have almost certainly copied the supplier's description. So has everyone else. Google is looking at six pages with identical text and has no reason to pick yours.$p$,
    $p$You do not need to write much. Two or three sentences about what the thing is, who it suits, and what is in the box will do more than a page of manufacturer copy, because it is the only text on the page that nobody else has.$p$,
    $p$## 4. Make the category page the one that ranks, not the product$p$,
    $p$Individual products should rank for specific searches. Broad searches — "kurta online Nepal", "wireless earbuds price in Nepal" — should land on a category page that lists options, because someone typing that has not decided what they want yet.$p$,
    $p$In practice the opposite happens. Product pages inherit whatever authority the store has and the category pages sit empty, competing on nothing but internal links. A category page needs a short paragraph at the top saying what the category covers and who it is for. That is the text that has a chance of being read out as an answer.$p$,
    $p$## 5. Stop your filters and sorting from multiplying into thousands of pages$p$,
    $p$Every filter combination and sort order on a store can generate its own URL. Size, colour, price, sort-by-newest — each one becomes a page that a crawler can find and index, and each one is a thin duplicate of the category it came from.$p$,
    $p$This is not a disaster on a store with thirty products. On a store with three hundred it can mean the crawler spends its entire budget on near-identical filter pages and never reaches the ones you care about. The fix is usually a setting rather than code: make filter URLs non-indexable and keep them out of the crawl path.$p$,
    $p$## 6. Measure speed on the phone your customers actually use$p$,
    $p$Load your store on a mid-range Android over mobile data, not on your laptop over wifi. Most stores in Nepal are browsed on a phone, and a product page that feels instant in the office can take several seconds on the connection a customer is actually on.$p$,
    $p$Product images are almost always the cause. Serving them at the size they are displayed, rather than the size they were uploaded, is the single highest-value change on most stores I look at.$p$,
    $p$## What to do first if you only do one thing$p$,
    $p$Item 1. If the product copy is not in the HTML source, nothing else on this list can work, and it is a ten-minute check.$p$
  ],
  false,
  false,
  3
)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------- 2 of 6 ---
-- Deliberately refuses to quote fees, because I have not confirmed any. The
-- decision is framed around maintenance and who edits the store, which is the
-- part that actually differs and the part that does not go stale.

insert into public.posts
  (slug, title, excerpt, category, date, reading_time, image, tags, content, published, is_placeholder, sort_order)
values (
  'shopify-vs-woocommerce-nepal',
  $t$Shopify vs WooCommerce for Nepali sellers: which fits which business$t$,
  $t$The honest dividing line is not price or features. It is who edits the store after launch, and how much you are willing to maintain. Here is how I decide between them on a real build.$t$,
  'Ecommerce',
  '2026-10-16',
  '5 min read',
  '/images/blog-shopify-vs-woocommerce-nepal.png',
  array['Shopify', 'WooCommerce', 'Ecommerce', 'Web Development'],
  array[
    $p$This question comes up on almost every store build, and it is usually framed as a feature comparison. It is not one. Both platforms can sell products, take payment and ship. The differences that decide the project are maintenance and control.$p$,
    $p$Here is how I actually decide.$p$,
    $p$## Start with who edits the store afterwards$p$,
    $p$If the owner, or someone in the shop, is going to add products, change prices and publish offers without calling anyone, the platform that makes that easiest wins. That is the real constraint, and it usually decides the question before features come into it.$p$,
    $p$A custom build gives the most control and the least ability to self-edit. That is fine when there is a developer on call and a mistake when there is not. I have talked people out of custom builds for exactly this reason, including when the custom build was the more interesting work.$p$,
    $p$## Then ask what the store has to do that is unusual$p$,
    $p$A store selling a straightforward catalogue is not the same as a store selling something with rules attached — bookings by date, products priced by weight, bundles built on the fly, or a checkout that has to talk to something else the business already runs.$p$,
    $p$The more of that you have, the more the decision moves toward the platform that lets you change the logic rather than the one that lets you change the settings. When the catalogue is simple, that pressure disappears and the answer usually goes the other way.$p$,
    $p$## The maintenance question nobody asks at the start$p$,
    $p$One platform is managed for you: hosting, security patches and uptime are somebody else's problem, and you pay for that in a monthly fee and in the ceiling on what you can change.$p$,
    $p$The other gives you the files, which means you own the hosting, the updates and the responsibility when a plugin breaks after an update you did not test. That is not a small commitment over several years. It is also completely fine if someone is looking after it.$p$,
    $p$The failure I see most often is not choosing wrong. It is choosing the self-managed option and then not managing it, so the store runs for two years on an unpatched install nobody has looked at.$p$,
    $p$## Page speed is where the choice shows up later$p$,
    $p$A store that installs a plugin for every feature eventually carries a lot of code it does not need, and that cost lands on the product pages that have to rank and convert.$p$,
    $p$The managed platform has its own version of this problem, with apps doing the same thing, and less you can do about it when it happens.$p$,
    $p$Either way, this is a decision you are making at the start and paying for on every product page for the life of the store. Fewer add-ons, and one that does the job properly, beats six that each do a corner of it.$p$,
    $p$## How I answer the question$p$,
    $p$Straightforward catalogue, someone in the business will maintain it, no unusual logic: the managed platform.$p$,
    $p$Unusual rules, integrations with existing systems, strong performance requirements, and a developer available: the self-hosted one.$p$,
    $p$If both descriptions sound plausible, that usually means the catalogue is simple and the answer is the managed platform, with the money that would have gone into custom logic spent on product photography and product copy instead. That is a better use of it on almost every store I have worked on.$p$
  ],
  false,
  false,
  4
)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------- 3 of 6 ---
-- No numbers anywhere: all seven prices and the audit price are still blank
-- in the brief, so the post explains what moves the price and how to compare
-- two quotes, which is the part that stays true regardless of the figure.

insert into public.posts
  (slug, title, excerpt, category, date, reading_time, image, tags, content, published, is_placeholder, sort_order)
values (
  'website-cost-nepal',
  $t$What changes the price of a website in Nepal$t$,
  $t$Website quotes in Nepal vary by an order of magnitude for what sounds like the same job. Here is what actually moves the number, and how to compare two quotes that do not look comparable.$t$,
  'Web Development',
  '2026-10-16',
  '5 min read',
  '/images/blog-website-cost-nepal.png',
  array['Web Development', 'Pricing', 'Planning'],
  array[
    $p$Two quotes for "a website" can differ by more than either party expects, and the gap is almost never about how good the work is. It is about what each one includes. This is what moves my own quotes, in rough order of how much they matter.$p$,
    -- TODO(verify): if you decide to publish any starting figure, it belongs in
    -- this paragraph. Until then this post carries no numbers at all, which is
    -- deliberate and is why it reads as mechanics rather than as a rate card.
    $p$## How many different page layouts exist$p$,
    $p$The biggest single factor, and the one clients consistently underestimate. A site with three page types and a site with fourteen are not the same job, even if both are described as "about fifteen pages".$p$,
    $p$Fifteen pages built from three layouts is three designs. Fifteen pages where each one has its own arrangement is fifteen. That is the difference between a week of design work and a month of it, and it is why a page count is a poor way to compare quotes.$p$,
    $p$## Whether the design exists yet$p$,
    $p$A theme that already looks right, a designer's files to build against, and "make it look good" are three different projects. The last one is the expensive one, because design decisions get made during the build, which is the slowest and most circular way to make them.$p$,
    $p$If there is no design, ask what the quote assumes. A quote that quietly assumes you will supply the design is not comparable to one that includes it, and the gap only becomes visible when the build starts.$p$,
    $p$## Content: who writes it, who moves it$p$,
    $p$Copy, product descriptions, photography and page structure are a real part of the work, and they are frequently excluded. "Content to be supplied by client" is a sentence that has sunk more launch dates than any technical problem.$p$,
    $p$If an existing site is being replaced, migrating the content is its own job. Old URLs that change without redirects will cost you whatever search visibility the old site had, and setting those up properly takes time that a low quote has usually not allowed for.$p$,
    $p$## What the site has to connect to$p$,
    $p$A contact form that emails someone is close to free. The same form writing to a CRM, a payment provider, a delivery partner's system or an accounting package is not.$p$,
    $p$Each integration has to be built, tested against something real, and made to fail in a way that does not lose the enquiry. This is where "small additions" quietly become the largest line in a project.$p$,
    $p$## Who edits it afterwards$p$,
    $p$This one changes the build, not just the handover. If the site has to be editable by someone who is not a developer — new offers, new products, new posts — it needs a content model that supports that, and content models are designed before the build rather than added to it.$p$,
    $p$A site nobody else will edit can be built faster and leaner. A site that three people will edit needs structure, and that structure is what you are paying for.$p$,
    $p$## How to compare two quotes that do not look comparable$p$,
    $p$Ask each one five questions: how many unique page layouts are included; is design included and how many rounds of changes; who supplies copy and images; which integrations are covered and which are extra; what happens after launch and for how long.$p$,
    $p$Two quotes that both answer those five will be comparable. Two that do not are not, and the cheap one is usually cheap because one of those five is missing rather than because it is efficient.$p$,
    $p$## What I would not cut$p$,
    $p$Speed on a phone, and the redirects from the old site. Both are invisible in the finished design, both are expensive to retrofit, and both have a direct effect on whether the site brings in anyone at all.$p$,
    $p$If the budget is tight, cut the number of page layouts, cut the integrations to the one that matters, and launch with fewer pages done properly. That is a better site than the same money spread across fourteen templates and no redirect map.$p$
  ],
  false,
  false,
  5
)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------- 4 of 6 ---
-- Built entirely on the POM's Penthouse engagement, which is the one project
-- where this decision was actually made and shipped. No metrics, no booking
-- figures, no claims about what it did to revenue.

insert into public.posts
  (slug, title, excerpt, category, date, reading_time, image, tags, content, published, is_placeholder, sort_order)
values (
  'whatsapp-ordering-nepal',
  $t$Why WhatsApp ordering beats a form for many Nepali businesses$t$,
  $t$A form asks a customer to trust a site they have just met and then wait. A chat asks them to do what they already do all day. On the POM's Penthouse build the second one was the obvious call.$t$,
  'Web Development',
  '2026-10-16',
  '4 min read',
  '/images/blog-whatsapp-ordering-nepal.png',
  array['WhatsApp', 'Conversion', 'Mobile First', 'Web Development'],
  array[
    $p$The first wireframe I drew for POM's Penthouse in Lakeside, Pokhara had a booking form on it. Dates, guests, name, email, submit. That is what booking websites look like, so that is what I drew.$p$,
    $p$Then I thought about who was actually going to use it, and changed the plan.$p$,
    $p$## Who is filling this in$p$,
    $p$Someone booking a serviced apartment for a short stay is on a phone. Often they are already travelling, or about to. They are choosing between three or four places at once and they have a question a form cannot answer: is the room I am looking at free on the dates I want, and can I see what it actually looks like?$p$,
    $p$A form cannot answer either of those. It can only take the question away and promise a reply.$p$,
    $p$## A form hides; a conversation does not$p$,
    $p$A form is a wall with a slot in it. You fill it in, you press submit, and you find out later whether anyone is there. On a keyboard at eleven at night, on a phone, with a validation error about the date format, a lot of people simply stop.$p$,
    $p$WhatsApp is the opposite. You ask, someone answers, and they can send a photograph of the actual room within a minute. The confirmation is immediate, which is the thing the form could never provide.$p$,
    $p$So the reservation path on that build became a single tap. No account, no confirmation email loop, no form.$p$,
    $p$## What that decision changed about the rest of the build$p$,
    $p$If the enquiry happens in a chat, the website has exactly one job: get someone to that tap with enough confidence to take it.$p$,
    $p$That reframed everything. The three apartment types had to be comparable without clicking through, so they sit side by side with their own photographs, a plain-language summary, the amenities that actually matter and a from-price per night. A visitor compares 1, 2 and 3 BHK on one screen and then taps.$p$,
    $p$Mobile-first stopped being a slogan and became the layout constraint. Images sized for a phone, an amenities list that scans, and a booking button that stays reachable as you scroll.$p$,
    $p$## What this is not$p$,
    $p$It is not an argument that forms are bad, or that every business should run on chat.$p$,
    $p$If you sell a product with a fixed price and no variables, a checkout beats a conversation every time. Nobody wants to negotiate a phone case. Adding a chat step to a purchase that was already simple makes it worse, and it creates manual work for whoever is answering.$p$,
    $p$The rule I use: if the customer is likely to have a question before they can commit, move that conversation earlier. If they are not, get out of their way.$p$,
    $p$## The cost nobody mentions$p$,
    $p$A WhatsApp-first flow moves work onto a person. Someone has to answer, and they have to answer reasonably fast, or the whole thing is worse than a form because the customer now knows they are being ignored.$p$,
    $p$That is the trade. You get a higher-intent conversation and you pay for it in attention. It is the right trade for a guesthouse with a few rooms and one person on the phone. It is the wrong one for a business that cannot staff a reply within the hour, and it is worth being honest about which of those you are before building it.$p$
  ],
  false,
  false,
  6
)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------- 5 of 6 ---
-- Tracking first, because that is the actual cause of most wasted budget and
-- it is invisible in the ads dashboard. No spend figures, no cost-per-result.

insert into public.posts
  (slug, title, excerpt, category, date, reading_time, image, tags, content, published, is_placeholder, sort_order)
values (
  'meta-ads-nepal-budget-waste',
  $t$Meta Ads for online stores: why most budgets get wasted$t$,
  $t$It is almost never the audience. It is usually a purchase event that fires twice, or not at all on mobile, so every decision afterwards is made against a number that is wrong.$t$,
  'Meta Ads',
  '2026-10-16',
  '5 min read',
  '/images/blog-meta-ads-nepal-budget-waste.png',
  array['Meta Ads', 'Meta Pixel', 'Tracking', 'Ecommerce'],
  array[
    $p$When a store owner tells me their Meta Ads are not working, the conversation usually starts on targeting. In most accounts I look at, targeting is the last thing that needs attention.$p$,
    $p$The order I work in is tracking, then audience structure, then creative. Getting that order wrong is the most expensive mistake available, because a bad decision made on good data costs a campaign and a bad decision made on bad data costs the whole account.$p$,
    $p$## Start with whether the purchase event is telling the truth$p$,
    $p$If your reported cost per purchase is wrong, you will scale the campaign that is losing money and pause the one that works. Both decisions look correct in the dashboard.$p$,
    $p$The failures are dull and they repeat. The purchase event fires on page load as well as on the confirmation page, so a single order counts twice. It fires on desktop but not on mobile, and mobile is most of the traffic. A developer's test pixel is still installed months later and is quietly reporting conversions nobody made. A purchase is counted when someone reaches the payment step rather than when the payment clears.$p$,
    $p$None of these are exotic. All of them make the account look like it is doing better than it is, which is why they survive so long.$p$,
    $p$## How to check, without a dashboard$p$,
    $p$Place a real order on your own store, from a phone, on mobile data, after clearing the browser. Then look at what the account recorded. One order should produce one purchase event, with the right value, within a minute or two.$p$,
    $p$Then do it on a desktop. If the two behave differently, you have found the problem, and it is worth more than any amount of audience work. This test takes twenty minutes and it is the first thing I do on an inherited account.$p$,
    $p$## Audience structure in a small market$p$,
    $p$Nepal is not a large audience pool, and that changes the correct strategy in a way that advice written for bigger markets gets wrong.$p$,
    $p$A long list of narrow interest-based audiences looks thorough and behaves badly. Each one is small, each one exhausts quickly, and they all end up showing the same ad to the same people while competing against each other in the auction. Fewer, broader audiences with better creative usually outperform a carefully carved set of small ones.$p$,
    $p$## Creative is the lever you actually have$p$,
    $p$Meta has automated more and more of the targeting over the years. What it has not automated is the ad itself and the page it lands on, and for most small budgets those two do more of the work than the audience settings ever did.$p$,
    $p$Test one variable at a time. Four concepts and twelve headlines running together tells you nothing about which change made the difference, and it usually ends with the winning combination being an accident nobody can repeat.$p$,
    $p$## The destination is part of the ad$p$,
    $p$A search or a scroll ends with a click, and the click has to land somewhere that continues the sentence. Sending someone to a category page when the ad showed one specific product is one of the most common mistakes in ecommerce advertising, and it is invisible in the ads dashboard because the click did happen. It just did not become anything.$p$,
    $p$## What to do before increasing the budget$p$,
    $p$Confirm one real order produces one real purchase event, on a phone and on a desktop. Then look at where the ads send people and check each destination matches what the ad promised. Both of those are free, and either can be the reason the account is not working.$p$,
    $p$Increasing spend on an account with broken tracking does not produce more customers. It produces more confidence in a number that is wrong.$p$
  ],
  false,
  false,
  7
)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------- 6 of 6 ---
-- The research-heavy one, and the one where I know least for certain. It
-- deliberately states no fee, no threshold, no duty rate and no carrier rule,
-- because none of those are confirmed and all of them change. Every place a
-- real figure belongs carries a TODO.

insert into public.posts
  (slug, title, excerpt, category, date, reading_time, image, tags, content, published, is_placeholder, sort_order)
values (
  'sell-nepali-products-abroad',
  $t$Selling Nepali products abroad: the ecommerce basics to get right first$t$,
  $t$The hard part of exporting is not the website. It is product data, shipping decisions and returns policy — all of which are cheaper to decide before the first international order than after it.$t$,
  'Ecommerce',
  '2026-10-16',
  '6 min read',
  '/images/blog-sell-nepali-products-abroad.png',
  array['Ecommerce', 'Export', 'Product Pages', 'Logistics'],
  array[
    $p$Selling abroad from Nepal is mostly not a website problem. The website part is the easy part, and it is the part people spend the most time on while the decisions that actually determine whether it works stay unmade.$p$,
    $p$This is what I would settle before building anything. It is not legal or customs advice, and I am deliberately not quoting fees, thresholds or courier rules — those change, they differ by destination and carrier, and any number I gave you here would be stale before the post finished being useful. Verify every one of them for your own products and destinations.$p$,
    -- TODO(verify): customs duty thresholds and rates by destination country.
    -- TODO(verify): carrier restrictions on your specific product categories.
    -- TODO(verify): prohibited and restricted export categories from Nepal.
    -- TODO(verify): payment provider availability and settlement for Nepali sellers.
    $p$## Decide what you are actually shipping before you design anything$p$,
    $p$A product page abroad has to answer questions a domestic page never gets asked. How heavy is it. What are its packed dimensions. What is it made of. Where was it made. Is it a food, a liquid, a plant product, a battery, or anything with a blade — because those categories attract rules that ordinary goods do not.$p$,
    $p$If you cannot answer those for a product today, that is the first job, and it is a spreadsheet job rather than a website job.$p$,
    $p$## Write product copy for someone who has never heard of the thing$p$,
    $p$A domestic customer already knows what a given item is. An international one often does not, and will not search for a word they cannot spell.$p$,
    $p$So the page has to carry both names — the local one and the plain English description — plus enough context that the product makes sense to a stranger. What it is used for, what it is made from, roughly what size it is, and what it comes with. This is also the text that gets quoted when an AI assistant answers a question about your category, which is a reason to write it properly rather than a reason to stuff it with words.$p$,
    $p$## Shipping is a product decision, not an admin one$p$,
    $p$How you ship changes what you can sell, at what size, and to whom. A product that is heavy relative to its value often cannot be exported profitably by any route. A product that is fragile needs packaging that adds weight and cost.$p$,
    $p$I have seen this treated as an afterthought on a build and it always comes back as a pricing problem later. If shipping cost is a meaningful fraction of the product price, that is worth knowing before the product page is designed around a price that cannot hold.$p$,
    -- TODO(verify): carrier options and indicative rates for your routes.
    $p$## Price in the currency you are selling in$p$,
    $p$An international buyer should not have to convert a price in their head to decide whether to continue. Showing your home currency only adds friction at exactly the moment you want the least.$p$,
    $p$If the platform supports multi-currency, use it. If it does not, the practical version is a clear statement of the currency, the conversion source and when it is applied, so there is no surprise at the payment step. A surprise at the payment step is where international carts are abandoned.$p$,
    -- TODO(verify): which payment providers will settle to a Nepali business
    -- account, and what currencies they support.
    $p$## Say what happens if it goes wrong$p$,
    $p$Returns, damaged goods, customs delays, parcels that disappear. A buyer abroad is taking a bigger risk than a domestic one and knows it, so the returns policy is a conversion element rather than a legal footnote. Put it on the product page, not only in the footer.$p$,
    $p$What the policy actually says depends on your carrier and your margins, and I am not going to guess at it here. Write it down before you launch, and make sure it is something you can actually honour on a bad day.$p$,
    $p$## Then the website part$p$,
    $p$Once those decisions exist, the build is straightforward. Product structured data so price and availability can appear in results, pages that load fast on connections you have never tested, and search visibility in the destination market rather than at home — which is a different job from ranking in Nepal and usually starts with the English-language content mentioned above.$p$,
    $p$## The order that saves the most time$p$,
    $p$Products and their physical facts. Then shipping and returns. Then pricing and currency. Then the website. Most projects I see do it in exactly the reverse order, which is why they stall at the point where a customer in another country asks a question nobody has answered yet.$p$
  ],
  false,
  false,
  8
)
on conflict (slug) do nothing;

-- ------------------------------------------------- media alt text for above ---
-- `posts` has no `image_alt` column, so alt text lives in `media`, keyed by
-- (entity_type, entity_slug) — see the media table's note in combined.sql.
-- These rows are written now so the alt text is not forgotten later, but the
-- `src` values point at images that DO NOT EXIST YET. Create the artwork at
-- these paths before publishing, or the alts describe nothing.
--
-- TODO(asset): the six images above are outstanding. Nothing here can supply
-- them, and reusing another article's artwork would ship a post illustrated
-- with a picture of a different subject.

insert into public.media (src, alt, entity_type, entity_slug)
values
  ('/images/blog-nepali-store-google-checklist.png',
   $a$A product page shown in Google's search results beside the same page opened as raw HTML source, illustrating whether the product name is present without JavaScript.$a$,
   'post', 'nepali-store-google-checklist'),
  ('/images/blog-shopify-vs-woocommerce-nepal.png',
   $a$Two store admin screens side by side comparing how a product listing is edited on a hosted platform and a self-hosted one.$a$,
   'post', 'shopify-vs-woocommerce-nepal'),
  ('/images/blog-website-cost-nepal.png',
   $a$A website quote broken into its parts on paper, with page layouts, design, content and integrations listed as separate lines.$a$,
   'post', 'website-cost-nepal'),
  ('/images/blog-whatsapp-ordering-nepal.png',
   $a$A phone showing an apartment listing page beside an open WhatsApp conversation where the guest asks about availability.$a$,
   'post', 'whatsapp-ordering-nepal'),
  ('/images/blog-meta-ads-nepal-budget-waste.png',
   $a$An events manager view showing one purchase event recorded twice from a single test order placed on a mobile phone.$a$,
   'post', 'meta-ads-nepal-budget-waste'),
  ('/images/blog-sell-nepali-products-abroad.png',
   $a$A packed parcel beside a product checklist listing weight, dimensions, materials and country of origin before an international shipment.$a$,
   'post', 'sell-nepali-products-abroad')
on conflict (src) do nothing;

-- --------------------------------------------- testimonial draft rows (empty) ---
-- Task 3 asks for empty draft rows with TODOs and explicitly forbids writing a
-- quote. These are placeholders so the four clients have somewhere to land.
--
-- `testimonials.content` is NOT NULL, so the cell cannot be NULL — it has to be
-- an empty string. `mapTestimonial` in src/lib/content.ts resolves an empty
-- `content` to `quote: null`, and `publishableTestimonials` filters those out,
-- so these rows render nothing. That is the intended state.
--
-- TODO(quote): replace '' with the client's own words, verbatim. Do not tidy
-- the sentence up — a slightly rough one they actually wrote is worth more
-- than a polished one they did not.
-- TODO(name): the person who said it, not the company.
-- TODO(role): their job title.

insert into public.testimonials (id, name, role, company, content, avatar, published, sort_order)
values
  ('drillthru',        '', '', 'DrillThru',                  '', '/images/clients/drillthru.png',        false, 0),
  ('trip-zone',        '', '', 'Trip Zone Travel & Tours',  '', '/images/clients/tripzone.png',         false, 1),
  ('starglobalvision', '', '', 'Star Global Vision',        '', '/images/clients/starglobalvision.png', false, 2),
  ('poms-penthouse',   '', '', $c$POM's Penthouse$c$,        '', '/images/clients/poms-penthouse.png',   false, 3)
on conflict (id) do nothing;

-- ============================================= project text — drillthru =======
-- `projects` is NOT touched by scripts/sync-content.ts, so a SQL UPDATE here is
-- the correct mechanism and will not be reverted — unlike `services.body` or
-- `posts.excerpt`, which are file-owned.
--
-- ## Why this one project, and why only this field
--
-- The other three narratives are specific and already good: each names the real
-- decision on its build rather than describing a template. Rewriting them
-- without being able to diff against the live rows risks replacing better text
-- with worse, and that is the one edit a diff report cannot catch for you. They
-- are left alone deliberately.
--
-- This row has an actual defect. The `overview` repeats DrillThru's own
-- marketing claims as though they were outcomes of the work:
--
--     "backed by a trust band (50+ projects delivered, 98% client satisfaction,
--      3x average ROI, 24/7 support)"
--
-- Those are the agency's published numbers, measured by them, for their own
-- benefit. Sitting in a portfolio, they read as the author's claims — and this
-- is the same class of problem as the invented testimonials, arriving through
-- the back door rather than through a quote.
--
-- The figures are not disputed. They may well be accurate. They are simply not
-- this site's to assert, so the paragraph now describes the build accurately and
-- states the boundary where a reader can see it.
--
-- TODO(verify): if DrillThru has asked you to publish these figures, or if you
-- measured them yourself, delete the final sentence of the new text and this
-- note.

update public.projects
set overview = $ov$The website for DrillThru, a web design and digital marketing agency serving businesses in Kathmandu and across Nepal. It has to do two jobs at once: demonstrate the craft, because the site is the portfolio, and evidence outcomes, because an agency competes with every other Nepali web shop on the same keywords. The page presents web development, SEO, Google Ads and Meta Ads as one offer rather than four separate services, supports each with a work showcase and testimonials, and keeps an enquiry path on screen throughout.

The trust figures shown on the live site — project counts, client satisfaction and average ROI — are DrillThru's own published numbers. I built the site; I did not measure them.$ov$
where slug = 'drillthru'
  and overview like '%98% client satisfaction%';

-- The WHERE clause is deliberately narrow: it matches only the row still
-- carrying the original wording, so re-running the file after the edit is a
-- no-op rather than a second rewrite of text that is already live.

-- ------------------------------------------------------- internal link map ---
-- Task 3 asks for this explicitly. It is left as a comment rather than as SQL
-- because the links live in the rendered pages and in the post bodies, not in
-- a column — there is nothing to UPDATE.
--
-- ## Post -> service
--   nepali-store-google-checklist  -> /services/ecommerce-growth, /services/seo
--   shopify-vs-woocommerce-nepal   -> /services/ecommerce-growth
--   website-cost-nepal             -> /services/web-development, /pricing
--   whatsapp-ordering-nepal        -> /services/web-development
--   meta-ads-nepal-budget-waste    -> /services/meta-ads, /services/ecommerce-growth
--   sell-nepali-products-abroad    -> /services/ecommerce-growth, /services/seo
--
--   Existing three:
--   technical-seo-foundations      -> /services/seo
--   whatsapp-booking-site          -> /services/web-development
--   ecommerce-one-system           -> /services/ecommerce-growth, /services/seo
--
--   NOTE: the first link above is written as a bare path. Confirm whether
--   /services/seo or /services/seo-services is the URL that actually resolves
--   before these are inserted — see the routing finding in 01-bug-fixes.sql.
--   Six new dead internal links would be worse than none.
--
-- ## Service -> post (2-3 each)
--   ecommerce-growth -> nepali-store-google-checklist, ecommerce-one-system,
--                       sell-nepali-products-abroad
--   seo              -> technical-seo-foundations, nepali-store-google-checklist
--   web-development  -> website-cost-nepal, whatsapp-ordering-nepal
--   meta-ads         -> meta-ads-nepal-budget-waste, ecommerce-one-system
--   google-ads       -> ecommerce-one-system
--   ai-search        -> technical-seo-foundations
--   digital-marketing-> ecommerce-one-system, website-cost-nepal
--
--   `google-ads`, `ai-search` and `digital-marketing` have one or two each
--   because there is no honest fit for the rest yet. Four more posts would fill
--   those slots; padding them with an unrelated link now would be a worse
--   signal than a thinner one.
--
-- ## Posts -> posts (a short reading path)
--   nepali-store-google-checklist <-> shopify-vs-woocommerce-nepal
--   whatsapp-ordering-nepal       <-> sell-nepali-products-abroad
--   meta-ads-nepal-budget-waste   <-> ecommerce-one-system

commit;

-- ============================================================================
-- WHAT THIS FILE STILL NEEDS FROM YOU
-- ============================================================================
-- 1. Six images, at the paths named above.
-- 2. Four testimonial quotes, with a name and a job title each.
-- 3. Confirmation that /services/seo or /services/seo-services is the live URL,
--    before the internal links above are inserted anywhere.
-- ============================================================================
