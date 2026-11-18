'use client';

import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { RevealText } from '@/components/ui/RevealText';
import { SectionLabel } from '@/components/ui/SectionLabel';

/**
 * The home page's short "about" beat.
 *
 * Deliberately brief — it is a signpost toward /about, not the profile itself.
 * The full first-person narrative and the sidebar cards live in
 * `src/sections/Profile`, which is a different section with a different job.
 *
 * ## The layout (redesign pass)
 *
 * This used to be a heading followed by a 4-up grid of bordered cards — the
 * same card language three other sections on the page also used. It is now a
 * split editorial layout: the heading and lead paragraph sit in a wide left
 * column, and the four points run as a hairline-divided numbered list in a
 * right-hand rail. No boxes, no shadows — the rhythm comes from the rules
 * between items, so this section reads differently from every carded section
 * around it while carrying exactly the same copy.
 */
export function Introduction() {
  const cards = [
    {
      title: 'Ecommerce Development',
      description:
        'Building user-friendly online stores with smooth shopping experiences, local payment options, and efficient order management for the Nepali market.',
    },
    {
      title: 'SEO & Organic Growth',
      description:
        '3+ years of SEO experience, improving Google visibility through technical SEO, product optimization, category pages, and content strategy.',
    },
    {
      title: 'Paid Advertising',
      description:
        'Managing Meta Ads and Google Ads to reach potential customers, generate sales, and improve return on ad spend through continuous optimization.',
    },
    {
      title: 'In-House Ecommerce Experience',
      description:
        'Currently working as Ecommerce Lead at Nano Store, managing SEO, paid advertising, and CRO. I work across the entire customer journey, from product discovery to checkout and repeat purchases.',
    },
  ];

  return (
    <Section id="about" className="border-t border-line">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionLabel section="about" />

            <RevealText
              as="h2"
              text="Helping ecommerce businesses in Nepal grow online and sell more."
              className="mt-6 text-h2"
            />

            <Reveal delay={0.1}>
              <p className="mt-6 max-w-2xl text-lead text-ink">
                With 3+ years of experience in ecommerce, SEO, and digital marketing, I help
                businesses build better online stores, attract customers, and increase sales.
                I focus on the complete growth process, from website experience and search
                visibility to advertising and customer retention.
              </p>
            </Reveal>
          </div>

          <ol className="border-t border-line lg:col-span-6 lg:col-start-7">
            {cards.map((card, index) => (
              <Reveal key={card.title} as="li" delay={index * 0.08} className="group border-b border-line py-7">
                <div>
                  <h3 className="font-display text-[1.3rem] font-semibold leading-snug tracking-[-0.015em] text-ink transition-colors duration-200 group-hover:text-accent">
                    {card.title}
                  </h3>
                  <p className="mt-2.5 text-[0.975rem] leading-relaxed text-muted">
                    {card.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
