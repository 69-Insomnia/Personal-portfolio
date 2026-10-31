'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { scrollRow, scrollRowItemClassName } from '@/components/ui/ScrollRow';
import { projectCategories, projectFilters, projects } from '@/data/projects';
import type { Project, ProjectFilter } from '@/types';
import { cn } from '@/utils/cn';

/**
 * Two columns, not three.
 *
 * The grid was three-up, which at this container width made every screenshot
 * about 380px wide — small enough that the work was unreadable and the section
 * read as a thumbnail wall. With four case studies a 2×2 grid gives each image
 * roughly double the area, and the cards carry a description and a stack row
 * without either being cut to a line.
 *
 * The `ScrollRow` wrapper is kept for its mobile behaviour: below `md` the cards
 * stay side by side and swipe rather than stacking into a very tall page.
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
            description="Four projects, written up properly — the brief, the decisions, and what was actually built."
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

        <motion.ul layout className={scrollRow(2, 'mt-10 md:gap-6')}>
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.li
                key={project.slug}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={cn('h-full', scrollRowItemClassName)}
              >
                <ProjectCard project={project} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        {filtered.length === 0 ? (
          <p className="card mt-10 p-10 text-center text-muted">
            No projects in this category yet.
          </p>
        ) : null}
      </Container>
    </Section>
  );
}
