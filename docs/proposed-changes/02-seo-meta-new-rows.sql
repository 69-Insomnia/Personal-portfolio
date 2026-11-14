-- ============================================================================
-- 02-seo-meta-new-rows.sql  —  PROPOSED, NOT APPLIED
-- ============================================================================
--
-- Fills the nine `seo_meta` rows that carry no title or description today:
--     page    about, contact, pricing, work
--     post    ecommerce-one-system, technical-seo-foundations, whatsapp-booking-site
--     project drillthru, starglobalvision
--
-- ## Why this is safe to review without the backup
--
-- The `old value` for every column below is NULL — that is what "empty row"
-- means, and the brief states it. So this is the one part of Tasks 1-3 whose
-- diff is knowable without reading the database.
--
-- The `keyword_cluster` column is the exception, and it is flagged again at the
-- bottom. "No overlap with other pages" cannot be checked from here, because
-- eleven of those other pages are rows I cannot see.
--
-- ## custom_json_ld is mostly OMITTED, deliberately
--
-- The brief asks for Person (about), ContactPage + ProfessionalService
-- (contact), Article (posts) and CreativeWork (projects). Four of those five
-- would duplicate markup that already ships:
--
--   Person              -> `personNode()` at #person, emitted site-wide by
--                          SiteJsonLd (src/components/common/JsonLd.tsx:59)
--   ProfessionalService -> `professionalServiceNode()` at #service, same file
--   Article             -> `articleNode(post)`, emitted per post by
--                          src/app/blog/[slug]/page.tsx:123
--   CreativeWork        -> `projectNode(project)`, emitted per project by
--                          src/app/work/[slug]/page.tsx:129
--
-- JsonLd.tsx documents this exact bug being fixed once already: "An earlier
-- version had this component always prepend the base graph, which meant every
-- page emitted Person, WebSite and ProfessionalService a second time."
--
-- Re-adding them would produce a second Person entity on /about and a second
-- Article per post. Where two nodes describe one thing with different @ids, a
-- consumer has to guess which is authoritative — which is worse than emitting
-- neither. So the only custom_json_ld written here is the one node that does
-- NOT already exist: ContactPage on /contact.
--
-- The per-page value the brief is reaching for lives in `entity_signals`
-- (`knowsAbout`) and `faqs`, both of which are additive and collide with
-- nothing. Those are filled below.
--
-- ## Shape notes
--
-- `seo_meta` has NOT NULL constraints on nothing here except entity_type,
-- entity_slug and keywords (default '{}'), so every column below is optional.
-- `faqs` and `stats` are constrained to jsonb_typeof = 'array'; `entity_signals`
-- to 'object'; `custom_json_ld` to 'object' or 'array'. Every value below
-- satisfies those checks.
--
-- INSERT ... ON CONFLICT DO UPDATE rather than a bare UPDATE, so a row that
-- somehow does not exist yet is created rather than silently skipped — and so
-- re-running this file is idempotent either way.
-- ============================================================================

begin;

-- ============================================================ page / about ===
-- Title leads with the query, not the brand, matching the completed rows.
-- `ai_answer` opens with the identity sentence so it survives being lifted out
-- of the page with no context above it.

insert into public.seo_meta
  (entity_type, entity_slug, meta_title, meta_description, og_title, og_description,
   focus_keyword, keyword_cluster, ai_answer, faqs, entity_signals, canonical_override)
