'use client';

import type { ReactNode } from 'react';
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
}

/**
 * The masthead for every non-home route. Keeps the top padding, the rule and
 * the type scale in one place, so a detail page and a listing page line up.
 */
export function PageHeader({ label, index, title, description, badge, meta }: PageHeaderProps) {
  return (
    <Section className="border-b border-line pb-14 pt-32 md:pb-16 md:pt-40 lg:pb-20 lg:pt-44">
      <Container>
        <div className="flex flex-wrap items-center gap-4">
          <SectionLabel label={label} index={index} />
          {badge}
        </div>
        <RevealText as="h1" text={title} className="mt-6 max-w-4xl text-h1" />
        {meta}
        {description ? (
          <p className="mt-6 max-w-2xl text-lead text-muted">{description}</p>
        ) : null}
      </Container>
    </Section>
  );
}
