'use client';

import { EmptyState } from '@/components/common/EmptyState';
import { TestimonialCard } from '@/components/cards/TestimonialCard';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { publishableTestimonials, testimonials } from '@/data/testimonials';
import type { Testimonial } from '@/types';

/**
 * Client quotes, or nothing.
 *
 * `publishableTestimonials` filters to entries that carry both a verbatim quote
 * and a named person. That filter is the whole point of this component: the
 * four rows in the data file previously held project summaries that rendered
 * inside `<blockquote>` with a quotation mark above them, so the page showed
 * four testimonials nobody had given.
 *
 * With the filter in place and no quotes supplied yet, this renders the empty
 * state — which is the honest thing for the band to do. It is also a standing
 * reminder in the page itself that the work is outstanding, rather than a
 * silent gap someone forgets about.
 */
export function Testimonials({ data }: { data?: Testimonial[] }) {
  const items = publishableTestimonials(data && data.length > 0 ? data : testimonials);

  return (
    <Section id="testimonials" className="border-t border-line">
      <Container>
        <SectionHeading
          section="testimonials"
          title="What clients say"
          description="Unedited. The only entries that appear here are sentences the client actually wrote or said, attributed to the person who said them."
        />

        {items.length === 0 ? (
          <Reveal delay={0.05}>
            <EmptyState
              className="mt-10"
              title="Quotes are being collected."
              description="Nothing is shown here until a client has said something worth quoting and agreed to be named. Nothing on this page is written on their behalf."
            />
          </Reveal>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((testimonial, index) => (
              <Reveal key={testimonial.id} delay={0.07 * index} className="h-full">
                <TestimonialCard testimonial={testimonial} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
