import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { SkillCard } from '@/components/cards/SkillCard';
import { AnswerBlock, FaqBlock, StatBlock } from '@/components/common/GeoBlocks';
import { JsonLd } from '@/components/common/JsonLd';
import { PageHeader } from '@/components/common/PageHeader';
import { RelatedBlock } from '@/components/common/RelatedBlock';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { formatNpr, serviceStartingPrice } from '@/data/pricing';
import { profile } from '@/data/profile';
import {
  DM_ABOUT_LINE,
  DM_AUTHOR_SUMMARY,
  DM_BREADCRUMB,
  DM_DESCRIPTION,
  DM_H1,
  DM_IMAGE_ALT,
  DM_KEYWORDS,
  DM_SERVICE_TYPE,
  DM_SIDE_NOTE,
  DM_SLUG,
  DM_TITLE,
} from '@/data/digital-marketing';
import { getPosts, getProjects, getRedirect, getSeo, getService, getServices, getSiteSettings } from '@/lib/content';
import { relatedToService } from '@/lib/related';
import {
  customJsonLdNodes,
  definedTermNodes,
  definedTermSetNode,
  faqPageNode,
  personId,
  serviceNode,
  webPageNode,
} from '@/lib/structured-data';
import { DEFAULT_OG_IMAGE, identity, serviceSEO, site } from '@/data/seo';
import type { Service } from '@/types';
import { buildMetadata, normalizeMetadataImage } from '@/utils/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const WEB_DEVELOPMENT_FAQ_BOOSTERS = [
  {
    question: 'Who is a professional website developer in Nepal?',
    answer:
      'I provide website development services from Kathmandu for businesses across Nepal, handling strategy, design, development and launch support as one workflow.',
  },
  {
    question: 'Where can I find a website developer in Kathmandu?',
    answer:
      'I work with businesses in Kathmandu and across Nepal, building business websites, custom web apps and ecommerce websites that are responsive, SEO-friendly and built to convert.',
  },
  {
    question: 'Who provides ecommerce website development in Nepal?',
    answer:
      'I develop ecommerce websites in Nepal for product-driven businesses that need a faster, cleaner shopping experience, clearer product pages and a more reliable online sales flow.',
  },
  {
    question: 'Which web developer specializes in React and Next.js in Nepal?',
    answer:
      'I build custom React and Next.js websites for businesses that need performance, flexibility and a tailored build rather than a template-driven setup.',
  },
  {
    question: 'Who can build an SEO-friendly ecommerce website in Nepal?',
    answer:
      'I build ecommerce and business websites with clean information architecture, technical SEO foundations, fast loading pages and conversion-focused design that helps the site perform well in search.',
  },
  {
    question: 'Can I hire a freelance web developer in Nepal for a full project?',
    answer:
      'Yes. Most projects run end-to-end: discovery, UX and UI design, frontend and backend implementation, SEO-ready structure, analytics setup, launch and post-launch fixes.',
  },
  {
    question: 'Do you work as a full stack developer in Nepal?',
    answer:
      'Yes. I handle frontend architecture, backend integrations, CMS or ecommerce setup, API wiring, and deployment so the website and the business logic are delivered together.',
  },
  {
    question: 'Do you also provide web design in Nepal?',
    answer:
      'Yes. I design the information structure, page layouts and conversion paths before development, so the finished site stays fast, readable and easy to use on mobile.',
  },
  {
    question: 'Are you available as a website developer in Kathmandu?',
    answer:
      'Yes. I am based in Kathmandu and work with local and remote clients across Nepal, with project communication through WhatsApp, email and scheduled calls.',
  },
  {
    question: 'Which payment methods do you support for an ecommerce website in Nepal?',
    answer:
      'Checkout can be set up with eSewa and Khalti wallets, Fonepay, cards, bank transfer and cash on delivery. Which of those a store can actually use depends on the platform: WooCommerce and custom builds integrate the gateways directly, while a Shopify store uses the payment apps available to it.',
  },
  /**
   * The five phrases added for the "ecommerce website developer in Nepal"
   * cluster: designer, bare "developer", the "company" framing (twice, Nepal
   * and Kathmandu), and the "best" superlative. Answered honestly for a
   * one-person practice rather than claiming to be a team or an agency —
   * the FAQ says what's true and lets the reader decide if that's what they
   * want, which is also why "best" is answered as a question to ask rather
   * than a claim about myself.
   */
  {
    question: 'Do you work as an ecommerce website designer as well as a developer in Nepal?',
    answer:
      'Yes. Design and development run as one process rather than being handed off between two people: page layout, product and category structure, and the visual design happen alongside the build, so the design decisions are the ones the code actually has to support.',
  },
  {
    question: 'Who is an ecommerce developer in Nepal?',
    answer:
      'An ecommerce developer in Nepal builds and maintains the online store itself — product pages, checkout, payment integration and the backend behind it — on Shopify, WooCommerce or a custom build. That is the core of what I do, alongside the SEO and design work the store needs around it.',
  },
  {
    question: 'Are you an ecommerce website development company in Nepal, or a freelancer?',
    answer:
      'I work as a freelancer, not a company with account managers — you work directly with the person building the site. For an ecommerce website development company in Kathmandu, that usually means a bigger team and a higher cost for the same work; for a single build, a freelancer is often the simpler and cheaper route to the same result.',
  },
  {
    question: 'How do I find the best ecommerce website developer in Nepal?',
    answer:
      'Ask to see real ecommerce stores they built, not just a portfolio screenshot, and ask who specifically worked on each one. Check whether they handle payment integration (eSewa, Khalti, Fonepay) and SEO themselves or outsource it, and get a fixed scope and price before the build starts rather than an open-ended hourly estimate.',
  },
];

