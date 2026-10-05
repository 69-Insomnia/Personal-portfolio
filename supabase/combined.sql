-- ============================================================
-- Combined: schema + admin user + seed data
-- Paste into Supabase Dashboard > SQL Editor and click Run.
-- Idempotent: safe to run more than once.
-- ============================================================

-- Initial schema for the portfolio backend: contact inbox + CMS collections.
-- Applied via the Supabase Management API (project db host is IPv6-only).

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- tables ---

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  company text,
  service text,
  budget text,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'read', 'replied', 'archived')),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  slug text primary key,
  title text not null,
  category text not null,
  secondary_categories text[] not null default '{}',
  description text not null,
  image text not null,
  images text[] not null default '{}',
  technologies text[] not null default '{}',
  year text,
  overview text,
  challenge text,
  approach text,
  development text,
  marketing text,
  results jsonb not null default '[]'::jsonb,
  link text,
  is_placeholder boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id text primary key,
  name text not null,
  role text not null,
  company text,
  content text not null,
  avatar text,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  slug text primary key,
  title text not null,
  excerpt text not null,
  category text not null,
  date text not null,
  reading_time text not null,
  image text not null,
  content text[] not null default '{}',
  tags text[] not null default '{}',
  is_placeholder boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experience (
  id text primary key,
  period text not null,
  role text not null,
  company text not null,
  description text not null,
  technologies text[] not null default '{}',
  is_placeholder boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  slug text primary key,
  service_index text not null default '01',
  title text not null,
  short_description text not null,
  description text not null,
  -- Long-form page body: [{ heading, paragraphs[] }]. Code-managed, not
  -- exposed in the admin editor, so admin saves never overwrite it.
  body jsonb not null default '[]'::jsonb,
  capabilities text[] not null default '{}',
  icon text not null default 'code',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists messages_created_at_idx on public.messages (created_at desc);
create index if not exists projects_sort_idx on public.projects (sort_order, created_at desc);
create index if not exists posts_sort_idx on public.posts (sort_order, date desc);
create index if not exists experience_sort_idx on public.experience (sort_order);
create index if not exists services_sort_idx on public.services (sort_order);
create index if not exists testimonials_sort_idx on public.testimonials (sort_order);

-- ------------------------------------------------------------- updated_at ---

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['messages', 'projects', 'testimonials', 'posts', 'experience', 'services']
  loop
    execute format(
      'drop trigger if exists touch_%I on public.%I; '
      'create trigger touch_%I before update on public.%I '
      'for each row execute function public.touch_updated_at()',
      t, t, t, t
    );
  end loop;
end;
$$;

-- -------------------------------------------------------------------- rls ---

alter table public.messages enable row level security;
alter table public.projects enable row level security;
alter table public.testimonials enable row level security;
alter table public.posts enable row level security;
alter table public.experience enable row level security;
alter table public.services enable row level security;

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;

do $$
declare t text;
begin
  -- messages: anyone may submit; only the signed-in admin reads/changes rows.
  drop policy if exists "messages insert" on public.messages;
  create policy "messages insert" on public.messages
    for insert to anon, authenticated with check (true);

  drop policy if exists "messages select" on public.messages;
  create policy "messages select" on public.messages
    for select to authenticated using (true);
  drop policy if exists "messages update" on public.messages;
  create policy "messages update" on public.messages
    for update to authenticated using (true) with check (true);
  drop policy if exists "messages delete" on public.messages;
  create policy "messages delete" on public.messages
    for delete to authenticated using (true);

  -- content collections: world-readable (the public site renders them),
  -- writable only by the signed-in admin.
  foreach t in array array['projects', 'testimonials', 'posts', 'experience', 'services']
  loop
    execute format('drop policy if exists "%I public read" on public.%I', t, t);
    execute format(
      'create policy "%I public read" on public.%I for select to anon, authenticated using (true)',
      t, t
    );
    execute format('drop policy if exists "%I admin write" on public.%I', t, t);
    execute format(
      'create policy "%I admin write" on public.%I for all to authenticated using (true) with check (true)',
      t, t
    );
  end loop;
end;
$$;

-- ------------------------------------------------------------- admin user ---

-- One Supabase Auth email/password user for /admin. Password comes from the
-- migration parameter embedded below (matches ADMIN_PASSWORD in .env.local).
delete from auth.identities
  where provider = 'email'
    and provider_id in (select id::text from auth.users where email = 'guragaidipendra6@gmail.com');
delete from auth.users where email = 'guragaidipendra6@gmail.com';

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  -- GoTrue scans these token columns into plain Go strings. Inserting a row
  -- without them leaves NULL behind, and the scan fails at login with
  -- "Database error querying schema" (500) before the password is checked.
  -- They must be empty strings, not NULL.
  confirmation_token, recovery_token, email_change,
  email_change_token_new, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token,
  created_at, updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'guragaidipendra6@gmail.com',
  extensions.crypt('tylbdL5n2JSahvwqm0ue', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"full_name": "Dipendra Guragain"}'::jsonb,
  '', '', '', '', '', '', '', '',
  now(),
  now()
);

insert into auth.identities (
  id, user_id, provider, provider_id, identity_data,
  last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(), u.id, 'email', u.id::text,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true,
    'full_name', 'Dipendra Guragain'
  ),
  now(), now(), now()
from auth.users u
where u.email = 'guragaidipendra6@gmail.com';


