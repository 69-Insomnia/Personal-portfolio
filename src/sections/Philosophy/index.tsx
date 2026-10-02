'use client';

import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { RevealText } from '@/components/ui/RevealText';
import { Section } from '@/components/ui/Section';
import { SectionLabel } from '@/components/ui/SectionLabel';

export function Philosophy() {
  return (
    <Section id="philosophy" className="border-y border-line bg-subtle">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <SectionLabel section="philosophy" />

            <RevealText
              as="h2"
              text="Good technology should solve a business problem."
              className="mt-8 text-display"
            />

            <span aria-hidden className="mt-8 block h-1 w-16 bg-accent" />
          </div>

          <Reveal delay={0.1}>
            <div className="grid gap-2 text-lead text-muted lg:border-l lg:border-line lg:pl-10">
              <p>A beautiful website is useful.</p>
              <p className="text-ink">A fast website is better.</p>
              <p className="font-medium text-ink">
                A website that brings customers is what matters.
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
