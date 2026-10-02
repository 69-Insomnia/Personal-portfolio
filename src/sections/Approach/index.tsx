'use client';

import { FlowChain } from '@/components/common/FlowChain';
import { Icon } from '@/components/common/Icon';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { growthFlowSteps } from '@/data/skills';
import type { IconName } from '@/types';

const steps: Array<{
  index: string;
  title: string;
  description: string;
  icon: IconName;
}> = [
  {
    index: '01',
    title: 'Build',
    description: 'Structure, speed and a clear path from landing to enquiry.',
    icon: 'code',
  },
  {
    index: '02',
    title: 'Optimize',
    description: 'Find what is losing people and fix that before adding anything new.',
    icon: 'search',
  },
  {
    index: '03',
    title: 'Grow',
    description: 'Bring the right visitors in through search and paid campaigns, then check what they did.',
    icon: 'chart',
  },
];

export function Approach() {
  return (
    <Section id="approach" className="border-t border-line">
      <Container>
        <SectionHeading
          section="approach"
          title="Build. Optimize. Grow."
          description="Same order every time. It isn't clever, but it stops us polishing a page that nobody can find."
        />

        <div className="mt-12 grid gap-px border border-line bg-line md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.index} className="h-full bg-paper">
              <Reveal delay={index * 0.08} className="h-full">
                <div className="group h-full bg-paper p-7 transition-colors duration-500 hover:bg-surface md:p-9">
                  <div className="flex items-center justify-between">
                    <span className="text-label font-semibold text-accent">{step.index}</span>
                    <Icon
                      name={step.icon}
                      size={18}
                      className="text-muted transition-all duration-500 group-hover:-translate-y-0.5 group-hover:text-accent"
                    />
                  </div>
                  <h3 className="mt-12 text-h3 uppercase">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{step.description}</p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-10">
          <div className="card p-5 md:p-7">
            <p className="text-label font-medium uppercase text-muted">The flow</p>
            <FlowChain steps={growthFlowSteps} className="mt-5" />
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
