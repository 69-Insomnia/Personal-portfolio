import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PlaceholderBadge } from '@/components/common/PlaceholderBadge';
import { projectCategories } from '@/data/projects';
import { projectImageAlt } from '@/utils/images';
import type { Project } from '@/types';
import { cn } from '@/utils/cn';

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
  /** The lead case study on /work: image beside the details on desktop, every result shown. */
  featured?: boolean;
}

/**
 * Image on top, copy below.
 *
 * The previous version put the text on a dark scrim over the screenshot, which
 * hid the very thing a portfolio card is for. Here the screenshot is shown in
 * full on a soft frame and the copy sits on a plain surface underneath, so the
 * work is always legible and text contrast never depends on the image.
 *
 * `results` is only rendered when real, sourced figures exist — never invented.
 */
export function ProjectCard({ project, priority = false, featured = false }: ProjectCardProps) {
  const headline = project.results?.[0];
  const categories = projectCategories(project).join(' · ');

  return (
    <Card as="article" interactive className="group h-full overflow-hidden">
      <Link
        href={`/work/${project.slug}`}
        className={cn('flex h-full flex-col', featured && 'lg:grid lg:grid-cols-12')}
      >
        <div
          className={cn(
            'relative overflow-hidden bg-subtle',
            featured ? 'aspect-[16/10] lg:col-span-7 lg:aspect-auto lg:min-h-[26rem]' : 'aspect-[16/10]',
          )}
        >
          <Image
            src={project.image}
            alt={projectImageAlt(project)}
            fill
            sizes={
              featured
                ? '(max-width: 1024px) 92vw, 640px'
                : '(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 380px'
            }
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            priority={priority}
          />
          {project.isPlaceholder ? <PlaceholderBadge className="absolute left-4 top-4" /> : null}
        </div>

        <div
          className={cn(
            'flex flex-1 flex-col p-5 md:p-6',
            featured && 'lg:col-span-5 lg:justify-center lg:p-10',
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-accent">
              {categories}
            </span>
            {project.year ? (
              <span className="shrink-0 text-[0.6875rem] font-semibold tracking-[0.08em] text-muted">
                {project.year}
              </span>
            ) : null}
          </div>

          <h3
            className={cn(
              'mt-3 font-display font-semibold leading-snug tracking-[-0.015em] text-ink transition-colors duration-200 group-hover:text-accent',
              featured ? 'text-[clamp(1.375rem,2.4vw,1.875rem)] leading-tight' : 'text-[1.25rem]',
            )}
          >
            {project.title}
          </h3>

          <p
            className={cn(
              'mt-2 leading-relaxed text-muted',
              featured ? 'line-clamp-4 text-[0.9375rem]' : 'line-clamp-2 text-[0.875rem]',
            )}
          >
            {project.description}
          </p>

          {featured && project.results?.length ? (
            // Phones: one row per result (number left, label right) so a seven-
            // character figure never has to share a 150px column. From `sm`:
            // two side-by-side cells, numbers top-aligned whatever the label's
            // length. Label before value in the markup (dt before dd), number
            // shown first with CSS `order`.
            <dl className="mt-6 grid grid-cols-1 divide-y divide-line overflow-hidden rounded-control border border-line bg-subtle sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              {project.results.map((result) => (
                <div
                  key={result.label}
                  className="flex items-center gap-4 px-4 py-3.5 sm:flex-col sm:items-start sm:gap-1.5 sm:px-5 sm:py-4"
                >
                  <dt className="order-2 text-[0.8125rem] leading-snug text-muted sm:text-[0.75rem]">
                    {result.label}
                  </dt>
                  <dd className="order-1 min-w-[6.25rem] shrink-0 whitespace-nowrap font-display text-[1.5rem] font-semibold leading-none tracking-[-0.02em] text-ink tabular-nums sm:min-w-0 sm:text-[1.75rem]">
                    {result.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : headline ? (
            <p className="mt-3 flex flex-wrap items-baseline gap-x-1.5">
              <span className="text-sm font-semibold text-ink">{headline.value}</span>
              <span className="text-[0.75rem] text-muted">{headline.label}</span>
            </p>
          ) : null}

          <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[0.875rem] font-semibold text-accent">
            Read the case study
            <ArrowRight
              size={14}
              aria-hidden
              className="transition-transform duration-200 ease-out group-hover:translate-x-1"
            />
          </span>
        </div>
      </Link>
    </Card>
  );
}
