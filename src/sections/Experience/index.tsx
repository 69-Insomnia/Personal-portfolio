'use client';

import { EmptyState } from '@/components/common/EmptyState';
import { TimelineItem } from '@/components/cards/TimelineItem';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { experience } from '@/data/experience';
import type { ExperienceItem } from '@/types';

export function Experience({ data }: { data?: ExperienceItem[] }) {
  const realExperience = (data ?? experience).filter((item) => !item.isPlaceholder);

  return (
    <Section id="experience" className="border-t border-line">
      <Container>
        <SectionHeading
          section="experience"
          title="Where I've Worked"
          description="Roles and client projects so far, newest first. The longer version of each is on the work page."
        />

        <Reveal delay={0.05}>
          {realExperience.length > 0 ? (
            <ol className="relative mt-14 border-l border-line pl-8 md:pl-10">
              {realExperience.map((item) => (
                <TimelineItem key={item.id} item={item} />
              ))}
            </ol>
          ) : (
            <EmptyState
              className="mt-14"
              title="Experience information coming soon."
              description="Real roles and projects will be listed here once they are added."
            />
          )}
        </Reveal>
      </Container>
    </Section>
  );
}
