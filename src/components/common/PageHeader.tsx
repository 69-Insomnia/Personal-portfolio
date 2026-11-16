'use client';

import type { ReactNode } from 'react';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { RevealText } from '@/components/ui/RevealText';

interface PageHeaderProps {
  label: string;
  /** Explicit index for the eyebrow — e.g. a service number. */
  index?: string;
  title: string;
  description?: string;
  /**
   * Rendered beside the eyebrow, for placeholder badges. The three `[slug]`
   * detail routes used to hand-roll this whole header to get these slots.
   */
  badge?: ReactNode;
  /** Rendered between the title and the description — dates, reading time. */
  meta?: ReactNode;
  /**
   * The trail to this page, first item usually Home.
   *
   * Passed as plain data rather than as a `<Breadcrumb>` element so the trail
   * and its `BreadcrumbList` schema are built from one list — the detail routes
   * previously emitted the schema with nothing on the page for a visitor to
   * see, which describes a navigation that does not exist.
   */
  breadcrumb?: Array<{ name: string; path: string }>;
  /** Rendered directly under the description — topic chips, tags. */
  footer?: ReactNode;
}

/**
 * The masthead for every non-home route. Keeps the top padding, the rule and
 * the type scale in one place, so a detail page and a listing page line up.
 *
 * ## The redesign
 *
 * The header now sits on the subtle band with a hairline bottom rule and an
 * oversized outline diamond bleeding off the right edge (decorative,
 * `aria-hidden`), which gives every inner page the same opening shape as the
 * home hero without repeating its dot grid. The description becomes the
 * coral-ruled side note used by `SectionHeading` from `lg` up, so the two
 * masthead components on the site share one composition language. DOM order —
 * breadcrumb, label, title, meta, description, footer — is unchanged.
 */
export function PageHeader({
  label,
  index,
  title,
  description,
  badge,
  meta,
  breadcrumb,
  footer,
}: PageHeaderProps) {
  return (
    <Section className="relative overflow-hidden border-b border-line bg-subtle pb-14 pt-32 md:pb-16 md:pt-40 lg:pb-20 lg:pt-44">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/2 hidden h-72 w-72 -translate-y-1/2 rotate-45 rounded-[3.5rem] border-2 border-marigold/30 xl:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-4 top-1/2 hidden h-24 w-24 -translate-y-1/2 rotate-45 bg-marigold/10 xl:block"
      />
      <Container className="relative">
        {breadcrumb && breadcrumb.length > 0 ? (
          <Breadcrumb items={breadcrumb} className="mb-7" />
        ) : null}
        <div className="flex flex-wrap items-center gap-4">
          <SectionLabel label={label} index={index} />
          {badge}
        </div>
        <div className="grid gap-x-10 gap-y-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <RevealText as="h1" text={title} className="mt-6 text-h1" />
            {meta}
          </div>
          {description ? (
            <p className="measure border-l-2 border-marigold pl-5 text-[0.975rem] leading-relaxed text-muted lg:col-span-4 lg:col-start-9 lg:self-end lg:pl-6">
              {description}
            </p>
          ) : null}
        </div>
        {footer}
      </Container>
    </Section>
  );
}