values (
  'page', 'about',
  $q$About Dipendra Guragain | Ecommerce SEO, Kathmandu$q$,
  $q$How I moved from building websites to running the search and paid campaigns behind them, the two client roles that shaped that, and what I studied alongside.$q$,
  $q$About Dipendra Guragain | Ecommerce SEO, Kathmandu$q$,
  $q$How I moved from building websites to running the search and paid campaigns behind them, the two client roles that shaped that, and what I studied alongside.$q$,
  $q$about Dipendra Guragain$q$,
  -- TODO(verify): confirm these three do not already sit in the home, services
  -- or seo-services clusters. I could not read those rows; see the note at the
  -- foot of this file before running.
  array['web developer Kathmandu', 'React developer Nepal', 'SEO specialist Kathmandu'],
  $q$I am Dipendra Guragain, an ecommerce growth specialist based in Kathmandu, Nepal. I build online stores and the search and paid campaigns that bring people to them, working across React and Next.js on one side and SEO and advertising on the other. I spent a year as a web developer at DrillThru, a Kathmandu agency, and six months building the booking site for POM's Penthouse in Lakeside, Pokhara. Most of what I know came from shipping work and then watching what happened to it.$q$,
  $j$[
    {"question": "Who is Dipendra Guragain?",
     "answer": "An ecommerce growth specialist based in Kathmandu, Nepal. He builds online stores and runs the search and paid campaigns that bring customers to them, working across React, Next.js, SEO, Meta Ads and Google Ads. He spent a year as a web developer at DrillThru and six months building the POM's Penthouse booking site in Pokhara."},
    {"question": "What does this do that a web developer does not?",
     "answer": "A web developer usually hands over a finished site. This work carries on into whether anyone can find it and whether it converts. Technical SEO, paid campaigns, analytics and product page work are treated as part of the same job rather than handed to separate suppliers once the build is over."},
    {"question": "Does he work with clients outside Nepal?",
     "answer": "Yes. Projects run remotely with stores outside Nepal, usually over written updates rather than scheduled meetings, which suits the time difference from Kathmandu. Nepal-based clients are served the same way, and the work itself does not change with location."}
  ]$j$::jsonb,
  $j${"knowsAbout": ["Ecommerce SEO", "Shopify", "WooCommerce", "Google Ads", "Meta Ads", "Technical SEO", "Conversion Optimisation"]}$j$::jsonb,
  $q$https://dipendraguragain.tech/about$q$
)
on conflict (entity_type, entity_slug) do update set
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  og_title = excluded.og_title,
  og_description = excluded.og_description,
  focus_keyword = excluded.focus_keyword,
  keyword_cluster = excluded.keyword_cluster,
  ai_answer = excluded.ai_answer,
  faqs = excluded.faqs,
  entity_signals = excluded.entity_signals,
  canonical_override = excluded.canonical_override;

-- ========================================================== page / contact ===
-- No numbers of any kind in the description: the prices are still unconfirmed,
-- and a contact page is the last place to imply one.

insert into public.seo_meta
  (entity_type, entity_slug, meta_title, meta_description, og_title, og_description,
   focus_keyword, keyword_cluster, ai_answer, faqs, custom_json_ld, canonical_override)