function mergeFaqs(base: Array<{ question: string; answer: string }>, extras: Array<{ question: string; answer: string }>) {
  const seen = new Set<string>();
  const merged: Array<{ question: string; answer: string }> = [];

  for (const entry of [...base, ...extras]) {
    const key = entry.question.toLowerCase().replace(/\s+/g, ' ').trim();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(entry);
  }

  return merged;
}

/**
 * The four facts a reader scans for before reading anything else: who does
 * this, what it covers, how long it takes, what it starts from.
 *
 * A `<dl>` of term/value pairs — the pairs ("Timeline: 1-2 weeks setup") are
 * exactly the shape an answer engine lifts, and `<dt>`/`<dd>` state the
 * relationship in markup rather than only visually. It renders on the server
 * with no client JavaScript, so crawlers that do not run scripts see it in the
 * raw HTML.
 *
 * The price resolves through `serviceStartingPrice`, so the database's
 * `from_npr` wins and a null falls back to the pricing tier — the same order
 * the matrix and `/llms.txt` use, which is what keeps one service from quoting
 * two different numbers. `formatNpr` renders the "no published price" case as
 * "Contact for a quote", which is a real answer, not a placeholder.
 */
function QuickFacts({ service }: { service: Service }) {
  const price = formatNpr(serviceStartingPrice(service.slug, service.fromNpr));
  const covers = service.capabilities.slice(0, 3).join(', ');
  const more = service.capabilities.length - 3;

  const columns: Array<{ label: string; value: React.ReactNode; strong?: boolean }> = [
    { label: 'Delivered by', value: profile.name },
    {
      label: 'Covers',
      value: (
        <>
          {covers}
          {more > 0 ? <span className="text-faint"> +{more} more</span> : null}
        </>
      ),
    },
    {
      label: 'Timeline',
      value: service.timeline ?? <span className="text-faint">—</span>,
    },
    {
      label: 'Starting from',
      // The one fact every scanner looks for first, so it carries the weight.
      // Still the same `serviceStartingPrice` resolution as everywhere else —
      // emphasis changes how it reads, never what it says.
      strong: true,
      value: price ?? <span className="text-faint">Contact for a quote</span>,
    },
  ];

  // A definition list in a responsive grid (2x2 on phones, 4 across from md)
  // rather than a 44rem table in a horizontal scroller: on a phone the old
  // table hid half its facts off-screen and put the rest under the floating
  // WhatsApp button. Label/value pairs are still explicit in the markup for
  // crawlers that do not run scripts.
  return (
    <Card className="overflow-hidden">
      <dl
        aria-label="Quick facts: who delivers this service, what it covers, how long it takes and what it starts from"
        className="grid grid-cols-2 md:grid-cols-4"
      >
        {columns.map((column, index) => (
          <div
            key={column.label}
            className={[
              'flex flex-col gap-2 px-4 py-4 sm:px-5 sm:py-5',
              // Hairlines between cells for both the 2x2 and the 4-up layout.
              index % 2 === 1 ? 'border-l border-line' : '',
              index >= 2 ? 'border-t border-line md:border-t-0' : '',
              index === 2 ? 'md:border-l' : '',
              column.strong ? 'bg-subtle' : '',
            ].join(' ')}
          >
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted">
              {column.label}
            </dt>
            <dd
              className={[
                'text-sm leading-snug text-ink',
                column.strong ? 'font-display text-lg font-semibold' : '',
              ].join(' ')}
            >
              {column.value}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

/**
 * The pinned copy for the retargeted `/services/digital-marketing` page —
 * title, description, H1, side note, FAQ set and schema identity — lives in
 * `src/data/digital-marketing.ts`, shared with the script that mirrors it
 * into the `seo_meta` row.
 *
 * Every other service on this route renders from the database, and keeps
 * doing so: everything below keys off `slug === DM_SLUG`, so the change stays
 * on this one URL.
 */

export async function generateStaticParams() {
  // Database-only: a service created in /admin after this build still gets a
  // page, rendered on demand through the route's ISR window — while a slug
  // that exists only in the repo's static file gets no page at all, because
  // the file is seed material and not a second registry of live services.
  const live = await getServices();
  return live.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [live, meta, settings] = await Promise.all([
    getService(slug),
    getSeo('service', slug),
    getSiteSettings(),
  ]);
  const service = live;
  if (!service) {
    // `notFound()` renders the root boundary, which sends its own `noindex`.
    // This only has to avoid publishing a title that reads like a real page.
    return { title: 'Service Not Found', robots: { index: false, follow: false } };
  }

  /**
   * The retargeted page resolves its head from the constants above rather
   * than from the `seo_meta` row.
   *
   * `withSeoMeta` lets a database row win over the generated defaults, which
   * is right for every other service and wrong here: this URL's title,
   * description and social copies are fixed by the brief, so they are spread
   * over the resolved SEO data after the merge — the row still supplies the
   * canonical URL, the OG image and the admin's custom nodes, it just no
   * longer gets to rename the page. The third argument pins `og:image:alt`
   * to the brief's string instead of the title fallback.
   */
  if (slug === DM_SLUG) {
    const resolved = serviceSEO(service, meta);
    return buildMetadata(
      {
        ...resolved,
        title: DM_TITLE,
        description: DM_DESCRIPTION,
        keywords: DM_KEYWORDS,
        ogTitle: DM_TITLE,
        ogDescription: DM_DESCRIPTION,
        twitterTitle: DM_TITLE,
        twitterDescription: DM_DESCRIPTION,
      },
      settings,
      DM_IMAGE_ALT,
    );
  }

  return buildMetadata(serviceSEO(service, meta), settings);
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;

  // The SEO service was renamed in the CMS from `seo` to `seo-services`, but
  // the repo's static file still contains the legacy slug. Redirect that
  // legacy route explicitly so it cannot keep serving a second,
  // self-canonical copy of the service page outside the sitemap.
  if (slug === 'seo') permanentRedirect('/services/seo-services');

  // Database-only lookup. A slug the database does not hold — an unpublished
  // service, a typo, or a name that only ever existed in the repo's file —
  // falls through to the redirect table and then to 404, so nothing can render
  // from the static file.
  const service = await getService(slug);

  if (!service) {
    // See the note in `work/[slug]`: the redirect lookup only runs once the
    // slug has already failed to resolve, so valid URLs pay nothing for it.
    // This is also where a renamed slug lands: `on_slug_change` moved the row
    // and logged a 308 for the old address, so the old URL redirects here
    // rather than shadowing the new one with stale content.
    const target = await getRedirect(`/services/${slug}`);
    if (target) permanentRedirect(target);
    notFound();
  }

  const [allServices, allProjects, allPosts, seoMeta, settings] = await Promise.all([
    getServices(),
    getProjects(),
    getPosts(),
    // Cached by the same `revalidate` as the reads above, so this is not a
    // second round trip — see the note in `work/[slug]`.
    getSeo('service', service.slug),
    // Only the retargeted page uses this (for its `ProfessionalService`
    // `sameAs`), but the read is cached with the rest either way.
    getSiteSettings(),
  ]);

  /**
   * The one service page with pinned copy. Every branch below — H1, side
   * note, breadcrumb crumb, About line, schema identity, internal links —
   * keys off this flag, so `/services/seo-services` and the rest render from
   * the database exactly as they did before the retarget.
   */
  const isDigitalMarketing = service.slug === DM_SLUG;
  /**
   * The consolidated ecommerce-growth-cluster page (see the long comment on
   * this slug's entry in `src/data/services.ts`). Its card/listing `title`
   * stays the short "Ecommerce Growth Services" so the `/services` grid and
   * the homepage Services band read like their siblings; this flag swaps in
   * the keyword-bearing H1 only on the page itself, the same split
   * `isDigitalMarketing` already uses for `DM_H1` vs. "Digital Marketing
   * Services".
   */
  const isEcommerceGrowth = service.slug === 'ecommerce-growth';
  const ECOMMERCE_GROWTH_H1 = 'Ecommerce Growth Expert in Nepal';

  const related = allServices.filter((item) => item.slug !== service.slug).slice(0, 3);
  const { projects: relatedProjects, posts: relatedPosts } = relatedToService(service.slug, {
    projects: allProjects,
    posts: allPosts,
  });
  /**
   * The H1 carries the location as well as the service. "Web Development" on
   * its own told a crawler what the page is about but not where it sells, and
   * the title tag already leads with the longer commercial query — so the H1
   * answers the shorter half of the same target rather than repeating the tag
   * word for word. The breadcrumb trail reads from the same string, which is
   * why the last crumb is the full heading and not an abbreviation.
   */
  const pageTitle = isDigitalMarketing
    ? DM_H1
    : service.slug === 'web-development'
      ? /**
         * Realigned to the exact lead phrase of the `<title>` tag
         * ("Ecommerce Website Developer in Nepal | Web Development Services")
         * — it previously read "Web Development Services in Nepal", which
         * does not contain any of the "ecommerce website developer/designer/
         * development company" phrases this page targets. The one H1 on the
         * page should be able to be compared word for word with its primary
         * query, same as `DM_H1` and `ECOMMERCE_GROWTH_H1` below.
         */
        'Ecommerce Website Developer in Nepal'
      : isEcommerceGrowth
        ? ECOMMERCE_GROWTH_H1
        : service.title;
  const pageDescription = isDigitalMarketing
    ? DM_SIDE_NOTE
    : service.slug === 'web-development'
      ? 'Ecommerce website developer in Nepal and Kathmandu — also a website designer and development company for businesses that need a custom build. Online stores, business websites and web apps with Shopify, WooCommerce, React and Next.js.'
      : service.shortDescription;
  const body = service.body ?? [];

  /**
   * The extra graph nodes, all optional.
   *
   * Each is emitted only when the admin has filled in the field behind it, so a
   * service page that has never been opened in the SEO panel publishes exactly
   * the graph it published before any of this existed. `serviceWebPageNode`
   * returns `undefined` — rather than an empty node — when there is nothing to
   * say, which is why it is spread conditionally instead of pushed and filtered.
   */
  const terms = seoMeta?.entitySignals?.definedTerms;
  const pageNode = webPageNode({
    url: `${site.url}/services/${service.slug}`,
    // The H1, not the database title, on the retargeted page — the schema and
    // the heading on the page should be able to be compared word for word.
    // Same value as the visible `<h1>` (`pageTitle` below) rather than
    // re-deriving the per-slug override here a second time — the schema and
    // the heading on the page should always be able to be compared word for
    // word, and a second copy of the same branching is how they drift.
    name: pageTitle,
    mainEntityId: `${site.url}/services/${service.slug}/#service`,
    signals: seoMeta?.entitySignals,
    aiAnswer: seoMeta?.aiAnswer,
  });
  const fallbackFaqs = [
    {
      question: `What does ${service.title.toLowerCase()} include?`,
      answer: service.shortDescription,
    },
    {
      question: `Who is ${service.title.toLowerCase()} for?`,
      answer:
        service.bestFor ??
        `Businesses in Nepal that need ${service.shortDescription.replace(/[.!?]+$/, '')}`,
    },
    {
      question: `How do I get started with ${service.title.toLowerCase()}?`,
      answer:
        'Send a short project brief through the contact page. I will review the scope and reply with a practical next step.',
    },
  ];
  const serviceFaqs = seoMeta?.faqs?.length
    ? seoMeta.faqs
    : fallbackFaqs;
  const boostedFaqs = service.slug === 'web-development'
    ? mergeFaqs(serviceFaqs, WEB_DEVELOPMENT_FAQ_BOOSTERS)
    : serviceFaqs;
  const answerBlock = seoMeta?.aiAnswer ??
    (service.slug === 'web-development'
      ? 'Dipendra Guragain is a web developer in Nepal and a website developer in Kathmandu building responsive business websites, ecommerce websites and custom web applications for businesses that need a faster, better-converting online presence. The work covers planning, UX and layout, frontend development, backend integration, ecommerce setup, analytics tracking and launch support. For projects that need more flexibility, I build with React and Next.js. For businesses that need simpler day-to-day editing, I can build on WordPress or Shopify. The goal is always a secure, SEO-friendly, performance-focused website that is easy to maintain and ready to support real business growth in Nepal.'
      : undefined);
  const serviceAuthorSummary = isDigitalMarketing
    ? DM_AUTHOR_SUMMARY
    : service.slug === 'web-development'
      ? 'I help businesses in Kathmandu and across Nepal build modern, high-performing websites that combine clean design, seamless functionality, and SEO-friendly development to turn visitors into customers.'
      : `I help businesses in Kathmandu and across Nepal with ${service.title.toLowerCase()} that is practical, well-structured and built around the goals of the business rather than a generic template.`;

  /**
   * The page's Q&A as structured data, from the same array `FaqBlock` renders
   * below — and only when the admin has actually written some. A `FAQPage`
   * node on a page with no visible FAQ would be a claim the page does not
   * support, which is why this is conditional rather than always emitted.
   */
  const faqNode = faqPageNode(boostedFaqs, `${site.url}/services/${service.slug}`);

  /**
   * The retargeted page's own entity nodes.
   *
   * Both are scoped to this URL's `@id` rather than reusing the site-wide
   * `#person` and `#service` ids: the site-wide `Person` carries the admin's
   * jobTitle and knowsAbout, so republishing it with different values under
   * the same `@id` would be conflicting markup rather than reinforcement.
   * These two say what *this* page is about — a digital marketing expert —
   * and reference each other, while `serviceNode` keeps pointing at the
   * canonical site-wide entities exactly as before.
   */
  const socials = Object.entries(settings.socialLinks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, href]) => href);

  /**
   * Every service row carries a legacy admin-entered `Service` object in
   * `custom_json_ld` with no `@id` and its own stale `minPrice` (45,000 where
   * the real starting price is different). Emitted as-is it published a second
   * `Service` entity with a conflicting price on every page. It is folded into
   * the primary node instead (only its `serviceType` survives); any other
   * custom nodes the admin adds still pass through untouched.
   */
  const allCustomNodes = customJsonLdNodes(seoMeta?.customJsonLd);
  const legacyService = allCustomNodes.find(
    (node) => node['@type'] === 'Service' && !node['@id'],
  );
  const customNodes = allCustomNodes.filter((node) => node !== legacyService);


  // The page's service is founded by the one site-wide Person entity. A
  // second page-scoped Person (same name, different jobTitle) used to sit
  // here, which split the person's identity across two entities.
  const dmNodes = isDigitalMarketing
    ? [
        {
          '@type': 'ProfessionalService',
          '@id': `${site.url}/services/${DM_SLUG}/#professionalservice`,
          name: 'Dipendra Guragain – Ecommerce Marketing Expert',
          description: DM_DESCRIPTION,
          url: `${site.url}/services/${DM_SLUG}`,
          image: `${site.url}/images/profile.png`,
          founder: { '@id': personId },
          ...(identity.telephone ? { telephone: identity.telephone } : {}),
          email: `mailto:${profile.email}`,
          // The one published figure for this engagement: audit, strategy and
          // ongoing monthly work at NPR 15,000 per month. Ad budget is paid
          // directly to Google and Meta and is therefore not part of it.
          priceRange: 'NPR 15,000 per month',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Kathmandu',
            addressCountry: 'NP',
          },
          areaServed: [
            { '@type': 'Country', name: 'Nepal' },
            { '@type': 'City', name: 'Kathmandu' },
          ],
          sameAs: socials,
        },
      ]
    : [];

  return (
    <article>
      {/* The breadcrumb trail is rendered by `PageHeader` below, which emits
          its own `BreadcrumbList`. Passing one here as well would publish the
          same trail twice. */}
      <JsonLd
        graph={[
          {
            ...serviceNode(service),
            // The admin's legacy `Service` block only contributes its more
            // specific category; see `customNodes` below for why the rest of
            // it is dropped.
            ...(typeof legacyService?.serviceType === 'string'
              ? { serviceType: legacyService.serviceType }
              : {}),
            // The category, not the database title, on the retargeted page.
            ...(isDigitalMarketing ? { serviceType: DM_SERVICE_TYPE } : {}),
          },
          ...dmNodes,
          ...(pageNode ? [pageNode] : []),
          ...definedTermNodes(terms),
          // The set is emitted only alongside terms, since it exists to give
          // them something to belong to.
          ...(terms?.length ? [definedTermSetNode()] : []),
          ...(faqNode ? [faqNode] : []),
          ...customNodes,
        ]}
      />
      <PageHeader
        label="Service"
        index={service.index}
        breadcrumb={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          {
            name: isDigitalMarketing ? DM_BREADCRUMB : pageTitle,
            path: `/services/${service.slug}`,
          },
        ]}
        title={pageTitle}
        description={pageDescription}
      />

      <Section>
        <Container>
          {/* The four facts, first — before the prose, because this is what a
              scanning reader (and an answer engine's first pass) wants. */}
          <QuickFacts service={service} />

          {/* The answer block. Written to stand alone and front-loaded, because
              most AI citations are pulled from the first third of a page. */}
          <div className="mt-14 grid gap-10 border-t border-line pt-14 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <SectionLabel label="Overview" />
            </div>
            <div className="lg:col-span-8 lg:col-start-5">
              <Reveal>
                <p className="max-w-2xl text-lead text-muted">{service.description}</p>
              </Reveal>

              {/* The passage written to be quoted, when the admin has written
                  one. Rendered outside `Reveal` — this block exists for
                  crawlers that do not run scripts, and `Reveal` ships
                  `opacity:0` in the raw HTML. See `src/components/common/
                  GeoBlocks.tsx`. */}
              {answerBlock ? (
                <div className="mt-8">
                  <AnswerBlock answer={answerBlock} />
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-14 grid gap-10 border-t border-line pt-14 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <SectionLabel label="What's Included" />
            </div>
            <div className="lg:col-span-8 lg:col-start-5">
              <Reveal delay={0.08}>
                <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {service.capabilities.map((capability) => (
                    <SkillCard key={capability} title={capability} icon={service.icon} />
                  ))}
                </ul>
              </Reveal>

              {/* What physically arrives. The old spec table's other rows —
                  timeline, price, who it's for — now live in the facts strip
                  above and their own sections below, so this holds only the
                  deliverables. Not wrapped in `Reveal`: the list exists to be
                  extracted by crawlers that do not run scripts, and `Reveal`
                  ships `opacity:0` in the raw HTML. */}
              {service.deliverables?.length ? (
                <Card className="mt-10 p-6">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                    Deliverables
                  </p>
                  <ul className="mt-4 flex flex-col gap-3">
                    {service.deliverables.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm leading-relaxed text-ink"
                      >
                        <span
                          aria-hidden
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-accent"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : null}

              <Reveal delay={0.14}>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Button href="/contact" size="lg" showArrow>
                    Discuss This Service
                  </Button>
                  {/*
                    Points at the first real case study for this service rather
                    than at the /work index. "See Related Work" used to drop a
                    reader on a grid of everything, which is one more decision
                    to make; the specific project is the evidence for the page
                    they are already on.
                  */}
                  <Button
                    href={
                      relatedProjects[0] ? `/work/${relatedProjects[0].slug}` : '/work'
                    }
                    variant="outline"
                    size="lg"
                  >
                    {relatedProjects[0] ? `See ${relatedProjects[0].title}` : 'See Related Work'}
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Who this service is for, from the `bestFor` field the admin
              fills in — the sentence the FAQ's "who is this for" answer is
              built from, now also stated as its own visible section. Placed
              before the long-form body rather than after it: a reader deciding
              whether this applies to them should not have to read three
              sections first to find out. */}
          {service.bestFor ? (
            <div className="mt-14 grid gap-10 border-t border-line pt-14 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <SectionLabel label="Who It's For" />
              </div>
              <div className="lg:col-span-8 lg:col-start-5">
                <Reveal>
                  <p className="max-w-2xl text-lead text-ink">{service.bestFor}</p>
                </Reveal>
              </div>
            </div>
          ) : null}

          {/* Sourced statistics, when the admin has entered any. The audit's
              finding was that this site published no figure a reader could
              check, anywhere — the single biggest reason a page gets passed
              over for AI citation. */}
          {seoMeta?.stats?.length ? (
            <div className="mt-14 grid gap-10 border-t border-line pt-14 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <SectionLabel label="By The Numbers" />
              </div>
              <div className="lg:col-span-8 lg:col-start-5">
                <StatBlock stats={seoMeta.stats} />
              </div>
            </div>
          ) : null}

          {/* Long-form body. Headings are written as questions because that is
              the shape answer engines and featured snippets extract. */}
          {body.length > 0 ? (
            <div className="mt-14 grid gap-10 border-t border-line pt-14 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <SectionLabel label="In Detail" />
              </div>
              <div className="flex flex-col gap-12 lg:col-span-8 lg:col-start-5">
                {body.map((section, index) => (
                  <Reveal key={section.heading} delay={index * 0.05}>
                    <section>
                      <h2 className="max-w-2xl font-display text-h3">{section.heading}</h2>
                      <div className="mt-5 flex flex-col gap-5">
                        {section.paragraphs.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="max-w-2xl leading-relaxed text-muted"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </section>
                  </Reveal>
                ))}

                {/*
                  The service's outbound internal links. Only on the
                  retargeted page — the anchors name this page's own keyword
                  pair and the six destinations the brief specified, and the
                  other services link where their own copy calls for it.
                  Unwrapped in `Reveal` for the same reason the deliverables
                  list is: the raw HTML has to carry the links for crawlers
                  that do not run scripts.
                */}
                {isDigitalMarketing ? (
                  <p className="max-w-2xl leading-relaxed text-muted">
                    As an ecommerce marketing expert in Nepal, I work across all of
                    these channels:{' '}
                    <Link
                      href="/services/seo-services"
                      className="underline decoration-line underline-offset-2 transition-colors hover:text-ink"
                    >
                      SEO services in Kathmandu
                    </Link>
                    ,{' '}
                    <Link
                      href="/services/google-ads"
                      className="underline decoration-line underline-offset-2 transition-colors hover:text-ink"
                    >
                      Google Ads management in Nepal
                    </Link>
                    ,{' '}
                    <Link
                      href="/services/meta-ads"
                      className="underline decoration-line underline-offset-2 transition-colors hover:text-ink"
                    >
                      Meta Ads management in Nepal
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/services/ai-search"
                      className="underline decoration-line underline-offset-2 transition-colors hover:text-ink"
                    >
                      AI search optimisation
                    </Link>{' '}
                    — and{' '}
                    <Link
                      href="/work/drillthru"
                      className="underline decoration-line underline-offset-2 transition-colors hover:text-ink"
                    >
                      the DrillThru case study
                    </Link>{' '}
                    shows what that work looks like in practice.{' '}
                    <Link
                      href="/contact"
                      className="underline decoration-line underline-offset-2 transition-colors hover:text-ink"
                    >
                      Book the free first review
                    </Link>{' '}
                    and I will tell you what I would fix first.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Visible Q&A and its schema are generated from the same array. */}
          {boostedFaqs.length ? (
            <div className="mt-14 grid gap-10 border-t border-line pt-14 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <SectionLabel label="Questions" />
              </div>
              <div className="lg:col-span-8 lg:col-start-5">
                <FaqBlock faqs={boostedFaqs} title="Questions about this service" />
              </div>
            </div>
          ) : null}

          {/* The person behind the work. This section is written as an expert
              overview rather than a detached profile card, so it feels like the
              article is concluding with a clear service-specific introduction. */}
          <div className="mt-14 grid gap-10 border-t border-line pt-14 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <SectionLabel label="About the Expert" />
            </div>
            <div className="lg:col-span-8 lg:col-start-5">
              <Reveal>
                <Card className="flex max-w-2xl flex-col gap-5 p-6 sm:flex-row sm:items-start">
                  <Image
                    src={profile.avatar}
                    alt={profile.name}
                    width={72}
                    height={72}
                    className="h-18 w-18 shrink-0 rounded-control border border-line object-cover"
                  />
                  <div className="min-w-0">
                    <Link
                      href="/about"
                      rel="author"
                      className="font-display text-lg font-semibold text-ink transition-colors duration-200 hover:text-accent"
                    >
                      {profile.name}
                    </Link>
                    <p className="mt-1 text-sm font-medium text-accent">
                      {isDigitalMarketing ? DM_ABOUT_LINE : 'Web Development Expert in Kathmandu, Nepal'}
                    </p>
                    <p className="mt-3 leading-relaxed text-muted">{serviceAuthorSummary}</p>
                    <p className="mt-3 leading-relaxed text-muted">
                      From business websites to custom eCommerce platforms, I focus on creating digital experiences that strengthen your online presence, generate quality leads, and support long-term business growth.
                    </p>
                    <p className="mt-3 leading-relaxed text-muted">
                      My approach goes beyond just building websites. I focus on performance, user experience, mobile responsiveness, search visibility, and conversion-focused design to ensure every website delivers real value to your business.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href="/about"
                        className="inline-flex items-center text-sm font-medium text-ink transition-colors duration-200 hover:text-accent"
                      >
                        About the work
                      </Link>
                      <Link
                        href="/contact"
                        className="inline-flex items-center text-sm font-medium text-ink transition-colors duration-200 hover:text-accent"
                      >
                        Discuss a project
                      </Link>
                    </div>
                  </div>
                </Card>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* Work first, then reading, then the rest of the catalogue. That order is
          the argument the page is making: here it is, here is why, here is what
          else I do. */}
      <RelatedBlock
        kind="projects"
        label="Proof"
        title="Related Work"
        items={relatedProjects}
      />
      <RelatedBlock
        kind="posts"
        label="Further Reading"
        title="Articles On This"
        items={relatedPosts}
      />
      <RelatedBlock
        kind="services"
        label="Keep Exploring"
        title="Other Services"
        items={related}
      />
    </article>
  );
}
