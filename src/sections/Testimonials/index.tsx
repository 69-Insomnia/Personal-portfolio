'use client';

import { EmptyState } from '@/components/common/EmptyState';
import { TestimonialCard } from '@/components/cards/TestimonialCard';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { testimonials } from '@/data/testimonials';
import type { Testimonial } from '@/types';

export function Testimonials({ data }: { data?: Testimonial[] }) {
  const items = data ?? testimonials;
  return (
    <Section id="testimonials" className="border-t border-line">
      <Container>
        <SectionHeading section="testimonials" title="What Clients Say" />

        {items.length === 0 ? (
          <Reveal delay={0.05}>
            <EmptyState
              className="mt-10"
              title="Testimonials coming soon."
              description="Real client words will be published here once available. Nothing is invented."
            />
          </Reveal>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
