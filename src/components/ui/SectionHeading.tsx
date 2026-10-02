'use client';

import type { ReactNode } from 'react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { RevealText } from '@/components/ui/RevealText';
import { cn } from '@/utils/cn';

interface SectionHeadingProps {
  /**
   * Registry key from `src/data/sections.ts`. Supplies the eyebrow index and
   * label, so a section's number follows its position on the page rather than
   * a hand-typed literal.
   */
  section?: string;
  /** Explicit eyebrow label for sections outside the home-page registry. */
  label?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({
  section,
  label,
  title,
  description,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('grid gap-7 lg:grid-cols-12 lg:items-end', className)}>
      <div className="lg:col-span-7">
        <SectionLabel section={section} label={label} />
        <RevealText as="h2" text={title} className="mt-5 max-w-3xl text-h2" />
      </div>
      {description || action ? (
        <div className="flex flex-col gap-5 lg:col-span-4 lg:col-start-9">
          {description ? <p className="text-lead text-muted">{description}</p> : null}
          {action}
        </div>
      ) : null}
    </div>
  );
}
