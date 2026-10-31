'use client';

import { getSection } from '@/data/sections';
import { cn } from '@/utils/cn';

interface SectionLabelProps {
  /**
   * Registry key from `src/data/sections.ts`. Resolves the label copy.
   *
   * The registry's `index` is no longer rendered by this component — see the
   * note below — but it still supplies the label, and `getSection` still throws
   * on an unknown id, which is what turns a typo into a build failure instead
   * of a silently empty label.
   */
  section?: string;
  /** Explicit label, for headings outside the home-page registry (subpages). */
  label?: string;
  /**
   * Explicit index, e.g. a service number on a detail page.
   *
   * Accepted and deliberately ignored. It is kept in the signature so the
   * eleven existing call sites — including `PageHeader`, which threads it
   * through from three detail routes — keep compiling without a coordinated
   * edit. Delete this once those call sites stop passing it.
   */
  index?: string;
  className?: string;
}

/**
 * The small label above a section heading.
 *
 * ## What changed and why
 *
 * This used to render a two-digit ordinal, a hairline rule, and an uppercase
 * tracked label — "01 — Services". That is the reference site's idiom (its
 * service cards run 01–05, its portfolio cards read "01 / case ↗"), and it was
 * the single most copyable thing on this page.
 *
 * The ordinal also had a quieter problem: it only ever described the *home
 * page's* order, so `/about` would have shown 01, 02, 09, 10 — numbers that
 * mean nothing on the page displaying them. `SectionNumbering` existed purely
 * to suppress it everywhere else. With the numbers gone the provider is inert,
 * but it stays: the section registry it wraps is still the thing that fails a
 * build on an unknown section id.
 *
 * What is left is a marigold rule and a sentence-case label. The rule is
 * marigold rather than green because it is pure decoration — it sits against
 * paper, carries no text, and is exactly the scarce-accent role the palette
 * reserves marigold for.
 */
export function SectionLabel({ section, label, index, className }: SectionLabelProps) {
  const meta = section ? getSection(section) : undefined;
  const resolvedLabel = meta?.label ?? label;

  if (process.env.NODE_ENV !== 'production' && !resolvedLabel) {
    console.warn('<SectionLabel> needs either a `section` key or a `label`.');
  }

  // Referenced so the prop is not silently dropped by a future reader who
  // assumes it still does something. The value is intentionally unused.
  void index;

  return (
    <p className={cn('eyebrow', className)}>
      <span aria-hidden className="h-px w-7 bg-marigold" />
      <span>{resolvedLabel}</span>
    </p>
  );
}
