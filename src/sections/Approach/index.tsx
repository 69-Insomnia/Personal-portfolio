'use client';

import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/common/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { IconName } from '@/types';

/**
 * The three-step process.
 *
 * ## The numerals are gone
 *
 * These used to render "01 / Build", "02 / Optimize", "03 / Grow" in tracked
 * uppercase with a two-digit index in the accent colour. The reference site
 * numbers its service cards the same way, and a numbered three-step process is
 * a distinction without a difference — the order is carried by the connecting
 * line and by reading left to right, which is what the line is for.
 *
 * ## The list items
 *
 * This previously delegated to `FlowChain`, which rendered the six flow steps
 * *plus* five arrow connectors as `<li>` elements inside one `<ol>`. The arrows
 * were `aria-hidden`, which hides them from a screen reader's reading order but
 * does not remove their list-item semantics — so the list announced as eleven
 * items when it contained six. `FlowChain` and its two data exports are gone
 * with this rewrite; the process is now a real ordered list of three.
 */
const steps: Array<{
  title: string;
  description: string;
  icon: IconName;
}> = [
  {
    title: 'Build',
    description:
      'Structure, speed and one clear path from landing page to enquiry — before anything is spent on traffic.',
    icon: 'code',
  },
  {
    title: 'Optimize',
    description:
      'Find what is losing people and fix that first. Usually cheaper than the thing everyone assumed was the problem.',
    icon: 'search',
  },
  {
    title: 'Grow',
    description:
      'Bring the right visitors in through search and paid campaigns, then check what they actually did once they arrived.',
    icon: 'chart',
  },
];

export function Approach() {
  return (
    <Section id="approach" className="border-t border-line">
      <Container>
        <SectionHeading
          section="approach"
          title="Build. Optimize. Grow."
          description="Same order every time. It isn't clever, but it stops us polishing a page nobody can find."
        />

        <div className="relative mt-16">
          {/*
            The connecting line.

            `md:block` only — below that the steps stack and a horizontal rule
            through three rows would connect nothing. It sits at 24px from the
            top, which is the vertical centre of the 48px step marker, and
            behind it (`-z-0` via DOM order) so the markers punch through rather
            than sitting on top of a visible seam.
          */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-6 hidden h-px bg-line md:block"
          />

          <ol className="relative grid gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => (
              <Reveal key={step.title} as="li" delay={index * 0.1}>
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface text-accent shadow-sm">
                  <Icon name={step.icon} size={20} />
                </span>

                <h3 className="mt-6 font-display text-h3">{step.title}</h3>
                <p className="mt-3 max-w-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
