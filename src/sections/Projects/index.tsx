'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { projectCategories, projectFilters, projects } from '@/data/projects';
import type { Project, ProjectFilter } from '@/types';
import { cn } from '@/utils/cn';

/**
 * An image-forward grid, not a row of micro-tiles.
 *
 * The grid used to be an auto-fill row of ~175px tiles (a "small cards in a
 * row" request). The redesign goes the other way, per the brief's "premium
 * image-focused layouts": from `md` up it is a two-column grid of full-bleed
 * cover cards ~24rem tall, where the screenshot is the card and the copy sits
 * on a scrim. On phones the cards stay side by side in a swipe row so the
 * section does not stack into a very tall page — the ScrollRow behaviour,
 * kept below `md` only.
 *
 * `motion.li` items keep `layout` so filtering re-flows the grid instead of
 * snapping, and the empty-track question from the old auto-fill grid does not
 * apply to a fixed two-column layout.
 */
export function Projects({
  showHeading = true,
  data,
}: {
  showHeading?: boolean;
  data?: Project[];
}) {
  const items = data ?? projects;
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>('All');

  const filtered =
    activeFilter === 'All'
      ? items
      : items.filter((project) => projectCategories(project).includes(activeFilter));

  // The full /work page (no section heading) leads with the first project that
  // has real, sourced results as a wide featured case study, then a visible
  // grid of the rest. The homepage band keeps its compact swipe row.
  const isIndexPage = !showHeading;
  const featured = isIndexPage ? filtered.find((project) => project.results?.length) : undefined;
  const rest = featured ? filtered.filter((project) => project !== featured) : filtered;

  return (
    <Section id="work" className="border-t border-line">
      <Container>
        {showHeading ? (
          <SectionHeading
            section="work"
            title="Selected work"
            description="Every project written up properly — the brief, the decisions, and what was actually built."
            action={
              <Button href="/work" variant="ghost" showArrow className="self-start">
                All case studies
              </Button>
            }
          />
        ) : (
          <h2 className="sr-only">All projects</h2>
        )}

        <div
          className={cn('flex flex-wrap gap-2.5', showHeading ? 'mt-12' : 'mt-0')}
          role="group"
          aria-label="Filter projects"
        >
          {projectFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
              className={cn(
                'min-h-[44px] rounded-control border px-5 text-sm font-medium transition-all duration-200 ease-out',
                activeFilter === filter
                  ? 'border-accent bg-accent text-on-accent shadow-sm'
                  : 'border-line-strong text-muted hover:border-accent hover:text-accent',
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {featured ? (
          <p className="mt-10 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">
            Featured case study
          </p>
        ) : null}
        {featured ? (
          <div className="mt-4">
            <ProjectCard project={featured} featured priority />
          </div>
        ) : null}

        {featured && rest.length > 0 ? (
          <p className="mt-14 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">
            More projects
          </p>
        ) : null}

        <motion.ul
          layout
          className={cn(
            isIndexPage
              ? 'mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6'
              : 'no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0 lg:gap-7',
            featured ? '' : isIndexPage ? 'mt-10' : '',
          )}
        >
          <AnimatePresence mode="popLayout">
            {rest.map((project) => (
              <motion.li
                key={project.slug}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={cn(
                  'h-full',
                  isIndexPage ? 'min-w-0' : 'w-[82vw] max-w-[400px] shrink-0 snap-start md:w-auto md:max-w-none',
                )}
              >
                <ProjectCard project={project} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        {filtered.length === 0 ? (
          <Card as="p" className="mt-10 p-10 text-center text-muted">
            No projects in this category yet.
          </Card>
        ) : null}
      </Container>
    </Section>
  );
}
