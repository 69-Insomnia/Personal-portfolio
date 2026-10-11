import { ServiceComparisonTable } from '@/components/common/ComparisonTable';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Service } from '@/types';

/**
 * The comparison table, as a page section.
 *
 * ## Why this one is not wrapped in `Reveal`
 *
 * Every other section on the site animates in through `Reveal`, which renders
 * `initial="hidden"` — so the raw HTML for a crawler that does not execute
 * JavaScript carries `style="opacity:0"` on the wrapper. Nothing is lost, since
 * the text is still in the DOM and a retrieval system reads the DOM rather than
 * the screen. It is a defensible default and the site's audit signed off on the
 * SSR with it in place.
 *
 * This section opts out anyway, because it is the one place on the site where
 * the markup exists *specifically* to be extracted by machines. The audience is
 * GPTBot, PerplexityBot, ClaudeBot and Google-Extended — none of which run
 * scripts — and a table is meant to be read the moment it is seen, not faded
 * up at the reader. The cost of opting out is an entrance animation nobody
 * asked for; the benefit is that the most extractable block on the site is
 * unconditionally visible in the raw response.
 *
 * A deliberate exception rather than a drift, so it is written down here.
 */
export function Comparison({ data }: { data: Service[] }) {
  return (
    <Section id="comparison" className="border-t border-line">
      <Container>
        <SectionHeading
          label="At a glance"
          title="What Each Service Includes"
          description="Scope, typical timeline, starting price and who each one is for, side by side. Most projects use three or four of these together rather than one."
        />

        <ServiceComparisonTable services={data} className="mt-12" />
      </Container>
    </Section>
  );
}
