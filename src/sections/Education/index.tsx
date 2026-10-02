'use client';

import { EmptyState } from '@/components/common/EmptyState';
import { PlaceholderBadge } from '@/components/common/PlaceholderBadge';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { education } from '@/data/education';

export function Education() {
  const realEducation = education.filter((item) => !item.isPlaceholder);

  return (
    <Section id="education" className="border-t border-line">
      <Container>
        <SectionLabel section="education" />

        <Reveal delay={0.05}>
          {realEducation.length > 0 ? (
            <ul className="mt-8 border-t border-line">
              {realEducation.map((item, index) => (
                <li key={index} className="border-b border-line py-7">
                  <div className="grid gap-3 md:grid-cols-12 md:items-baseline md:gap-6">
                    <div className="md:col-span-5">
                      <h3 className="text-xl font-medium tracking-tight md:text-2xl">
                        {item.degree}
                      </h3>
                      <p className="mt-1 text-sm text-muted">{item.field}</p>
                    </div>
                    <div className="md:col-span-4">
                      <p className="text-sm font-medium text-ink">{item.institution}</p>
                    </div>
                    <div className="md:col-span-3 md:justify-self-end">
                      <span className="text-label font-semibold uppercase text-muted">
                        {item.year}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                  {item.isPlaceholder ? <PlaceholderBadge className="mt-4" /> : null}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              className="mt-8"
              title="Education information coming soon."
              description="Degrees, certifications and studies will appear here once they are added."
            />
          )}
        </Reveal>
      </Container>
    </Section>
  );
}
