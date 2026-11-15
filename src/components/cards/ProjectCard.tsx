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

  /**
   * Compact by request, not by accident.
   *
   * These cards used to be full case-study previews — display-size title,
   * an uncropped description, a chip per technology — which made each one
   * ~500px tall and turned the grid into two giant tiles per row. They now
   * carry what a small card in a row can actually hold: cover, category/year,
   * a clamped title and description, and the case-study link. The technology
   * chips were dropped here for the same reason; the detail page still renders
   * them in full (see the `dl` on `/work/[slug]`).
   */
  return (
    <Card as="article" interactive className="group h-full">
      <Link href={`/work/${project.slug}`} className="flex h-full flex-col">
        <div className="relative m-1.5 aspect-[16/10] overflow-hidden rounded-[10px] bg-subtle">
          <Image
            src={project.image}
            alt={projectImageAlt(project)}
            fill
            sizes="(max-width: 768px) 64vw, (max-width: 1200px) 33vw, 200px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            priority={priority}
          />
          {project.isPlaceholder ? <PlaceholderBadge className="absolute left-3 top-3" /> : null}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[11px] uppercase tracking-[0.08em] text-muted">
              {projectCategories(project).join(' · ')}
            </span>
            {project.year ? (
              <span className="shrink-0 text-[11px] text-muted">{project.year}</span>
            ) : null}
          </div>

          <h3 className="mt-1.5 line-clamp-2 font-display text-[15px] font-semibold leading-snug transition-colors duration-200 group-hover:text-accent">
            {project.title}
          </h3>

          {/* The evidentiary beat: a figure first, in the display face and the
              accent green, with its label reading after it as prose. A bare
              number in a stat tile would look like a dashboard; a number inside
              a sentence about the work reads as a claim someone made. Kept at
              caption size so it does not outweigh the title on a small card. */}
          {headline ? (
            <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
              <span className="text-sm font-semibold text-accent">{headline.value}</span>
              <span className="text-[11px] text-muted">{headline.label}</span>
            </p>
          ) : null}

          {/* `flex-1` used to sit on this paragraph to push the link down, and
              it silently broke `line-clamp`: a flex-grown `-webkit-box` lays
              out every remaining line past the clamp, so the text printed an
              ellipsis after line two and then kept painting over the card
              footer. The paragraph now sizes to its clamped two lines and
              `mt-auto` on the link below does the pushing. */}
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
            {project.description}
          </p>

          <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-medium text-accent">
            Read the case study
            <ArrowRight
              size={12}
              aria-hidden
              className="transition-transform duration-200 ease-out group-hover:translate-x-1"
            />
          </span>
        </div>
      </Link>
    </Card>
  );
}
