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

        {/*
          `Reveal` renders the `<div>` that HTML5 allows as a direct child of a
          `<dl>`, and the `dt`/`dd` pair sits directly inside it. An extra
          wrapper div here would have made the group `dl > div > div > dt`, which
          is outside the content model — the rule is that a div *in* a dl holds
          the term and its description, not another container.
        */}
        <dl className="mt-14 grid gap-x-12 gap-y-9 md:grid-cols-2 lg:gap-x-20">
          {technologyCategories.map((category, index) => (
            <Reveal
              key={category.id}
              delay={index * 0.04}
              className="border-t border-line pt-5"
            >
              <dt className="flex items-center gap-2.5 text-sm font-medium text-ink">
                <Icon name={category.icon} size={16} className="shrink-0 text-accent" />
                {category.name}
              </dt>

              <dd className="mt-4 flex flex-wrap gap-2">
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
