import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound, permanentRedirect } from 'next/navigation';
import { PlaceholderBadge } from '@/components/common/PlaceholderBadge';
import { JsonLd } from '@/components/common/JsonLd';
import { PageHeader } from '@/components/common/PageHeader';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { RelatedBlock } from '@/components/common/RelatedBlock';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { RevealText } from '@/components/ui/RevealText';
import { Section } from '@/components/ui/Section';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { getProjectBySlug, projectCategories, projects } from '@/data/projects';
import { getImageAlt, getPosts, getProject, getProjects, getRedirect, getSeo, getServices, getSiteSettings } from '@/lib/content';
import { relatedToProject } from '@/lib/related';
import { customJsonLdNodes, projectNode } from '@/lib/structured-data';
import { projectSEO } from '@/data/seo';
import { buildMetadata } from '@/utils/metadata';
import { projectImageAlt } from '@/utils/images';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const live = await getProjects();
  const slugs = new Set([...projects.map((p) => p.slug), ...live.map((p) => p.slug)]);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // The overrides are a separate read from the project itself, so they are
  // fetched alongside it rather than after it — this runs on every request for
  // the route, and the two queries are independent.
  const [live, meta] = await Promise.all([getProject(slug), getSeo('project', slug)]);
  const project = live ?? getProjectBySlug(slug);
  if (!project) {
    // `notFound()` renders the root boundary, which sends its own `noindex`.
    return { title: 'Project Not Found', robots: { index: false, follow: false } };
  }
  return buildMetadata(projectSEO(project, meta), await getSiteSettings());
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = (await getProject(slug)) ?? getProjectBySlug(slug);

  if (!project) {
    /**
     * The slug did not resolve, so before giving up: was it renamed?
     *
     * This runs *after* the lookup fails, which is the whole point — the happy
     * path costs nothing extra. Doing it in middleware would put a database
     * round trip (or a cache with a staleness window) in front of every request
     * to serve the small minority that are redirects.
     *
     * `permanentRedirect` emits 308, not 301. Both are permanent and Google
     * passes ranking signals identically; 308 additionally preserves the
     * request method, which is irrelevant for a GET.
     */
    const target = await getRedirect(`/work/${slug}`);
    if (target) permanentRedirect(target);
    notFound();
  }

  const [allProjects, allServices, allPosts, coverAlt, seoMeta] = await Promise.all([
    getProjects(),
    getServices(),
    getPosts(),
    // Fetched alongside the rest rather than after, and returns `undefined`
    // for every image committed to `public/` — see `getImageAlt`.
    getImageAlt(project.image),
    // Read again here rather than threaded down from `generateMetadata`: the
    // two run in separate scopes, and passing the value between them would need
    // a shared cache with its own staleness problem. Same `revalidate` as every
    // other read, so this is not a second request.
    getSeo('project', project.slug),
  ]);

  const related = allProjects
    .filter(
      (item) => item.slug !== project.slug && item.category === project.category,
    )
    .concat(
      allProjects.filter(
        (item) => item.slug !== project.slug && item.category !== project.category,
      ),
    )
    .slice(0, 2);

  const { services: relatedServices, posts: relatedPosts } = relatedToProject(project.slug, {
    services: allServices,
    posts: allPosts,
  });

  const detailBlocks = [
    { key: 'overview', label: 'Overview', text: project.overview },
    { key: 'challenge', label: 'Challenge', text: project.challenge },
    { key: 'approach', label: 'Approach', text: project.approach },
    { key: 'development', label: 'Development', text: project.development },
    { key: 'marketing', label: 'Marketing / SEO', text: project.marketing },
  ].filter((block): block is { key: string; label: string; text: string } => Boolean(block.text));

  return (
    <article>
      {/* The breadcrumb trail is rendered by `PageHeader` below, which emits
          its own `BreadcrumbList`. Passing one here as well would publish the
          same trail twice. */}
      <JsonLd graph={[projectNode(project), ...customJsonLdNodes(seoMeta?.customJsonLd)]} />
      <PageHeader
        label={projectCategories(project).join(' · ')}
        badge={project.isPlaceholder ? <PlaceholderBadge /> : null}
        breadcrumb={[
          { name: 'Home', path: '/' },
          { name: 'Work', path: '/work' },
          { name: project.title, path: `/work/${project.slug}` },
        ]}
        title={project.title}
        description={project.description}
      />

      <Container className="mt-10 md:mt-14">
        <div className="relative aspect-[16/9] overflow-hidden border border-line bg-surface">
          <Image
            src={project.image}
            alt={projectImageAlt(project, coverAlt)}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1100px"
            className="object-cover"
          />
        </div>

        {/* Nested in the same Container rather than a sibling one: two adjacent
            Containers both declaring a top margin collapse into one, which made
            this gap depend on which margin happened to be larger. */}
        <dl className="mt-10 grid gap-6 border-y border-line py-7 sm:grid-cols-2 md:mt-14 lg:grid-cols-4">
          <div>
            <dt className="text-label font-medium uppercase text-muted">Year</dt>
            <dd className="mt-2 text-sm font-medium">{project.year ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-label font-medium uppercase text-muted">Category</dt>
            <dd className="mt-2 text-sm font-medium">{projectCategories(project).join(' · ')}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-label font-medium uppercase text-muted">Technology</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {project.technologies.map((technology) => (
                <span
                  key={technology}
                  className="border border-line px-2.5 py-1 text-label font-medium uppercase text-muted"
                >
                  {technology}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </Container>

      <Container className="py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <SectionLabel label="Case Study" />
          </div>
          <div className="flex flex-col gap-10 lg:col-span-8 lg:col-start-5">
            {detailBlocks.map((block) => (
              <Reveal key={block.key}>
                <section className="border-t border-line pt-6">
                  <h2 className="text-h3">{block.label}</h2>
                  <p className="mt-4 max-w-2xl leading-relaxed text-muted">{block.text}</p>
                </section>
              </Reveal>
            ))}

            {project.results && project.results.length > 0 ? (
              <Reveal>
                <section className="border-t border-line pt-6">
                  <h2 className="text-h3">Results</h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                    {project.results.map((result) => (
                      <li key={result.label} className="border border-line bg-surface p-5">
                        <p className="text-2xl font-medium tracking-tight text-accent">
                          {result.value}
                        </p>
                        <p className="mt-1.5 text-sm text-muted">{result.label}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            ) : null}

            {project.images && project.images.length > 0 ? (
              <Reveal>
                <section className="border-t border-line pt-6">
                  <h2 className="text-h3">Gallery</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {project.images.map((image, index) => (
                      <div
                        key={image}
                        className="relative aspect-[4/3] overflow-hidden border border-line bg-surface"
                      >
                        <Image
                          src={image}
                          alt={`${project.title} project gallery image ${index + 1} of ${project.images?.length ?? 0}`}
                          fill
                          sizes="(max-width: 640px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>
            ) : null}

            {project.link ? (
              <Reveal>
                <div className="border-t border-line pt-6">
                  <Button href={project.link} variant="outline" size="lg" showArrow>
                    Visit Project
                  </Button>
                </div>
              </Reveal>
            ) : null}
          </div>
        </div>
      </Container>

      {/* The service this build demonstrates, then the writing it came out of.
          Previously a case study only ever linked to other case studies, so the
          page that carries the actual evidence pointed at nothing that sells
          the work it is evidence for. */}
      <RelatedBlock
        kind="services"
        label="Services Used"
        title="Services Behind This Build"
        items={relatedServices}
      />
      <RelatedBlock
        kind="posts"
        label="Further Reading"
        title="Articles On This Work"
        items={relatedPosts}
      />

      {related.length > 0 ? (
        <Section className="border-t border-line">
          <Container>
            <SectionLabel label="More Work" />
            <RevealText as="h2" text="Related Projects" className="mt-5 text-h3" />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {related.map((item) => (
                <ProjectCard key={item.slug} project={item} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <Section className="border-t border-line bg-surface">
        <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <h2 className="max-w-xl text-h3">Have a project like this in mind?</h2>
          <Button href="/contact" size="lg" showArrow>
            Start a Conversation
          </Button>
        </Container>
      </Section>
    </article>
  );
}