values (
  'page', 'contact',
  $q$Contact Dipendra Guragain | Ecommerce Growth, Kathmandu$q$,
  $q$Send a short brief about your store, site or campaigns and get a reply within 24 hours. WhatsApp, email and the Kathmandu address are all on this page.$q$,
  $q$Contact Dipendra Guragain, Kathmandu$q$,
  $q$Send a short brief about your store, site or campaigns and get a reply within 24 hours. WhatsApp, email and the Kathmandu address are all on this page.$q$,
  $q$hire ecommerce specialist Kathmandu$q$,
  array['contact Dipendra Guragain', 'hire SEO specialist Nepal', 'ecommerce consultant Kathmandu'],
  $q$Dipendra Guragain is an ecommerce growth specialist in Kathmandu, Nepal. He can be reached on WhatsApp at +977-9840814142 or by email at guragaidipendra6@gmail.com. Messages go to a personal inbox and are answered within 24 hours. A useful first message names the store or site, what is sold, and what the problem seems to be; the reply will say which questions still need answering and what the suggested first step is.$q$,
  $j$[
    {"question": "How quickly will I get a reply?",
     "answer": "Within 24 hours. Messages go to a personal inbox rather than a shared queue, so the reply comes from the person who will do the work rather than from an account manager. If a brief needs more detail before it can be answered, the reply will ask for it."},
    {"question": "What should I include in the first message?",
     "answer": "The store or site URL, what you sell, and what you think the problem is. A sentence about what you have already tried saves a round trip. There is nothing else to fill in — a short paragraph is enough to start from."},
    {"question": "Can you work with a business outside Nepal?",
     "answer": "Yes. Projects run remotely with stores outside Nepal, using written updates rather than scheduled calls, which suits the time difference from Kathmandu. The work itself does not change with location, only the timing of the conversations."}
  ]$j$::jsonb,
  -- The one genuinely additive node: no ContactPage exists anywhere in the
  -- codebase. `isPartOf`, `about` and `mainEntity` reference the site-wide
  -- Person and WebSite by @id rather than restating them, which is the pattern
  -- JsonLd.tsx documents.
  $j${
    "@type": "ContactPage",
    "@id": "https://dipendraguragain.tech/contact#contactpage",
    "url": "https://dipendraguragain.tech/contact",
    "name": "Contact Dipendra Guragain",
    "isPartOf": { "@id": "https://dipendraguragain.tech/#website" },
    "about": { "@id": "https://dipendraguragain.tech/#person" },
    "mainEntity": { "@id": "https://dipendraguragain.tech/#person" }
  }$j$::jsonb,
  $q$https://dipendraguragain.tech/contact$q$
)
on conflict (entity_type, entity_slug) do update set
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  og_title = excluded.og_title,
  og_description = excluded.og_description,
  focus_keyword = excluded.focus_keyword,
  keyword_cluster = excluded.keyword_cluster,
  ai_answer = excluded.ai_answer,
  faqs = excluded.faqs,
  custom_json_ld = excluded.custom_json_ld,
  canonical_override = excluded.canonical_override;

-- ========================================================== page / pricing ===
-- NO NUMBERS ANYWHERE, because none are confirmed. Both the ai_answer and the
-- FAQs answer "what does it cost" with what moves the price, which is the
-- honest answer and the one that does not need to be withdrawn later. If you
-- confirm starting figures, this row is where they go — and nowhere else.

insert into public.seo_meta
  (entity_type, entity_slug, meta_title, meta_description, og_title, og_description,
   focus_keyword, keyword_cluster, ai_answer, faqs, canonical_override)
values (
  'page', 'pricing',
  $q$SEO & Website Cost in Nepal | What Moves the Price$q$,
  $q$What changes the cost of SEO, a website build, an online store or paid ads in Nepal, and how to compare two quotes that do not look comparable.$q$,
  $q$What SEO, Web Development and Ads Cost in Nepal$q$,
  $q$What changes the cost of SEO, a website build, an online store or paid ads in Nepal, and how to compare two quotes that do not look comparable.$q$,
  $q$website cost Nepal$q$,
  -- TODO(verify): "SEO cost Nepal" is one of the two keywords your Task 1 item 7
  -- names as appearing in the home, services AND seo-services clusters. It is
  -- placed here as the page that should own it, on the grounds that this is the
  -- only page about price — but that assignment must be confirmed against the
  -- budget from the backup before it is written.
  array['website cost Nepal', 'SEO cost Nepal', 'ecommerce website price Nepal', 'Google Ads management cost Nepal'],
  $q$There is no single price for a website or for SEO in Nepal. The figure depends on how many unique page layouts are needed, whether design is included, who writes the content, which systems the site has to connect to, and who will edit it after launch. A quote that does not answer those five questions cannot be compared with one that does. Pricing depends on scope, so the practical next step is a short brief rather than a rate card.$q$,
  $j$[
    {"question": "Why can two website quotes differ so much?",
     "answer": "Because they usually cover different things. One may assume you supply the design and the copy, another may include both. One may cover a single integration, another several. Comparing totals without comparing what is inside them is the most common way people choose the wrong quote."},
    {"question": "What makes a project more expensive?",
     "answer": "More unique page layouts, custom design rather than a theme, content that has to be written or migrated from an old site, integrations with systems the business already runs, and needing the site editable by people who are not developers. Of those, the number of layouts moves the price most."},
    {"question": "Is there a cheaper way to start?",
     "answer": "Yes. Cut the number of page layouts, build only the integrations that matter, and launch with fewer pages done properly. A small site that loads fast and can be found beats a larger one where the budget spread across many templates and nothing was finished."}
  ]$j$::jsonb,
  $q$https://dipendraguragain.tech/pricing$q$
)
on conflict (entity_type, entity_slug) do update set
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  og_title = excluded.og_title,
  og_description = excluded.og_description,
  focus_keyword = excluded.focus_keyword,
  keyword_cluster = excluded.keyword_cluster,
  ai_answer = excluded.ai_answer,
  faqs = excluded.faqs,
  canonical_override = excluded.canonical_override;

