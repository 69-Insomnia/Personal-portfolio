'use client';

import { ServiceCard } from '@/components/cards/ServiceCard';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { services } from '@/data/services';
import type { Service } from '@/types';

interface ExpertiseProps {
  /** Hide the "All Services" CTA on pages where it would link to the current page. */
  showAllServices?: boolean;
  /** CMS-provided services; falls back to the static data file. */
  data?: Service[];
}

export function Expertise({ showAllServices = true, data }: ExpertiseProps) {
  const items = data ?? services;
  return (
    <Section id="expertise" className="border-t border-line">
      <Container>
        <SectionHeading
          label="Expertise"
          title="What I Do"
          description="Seven things I do, and they overlap more than a list suggests. Most projects use three or four of them."
          action={
            showAllServices ? (
              <Button href="/services" variant="outline" showArrow className="self-start">
                All Services
              </Button>
            ) : null
          }
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((service, index) => (
            <Reveal key={service.slug} delay={index * 0.06} className="h-full">
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
