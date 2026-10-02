import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SkillCard } from '@/components/cards/SkillCard';
import { JsonLd } from '@/components/common/JsonLd';
import { PageHeader } from '@/components/common/PageHeader';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { RevealText } from '@/components/ui/RevealText';
import { Section } from '@/components/ui/Section';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { getServiceBySlug, services } from '@/data/services';
import { getService, getServices } from '@/lib/content';
import { breadcrumbNode, serviceNode } from '@/lib/structured-data';
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
    return { title: 'Service Not Found' };
  }
  return buildMetadata(serviceSEO(service));
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = (await getService(slug)) ?? getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const all = await getServices();
  const related = all.filter((item) => item.slug !== service.slug).slice(0, 3);
  const body = service.body ?? [];

  return (
    <article>
      <JsonLd
        graph={[
          serviceNode(service),
          breadcrumbNode([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
            { name: service.title, path: `/services/${service.slug}` },
          ]),
        ]}
      />
      <PageHeader
        label="Service"
        index={service.index}
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
                  <Button href="/work" variant="outline" size="lg">
                    See Related Work
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

      {related.length > 0 ? (
        <Section className="border-t border-line">
          <Container>
            <SectionLabel label="Keep Exploring" />
            <RevealText as="h2" text="Other Services" className="mt-5 text-h3" />
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ServiceCard key={item.slug} service={item} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}
    </article>
  );
}