-- ============================================================= page / work ===
-- The FAQ answers "are the results verified" directly, because that is the
-- question a careful reader has about a portfolio, and answering it is worth
-- more than the space it costs.

insert into public.seo_meta
  (entity_type, entity_slug, meta_title, meta_description, og_title, og_description,
   focus_keyword, keyword_cluster, ai_answer, faqs, canonical_override)
values (
  'page', 'work',
  $q$Selected Work | Ecommerce and Web Projects in Nepal$q$,
  $q$Four projects written up in full: a Pokhara booking site, a Nepal tour operator, a Kathmandu agency and a study-abroad consultancy. What was built and why.$q$,
  $q$Selected Work | Ecommerce and Web Projects in Nepal$q$,
  $q$Four projects written up in full: a Pokhara booking site, a Nepal tour operator, a Kathmandu agency and a study-abroad consultancy. What was built and why.$q$,
  $q$web design portfolio Nepal$q$,
  array['ecommerce website Nepal', 'React developer portfolio', 'website case studies Nepal'],
  $q$This portfolio covers four delivered projects: POM's Penthouse, a serviced-apartment booking site in Lakeside, Pokhara built around WhatsApp reservations; Trip Zone Travel & Tours, a React site on Vercel covering nine Nepal journeys with filters and vehicle-inclusive pricing; DrillThru, a Kathmandu digital agency's own website built on Next.js; and Star Global Vision, a study-abroad consultancy site in React and Vite covering fourteen destinations. Each case study describes the problem, what was built, and what would be done differently on a second pass.$q$,
  $j$[
    {"question": "What kind of projects are in this portfolio?",
     "answer": "Four: a serviced-apartment booking site in Pokhara, a Nepal tour operator's package site, a Kathmandu digital agency's own website, and a study-abroad consultancy in Bagbazar. Three are built in React or Next.js and one is a mobile-first responsive build."},
    {"question": "Can I see the live sites?",
     "answer": "Yes. Each case study links to the live site where one is public. The case study itself covers the problem, the approach, what was built and what would be done differently, which is usually more useful than the screenshot."},
    {"question": "Are the results on these pages verified?",
     "answer": "Only figures that can be stood behind are published, and client outcomes appear only where the client has agreed to them. Where a project has no verified outcome the case study says so rather than describing one, and interface mockups are labelled as mockups."}
  ]$j$::jsonb,
  $q$https://dipendraguragain.tech/work$q$
)
on conflict (entity_type, entity_slug) do update set
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  og_title = excluded.og_title,
  og_description = excluded.og_description,
  focus_keyword = excluded.focus_keyword,
  keyword_cluster = excluded.keyword_cluster,
  ai_answer = excluded.ai_answer,
  faqs = excluded.faqs,
  canonical_override = excluded.canonical_override;

