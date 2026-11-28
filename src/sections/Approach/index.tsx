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
    <Section id="approach" className="border-t border-line bg-subtle">
      <Container>
        <SectionHeading
          section="approach"
          title="Build. Optimize. Grow."
          description="Same order every time. It isn't clever, but it stops us polishing a page nobody can find."
        />

        {/* Three numbered cards joined by a progress rail on desktop; the
            middle step sits on the charcoal band so the sequence reads as a
            build-up rather than three equal tiles. */}
        <ol className="relative mt-14 grid gap-4 md:grid-cols-3">
          <span
            aria-hidden
            className="pointer-events-none absolute left-[16%] right-[16%] top-[3.25rem] hidden h-px bg-gradient-to-r from-transparent via-line-strong to-transparent md:block"
          />
          {steps.map((step, index) => (
            <Reveal
              key={step.title}
              as="li"
              delay={index * 0.1}
              className={`group relative flex flex-col rounded-[1.5rem] border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-8 ${
                index === 1
                  ? 'section-inverse border-transparent shadow-md'
                  : 'border-line bg-surface shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-paper text-accent shadow-xs transition-colors duration-300 group-hover:border-accent">
                  <Icon name={step.icon} size={22} />
                </span>
                <span aria-hidden className="font-display text-5xl font-semibold leading-none tracking-[-0.04em] text-line">
                  0{index + 1}
                </span>
              </div>

              <h3 className="mt-8 font-display text-h3 text-ink">{step.title}</h3>
              <p className="mt-3 max-w-sm leading-relaxed text-muted">{step.description}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
