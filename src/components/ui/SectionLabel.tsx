'use client';

import { useSectionNumbering } from '@/components/ui/SectionNumbering';
import { getSection } from '@/data/sections';
import { cn } from '@/utils/cn';

interface SectionLabelProps {
  /**
   * Registry key from `src/data/sections.ts`. Supplies the label, plus the
   * ordinal when the current page numbers its sections. Prefer this over
   * `label` on any section that appears on the home page.
   */
  section?: string;
  /** Explicit label, for headings outside the home-page order (subpages). */
  label?: string;
  /** Explicit index, for headings outside the home-page order (e.g. "—"). */
  index?: string;
  className?: string;
}

export function SectionLabel({ section, label, index, className }: SectionLabelProps) {
  const numbered = useSectionNumbering();
  const meta = section ? getSection(section) : undefined;

  // The registry ordinal is only meaningful on the page whose order it
  // describes, so it's shown only when that page opts in. An explicit `index`
  // still renders either way — detail pages use "—" for their one-off headers.
  const resolvedIndex = numbered ? (meta?.index ?? index) : index;
  const resolvedLabel = meta?.label ?? label;

  if (process.env.NODE_ENV !== 'production' && !resolvedLabel) {
    console.warn('<SectionLabel> needs either a `section` key or a `label`.');
  }

  return (
    <div className={cn('eyebrow', className)}>
      {resolvedIndex ? <span className="font-semibold text-accent">{resolvedIndex}</span> : null}
      <span aria-hidden className="h-px w-8 bg-line" />
      <span>{resolvedLabel}</span>
    </div>
  );
}
