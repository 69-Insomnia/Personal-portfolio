import { BlogCard } from '@/components/cards/BlogCard';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { Container } from '@/components/ui/Container';
import { RevealText } from '@/components/ui/RevealText';
import { Section } from '@/components/ui/Section';
import { SectionLabel } from '@/components/ui/SectionLabel';
import type { BlogPost, Project, Service } from '@/types';

type RelatedBlockProps =
  | { kind: 'projects'; label: string; title: string; items: Project[]; columns?: 2 | 3 | 4 }
  | { kind: 'services'; label: string; title: string; items: Service[] }
  | { kind: 'posts'; label: string; title: string; items: BlogPost[] };

/**
 * The "and here is the rest of it" band on a detail page.
 *
 * Built as one component rather than three near-identical blocks because the
 * three detail routes need the same band twice each — a service points at
 * related work *and* related reading — and hand-rolling that six times is how
 * six slightly different grids end up on one site.
 *
 * It returns `null` for an empty list rather than rendering a heading over
 * nothing. That is the important half: `relatedToService` legitimately returns
 * no projects for a service nothing on this site demonstrates, and an empty
 * "Related Work" section would be a promise the page then fails to keep.
 */
export function RelatedBlock(props: RelatedBlockProps) {
  const { label, title, items } = props;
  if (items.length === 0) return null;

  const columns =
    props.kind === 'projects' ? (props.columns ?? 2) : props.kind === 'services' ? 3 : 2;

  const gridClass =
    props.kind === 'posts'
      ? // Article cards carry a 16:10 image and a byline, so the row gap the
        // project grid uses would run two of them together.
        'grid gap-x-4 gap-y-10 md:grid-cols-2'
      : props.kind === 'projects' && columns === 4
        ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-4'
        : 'grid gap-4 md:grid-cols-2 lg:grid-cols-3';

  return (
    <Section className="border-t border-line">
      <Container>
        <SectionLabel label={label} />
        <RevealText as="h2" text={title} className="mt-5 text-h3" />
        <div className={`mt-8 ${gridClass}`}>
          {props.kind === 'projects'
            ? props.items.map((project) => <ProjectCard key={project.slug} project={project} />)
            : null}
          {props.kind === 'services'
            ? props.items.map((service) => <ServiceCard key={service.slug} service={service} />)
            : null}
          {props.kind === 'posts'
            ? props.items.map((post) => <BlogCard key={post.slug} post={post} />)
            : null}
        </div>
      </Container>
    </Section>
  );
}
