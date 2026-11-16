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
      title: 'Built for how Nepal buys',
      description:
        'eSewa, Khalti, cards, and cash on delivery at checkout, wired into dispatch, so orders flow from payment to delivery without manual work.',
    },
    {
      title: 'Found on Google',
      description:
        '3+ years of SEO: technical store audits, product and category pages that rank, and content that answers what buyers search for, including AI search.',
    },
    {
      title: 'Ads judged by orders',
      description:
        'Meta and Google Ads with creative testing and monthly budget moves, measured by ROAS and cost per acquisition, not likes or reach.',
    },
    {
      title: 'In-house experience',
      description:
        'As Ecommerce Lead at Nano Store, a Nepali retailer of iPhones, Android phones, laptops, DJI cameras, Insta360 products, and prescription frames, I owned SEO, paid media, CRO, and email from inside the business. Working in-house meant I managed the full funnel, from product discovery on Google to checkout and repeat purchases, instead of handing off between agencies.',
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
              text="An ecommerce specialist in Kathmandu who works on the whole store, not one channel."
              className="mt-6 text-h2"
            />

            <Reveal delay={0.1}>
              <p className="mt-6 max-w-2xl text-lead text-ink">
                Most stores in Nepal hire one person for the website, another for Facebook
                ads, and nobody for search or email. Sales stall in the gaps between them. I
                work across all of it, so every rupee of spend can be traced to orders.
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
