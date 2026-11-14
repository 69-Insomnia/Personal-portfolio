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
import { getPosts, getProjects, getRedirect, getSeo, getService, getServices, getSiteSettings } from '@/lib/content';
import { relatedToService } from '@/lib/related';
import {
  customJsonLdNodes,
  definedTermNodes,
  definedTermSetNode,
  faqPageNode,
  serviceNode,
  webPageNode,
} from '@/lib/structured-data';
import { identity, serviceSEO, site } from '@/data/seo';
import type { Service } from '@/types';
import { buildMetadata } from '@/utils/metadata';

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
 * A genuine `<table>` with `scope="col"` headers for the same extraction
 * reason as the comparison matrix in `ComparisonTable.tsx` — the pairs
 * ("Timeline: 1-2 weeks setup") are exactly the shape an answer engine lifts,
 * and a grid of `<div>`s states the relationship only visually. It renders on
 * the server with no client JavaScript, so crawlers that do not run scripts
 * see it in the raw HTML.
 *
 * The price resolves through `serviceStartingPrice`, so the database's
 * `from_npr` wins and a null falls back to the pricing tier — the same order
 * the matrix and `/llms.txt` use, which is what keeps one service from quoting
 * two different numbers. `formatNpr` renders the "no published price" case as
 * "Contact for a quote", which is a real answer, not a placeholder.
 *
 * Four columns fit a phone inside the horizontal-scroll wrapper used
 * everywhere else on the site; `min-w-0` on the parent is load-bearing and is
 * the same hazard documented in `ComparisonTable.tsx`.
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

  return (
    <Card className="min-w-0 overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-left align-top">
        <caption className="sr-only">
          Quick facts: who delivers this service, what it covers, how long it
          takes and what it starts from.
        </caption>
        <thead>
          <tr className="border-b border-line">
            {columns.map((column, index) => (
              <th
                key={column.label}
                scope="col"
                className={[
                  'text-label px-5 py-4 font-medium text-muted',
                  index > 0 ? 'border-l border-line' : '',
                ].join(' ')}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {columns.map((column, index) => (
              <td
                key={column.label}
                className={[
                  'px-5 py-4 text-sm text-ink',
                  column.strong ? 'font-semibold' : '',
                  index > 0 ? 'border-l border-line' : '',
                ].join(' ')}
              >
                {column.value}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </Card>
  );
}

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
  const [live, meta] = await Promise.all([getService(slug), getSeo('service', slug)]);
  const service = live;
  if (!service) {
    // `notFound()` renders the root boundary, which sends its own `noindex`.
    // This only has to avoid publishing a title that reads like a real page.
    return { title: 'Service Not Found', robots: { index: false, follow: false } };
  }
  return buildMetadata(serviceSEO(service, meta), await getSiteSettings());
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

  const [allServices, allProjects, allPosts, seoMeta] = await Promise.all([
    getServices(),
    getProjects(),
    getPosts(),
    // Cached by the same `revalidate` as the reads above, so this is not a
    // second round trip — see the note in `work/[slug]`.
    getSeo('service', service.slug),
  ]);

  const related = allServices.filter((item) => item.slug !== service.slug).slice(0, 3);
  const { projects: relatedProjects, posts: relatedPosts } = relatedToService(service.slug, {
    projects: allProjects,
    posts: allPosts,
  });
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
    name: service.title,
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
      ? 'Dipendra Guragain is a professional website developer in Nepal and a freelance full stack developer based in Kathmandu, building custom websites, web applications, landing pages and online stores. The process covers planning, web design, development, SEO-ready architecture and analytics setup so the site is fast, measurable and easy to manage after launch. Projects are built with React and Next.js for custom requirements, or WordPress and Shopify when teams need simple day-to-day editing. The work includes both frontend and backend implementation, API integrations, performance optimization and post-launch support, making this service suitable for businesses that want one accountable web developer in Nepal from strategy to go-live.'
      : undefined);

  /**
   * The page's Q&A as structured data, from the same array `FaqBlock` renders
   * below — and only when the admin has actually written some. A `FAQPage`
   * node on a page with no visible FAQ would be a claim the page does not
   * support, which is why this is conditional rather than always emitted.
   */
  const faqNode = faqPageNode(boostedFaqs, `${site.url}/services/${service.slug}`);

  return (
    <article>
      {/* The breadcrumb trail is rendered by `PageHeader` below, which emits
          its own `BreadcrumbList`. Passing one here as well would publish the
          same trail twice. */}
      <JsonLd
        graph={[
          serviceNode(service),
          ...(pageNode ? [pageNode] : []),
          ...definedTermNodes(terms),
          // The set is emitted only alongside terms, since it exists to give
          // them something to belong to.
          ...(terms?.length ? [definedTermSetNode()] : []),
          ...(faqNode ? [faqNode] : []),
          ...customJsonLdNodes(seoMeta?.customJsonLd),
        ]}
      />
      <PageHeader
        label="Service"
        index={service.index}
        breadcrumb={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: service.title, path: `/services/${service.slug}` },
        ]}
        title={service.title}
        description={service.shortDescription}
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
                  <p className="text-label font-medium text-muted">Deliverables</p>
                  <ul className="mt-4 flex flex-col gap-3">
                    {service.deliverables.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm leading-relaxed text-ink"
                      >
                        <span
                          aria-hidden
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
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
                      <h2 className="max-w-2xl text-h3">{section.heading}</h2>
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

          {/* The person behind the work. Every fact on this page is a claim
              by one named human, so the page ends by saying who — same name,
              role and positioning the `Person` node in the JSON-LD above
              publishes, so the visible page and the structured data agree.
              The avatar is the same file the `Person` node's `image` points
              at; the name links to `/about` with `rel="author"`, matching the
              byline every article uses. */}
          <div className="mt-14 grid gap-10 border-t border-line pt-14 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <SectionLabel label="Who You Work With" />
            </div>
            <div className="lg:col-span-8 lg:col-start-5">
              <Reveal>
                <Card className="flex max-w-2xl items-start gap-5 p-6">
                  <Image
                    src={profile.avatar}
                    alt={profile.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 shrink-0 rounded-full border border-line object-cover"
                  />
                  <div className="min-w-0">
                    <Link
                      href="/about"
                      rel="author"
                      className="font-display text-lg font-semibold text-ink transition-colors duration-200 hover:text-accent"
                    >
                      {profile.name}
                    </Link>
                    <p className="mt-1 text-sm font-medium text-accent">{identity.role}</p>
                    <p className="mt-3 leading-relaxed text-muted">{profile.headline}</p>
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
