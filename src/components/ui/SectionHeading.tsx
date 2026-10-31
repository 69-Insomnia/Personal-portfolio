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
 * ## The layout changed shape
 *
 * It used to be a 12-column split with the eyebrow and `<h2>` in columns 1–7
 * and the description floating in columns 9–12, bottom-aligned. That produced a
 * heading whose line breaks were dictated by a 7/12 column rather than by the
 * sentence — on the longer section titles the `<h2>` wrapped mid-clause while
 * a third of the grid sat empty beside it.
 *
 * Now the eyebrow and the optional action share a top row, and the heading runs
 * the full width beneath them. The heading gets to break where the sentence
 * says, and the action lands at the top-right where it reads as belonging to
 * the section rather than to the copy.
 *
 * The description is capped at the 68ch measure rather than at a column, for
 * the same reason.
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

      <RevealText as="h2" text={title} className="mt-6 max-w-4xl text-h2" />

      {description ? (
        <p className="measure mt-5 text-lead text-muted">{description}</p>
      ) : null}
    </div>
  );
}
