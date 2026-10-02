'use client';

import { ToolChip } from '@/components/cards/ToolChip';
import { Icon } from '@/components/common/Icon';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { technologyCategories, toPlatformTool } from '@/data/skills';

/**
 * Six category cards, each a panel carrying a left-aligned tracked label over
 * a wrapping row of chip-and-mark pills.
 *
 * The grouping is the point — a flat wall of 26 logos says nothing about what
 * the tools are FOR — but it reads as one cloud rather than six lists, so the
 * categories stay scannable without turning the section into a table.
 *
 * Two columns rather than three: a card has to be wide enough to hold its
 * chips in one or two rows before the panel starts looking like empty grey.
 * At three columns the seven-item Frontend card runs to four rows and the rest
 * sit half-empty beside it. Uneven rows are still possible (Frontend and
 * Marketing need two chip rows where their neighbours need one), so cards
 * stretch to the tallest in their row and keep their content at the top — the
 * slack falls below the chips as panel, which is invisible, rather than pushing
 * one card's label down out of line with the label beside it. Labels are
 * left-aligned so every card shares one vertical edge with the section
 * heading above it.
 */
export function Technologies() {
  return (
    <Section id="technologies" className="border-t border-line">
      <Container>
        <SectionHeading
          section="technologies"
          title="Tools I Work With"
          description="The tools I actually reach for. The stack changes with the job; these are the ones I know well enough to choose between."
        />

        <div className="mt-12 grid gap-3 md:grid-cols-2 md:gap-4">
          {technologyCategories.map((category, index) => (
            <Reveal key={category.id} delay={index * 0.05}>
              <div className="card flex h-full flex-col px-5 py-7 md:px-7">
                <p className="flex items-center gap-2.5 text-label font-medium uppercase text-muted">
                  <Icon name={category.icon} size={14} className="shrink-0 text-accent" />
                  {category.name}
                </p>

                <ul className="mt-4 flex flex-wrap gap-2.5">
                  {category.items.map((item) => (
                    <li key={item} className="flex">
                      <ToolChip tool={toPlatformTool(item)} />
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
