import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { SkillCard } from '@/components/cards/SkillCard';
import { ServiceSpecTable } from '@/components/common/ComparisonTable';
import { AnswerBlock, FaqBlock, StatBlock } from '@/components/common/GeoBlocks';
import { JsonLd } from '@/components/common/JsonLd';
import { PageHeader } from '@/components/common/PageHeader';
import { RelatedBlock } from '@/components/common/RelatedBlock';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { getServiceBySlug, services } from '@/data/services';
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
import { serviceSEO, site } from '@/data/seo';
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

export async function generateStaticParams() {
  const live = await getServices();
  const slugs = new Set([...services.map((s) => s.slug), ...live.map((s) => s.slug)]);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [live, meta] = await Promise.all([getService(slug), getSeo('service', slug)]);
  const service = live ?? getServiceBySlug(slug);
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
  // the static fallback still contains the legacy slug. Redirect that legacy
  // route explicitly so it cannot keep serving a second, self-canonical copy
  // of the service page outside the sitemap.
  if (slug === 'seo') permanentRedirect('/services/seo-services');

  const live = await getService(slug);
  const service = live ?? getServiceBySlug(slug);

  if (!service) {
    // See the note in `work/[slug]`: the redirect lookup only runs once the
    // slug has already failed to resolve, so valid URLs pay nothing for it.
    const target = await getRedirect(`/services/${slug}`);
    if (target) permanentRedirect(target);
    notFound();
  }

  /**
   * Resolved from the repo's static file while the database is healthy — which
   * means the slug exists in `src/data/services.ts` but not in the `services`
   * table. That is what a slug rename in the admin looks like from here:
   * `on_slug_change` moved the row and logged a 308 for the old address, and
   * the static fallback above then shadowed it.
   *
   * The consequence was visible in production. `seo` (the repo's slug) and
   * `seo-services` (the database's) both returned 200, serving different
   * content — the fallback's timeline and price on one, the admin's on the
   * other — and each canonicalised to itself. The footer and nav linked to one
   * address while `sitemap.xml` and `llms.txt` published the other.
   *
   * The redirect is only consulted here, never on the happy path, so a page
   * whose slug is in the database still costs exactly what it did before.
   */
  if (!live) {
    const target = await getRedirect(`/services/${slug}`);
    if (target) permanentRedirect(target);
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
          {/* The answer block. Written to stand alone and front-loaded, because
              most AI citations are pulled from the first third of a page. */}
          <div className="grid gap-10 lg:grid-cols-12">
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

              {/* Scope, timeline, starting price and who this is for. Not
                  wrapped in `Reveal`, unlike everything around it — the table
                  exists to be extracted by crawlers that do not run scripts,
                  and `Reveal` ships `opacity:0` in the raw HTML. See the note
                  in src/sections/Comparison/index.tsx. */}
              {service.deliverables?.length ||
              service.timeline ||
              service.bestFor ||
              service.fromNpr !== undefined ? (
                <div className="mt-10">
                  <ServiceSpecTable service={service} />
                </div>
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