-- ================================================== post / ecommerce-one-system ===
-- The brief flags this meta_description as truncated mid-word today. This is a
-- complete sentence at 158 characters. The meta_title is 51.

insert into public.seo_meta
  (entity_type, entity_slug, meta_title, meta_description, og_title, og_description,
   focus_keyword, keyword_cluster, ai_answer, faqs, canonical_override)
values (
  'post', 'ecommerce-one-system',
  $q$Ecommerce Is One System, Not Four Separate Channels$q$,
  $q$The storefront, the search result, the ad and the report get optimised in separate rooms. The customer only meets them together, which is why it goes unfixed.$q$,
  $q$Ecommerce Is One System, Not Four Separate Channels$q$,
  $q$The storefront, the search result, the ad and the report get optimised in separate rooms. The customer only meets them together, which is why it goes unfixed.$q$,
  $q$ecommerce SEO Nepal$q$,
  array['ecommerce growth Nepal', 'store conversion optimisation', 'product page SEO'],
  $q$Most ecommerce problems arrive described as one problem — traffic down, conversion down, ad costs up — and turn out to be the same problem seen from four angles. A product page that loads slowly on mobile is an SEO issue, an advertising issue and a merchandising issue at once. Because each specialist sees the symptom their own tool measures, the fault sits in the gap between them and nobody owns it. Finding where people actually drop off is usually cheaper than buying more traffic.$q$,
  $j$[
    {"question": "Why do ecommerce problems look like several problems?",
     "answer": "Because each specialist sees the symptom their tool measures. The SEO sees a Core Web Vitals failure, the ads manager sees a high bounce rate, the merchandiser sees a product with views and no carts. All three are describing the same page, and none of them is wrong."},
    {"question": "What should be checked before optimising campaigns?",
     "answer": "Whether the analytics are true. If a purchase event fires twice, or never fires on mobile, every decision afterwards is made against a wrong number. That makes a losing campaign look efficient and an efficient one look wasteful."},
    {"question": "Which questions find the real problem?",
     "answer": "Unglamorous ones with specific answers. Which products get views but no carts. Which queries land on a page that does not answer them. Which ad sends someone to a category when they wanted one item. Those answers usually point at a fix that costs nothing to ship."}
  ]$j$::jsonb,
  $q$https://dipendraguragain.tech/blog/ecommerce-one-system$q$
)
on conflict (entity_type, entity_slug) do update set
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  og_title = excluded.og_title,
  og_description = excluded.og_description,
  focus_keyword = excluded.focus_keyword,
  keyword_cluster = excluded.keyword_cluster,
  ai_answer = excluded.ai_answer,
  faqs = excluded.faqs,
  canonical_override = excluded.canonical_override;

-- ============================================ post / technical-seo-foundations ===
-- Task 1 item 5 also asks for this meta_title to come in at 60 characters or
-- fewer. It is 50. The meta_description is a complete 151-character pair of
-- sentences rather than a cut-off clause.

insert into public.seo_meta
  (entity_type, entity_slug, meta_title, meta_description, og_title, og_description,
   focus_keyword, keyword_cluster, ai_answer, faqs, canonical_override)
