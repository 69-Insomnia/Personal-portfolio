'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PlaceholderBadge } from '@/components/common/PlaceholderBadge';
import { projectCategories } from '@/data/projects';
import { projectImageAlt } from '@/utils/images';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
}

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  return (
    <article className="group h-full">
      <Link
        href={`/work/${project.slug}`}
        className="card card-interactive flex h-full flex-col p-3 md:p-4"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-paper">
          <Image
            src={project.image}
            alt={projectImageAlt(project)}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            priority={priority}
          />
          {project.isPlaceholder ? <PlaceholderBadge className="absolute left-3 top-3" /> : null}
        </div>

        <div className="flex flex-1 flex-col pt-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-label font-medium uppercase text-muted">
              {projectCategories(project).join(' · ')}
            </span>
            {project.year ? <span className="text-sm text-muted">{project.year}</span> : null}
          </div>

          <h3 className="mt-3 text-xl font-medium tracking-tight transition-colors duration-300 group-hover:text-accent md:text-2xl">
            {project.title}
          </h3>

          <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">{project.description}</p>

          <ul className="mt-4 flex flex-wrap gap-2">
            {project.technologies.map((technology) => (
              <li
                key={technology}
                className="border border-line px-2.5 py-1 text-label font-medium uppercase text-muted"
              >
                {technology}
              </li>
            ))}
          </ul>

          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors duration-300 group-hover:text-accent">
            View Project
            <ArrowUpRight
              size={15}
              aria-hidden
              className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </Link>
    </article>
  );
}
