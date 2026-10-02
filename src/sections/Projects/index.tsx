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
            title="Selected Projects"
            description="A selection of websites, ecommerce experiences and digital projects I've worked on."
            action={
              <Button href="/work" variant="outline" showArrow className="self-start">
                View All Work
              </Button>
            }
          />
        ) : (
          <h2 className="sr-only">All projects</h2>
        )}

        <div
          className={cn('flex flex-wrap gap-2', showHeading ? 'mt-10' : 'mt-0')}
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
                'rounded-full border px-4 py-2 text-sm font-medium tracking-tight transition-all duration-300 ease-out',
                activeFilter === filter
                  ? 'border-accent bg-accent text-on-accent'
                  : 'border-line text-muted hover:border-ink hover:text-ink',
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        <motion.ul layout className={scrollRow(3, 'mt-8')}>
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.li
                key={project.slug}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
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