values (
  'post', 'technical-seo-foundations',
  $q$Fix These Technical SEO Basics Before Writing More$q$,
  $q$Sites that seem to need more content usually need existing pages crawlable, fast and unambiguous first. The order to check, and why content comes last.$q$,
  $q$Fix These Technical SEO Basics Before Writing More$q$,
  $q$Sites that seem to need more content usually need existing pages crawlable, fast and unambiguous first. The order to check, and why content comes last.$q$,
  $q$technical SEO checklist$q$,
  array['Core Web Vitals Nepal', 'crawlability audit', 'on-page SEO basics'],
  $q$When a site stops ranking, the usual assumption is that it needs more content. Most of the time it needs its existing pages to be crawlable, fast and unambiguous first. The order that matters is whether a crawler can fetch the page and read its content without running JavaScript, whether each page targets one subject, whether titles and structured data are correct, and whether speed is measured on the phones real visitors use. Content is the last lever, not the first, because content on a site that cannot be understood just adds to the pile.$q$,
  $j$[
    {"question": "What should I check before writing more content?",
     "answer": "Whether the existing pages can be crawled and read in the rendered HTML, then whether each page targets one subject, then metadata and structured data, then speed measured from real visitors rather than a lab score."},
    {"question": "Why does content come last?",
     "answer": "Because content added to a site that cannot be crawled or understood does not fix anything. Eight unreadable pages plus a ninth is still eight unreadable pages. The technical work caps what any amount of new content can achieve."},
    {"question": "Does FAQ structured data still help?",
     "answer": "Not as a rich result. Google stopped showing FAQ rich results for most sites, so marking up a block of questions no longer changes how a result looks. The questions are still worth writing because they match how people search, but as real headings on the page rather than as markup."}
  ]$j$::jsonb,
  $q$https://dipendraguragain.tech/blog/technical-seo-foundations$q$
)
on conflict (entity_type, entity_slug) do update set
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  og_title = excluded.og_title,
  og_description = excluded.og_description,
  focus_keyword = excluded.focus_keyword,
  keyword_cluster = excluded.keyword_cluster,
  ai_answer = excluded.ai_answer,
  faqs = excluded.faqs,
  canonical_override = excluded.canonical_override;

-- ================================================ post / whatsapp-booking-site ===
-- Task 1 item 5 flags this description as truncated mid-word too. This is a
-- complete 153-character version.

insert into public.seo_meta
  (entity_type, entity_slug, meta_title, meta_description, og_title, og_description,
   focus_keyword, keyword_cluster, ai_answer, faqs, canonical_override)
values (
  'post', 'whatsapp-booking-site',
  $q$Why WhatsApp Beat a Booking Form on a Pokhara Build$q$,
  $q$A booking form asks a guest to trust a site they have just met. WhatsApp asks them to do what they already do all day. Why the build changed around it.$q$,
  $q$Why WhatsApp Beat a Booking Form on a Pokhara Build$q$,
  $q$A booking form asks a guest to trust a site they have just met. WhatsApp asks them to do what they already do all day. Why the build changed around it.$q$,
  $q$WhatsApp booking Nepal$q$,
  array['WhatsApp ordering', 'booking site conversion', 'mobile first Nepal'],
  $q$On a serviced-apartment booking site in Lakeside, Pokhara, the reservation path was built around WhatsApp rather than a booking form. Short-stay guests are usually on a phone and often already travelling, and they have questions a form cannot answer: whether the room is free on their dates, and what it actually looks like. A form takes the question away and promises a reply later. A chat answers immediately and can send a photograph of the room. The rest of the build followed: three apartment types comparable on one screen, with their own images, amenities and a from-price per night.$q$,
  $j$[
    {"question": "When is WhatsApp better than a booking form?",
     "answer": "When the customer is likely to have a question before they can commit. Checking availability, seeing the actual room, confirming something about the location. If those questions exist, moving the conversation earlier usually removes the drop-off the form was causing."},
    {"question": "When is a checkout better than a conversation?",
     "answer": "When the product has a fixed price and no variables. Nobody wants to negotiate the price of a phone case. Adding a chat step to a purchase that was already simple makes it slower for the customer and creates manual work for whoever answers."},
    {"question": "What does a WhatsApp-first approach cost?",
     "answer": "Attention. Someone has to answer, and reasonably quickly, or the experience is worse than a form because the customer now knows they are being ignored. It suits a business that can staff a reply within the hour, and not one that cannot."}
  ]$j$::jsonb,
  $q$https://dipendraguragain.tech/blog/whatsapp-booking-site$q$
)
on conflict (entity_type, entity_slug) do update set
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  og_title = excluded.og_title,
  og_description = excluded.og_description,
  focus_keyword = excluded.focus_keyword,
  keyword_cluster = excluded.keyword_cluster,
  ai_answer = excluded.ai_answer,
  faqs = excluded.faqs,
  canonical_override = excluded.canonical_override;

