import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SkillCard } from '@/components/cards/SkillCard';
import { JsonLd } from '@/components/common/JsonLd';
import { PageHeader } from '@/components/common/PageHeader';
import { RelatedBlock } from '@/components/common/RelatedBlock';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { getServiceBySlug, services } from '@/data/services';
import { getPosts, getProjects, getService, getServices } from '@/lib/content';
import { relatedToService } from '@/lib/related';
import { serviceNode } from '@/lib/structured-data';
import { serviceSEO } from '@/data/seo';
import { buildMetadata } from '@/utils/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const live = await getServices();
  const slugs = new Set([...services.map((s) => s.slug), ...live.map((s) => s.slug)]);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = (await getService(slug)) ?? getServiceBySlug(slug);
  if (!service) {
    // `notFound()` renders the root boundary, which sends its own `noindex`.
    // This only has to avoid publishing a title that reads like a real page.
    return { title: 'Service Not Found', robots: { index: false, follow: false } };
  }
  return buildMetadata(serviceSEO(service));
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = (await getService(slug)) ?? getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const [allServices, allProjects, allPosts] = await Promise.all([
    getServices(),
    getProjects(),
    getPosts(),
  ]);

  const related = allServices.filter((item) => item.slug !== service.slug).slice(0, 3);
  const { projects: relatedProjects, posts: relatedPosts } = relatedToService(service.slug, {
    projects: allProjects,
    posts: allPosts,
  });
  const body = service.body ?? [];

  return (
    <article>
      {/* The breadcrumb trail is rendered by `PageHeader` below, which emits
          its own `BreadcrumbList`. Passing one here as well would publish the
          same trail twice. */}
      <JsonLd graph={[serviceNode(service)]} />
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
