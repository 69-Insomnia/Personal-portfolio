'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PlaceholderBadge } from '@/components/common/PlaceholderBadge';
import { projectCategories } from '@/data/projects';
import { projectImageAlt } from '@/utils/images';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
}

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  /**
   * The result line.
   *
   * `results` is the field the case-study page has always rendered under a
   * "Results" heading, and it is unset on every project in the repository — so
   * this reads the first entry when one exists and renders nothing when it does
   * not. That is deliberate: the alternative is a card that shows a number no
   * one can source, on a site whose whole pitch is measuring things properly.
   *
   * The slot is designed and waiting. See the handoff note for the four values
   * that would fill it.
   */
  const headline = project.results?.[0];

  return (
    <Card as="article" interactive className="group h-full">
      <Link href={`/work/${project.slug}`} className="flex h-full flex-col">
        <div className="relative m-2 aspect-[16/10] overflow-hidden rounded-[12px] bg-subtle">
          <Image
            src={project.image}
            alt={projectImageAlt(project)}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            priority={priority}
          />
          {project.isPlaceholder ? <PlaceholderBadge className="absolute left-3 top-3" /> : null}
        </div>

        <div className="flex flex-1 flex-col p-6 pt-4 md:p-7 md:pt-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted">{projectCategories(project).join(' · ')}</span>
            {project.year ? <span className="text-sm text-muted">{project.year}</span> : null}
          </div>

          <h3 className="mt-2 font-display text-h3 transition-colors duration-200 group-hover:text-accent">
            {project.title}
          </h3>

          {/* The evidentiary beat: a figure first, in the display face and the
              accent green, with its label reading after it as prose. A bare
              number in a stat tile would look like a dashboard; a number inside
              a sentence about the work reads as a claim someone made. */}
          {headline ? (
            <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-xl font-semibold text-accent">
                {headline.value}
              </span>
              <span className="text-sm text-muted">{headline.label}</span>
            </p>
          ) : null}

          <p className="mt-4 flex-1 leading-relaxed text-muted">{project.description}</p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {project.technologies.map((technology) => (
              <li
                key={technology}
                className="rounded-full border border-line px-3 py-1 text-label text-muted"
              >
                {technology}
              </li>
            ))}
          </ul>

          <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-accent">
            Read the case study
            <ArrowRight
              size={15}
              aria-hidden
              className="transition-transform duration-200 ease-out group-hover:translate-x-1"
            />
          </span>
        </div>
      </Link>
    </Card>
  );
}
