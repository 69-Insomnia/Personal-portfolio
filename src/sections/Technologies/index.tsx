import { ToolChip } from '@/components/cards/ToolChip';
import { Icon } from '@/components/common/Icon';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { technologyCategories, toPlatformTool } from '@/data/skills';

/**
 * The stack, rendered exactly once.
 *
 * ## Why this section lost its cards
 *
 * It used to be six `card` panels, each holding a tracked label over a wrapping
 * row of chips. Six bordered boxes to say "these are grouped" is an expensive
 * way to draw a grouping — the boxes competed with the chips inside them for
 * weight, and the whole band read as a wall of furniture for what is
 * fundamentally a list of names.
 *
 * A rule and a label per group says the same thing with one line instead of
 * four. The pairs are also now a real `<dl>`, so the relationship between a
 * category and its tools is in the markup rather than implied by proximity.
 *
 * ## Why there is only one copy of this
 *
 * The hero used to carry its own strip of ten platform chips — "Platforms &
 * Tools I Work With" — which is word-for-word the label the reference site puts
 * above its own marquee of the same brands. Two logo strips on one page, one of
 * them duplicating a competitor's section verbatim, is the clearest example of
 * the drift this redesign exists to correct. The hero strip is gone; this is
 * the only place tools appear.
 */
export function Technologies() {
  return (
    <Section id="technologies" className="border-t border-line">
      <Container>
        <SectionHeading
          section="technologies"
          title="The stack behind the work"
          description="What I actually reach for. The stack changes with the job — these are the ones I know well enough to choose between rather than just recognise."
        />

        {/* Category cards in a grid. The `<dl>` semantics hold: each Reveal
            div wraps exactly one dt/dd pair, which HTML allows inside a dl. */}
        <dl className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {technologyCategories.map((category, index) => (
            <Reveal
              key={category.id}
              delay={index * 0.04}
              className="group flex flex-col rounded-[1.25rem] border border-line bg-surface p-6 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
            >
              <dt className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-subtle text-accent transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
                  <Icon name={category.icon} size={18} />
                </span>
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink">
                  {category.name}
                </span>
              </dt>

              <dd className="mt-5 flex flex-wrap gap-2">
                {category.items.map((item) => (
                  <ToolChip key={item} tool={toPlatformTool(item)} />
                ))}
              </dd>
            </Reveal>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