-- Seed data generated from src/data/*.ts (see scripts/genseed.ts).
-- Idempotent: ON CONFLICT DO NOTHING, so re-running never overwrites admin edits.

insert into public.projects (slug, title, category, secondary_categories, description, image, technologies, overview, challenge, approach, development, marketing, link, is_placeholder) values
  ('drillthru', 'DrillThru', 'Web Development', '{SEO,Marketing}', 'Agency website for DrillThru: web design, development, SEO and ads services presented with proof stats, a proven-framework process, a work showcase and enquiry paths.', '/images/project-drillthru.png', '{Next.js,"Technical SEO","Digital Marketing"}', 'The website for DrillThru, a web design and digital marketing agency serving businesses in Kathmandu and across Nepal. It has to sell two things at once: the craft, since the site itself is the portfolio, and the growth story behind it. Services span web design and development, SEO, Google Ads, Meta Ads, brand identity and performance optimization, backed by a trust band (50+ projects delivered, 98% client satisfaction, 3x average ROI, 24/7 support), a proven-framework process section, a work showcase featuring Pent House, Consultancy Hunt, Ticket Nepal and VELURA, testimonials, a blog and a frequently-asked-questions block.', 'An agency site competes with every other Nepali web shop on the same keywords, so looking capable is not enough. It has to demonstrate outcomes. The page needed to make web development, search and paid-media services legible to a business owner in seconds, prove them with work and testimonials, and turn that trust into an enquiry without adding friction.', 'A black-and-lime identity runs from the hero line ("Web design & development that drills through the competition") into every section. Two CTAs (Start Your Project, View Our Work) split ready-to-buy and still-browsing visitors, while floating Enquire Now and WhatsApp widgets keep a contact path on screen at all times. Proof is layered in order: trust stats under the hero, Our Proven Framework as the process, then work, testimonials and FAQ before the closing contact band.', 'Built as a Next.js application, with Organization, WebSite and FAQPage JSON-LD injected through the framework’s script pipeline. Services, work items and testimonials render from shared content so the catalogue stays consistent across sections, and the layout adapts from phone to desktop on the dark theme throughout.', 'SEO is wired into the page metadata: a title and meta description aimed at "web design Nepal", "website design Kathmandu" and "SEO agency Nepal" queries, a matching keywords meta, robots set to index, follow, a canonical URL on the www domain and an Open Graph title for shared links. Structured data covers the organisation, the website and the FAQ page, while the blog and testimonials give searchers indexable depth beyond the homepage.', 'https://drillthru.tech/', false),
  ('trip-zone', 'Trip Zone Travel & Tours', 'Web Development', '{SEO}', 'Nepal tour-package website covering nine handpicked journeys from Kathmandu, with clear pricing, transport options, destination filters and trip planning by WhatsApp.', '/images/project-tripzone.png', '{React,Vercel,"Technical SEO"}', 'The website for Trip Zone Travel & Tours, a Kathmandu-based operator running curated Nepal tours including Manang, Muktinath, Pathivara, Halesi, Sailung & Kalinchowk, Gosaikunda, Aama Yangri, Char Dham and Dhorpatan. Visitors can browse packages, filter by destination and tour type, see duration and vehicle-inclusive pricing on every card, and start a trip plan or WhatsApp chat from anywhere on the page. A gallery, blog and FAQ carry the destination knowledge behind the packages.', 'Travelers researching Nepal trips compare routes, durations and prices across scattered posts and PDFs. The site had to present nine very different journeys (mountain drives, pilgrimages, short escapes) as a consistent, scannable catalogue where price, transport and duration are visible without clicking, while keeping a direct enquiry path for visitors who would rather talk than browse.', 'A mega-dropdown Tours menu lists every package with thumbnail, location and trip length so the whole catalogue is one hover away. The hero pairs the mountain imagery with a journey-film card and a destination / tour-type search. Package cards carry a location caption, a short route description and price chips broken down by vehicle and group size. Trust stats (packages, travel styles, direct support), a Plan a trip button and a floating WhatsApp widget keep conversion within reach, on a green-and-navy identity throughout.', 'Built as a React application and deployed on Vercel. Tour cards, dropdown entries and filters render from shared package data, so prices and durations stay consistent wherever a trip appears. The layout adapts from phone to desktop, and the gallery, blog and FAQ are separate indexable routes rather than a single long page.', 'Search work on the site includes a destination-led meta title and description ("Nepal tour packages" plus the individual tour names), a canonical URL pointing at the production domain, and Schema.org structured data covering a WebSite entity, PostalAddress and Country markup, plus an FAQPage built from the real questions travellers ask. Open Graph title and image are set for shared links, while the blog and FAQ give the site indexable depth beyond the package pages.', 'https://trip-zone-travel-tours.vercel.app/', false),
  ('starglobalvision', 'Star Global Vision', 'Web Development', default, 'Website for a study-abroad consultancy in Kathmandu, with fourteen destination guides, test-prep courses, success stories and a free-counselling booking flow.', '/images/project-starglobalvision.png', '{React,Vite,"Structured Data"}', 'The website for Star Global Vision, an education consultancy in Bagbazar, Kathmandu that handles university applications, test preparation and visa filing. The homepage walks prospective students from “where can I go” to “book a free counselling session”: four flagship destinations (Australia, Canada, USA, UK) with intake windows, a full country guide covering fourteen destinations, test-prep courses for IELTS, PTE, Duolingo and Japanese, a six-step process from first question to departure, success stories, a blog and an FAQ.', 'Students comparing consultancies need country-specific facts fast (intakes, destinations, visa pathways) while the business needs enquiries to turn into counselling appointments. The site had to organise fourteen destinations and multiple services into a scannable flow, establish credibility (ministry approval, contact details and hours are pinned in the top bar), and keep a booking path visible from every scroll position.', 'A sticky top bar carries the ministry approval, opening hours, email and phone; the nav keeps Home, Destinations, Test Prep, Success Stories, Blog, About and Contact with a persistent Free counselling button. Destination cards lead with imagery and intake dates, the process is broken into six numbered steps, and a floating WhatsApp button plus a free-consultation modal (name, email, phone, preferred country, message) give two always-available conversion paths. A navy-and-orange identity, dark mode and social-proof badges carry the brand through the page.', 'Built as a React application bundled with Vite. Destinations, steps and services render from shared data so the fourteen country entries stay consistent, and the site is responsive from phone to desktop with a dark mode toggle. Two JSON-LD blocks describe the business (address, contact points and an offer catalog of services) so search engines see the consultancy as an organisation, not just a page.', 'Page-level SEO is wired in: a title and meta description targeting “study abroad consultancy in Kathmandu” plus destination and test-prep keywords, a canonical URL on the apex domain, and Schema.org structured data built from PostalAddress, ContactPoint, OfferCatalog, Service and City/Country entities. The blog and FAQ sections give the site indexable depth beyond the homepage.', 'https://www.starglobalvision.com/', false),
  ('poms-penthouse', 'POM''s Penthouse', 'Web Development', default, 'Booking website for a luxury serviced-apartment residence in Lakeside, Pokhara, with featured apartment listings, amenities and a gallery paired with nightly rates and direct WhatsApp reservations.', '/images/project-poms-penthouse.png', '{"Responsive Web Design","WhatsApp Booking","Image Gallery","Dark Mode"}', 'POM''s Penthouse is a luxury serviced-apartment residence in Lakeside, Pokhara, renting 1 BHK studios, 2 BHK and 3 BHK apartments to short-stay guests. The site introduces the residence, its rooms and its amenities, then turns that interest into a direct booking enquiry rather than passing the guest to a third-party marketplace.', 'Short-stay guests decide quickly and mostly from a phone, so the site had to do the comparison work for them. Three very different apartment types, a long amenity list and nightly rates all had to be readable at a glance. The property also wanted guests to reach it directly instead of through an OTA that takes a commission and hides the brand.', 'I shaped the page around the booking decision rather than a property brochure. Featured apartments lead, each with its own photograph, a plain-language summary, amenity tags and a "from" nightly rate, so a visitor can compare 1, 2 and 3 BHK side by side without opening a single detail page. Every card carries its own booking action, and the primary reservation route is WhatsApp, which guests in the region already use, so an enquiry costs one tap with no form, no account and no drop-off.', 'A mobile-first, responsive build with an image-led layout, viewport-sized apartment photographs, an amenities section, a photo gallery and a sticky booking call to action. A dark mode toggle lets guests browse comfortably for evening planning, and the whole interface was kept light so pages load quickly on mobile connections.', default, 'https://www.pomspenthouse.com/', false)
on conflict do nothing;

insert into public.posts (slug, title, excerpt, category, date, reading_time, image, tags, content) values
  ('technical-seo-foundations', 'Before You Write Another Blog Post, Fix These Technical Basics', 'Sites that "need more content" usually need their existing pages to be crawlable, fast and unambiguous first. Here is the order I check things in, and why content comes last.', 'SEO', '12 September 2026', '5 min read', '/images/blog-technical-seo-foundations.png', '{"Technical SEO","Core Web Vitals","Search Console"}', '{"Every few weeks someone asks me to look at a site that has stopped ranking, and the assumption is always the same: we need more content. Usually we do not. Usually there are eight or ten existing pages that a search engine cannot read properly, and adding a ninth does not fix that.","So I start at the bottom. Can Google fetch the page at all? I check robots.txt, then the rendered HTML rather than the source, because a lot of modern builds ship an empty shell and fill it in with JavaScript. If the content only exists after hydration, you are asking the crawler to do extra work and hoping it bothers.","Next, is each page about one thing? A page trying to rank for web design, SEO, ads and ecommerce at once ranks for none of them well. I map pages to the searches they should own, then look for the ones that overlap. Two pages chasing the same query compete with each other, and the fix is usually to merge them rather than write a third.","Then metadata, which is the cheapest thing on this list and the most commonly neglected. A title should say what the page is and where you are, not just repeat the brand. A title tag is often the highest-leverage line on a page and usually the last one anyone updates.","Structured data comes after that. It will not rank a page on its own, but it changes how the result looks, and better-looking results get clicked. Organization, WebSite and FAQPage cover most business sites, and a service or product page should describe the actual thing it sells.","Finally, speed. Not the number in a lab test, the number real visitors get. I look at field data for Core Web Vitals, find the slowest page that also gets traffic, and fix that one first instead of chasing a perfect score across the whole site.","The order matters. Content is the last lever, not the first, because content on a site that cannot be crawled or understood just adds to the pile."}'),
  ('whatsapp-booking-site', 'Why I Put WhatsApp at the Centre of a Booking Site', 'A booking form asks a guest to trust a strange site with their dates. WhatsApp asks them to do what they already do all day. On a recent hospitality build the second option was the obvious one.', 'Web Development', '28 August 2026', '4 min read', '/images/blog-whatsapp-booking-site.png', '{"Web Development","Mobile First",Conversion}', '{"The brief was a booking website for a serviced apartment residence in Lakeside, Pokhara, and the first wireframe I drew had a form on it. Dates, guests, name, email, submit. That is what booking websites look like.","Then I thought about who actually books a short stay in a place like that. They are on a phone, often already travelling or about to, and they have a question a form cannot answer: is the room I am looking at free on the dates I want, and can I see the actual room first?","A form hides behind a submit button. You fill it in, you wait, and you find out later. WhatsApp is a conversation. You ask, someone answers, and they can send you a photo of the room.","So the reservation path became a single tap. No account, no email confirmation loop, no form validation errors on a phone keyboard at eleven at night.","That decision shaped the rest of the build. If the enquiry happens in a chat, the site has one job: get someone to that tap with enough confidence to make it. Which means the apartments have to be comparable without clicking through, so three types sit side by side with their own photographs, a plain-language summary, the amenities that matter, and a from-price per night.","Mobile-first stopped being a slogan and became the layout constraint. Photographs sized for a phone screen, an amenities section that scans, a gallery, and a booking button that stays reachable as you scroll.","Not every business should do this. Sell something with a fixed price and no variables and a checkout will always beat a conversation. But anywhere the customer has a question before they commit, moving that conversation earlier in the flow is usually the right call."}'),
  ('ecommerce-one-system', 'Ecommerce Is One System, Not Four Channels', 'The storefront, the search result, the ad and the report get optimised in separate rooms by separate people. The customer only ever experiences them together.', 'Ecommerce', '9 August 2026', '5 min read', '/images/blog-ecommerce-one-system.png', '{Ecommerce,Analytics,Conversion}', '{"Most ecommerce problems arrive described as one problem. Traffic is down. Conversion is down. Ad costs are up. In practice they are usually the same problem wearing different hats.","Take a product page that loads in four seconds on mobile. The SEO person sees a Core Web Vitals issue. The ads person sees a landing page with a high bounce rate and blames the audience. The merchandiser sees a product nobody buys. All three are looking at the same page and none of them are wrong, which is exactly why nobody fixes it.","So I try to hold the whole funnel in one view, from the first search to the repeat order, and ask where the drop actually happens. Sometimes it is the page. Sometimes it is the query that brought them there, which means the page is promising something the product does not deliver.","The useful questions are unglamorous. Which products get views but no carts? Which queries land on a page that does not answer them? Which ad sends traffic to a category page when the customer wanted one specific item? Those answers usually point at a fix that costs nothing to ship.","Analytics has to be trustworthy before any of this works. If the purchase event fires twice, or never fires on mobile, every decision downstream is made against a number that is wrong. I would rather spend a week fixing tracking than a month optimising against bad data.","None of this is a channel strategy. It is just refusing to treat the storefront, the search result, the ad and the report as separate businesses, because the customer never does."}')
on conflict do nothing;

insert into public.experience (id, period, role, company, description, technologies, is_placeholder) values
  ('drillthru', '1 Year', 'Web Developer', 'DrillThru', 'A year at DrillThru, a web design and digital marketing agency in Nepal. I built the agency''s own site on Next.js: service pages, work showcase, testimonials, blog and enquiry flows, plus the structured data that feeds their search results. Sitting next to the SEO and ads work is where I stopped thinking of a website as the finish line.', '{Next.js,"Technical SEO","Digital Marketing"}', false),
  ('poms-penthouse', '6 Months', 'Web Developer', 'POM''s Penthouse', 'Six months on the booking site for POM''s Penthouse, a serviced-apartment residence in Lakeside, Pokhara. Guests compare 1, 2 and 3 BHK apartments with amenities and nightly rates at a glance, then reserve over WhatsApp in one tap rather than filling in a form and waiting.', '{"Responsive Web Design","WhatsApp Booking","Dark Mode"}', false)
on conflict do nothing;

insert into public.testimonials (id, name, role, company, content, avatar) values
  ('drillthru', 'DrillThru', 'Web Design & SEO', 'drillthru.tech', 'Agency website delivered on Next.js: services, work showcase, testimonials, blog and FAQ, with organization, website and FAQ structured data wired in for search.', '/images/clients/drillthru.png'),
  ('trip-zone', 'Trip Zone Travel & Tours', 'Web Development', 'trip-zone-travel-tours.vercel.app', 'Travel site with a mega-dropdown tours catalogue, package cards carrying location, route and price detail, trust stats and a floating WhatsApp booking path on a green-and-navy identity.', '/images/clients/tripzone.png'),
  ('starglobalvision', 'Star Global Vision', 'Web Development', 'starglobalvision.com', 'Consultancy website covering fourteen destinations, test-prep courses, success stories and a free-counselling booking flow, built in React with business structured data for search.', '/images/clients/starglobalvision.png'),
  ('poms-penthouse', 'POM''s Penthouse', 'Web Development', 'pomspenthouse.com', 'Mobile-first booking site for a Lakeside, Pokhara residence: apartment comparison with amenities and nightly rates, photo gallery and direct WhatsApp reservations.', '/images/clients/poms-penthouse.png')
on conflict do nothing;

insert into public.services (slug, service_index, title, short_description, description, body, capabilities, icon) values
  ('web-development', '01', 'Web Development Specialist', 'Custom websites and web applications built with React, Next.js, WordPress and Shopify.', 'I''m a web development specialist in Kathmandu, building marketing sites, web applications and online stores. The stack follows the job rather than a preference: React and Next.js where the project needs to be fast and custom, WordPress or Shopify where someone other than me has to edit it after launch. Every build starts with what the site has to do for the business, because a good-looking site that takes four seconds to load on a phone has already failed at the only thing it was for. What that means in practice is a fast, accessible, maintainable build that someone else can pick up later without a rewrite. I work across the front end and the back end, wire the analytics up properly, and stay involved after launch long enough to see how people actually use it.', '[{"heading":"What does a web development specialist build?","paragraphs":["Most of the work is one of three things: a marketing site that has to explain a business and collect enquiries, a web application that does something specific, or an online store. They have different constraints and I build them differently.","A marketing site is a persuasion problem. The pages have to load fast, read clearly and lead somewhere. An application is a state problem: what happens when two people edit the same record, what happens when the network drops. A store is a trust problem, and everything from the product page to the checkout either builds trust or spends it."]},{"heading":"How do you choose between Next.js, WordPress and Shopify?","paragraphs":["The honest answer is that it depends on who edits the site after I hand it over. If the owner wants to publish blog posts and change copy without calling anyone, WordPress or Shopify will do that better than a custom build, and I will say so even when a custom build would be more interesting work.","React and Next.js make sense when the site has to do something the platforms cannot, when performance is the constraint, or when the design is specific enough that fighting a theme costs more than building it. The stack is a decision about maintenance, not about quality."]},{"heading":"What happens after launch?","paragraphs":["A launch is the point where you start finding out what is wrong, not the point where the work stops. I watch what real visitors do for the first few weeks: which pages they leave from, where the forms get abandoned, what the field data says about speed on the phones people actually use.","That is also when the technical SEO is worth checking, because a site that cannot be crawled or that renders slowly on mobile will not rank no matter how good the copy is. Fixing it at launch is far cheaper than fixing it a year later."]}]'::jsonb, '{React,Next.js,JavaScript,TypeScript,Node.js,PHP,WordPress,Shopify,WooCommerce}', 'code'),
  ('seo', '02', 'SEO Specialist', 'Technical SEO, keyword research and content work for businesses in Nepal.', 'I''m an SEO specialist based in Kathmandu, working with businesses across Nepal. The job is to make a site findable for the searches that bring customers, and then to show that it worked. That starts with technical foundations, because nothing survives on top of a broken base: whether a crawler can read the page, whether it renders in under two seconds on a phone, and whether each page is about one thing. Only then does keyword and content work make sense. I also handle the part most audits skip, which is whether your conversion tracking fires correctly. Optimising against a number that is wrong costs more than doing nothing, and it is the most common problem I find on sites that already spend on SEO.', '[{"heading":"What does an SEO specialist actually do?","paragraphs":["Four things, in this order: make the site crawlable, make it fast, make each page about one thing, then build content around what people search for. The order matters because each step depends on the one before it.","It is not a channel you bolt on at the end. When SEO is treated as something that happens to a finished website, most of the leverage is already gone, because the decisions that matter most (URL structure, page focus, how content is organised) were made during the build."]},{"heading":"Why does the technical work come first?","paragraphs":["Because content on a site that cannot be crawled just adds to the pile. I have lost count of the times someone has asked for help ranking, and the real problem was eight existing pages a search engine could not read properly, not a shortage of new ones.","The technical list is short and unglamorous. Can Google fetch the page. Does it render without JavaScript being executed. Is it fast on a mid-range Android phone, which is what most visitors in Nepal are using. Do two pages compete for the same query. None of that requires new content, and all of it caps what new content can achieve."]},{"heading":"How long before rankings move?","paragraphs":["Technical fixes can show up within days if the page was previously blocked or broken. Content and authority work is measured in months, not weeks, and anyone promising otherwise is guessing.","What I will commit to is a shorter list of things worth doing, ordered by impact, and a clear indication of whether each one worked. If a fix does not move anything within a reasonable window, that is information too, and it is better to know it early."]},{"heading":"Do you work with businesses outside Nepal?","paragraphs":["Yes. I am based in Kathmandu and most of my client work has been for businesses in Nepal, but I work remotely and I am used to running projects over written updates rather than meetings.","For local searches the geography matters a great deal, and it is worth being explicit: ranking in the map pack for a Nepali city needs a Google Business Profile and consistent business details, which is a different job from the on-page work."]}]'::jsonb, '{"Technical SEO","Keyword Research","On-Page SEO","Content SEO","Ecommerce SEO","Local SEO",Schema,"Internal Linking","Core Web Vitals"}', 'search'),
  ('ai-search', '07', 'AI Search Specialist', 'AI search visibility: getting mentioned or cited by AI Overviews, ChatGPT and Perplexity.', 'I work on AI search visibility: whether AI Overviews, ChatGPT, Perplexity and Copilot mention or cite a business when someone asks about its services. Google''s own guidance is blunt about this and worth repeating, because a lot of agencies are selling it as a new discipline: optimising for generative AI search is still SEO, and the labels in circulation — AEO (Answer Engine Optimization), GEO (Generative Engine Optimization), AIO (AI Overviews Optimization), LLMO (Large Language Model Optimization) and LMO — describe overlapping work rather than separate channels. Google also states directly that llms.txt and similar files neither help nor hurt its rankings. What does move it is less exotic. Ranking classically comes first, because most AI citations are pulled from pages that already rank in the top ten. Then original data worth quoting, self-contained answers, dated and attributed content, and a brand that exists outside your own website.', '[{"heading":"What is AI search optimization?","paragraphs":["It is SEO applied to surfaces that answer questions instead of listing links. When someone asks an AI assistant which SEO specialist to hire in Kathmandu, the assistant assembles an answer from sources it already trusts, and the question is whether your business is one of them.","The acronyms you will see quoted at you mostly describe the same work. Answer Engine Optimization and Generative Engine Optimization are the two with real usage; AI Overviews Optimization, Large Language Model Optimization and LMO are later additions describing pieces of the same problem. Treating each as its own service to buy is how a business ends up paying five times for one job."]},{"heading":"How do AI systems decide what to cite?","paragraphs":["Two mechanisms, and they behave differently. Google AI Overviews leans heavily on classic ranking: the large majority of pages it cites are already in the top ten results, so the traditional work feeds it directly.","ChatGPT and Perplexity draw on a wider pool and weight things differently. Both lean on sources that exist off your own site, and studies of AI citations consistently find brand mentions correlate with visibility far more strongly than backlinks do. Presence on Wikipedia, Reddit, YouTube and LinkedIn matters more here than another directory listing."]},{"heading":"What actually moves AI visibility?","paragraphs":["Four things, roughly in order of leverage. Rank well in normal search, because most AI citations come from pages that already do. Write passages that survive being quoted out of context, since a claim that only makes sense beside the paragraph above it will not be extracted. Put a date and a name on your content, because recency and authorship both correlate with citation. And exist elsewhere, which for a person or a small business means the unglamorous work of profiles, answers and mentions.","I have already made the technical side of this site ready: AI crawlers are allowed explicitly in robots.txt, the structured data describes the person and the business, and every page carries a byline."]},{"heading":"What I will not promise","paragraphs":["I will not promise a citation. Nobody controls what an AI assistant says, the systems change monthly, and any agency quoting a guaranteed share of AI answers is describing something they cannot deliver.","What I can do is make the site legible and quotable to systems that read it, fix the technical things that stop it being read at all, and tell you honestly which of the changes were worth the money. If a tactic has no evidence behind it, I would rather say so than bill for it."]}]'::jsonb, '{"AI Overviews","ChatGPT & Perplexity","Generative Engine Optimization","Answer Engine Optimization","Citable Passages","Entity & Brand Signals","Structured Data","AI Crawler Access"}', 'sparkles'),
  ('meta-ads', '03', 'Meta Ads Specialist', 'Facebook and Instagram campaigns built around audiences, creative testing and real tracking.', 'I''m a Meta Ads specialist working on Facebook and Instagram campaigns. The work is ordered deliberately: audience structure first, then creative testing, then tracking. Most accounts I look at have the third one wrong, and that is the expensive one. If a purchase event fires twice, or never fires on mobile, every decision after it is made against a number that is wrong, so the budget goes where the reporting says rather than where the customers are. I set up the pixel and events properly before scaling anything, then test creative in disciplined batches instead of guessing at it. Lead generation and ecommerce campaigns are most of what I run, and reporting stays on conversions rather than impressions, because impressions have never paid anyone''s invoices.', '[{"heading":"What does a Meta Ads specialist actually manage?","paragraphs":["The account structure, the audiences, the creative pipeline and the measurement. Those four things produce the result; the daily bidding tweaks that agencies like to describe are mostly noise at small budgets.","Audience structure means deciding who sees what and making sure the account does not compete with itself. In Nepal the audiences are smaller than in larger markets, which changes the strategy: fewer, broader buckets usually beat a long list of narrow interests, because narrow audiences exhaust quickly and start showing the same people the same ad."]},{"heading":"Why fix tracking before spending more?","paragraphs":["Because a wrong number is worse than no number. If your reported cost per purchase is half the real one, you will scale the campaign that is losing money and pause the one that works.","The failure modes are dull and common. The purchase event fires on page load as well as on completion. It fires on desktop but not on mobile, which is most of the traffic here. It fires from the test pixel for months because nobody removed it. I check all of this before touching the budget."]},{"heading":"How is creative testing structured?","paragraphs":["One variable at a time, enough spend to mean something, and enough patience not to call it early. Testing four concepts and twelve headlines at once tells you nothing about which change made the difference.","For most small budgets, the creative is the main lever. Audience targeting has been progressively automated by Meta, so the ad itself, and the product page it lands on, do most of the work."]}]'::jsonb, '{"Facebook Ads","Instagram Ads",Retargeting,"Lead Generation","Ecommerce Ads","Creative Testing","Meta Pixel"}', 'target'),
  ('google-ads', '04', 'Google Ads Specialist', 'Search, Display, YouTube and remarketing campaigns aimed at people already looking.', 'I''m a Google Ads specialist. The difference between Google Ads and most other channels is intent: the person is already searching for the thing, so most of the work is about not wasting the click. That means tight accounts rather than broad ones, keywords matched to what the landing page actually delivers, and negative keyword lists that get maintained rather than set once and forgotten. I run Search, Display, YouTube and remarketing campaigns, and I would rather spend a week getting conversion tracking right than a month optimising against numbers I do not trust. For a business in Nepal, Search carries most of the value, because it catches demand that already exists. Display and YouTube do a different job, which is keeping a brand in view while someone decides.', '[{"heading":"What does a Google Ads specialist do differently?","paragraphs":["Mostly, they delete things. The first pass on an inherited account is usually removing keywords that were never going to convert, pausing ad groups with no impressions, and rebuilding the negative keyword list.","The second difference is matching the ad to the page. Sending a search for one specific product to a category page is one of the most common and most expensive mistakes in ecommerce, and it is invisible in the ads dashboard because the click did happen. It just did not become anything."]},{"heading":"Where does the budget usually leak?","paragraphs":["Broad match keywords with no negatives, which is Google happily spending on searches you cannot serve. Display placements bundled into a Search campaign. And conversion actions counted twice, which makes a bad campaign look efficient.","In Nepal there is a specific one worth knowing: a lot of search volume is in romanised Nepali rather than English, and campaigns targeting only English miss buyers who are searching for exactly what you sell."]},{"heading":"Which campaign types are worth running?","paragraphs":["Search first, always, because it captures existing demand and it is the only place where the person has already told you what they want. Remarketing second, because it is cheap and the audience is qualified by definition.","Display and YouTube depend on the business. They are awareness tools, and awareness is hard to attribute and easy to overspend on. I will run them when there is a reason to, not because the account looks fuller with them in it."]}]'::jsonb, '{"Search Ads","Display Ads","YouTube Ads",Remarketing,"Conversion Tracking","Keyword Strategy","Google Tag Manager"}', 'chart'),
  ('ecommerce-growth', '05', 'Ecommerce Growth Specialist', 'Storefront, product SEO, ads and analytics treated as one funnel rather than four projects.', 'I work on ecommerce growth, which in practice means treating the storefront, product pages, search visibility, advertising and analytics as one system rather than four projects owned by four people. Most ecommerce problems arrive described as a single problem. Traffic is down, or conversion is down, or ad costs are up, and it usually turns out to be the same problem wearing different hats. A product page that takes four seconds to load on mobile is an SEO issue, an advertising issue and a merchandising issue at once, and because three people each see a different symptom, nobody fixes it. So I start by finding where people actually drop off, using the funnel rather than an opinion, and fix that before sending more traffic into a leaking store.', '[{"heading":"Why do ecommerce problems look like several problems?","paragraphs":["Because each specialist sees the symptom their tool measures. The SEO sees a Core Web Vitals failure. The ads manager sees a high bounce rate and blames the audience. The merchandiser sees a product with views and no carts.","All three are describing the same page and none of them is wrong. That is exactly why it goes unfixed: the problem is not inside anybody''s remit, so it sits in the gap between them."]},{"heading":"What does the funnel work actually involve?","paragraphs":["Unglamorous questions with specific answers. Which products get views but no carts. Which queries land on a page that does not answer them. Which ad sends someone to a category when they wanted one item. Which step of checkout has the highest abandonment.","Those answers usually point at a fix that costs nothing to ship, which is why I look for them before proposing new campaigns. Buying more traffic for a store that loses people at checkout is an expensive way to stay where you are."]},{"heading":"Do you work on Shopify and WooCommerce?","paragraphs":["Yes, and on custom storefronts. The platform changes what is easy, not what matters. The things that decide whether a store grows (page speed, product page clarity, search visibility, checkout friction, trustworthy analytics) are the same on every platform.","Where the platform does matter is in what I can change directly. On Shopify and WooCommerce some fixes are configuration and some need code; on a custom build it is all code. I will tell you which before quoting."]}]'::jsonb, '{Shopify,WooCommerce,"Product SEO","Conversion Optimization","Meta Ads","Google Ads",Analytics,Retargeting}', 'shopping-bag'),
  ('digital-marketing', '06', 'Digital Marketing Specialist', 'One strategy across content, search, paid media and conversion instead of four separate people.', 'I''m a digital marketing specialist, which mostly means refusing to treat content, search, paid media and conversion as separate jobs. They get decided together because they only pay off together. An ad that sends traffic to a page which does not answer the query wastes the budget, and a page nobody can find wastes the writing. The question stays the same across all of it: what brings the right visitors, and what turns them into customers. For a business in Nepal that usually means search first, because demand already exists and it is the cheapest demand to capture, then paid media to reach the people who are not searching yet, then the conversion work that stops both from leaking. One person holding all four is not about doing more. It is about not having to reconcile four reports that disagree.', '[{"heading":"What does a digital marketing specialist actually own?","paragraphs":["The plan and the numbers behind it. Which channel gets the next rupee, what each one is expected to return, and what gets cut when it does not deliver.","That is a different job from running four channels well in isolation. When search, ads and content are optimised separately by different people against different targets, the business can hit every one of those targets and still not grow, because none of them was measuring the thing that mattered."]},{"heading":"Which channel should come first?","paragraphs":["For most small businesses in Nepal, search. The demand already exists and someone is already looking, which makes it far cheaper than creating demand from scratch with advertising.","Paid social comes next, once there is something worth sending people to. Advertising a page that does not convert is the most reliable way to conclude, wrongly, that advertising does not work."]},{"heading":"How do you decide what to stop doing?","paragraphs":["By agreeing in advance what each channel is supposed to return, and on what timeline. Without that, nothing ever gets cut, because every channel can produce an anecdote about the time it worked.","I would rather run three things properly than six badly. Most marketing budgets I see are spread thin enough that no single channel has enough data or enough spend to work at all."]}]'::jsonb, '{Content,Search,Advertising,Conversion,Analytics}', 'megaphone')
on conflict do nothing;


-- ============================================================
-- SEO layer: seo_meta, redirects, site_settings.
-- Copied from supabase/migrations/20261005001000_seo_layer.sql so this file
-- stays the single paste-and-run bootstrap. The migration is the source of
-- truth; if the two disagree, the migration is right.
-- Appended here (after the seed data) because the seo_meta seed below selects
-- from projects, posts and services.
-- ============================================================

-- SEO layer: per-entity metadata, permanent redirects, and global settings.
--
-- This is the database half of moving SEO out of `src/data/seo.ts` and into
-- something the admin panel can edit. The code half is `getSeo`/`getSeoMap` in
-- `src/lib/content.ts`, which follow the same DB-first-with-static-fallback
-- discipline as every other reader there: with no `seo_meta` rows present the
-- site renders exactly the templates it renders today.
--
-- ## Why one side table instead of columns on each content table
--
-- Static pages (home, about, contact) have no row to hang columns on, and the
-- brief asks for SEO control over those too. One polymorphic table means one
-- editor component and one slug-change hook instead of four of each.
--
-- The cost is real and is paid deliberately: there is no foreign key from
-- `seo_meta` to the entity it describes, so cascade is handled by the triggers
-- below rather than by the database. `entity_slug` is kept in step by
-- `on_slug_change` and cleaned up by `on_entity_delete`.

-- ---------------------------------------------------------------- redirects ---

-- Permanent redirects, logged automatically when a slug changes.
--
-- Paths are stored normalised: leading slash, lowercase, no trailing slash.
-- That is enforced here rather than anywhere upstream because this table is
-- what the router reads, and a stored path that does not match the request
-- path is a redirect that silently never fires.

create table if not exists public.redirects (
  id          uuid primary key default gen_random_uuid(),
  from_path   text not null unique
              check (from_path like '/%' and from_path = lower(from_path)
                     and from_path <> '/' and from_path !~ '/$'),
  -- '/' is a legitimate destination — a dead page is often best sent to the
  -- homepage — so the trailing-slash rule has to exempt it explicitly. Without
  -- the exemption the check reads as "no path may end in a slash", which
  -- rejects the one path that is nothing but a slash.
  to_path     text not null
              check (to_path = lower(to_path) and (to_path = '/' or to_path !~ '/$')),
  -- 308 is what Next's `permanentRedirect()` emits and is the default the
  -- router relies on. 301 is accepted for rows added by hand.
  status_code smallint not null default 308 check (status_code in (301, 308)),
  -- Bumped by the app, not by the triggers. A redirect that still has 0 hits
  -- long after the rename is one you can safely delete.
  hit_count   integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------ site_settings ---

-- Singleton row for the global SEO panel.
--
-- `boolean primary key default true check (id)` is the standard singleton
-- guard: it makes a second settings row impossible rather than merely
-- discouraged. The `default true` means `insert into site_settings default
-- values` produces the one row, which is what the seed below relies on.

create table if not exists public.site_settings (
  id                       boolean primary key default true check (id),
  title_suffix             text not null default '',
  default_meta_description text not null default '',
  default_og_image         text not null default '/og-image.png',
  person_job_title         text,
  person_knows_about       text[] not null default '{}',
  -- Analytics and verification. Every one of these is served in the public
  -- HTML, so they are readable by anon and there is nothing here to protect.
  ga4_measurement_id       text,
  gtm_container_id         text,
  meta_pixel_id            text,
  google_site_verification text,
  bing_site_verification   text,
  -- Raw robots.txt body. NULL means "render the generated default" — see
  -- `defaultRobotsTxt` in src/lib/robots.ts. An empty string is treated the
  -- same way, because a blank file deindexes the whole site.
  robots_txt               text,
  updated_at               timestamptz not null default now()
);

insert into public.site_settings (id) values (true) on conflict (id) do nothing;

-- ----------------------------------------------------------------- seo_meta ---

-- Per-entity search and social metadata. An absent row means "inherit the
-- template in src/data/seo.ts", which is what keeps the static fallback and
-- every page that has never been touched in the admin rendering unchanged.

create table if not exists public.seo_meta (
  id                  uuid primary key default gen_random_uuid(),
  entity_type         text not null
                      check (entity_type in ('project', 'post', 'service', 'page')),
  -- For a static page this is a stable name rather than a URL fragment: the
  -- home page is stored as 'home', not ''. See STATIC_PAGE_SLUGS in
  -- src/app/sitemap.ts for the full mapping.
  entity_slug         text not null
                      check (entity_slug = lower(entity_slug)
                             and entity_slug !~ '^/' and entity_slug !~ '/$'),

  meta_title          text,
  meta_description    text,
  focus_keyword       text,
  keywords            text[] not null default '{}',

  og_title            text,
  og_description      text,
  og_image            text,
  twitter_title       text,
  twitter_description text,
  twitter_image       text,

  -- Optional. Points at the original source when this was published elsewhere
  -- first. Constrained to absolute http(s) because a relative value here
  -- resolves against the *current* page and is therefore worse than no
  -- canonical at all — the same failure src/data/seo.ts documents at length
  -- for site.url.
  canonical_override  text check (canonical_override is null
                                  or canonical_override ~ '^https?://'),

  -- Drives the admin's "Hide from search engines" toggle. Only `index` and
  -- `follow` are stored; the rest of the layout's robots directives
  -- (max-image-preview, max-snippet) are left to be inherited, which is why
  -- buildMetadata omits the key entirely rather than passing a partial object.
  noindex             boolean not null default false,
  nofollow            boolean not null default false,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (entity_type, entity_slug)
);

-- The unique constraint above already provides the lookup index for both
-- `getSeo` (entity_type + entity_slug) and `getSeoMap` (full scan).

-- ------------------------------------------------------ slug lowercase guard ---

-- Automatic lowercase URLs, enforced where they cannot be bypassed. The admin
-- panel slugifies client-side too, but a constraint is the thing that makes
-- the guarantee true — including for rows written by scripts/sync-content.ts.
--
-- Trailing slashes are not handled here: `trailingSlash: false` is Next's
-- default and already 308-redirects /about/ to /about before a route runs.

alter table public.projects drop constraint if exists projects_slug_lowercase;
alter table public.projects add constraint projects_slug_lowercase
  check (slug = lower(slug) and slug !~ '^/' and slug !~ '/$');

alter table public.posts drop constraint if exists posts_slug_lowercase;
alter table public.posts add constraint posts_slug_lowercase
  check (slug = lower(slug) and slug !~ '^/' and slug !~ '/$');

alter table public.services drop constraint if exists services_slug_lowercase;
alter table public.services add constraint services_slug_lowercase
  check (slug = lower(slug) and slug !~ '^/' and slug !~ '/$');

-- --------------------------------------------------------- slug change hook ---

-- Fires on every content table whose slug is a URL segment. Three jobs: log
-- the redirect, collapse any redirect chain that already pointed here, and
-- keep seo_meta attached to the renamed entity.
--
-- Chain collapsing is the part that is easy to omit and expensive to skip. A
-- slug renamed twice produces A→B and B→C, so A→B→C is a two-hop redirect:
-- crawlers follow it, but it is a weaker signal and costs a round trip on
-- every old link. Rewriting any row that pointed at the OLD path to point at
-- the NEW path keeps every redirect one hop.
--
-- The reciprocal delete prevents a loop. Renaming B back to A when A→B already
-- exists would otherwise leave two rows pointing at each other.
--
-- tg_argv: [0] = entity_type, [1] = path prefix ('' for static pages)

create or replace function public.on_slug_change() returns trigger
language plpgsql as $$
declare
  entity   text := tg_argv[0];
  prefix   text := tg_argv[1];
  old_path text;
  new_path text;
begin
  if new.slug is not distinct from old.slug then
    return new;
  end if;

  old_path := case when prefix = '' then '/' || old.slug
                   else '/' || prefix || '/' || old.slug end;
  new_path := case when prefix = '' then '/' || new.slug
                   else '/' || prefix || '/' || new.slug end;

  delete from public.redirects where from_path = new_path and to_path = old_path;

  update public.redirects
     set to_path = new_path, updated_at = now()
   where to_path = old_path;

  insert into public.redirects (from_path, to_path)
  values (old_path, new_path)
  on conflict (from_path) do update
    set to_path = excluded.to_path, updated_at = now();

  -- Clear any row already sitting on the new slug before moving this entity's
  -- over. Two entities of the same type cannot share a slug (it is the primary
  -- key), so such a row is necessarily orphaned — but it would still trip the
  -- `unique (entity_type, entity_slug)` constraint and abort the whole save
  -- with an error that says nothing about the slug that was actually renamed.
  delete from public.seo_meta
   where entity_type = entity and entity_slug = new.slug;

  update public.seo_meta
     set entity_slug = new.slug, updated_at = now()
   where entity_type = entity and entity_slug = old.slug;

  return new;
end;
$$;

-- `before update of slug` rather than `before update` so an ordinary edit that
-- does not touch the slug costs nothing.

drop trigger if exists slug_change on public.projects;
create trigger slug_change before update of slug on public.projects
  for each row execute function public.on_slug_change('project', 'work');

drop trigger if exists slug_change on public.posts;
create trigger slug_change before update of slug on public.posts
  for each row execute function public.on_slug_change('post', 'blog');

drop trigger if exists slug_change on public.services;
create trigger slug_change before update of slug on public.services
  for each row execute function public.on_slug_change('service', 'services');

-- ------------------------------------------------------- delete cleanup hook ---

-- A deleted project redirects to its section index instead of 404ing, which
-- keeps any accumulated link equity inside the site rather than dropping it.
-- Delete the row from /admin/redirects to turn this back into a 404.
--
-- tg_argv: [0] = entity_type, [1] = path prefix, [2] = fallback destination

create or replace function public.on_entity_delete() returns trigger
language plpgsql as $$
declare
  entity text := tg_argv[0];
  prefix text := tg_argv[1];
  leaf   text := tg_argv[2];
  path   text;
begin
  path := case when prefix = '' then '/' || old.slug
               else '/' || prefix || '/' || old.slug end;

  insert into public.redirects (from_path, to_path)
  values (path, leaf)
  on conflict (from_path) do update
    set to_path = excluded.to_path, updated_at = now();

  delete from public.seo_meta where entity_type = entity and entity_slug = old.slug;
  return old;
end;
$$;

drop trigger if exists entity_delete on public.projects;
create trigger entity_delete after delete on public.projects
  for each row execute function public.on_entity_delete('project', 'work', '/work');

drop trigger if exists entity_delete on public.posts;
create trigger entity_delete after delete on public.posts
  for each row execute function public.on_entity_delete('post', 'blog', '/blog');

drop trigger if exists entity_delete on public.services;
create trigger entity_delete after delete on public.services
  for each row execute function public.on_entity_delete('service', 'services', '/services');

-- --------------------------------------------------------------------- rls ---

alter table public.seo_meta      enable row level security;
alter table public.redirects     enable row level security;
alter table public.site_settings enable row level security;

-- Same shape as the init migration: `grant all` opens the door, RLS is the
-- gate. The init migration's `grant all on all tables in schema public` only
-- covered the tables that existed when it ran, so the new ones need their own.
grant all on public.seo_meta, public.redirects, public.site_settings
  to anon, authenticated;

-- Public read on all three. The site reads them with the anon key on the
-- server (see `db()` in src/lib/content.ts), none of the columns are secret,
-- and writes stay behind auth.
do $$
declare t text;
begin
  foreach t in array array['seo_meta', 'redirects', 'site_settings']
  loop
    execute format('drop policy if exists "%I public read" on public.%I', t, t);
    execute format(
      'create policy "%I public read" on public.%I for select to anon, authenticated using (true)',
      t, t
    );
    execute format('drop policy if exists "%I admin write" on public.%I', t, t);
    execute format(
      'create policy "%I admin write" on public.%I for all to authenticated using (true) with check (true)',
      t, t
    );
  end loop;
end;
$$;

-- ------------------------------------------------------------- updated_at ---

-- Reuses `touch_updated_at` from the init migration rather than redefining it,
-- so the four tables in this file cannot drift from the six in that one.

drop trigger if exists touch_seo_meta on public.seo_meta;
create trigger touch_seo_meta before update on public.seo_meta
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_redirects on public.redirects;
create trigger touch_redirects before update on public.redirects
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_site_settings on public.site_settings;
create trigger touch_site_settings before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------- seed rows ---

-- Seeded from the copy that is live today, so the admin panel opens showing
-- what the site actually says rather than blank fields.
--
-- Without this, the first save from a half-filled panel would replace a
-- template title with NULL and the page would fall back to a weaker default.
-- Seeding makes the panel's starting state and the live state the same thing.
--
-- `left(..., 158)` matches DESCRIPTION_LIMIT in src/utils/metadata.ts.

insert into public.seo_meta (entity_type, entity_slug, meta_title, meta_description, noindex)
select 'project', p.slug,
       p.title || ' Case Study | ' || p.category || ' in Nepal',
       left(p.description, 158),
       false
from public.projects p
where p.published = true
on conflict (entity_type, entity_slug) do nothing;

insert into public.seo_meta (entity_type, entity_slug, meta_title, meta_description, noindex)
select 'post', b.slug,
       b.title || ' | Dipendra Guragain',
       left(b.excerpt, 158),
       false
from public.posts b
where b.published = true
on conflict (entity_type, entity_slug) do nothing;

insert into public.seo_meta (entity_type, entity_slug, meta_title, meta_description, noindex)
select 'service', s.slug,
       s.title || ' in Nepal | Dipendra Guragain',
       left(s.short_description, 158),
       false
from public.services s
where s.published = true
on conflict (entity_type, entity_slug) do nothing;

-- Static pages have no table to select from, so they are listed literally.
-- These match STATIC_PAGE_SLUGS in src/app/sitemap.ts.
insert into public.seo_meta (entity_type, entity_slug, noindex) values
  ('page', 'home',     false),
  ('page', 'about',    false),
  ('page', 'work',     false),
  ('page', 'services', false),
  ('page', 'pricing',  false),
  ('page', 'blog',     false),
  ('page', 'contact',  false)
on conflict (entity_type, entity_slug) do nothing;


-- ============================================================
-- SEO admin schema: media table, social links, custom JSON-LD.
-- Copied from supabase/migrations/20261006001000_seo_admin.sql.
-- ============================================================

-- Additive schema for the SEO admin panels.
--
-- Runs after `20261005001000_seo_layer.sql`, which created `seo_meta`,
-- `redirects` and `site_settings`. Everything here is `if not exists` or
-- `add column if not exists`, so re-running is safe.
--
-- Four things, one per admin module that needed storage it did not have:
--
--  1. `site_settings.social_links`  — the global panel's social handles.
--  2. `*.custom_json_ld`            — the JSON-LD panel's raw injection.
--  3. `site_settings.default_meta_title` — the global title fallback.
--  4. `public.media`                — uploads, with alt text the DATABASE
--                                     refuses to store blank.

-- ------------------------------------------------------- global SEO panel ---

-- Social handles move out of `src/data/profile.ts` so the admin can add a
-- YouTube channel or a new profile without a deploy.
--
-- Stored as an object keyed by platform (`{"github": "https://…"}`) rather
-- than an array of URLs, because the key is what lets the panel render a
-- labelled field per platform and what lets `sameAs` stay ordered. An array
-- would lose which URL is which, and `sameAs` order feeds entity resolution.
--
-- `not null default '{}'` and not `null`: an empty object is the honest
-- representation of "no handles set", and it means the reader never has to
-- distinguish null from empty.
alter table public.site_settings
  add column if not exists social_links jsonb not null default '{}'::jsonb;

-- Raw JSON-LD the admin pastes in, merged into the page's graph.
--
-- `jsonb` rather than `text` so the database rejects malformed JSON at write
-- time rather than the page throwing at render time. That is the difference
-- between a save that fails visibly in the admin and a page that 500s for
-- every visitor until someone notices.
--
-- Valid JSON is not the same as *sensible* schema, so the panel additionally
-- checks the shape before saving. The column is the floor, not the ceiling.
alter table public.site_settings
  add column if not exists custom_json_ld jsonb;

-- The site-wide title fallback, used when a page has no title of its own.
-- `title_suffix` (which already exists) is the appended brand string; this is
-- the standalone title for routes that do not set one.
alter table public.site_settings
  add column if not exists default_meta_title text;

-- ------------------------------------------------------------ JSON-LD ------

-- Per-entity JSON-LD, for the cases the generated nodes cannot cover: a
-- `CreativeWork` with custom `award` or `citation`, a `Person` with
-- `alumniOf`, an `Event` for a talk.
--
-- Constrained to an object or array of objects, never a scalar. `'42'::jsonb`
-- is valid JSON and would be merged into an `@graph` as a bare number, which
-- produces a graph no validator can make sense of. Rejecting it here is
-- cheaper than explaining it later.
alter table public.seo_meta
  add column if not exists custom_json_ld jsonb
  constraint seo_meta_custom_json_ld_shape
  check (custom_json_ld is null or jsonb_typeof(custom_json_ld) in ('object', 'array'));

-- ---------------------------------------------------------------- media ----

-- Uploads, with alt text enforced by the database.
--
-- ## Why `alt` is NOT NULL with a check
--
-- The requirement was that alt text be mandatory before an image can be
-- saved. Enforcing that in the form alone would be a suggestion — it holds
-- only for uploads that go through the form, and this project already has two
-- other writers (`scripts/sync-content.ts` and the Supabase table editor).
-- A `not null` plus `length(btrim(alt)) > 0` holds for every writer there
-- will ever be, and it is the only version of this rule that cannot be
-- bypassed by adding a new code path later.
--
-- `btrim` matters: `'   '` passes a bare `<> ''` check and is exactly the
-- value a hurried upload produces.
--
-- ## Why a separate table rather than `image_alt` columns
--
-- `src/utils/images.ts` documents why alt text was a code-side lookup keyed
-- by slug: a column would be null for every row that existed at the time.
-- That reasoning was right then and is still right for those rows. This table
-- is additive — the reader prefers a `media` row when one exists and falls
-- back to that same lookup when it does not, so nothing that renders today
-- changes and every new upload has to carry real alt text.
create table if not exists public.media (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- Path inside the `media` storage bucket, or an absolute URL for assets
  -- that live elsewhere (the existing `/images/*` files in `public/`).
  src         text not null unique check (length(btrim(src)) > 0),

  -- The whole point of the table. See the note above.
  alt         text not null check (length(btrim(alt)) > 0),

  -- Intrinsic dimensions, so the admin can warn about a missing size before
  -- it becomes a CLS problem on the public site. Nullable because an
  -- absolute URL to someone else's asset cannot be measured at insert time.
  width       integer check (width is null or width > 0),
  height      integer check (height is null or height > 0),
  mime_type   text,
  bytes       bigint check (bytes is null or bytes >= 0),

  -- Optional attribution. `site` covers the default OG image and favicons,
  -- which belong to no single entity.
  entity_type text check (entity_type in ('project', 'post', 'service', 'page', 'site')),
  entity_slug text,

  uploaded_by uuid references auth.users (id) on delete set null,

  -- An `alt` that merely restates the filename is the most common way to
  -- satisfy a mandatory-alt rule without writing useful alt text. Rejecting
  -- an exact match with the filename stem is a cheap nudge that costs nothing
  -- legitimate — a real description is never identical to `hero-final-v2`.
  constraint media_alt_not_filename
    check (alt <> regexp_replace(src, '^.*/|\.[a-z0-9]+$', '', 'gi'))
);

