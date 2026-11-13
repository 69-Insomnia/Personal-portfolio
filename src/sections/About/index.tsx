'use client';

import { Button } from '@/components/ui/Button';
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
 * The label moved above the heading. It used to sit alone in a 4-column rail
 * with the heading and body in the 8 beside it, which made the label look like
 * the heading of its own empty column. Every other section on the page now runs
 * label-then-heading down a single left edge, and this one matches.
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
    <Section id="about" className="border-t border-line py-12 md:py-14">
      <Container>
        <div className="flex flex-col gap-10">
          <div className="max-w-3xl">
            <SectionLabel section="about" />

            <RevealText
              as="h2"
              text="An ecommerce growth expert who works on the whole store, not one channel."
              className="mt-6 max-w-4xl text-h2"
            />

            <Reveal delay={0.1}>
              <p className="mt-6 max-w-2xl text-lead text-ink">
                Most stores in Nepal hire one person for the website, another for Facebook
                ads, and nobody for search or email. Sales stall in the gaps between them. I
                work across all of it, so every rupee of spend can be traced to orders.
              </p>
            </Reveal>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card, index) => (
              <Reveal key={card.title} delay={index * 0.08}>
                <div className="h-full rounded-[1.25rem] border border-line bg-surface p-6 shadow-sm md:p-7">
                  <h3 className="text-[1.7rem] font-semibold leading-tight tracking-[-0.04em] text-ink">
                    {card.title}
                  </h3>
                  <p className="mt-5 text-[1.02rem] leading-relaxed text-muted">
                    {card.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
