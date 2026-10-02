'use client';

import { FlowChain } from '@/components/common/FlowChain';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import {
  ecommerceCapabilities,
  metaAdsCapabilities,
  seoCapabilities,
  serviceFlowSteps,
} from '@/data/skills';

/**
 * The three service deep-dives (search, paid, ecommerce) used to be three
 * full-height sections stacked down the page, making the same point three
 * times. Folded into one band, the page keeps the capabilities and loses two
 * and a half screens of scroll.
 *
 * This is the page's only inverse band, so it keeps that job too: the dark
 * beat between a long light run of sections.
 *
 * The capabilities render as a plain marked list rather than the boxed chips
 * this started as. Three columns of bordered cards came to twenty-four boxes
 * competing with the column headings for weight, sized to their own text — so
 * "Conversion Optimization" wrapped to two lines and grew taller than its
 * neighbours, breaking the row rhythm. Worse, those chips carried
 * `card-interactive`, which lifts and flashes a near-white border on hover:
 * twenty-four controls that did nothing when clicked. Plain list items carry
 * no such promise.
 */
const pillars = [
  {
    title: 'Search',
    blurb:
      'Technical fixes, keyword work, and pages that answer the question someone actually typed.',
    capabilities: seoCapabilities,
  },
  {
    title: 'Paid Ads',
    blurb:
      'Meta and Google campaigns built on real intent, tested creative, and tracking worth trusting.',
    capabilities: metaAdsCapabilities,
  },
  {
    title: 'Ecommerce',
    blurb:
      'The storefront, the product pages, the checkout, and the numbers underneath all of it.',
    capabilities: ecommerceCapabilities,
  },
];

export function Services() {
  return (
    <Section id="services" className="section-inverse border-t border-line">
      <Container>
        <SectionHeading
          section="services"
          title="Three Jobs, Usually Split Between Three People."
          description="The site, the search result and the ad get handed to different specialists, and the customer only ever meets them together. Doing all three myself is mostly useful because the fix is so often in the gap between them."
        />

        <div className="mt-12 grid gap-px border border-line bg-line lg:grid-cols-3">
          {pillars.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 0.08} className="h-full">
              <div className="flex h-full flex-col bg-surface p-7 md:p-8">
                <h3 className="text-h3 text-ink">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{pillar.blurb}</p>

                {/* The rule separates the claim from the evidence, and gives the
                    three columns one shared horizontal line even though their
                    blurbs run to different lengths. */}
                <ul className="mt-7 flex flex-col gap-3 border-t border-line pt-6">
                  {pillar.capabilities.map((capability) => (
                    <li key={capability} className="flex gap-3 text-sm leading-relaxed text-ink">
                      <span
                        aria-hidden
                        className="mt-[0.5em] h-1 w-1 shrink-0 rounded-full bg-accent"
                      />
                      <span>{capability}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.12}>
          <div className="card mt-4 p-5 md:p-7">
            <p className="text-label font-medium uppercase text-muted">Where each job sits</p>
            <FlowChain steps={serviceFlowSteps} className="mt-5" />
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