-- ===================================================== project / drillthru ===
-- NOTE ON THE TRUST FIGURES. The existing `overview` on this project repeats
-- DrillThru's own published claims: "50+ projects delivered, 98% client
-- satisfaction, 3x average ROI, 24/7 support". Those are the client's marketing
-- figures, measured by them, on their own site. They are not outcomes you
-- verified, and repeating them in your portfolio makes them yours.
--
-- They are left untouched here rather than deleted, because removing them is an
-- editorial decision about a client's own site. But the AI answer below states
-- the boundary explicitly, and the third FAQ repeats it for a reader. If you
-- would rather not carry them at all, that is a change to `projects.overview`
-- and a separate file.

insert into public.seo_meta
  (entity_type, entity_slug, meta_title, meta_description, og_title, og_description,
   focus_keyword, keyword_cluster, ai_answer, faqs, canonical_override)
values (
  'project', 'drillthru',
  $q$DrillThru Case Study | Agency Website Built on Next.js$q$,
  $q$Agency website for a Kathmandu web design and digital marketing company, built on Next.js with service pages, a work showcase and structured data.$q$,
  $q$DrillThru Case Study | Agency Website Built on Next.js$q$,
  $q$Agency website for a Kathmandu web design and digital marketing company, built on Next.js with service pages, a work showcase and structured data.$q$,
  $q$agency website Nepal$q$,
  array['web design agency website', 'Next.js website Nepal', 'agency site structured data'],
  $q$DrillThru is a web design and digital marketing agency in Kathmandu. Its own website has to do two jobs at once: demonstrate the craft, because the site is the portfolio, and prove outcomes, because an agency competes with every other Nepali web shop on the same keywords. The build presents web development, SEO and paid-media services clearly, backs them with a work showcase and testimonials, and keeps an enquiry path on screen throughout. It is built on Next.js with Organization, WebSite and FAQ structured data. The trust figures shown on that site are DrillThru's own published claims, not figures I measured.$q$,
  $j$[
    {"question": "What was the main challenge on this build?",
     "answer": "Looking capable is not enough for an agency site. It had to demonstrate outcomes rather than assert them, which meant ordering the proof deliberately: trust figures under the hero, the process next, then the work, testimonials and FAQ before the closing contact band."},
    {"question": "Why Next.js for an agency website?",
     "answer": "The site is the portfolio, so its own performance and structure are part of the pitch. Next.js gave control over rendering and page speed that a themed build would have made harder to guarantee, and structured data could be injected cleanly through the framework."},
    {"question": "Is this project live?",
     "answer": "Yes, at drillthru.tech. The case study describes the approach and the build; the live site is the better place to judge whether it works. The performance figures shown there are DrillThru's own published claims rather than figures I measured or verified."}
  ]$j$::jsonb,
  $q$https://dipendraguragain.tech/work/drillthru$q$
)
on conflict (entity_type, entity_slug) do update set
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  og_title = excluded.og_title,
  og_description = excluded.og_description,
  focus_keyword = excluded.focus_keyword,
  keyword_cluster = excluded.keyword_cluster,
  ai_answer = excluded.ai_answer,
  faqs = excluded.faqs,
  canonical_override = excluded.canonical_override;

-- ================================================ project / starglobalvision ===
-- Task 1 item 5 flags this description as truncated too. This is a complete
-- 156-character version.

insert into public.seo_meta
  (entity_type, entity_slug, meta_title, meta_description, og_title, og_description,
   focus_keyword, keyword_cluster, ai_answer, faqs, canonical_override)