create index if not exists media_entity_idx on public.media (entity_type, entity_slug);
create index if not exists media_created_idx on public.media (created_at desc);

drop trigger if exists touch_media on public.media;
create trigger touch_media before update on public.media
  for each row execute function public.touch_updated_at();

alter table public.media enable row level security;

-- Public read: the site serves these images to anonymous visitors, and alt
-- text is read on the server through the same anon key as every other reader.
grant all on public.media to anon, authenticated;

drop policy if exists "media public read" on public.media;
create policy "media public read" on public.media
  for select to anon, authenticated using (true);

drop policy if exists "media admin write" on public.media;
create policy "media admin write" on public.media
  for all to authenticated using (true) with check (true);

-- -------------------------------------------------------- storage bucket ---

-- The bucket uploads land in. Public because these are portfolio images
-- served to anonymous visitors; a private bucket would mean signing every URL
-- and giving up caching.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Storage has its own RLS, on `storage.objects`, separate from the table
-- policies above. Without these two the upload fails and the row insert
-- succeeds, which produces a media record pointing at a file that was never
-- written — so they are required, not optional.
drop policy if exists "media bucket public read" on storage.objects;
create policy "media bucket public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

drop policy if exists "media bucket admin write" on storage.objects;
create policy "media bucket admin write" on storage.objects
  for all to authenticated
  using (bucket_id = 'media') with check (bucket_id = 'media');
