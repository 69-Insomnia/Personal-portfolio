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
   * Image-forward by design (redesign pass).
   *
   * The card used to be a compact tile: small cover, meta row, clamped title
   * and description, link. It is now a full-bleed cover with a gradient scrim
   * and the text sitting ON the image — the layout the brief asks for when it
   * says the portfolio should be "premium image-focused". The scrim carries a
   * solid panel behind the copy so the text never sits on raw photo detail,
   * which is what keeps it accessible without inventing a new colour.
   *
   * The content order is unchanged: category/year, title, result, description,
   * link — the same five beats in the same sequence, only re-housed.
   */
  return (
    <Card as="article" interactive className="group h-full overflow-hidden">
      <Link href={`/work/${project.slug}`} className="relative flex h-full min-h-[24rem] flex-col justify-end">
        <div className="absolute inset-0">
          <Image
            src={project.image}
            alt={projectImageAlt(project)}
            fill
            sizes="(max-width: 768px) 92vw, (max-width: 1200px) 46vw, 420px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            priority={priority}
          />
          {/* The scrim: a two-stop gradient from transparent to near-solid ink,
              so the copy panel always has ≥12:1 behind it regardless of what
              the screenshot underneath is doing. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(9, 14, 30, 0.94) 0%, rgba(9, 14, 30, 0.72) 38%, rgba(9, 14, 30, 0.08) 72%, rgba(9, 14, 30, 0) 100%)',
            }}
          />
          {project.isPlaceholder ? <PlaceholderBadge className="absolute left-4 top-4" /> : null}
        </div>

        <div className="relative flex flex-1 flex-col justify-end p-5 md:p-6">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/75">
              {projectCategories(project).join(' · ')}
            </span>
            {project.year ? (
              <span className="shrink-0 text-[0.6875rem] font-semibold tracking-[0.08em] text-white/75">
                {project.year}
              </span>
            ) : null}
          </div>

          <h3 className="mt-2.5 font-display text-[1.35rem] font-semibold leading-snug tracking-[-0.015em] text-white transition-colors duration-200 group-hover:text-white">
            {project.title}
          </h3>

          {/* The evidentiary beat: a figure first, in the display face and the
              accent blue, with its label reading after it as prose. Kept at
              caption size so it does not outweigh the title. */}
          {headline ? (
            <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
              <span className="text-sm font-semibold text-white">{headline.value}</span>
              <span className="text-[0.75rem] text-white/70">{headline.label}</span>
            </p>
          ) : null}

          <p className="mt-2 line-clamp-2 text-[0.8125rem] leading-relaxed text-white/70">
            {project.description}
          </p>

          <span className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-white">
            Read the case study
            <ArrowRight
              size={13}
              aria-hidden
              className="transition-transform duration-200 ease-out group-hover:translate-x-1"
            />
          </span>
        </div>
      </Link>
    </Card>
  );
}