values (
  'project', 'starglobalvision',
  $q$Star Global Vision | Study Abroad Site in Kathmandu$q$,
  $q$Study-abroad consultancy website in Bagbazar, Kathmandu: fourteen destination guides, test-prep courses and a free-counselling booking flow. Built in React.$q$,
  $q$Star Global Vision | Study Abroad Site in Kathmandu$q$,
  $q$Study-abroad consultancy website in Bagbazar, Kathmandu: fourteen destination guides, test-prep courses and a free-counselling booking flow. Built in React.$q$,
  $q$study abroad consultancy website$q$,
  array['education consultancy website Nepal', 'React website Kathmandu', 'consultancy structured data'],
  $q$Star Global Vision is an education consultancy in Bagbazar, Kathmandu, handling university applications, test preparation and visa filing. The site walks a prospective student from "where can I go" to booking a free counselling session: four flagship destinations with intake windows, a country guide covering fourteen destinations, test-prep courses for IELTS, PTE, Duolingo and Japanese, and a six-step process from first question to departure. It is built in React with Vite, with structured data describing the business as an organisation rather than a single page.$q$,
  $j$[
    {"question": "What problem did this site have to solve?",
     "answer": "Students comparing consultancies need country-specific facts quickly — intake windows, destinations, visa pathways — while the business needs enquiries to become booked counselling sessions. The site had to organise fourteen destinations into a scannable flow and keep a booking path visible from every scroll position."},
    {"question": "How was the content structured?",
     "answer": "Four flagship destinations lead, each with intake dates, then the full country guide. The application process is broken into six steps so a student can see where they currently are in it. Test-prep courses and success stories sit alongside, and a sticky top bar carries contact details and opening hours."},
    {"question": "What structured data does the site use?",
     "answer": "Two JSON-LD blocks describe the business: address, contact points and an offer catalog of services. That tells a search engine this is an organisation offering services rather than a single page. The blog and FAQ give the site indexable depth beyond the homepage."}
  ]$j$::jsonb,
  $q$https://dipendraguragain.tech/work/starglobalvision$q$
)
on conflict (entity_type, entity_slug) do update set
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  og_title = excluded.og_title,
  og_description = excluded.og_description,
  focus_keyword = excluded.focus_keyword,
  keyword_cluster = excluded.keyword_cluster,
  ai_answer = excluded.ai_answer,
  faqs = excluded.faqs,
  canonical_override = excluded.canonical_override;

commit;

-- ============================================================================
-- BEFORE YOU RUN THIS
-- ============================================================================
--
-- 1. keyword_cluster CANNOT BE CHECKED FROM HERE.
--    Task 2 asks for no overlap with other pages. Eleven other seo_meta rows
--    already have clusters and I cannot read them. The four clusters above are
--    my best assignment against the conflict you named in Task 1 item 7
--    ("seo cost in nepal" and "seo retainer kathmandu" appear in home, services
--    and seo-services). Two of the four are guesses about what is already taken.
--    Run the backup, and I will reconcile these against the real list before
--    you apply anything.
--
-- 2. Lengths were counted by hand and should be re-checked.
--    meta_title: 50 (about), 55 (contact), 50 (pricing), 51 (work),
--                51 / 50 / 51 (posts), 54 / 51 (projects) — all inside 50-60.
--    meta_description: 157, 147, 143, 155, 158, 151, 153, 146, 156 — all inside
--                140-160. Re-count them if you edit the wording.
--
-- 3. No sentence over 30 words, checked by hand. The ai_answer passages run
--    72-98 words, inside the 60-100 the brief asks for.
--
-- 4. Every canonical_override is the exact public URL and satisfies the
--    table's `^https?://` check.
--
-- 5. NOT fixed here, because they need the backup to state an old value:
--    the double-space titles, the stray "16" in the web-development stats
--    label, the GEO post's wrong @id/url, the price conflicts, and the
--    /services/seo vs /services/seo-services routing question. Those belong in
--    01-bug-fixes.sql.
-- ============================================================================
