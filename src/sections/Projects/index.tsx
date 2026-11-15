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
 * A row of small cards, not two giant tiles.
 *
 * The grid used to be two columns, which at this container width made every
 * card ~500px tall — each project filling half the screen with a display-size
 * title and a full screenshot. The request was to show the work as small cards
 * in a row instead, so from `md` up the list is an auto-fill grid: cards size
 * themselves to ~175px minimum and as many as will fit share one row (six on a
 * desktop viewport, fewer on a laptop, wrapping to a second row only when the
 * width runs out). The card itself is the compact `ProjectCard`.
 *
 * `auto-fill` rather than `auto-fit` is the load-bearing word: `auto-fit`
 * collapses the empty tracks, so filtering the list down to a single project
 * stretched that one card across the whole row — a 600px-tall screenshot where
 * a small card was meant to be. `auto-fill` keeps the empty tracks, so a card
 * is the same small size whether six projects or one match the active filter.
 *
 * The `ScrollRow` behaviour is kept on phones rather than replaced: below `md`
 * the cards stay side by side and swipe so the section does not stack into a
 * very tall page.
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
          className={cn('flex flex-wrap gap-2.5', showHeading ? 'mt-10' : 'mt-0')}
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
                'min-h-[44px] rounded-full border px-5 text-sm font-medium transition-colors duration-200 ease-out',
                activeFilter === filter
                  ? 'border-accent bg-accent text-on-accent'
                  : 'border-line-strong text-muted hover:border-accent hover:text-accent',
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        <motion.ul
          layout
          className={cn(
            'no-scrollbar mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2',
            'md:grid md:grid-cols-[repeat(auto-fill,minmax(175px,1fr))] md:gap-4 md:overflow-visible md:pb-0',
          )}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.li
                key={project.slug}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="h-full w-[64vw] max-w-[260px] shrink-0 snap-start md:w-auto md:max-w-none"
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
