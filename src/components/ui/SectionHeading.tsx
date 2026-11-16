'use client';

import type { ReactNode } from 'react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { RevealText } from '@/components/ui/RevealText';
import { cn } from '@/utils/cn';

interface SectionHeadingProps {
  /**
   * Registry key from `src/data/sections.ts`. Supplies the eyebrow label.
   */
  section?: string;
  /** Explicit eyebrow label for sections outside the home-page registry. */
  label?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * The masthead for a section.
 *
 * ## The layout changed shape (redesign pass)
 *
 * The current composition is a hanging masthead with a side note:
 *
 * - The eyebrow and the optional action share a top row, full width.
 * - Beneath them, a 12-column grid: the `<h2>` takes columns 1–7 and the
 *   description sits in columns 9–12, baseline-aligned, marked with a coral
 *   left rule so it reads as a note about the heading rather than as more
 *   heading copy.
 *
 * The split is safe here (where an earlier 7/12 version was not) because the
 * heading now carries `text-wrap: balance` from the base layer and the note
 * column is short by construction — it is the section's supporting sentence,
 * capped at ~34ch by the column itself. On mobile everything stacks in DOM
 * order: label, heading, note.
 *
 * The props are unchanged, so `/pricing`'s three usages and every section
 * component keep working untouched.
 */
export function SectionHeading({
  section,
  label,
  title,
  description,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionLabel section={section} label={label} />
        {action}
      </div>

      <div className="mt-7 grid gap-x-10 gap-y-5 lg:grid-cols-12">
        <RevealText as="h2" text={title} className="lg:col-span-7 text-h2" />

        {description ? (
          <p className="measure border-l-2 border-marigold pl-5 text-[0.975rem] leading-relaxed text-muted lg:col-span-4 lg:col-start-9 lg:self-end lg:pl-6">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
