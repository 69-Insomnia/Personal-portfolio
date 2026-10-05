import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { JsonLd } from '@/components/common/JsonLd';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getSeo, getSiteSettings } from '@/lib/content';
import { pricingOffersNode } from '@/lib/structured-data';
import {
  formatNpr,
  hasPublishedPrices,
  monthlyTiers,
  oneOffTiers,
  pricingFactors,
  type PricingTier,
} from '@/data/pricing';
import { pricingSEO, withSeoMeta } from '@/data/seo';
import { buildMetadata } from '@/utils/metadata';

/**
 * What the services cost.
 *
 * This page exists because "cost", "price" and "affordable" appear in the URL
 * or title of nearly every page ranking for SEO and web development in Nepal,
 * and this site answered none of them. The query cluster is commercial and the
 * intent is late-stage: someone typing "SEO cost in Nepal" has already decided
 * they want the service and is choosing between providers. Publishing no
 * pricing does not avoid the conversation, it just moves it to a form
 * submission that most people abandon.
 *
 * **The figures are deliberately nullable.** Nothing on this page invents a
 * number — see the module note in `src/data/pricing.ts`. A tier with no price
 * renders "Contact for a quote", which is weaker but true, and filling in the
 * real figure is a one-character edit per tier.
 *
 * The page is three sections rather than one because they answer three
 * different queries, and they are the three the SERP actually mixes: what does
 * it cost (the tiers), what changes that (the factors), and what happens next
 * (the CTA). Splitting them gives the retrieval systems something to chunk on,
 * which flat pricing tables do not.
 */

function TierCard({ tier }: { tier: PricingTier }) {
  const price = formatNpr(tier.fromNpr);

  return (
    <li className="card flex flex-col p-6 md:p-7">
      <h3 className="text-h3">{tier.name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{tier.summary}</p>

      <div className="mt-6 border-t border-line pt-5">
        {price ? (
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-label font-semibold uppercase text-muted">from</span>
            <span className="text-2xl font-semibold tracking-tight">{price}</span>
            <span className="text-label uppercase text-muted">{tier.unit}</span>
          </p>
        ) : (
          <p className="text-lead font-medium">Contact for a quote</p>
        )}

        {tier.excludesSpend ? (
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Excludes ad spend, which is paid to Google or Meta directly.
          </p>
        ) : null}
      </div>

      <ul className="mt-5 grid gap-2.5 text-sm leading-relaxed text-muted">
        {tier.includes.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        {tier.timeline ? (
          <p className="mb-4 text-xs text-muted">{tier.timeline}</p>
        ) : null}
        {tier.serviceSlug ? (
          <Link
            href={`/services/${tier.serviceSlug}`}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors hover:text-accent"
          >
            How this service works
            <ArrowUpRight
              size={15}
              aria-hidden
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        ) : null}
      </div>
    </li>
  );
}

export default async function PricingPage() {
  /**
   * `undefined` until at least one real price exists, in which case the page
   * emits no offer markup at all rather than an empty catalogue. See the note
   * on `pricingOffersNode`.
   */
  const offers = pricingOffersNode();

  return (
    <>
      {offers ? <JsonLd graph={[offers]} /> : null}

      <PageHeader
        label="Pricing"
        breadcrumb={[
          { name: 'Home', path: '/' },
          { name: 'Pricing', path: '/pricing' },
        ]}
        title="What SEO, Web Development and Ads Cost in Nepal"
        description="Starting points for each service, the things that move those numbers, and what a quote does and does not cover."
      />

      <Section className="pt-14 md:pt-16">
        <Container>
          <div className="max-w-3xl">
            <p className="text-lead text-muted">
              Most projects start from a known figure rather than a negotiation, so the
              numbers below are floors and not quotes. What a specific project costs
              depends on scope, and the section further down sets out exactly which
              decisions move it. If your situation is not covered by anything here, the
              honest answer is a conversation rather than a guess.
            </p>
            {!hasPublishedPrices ? (
              <p className="mt-6 border-l-2 border-line pl-4 text-sm leading-relaxed text-muted">
                Published starting figures are still being finalised. Everything below
                describes what each service includes and what changes the price, and a
                quote is available on request in the meantime.
              </p>
            ) : null}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-line">
        <Container>
          <SectionHeading
            label="One-off"
            title="Project work"
            description="Work with a defined end: it is built, handed over and finished."
          />
          <Reveal delay={0.05}>
            <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {oneOffTiers.map((tier) => (
                <TierCard key={tier.id} tier={tier} />
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <Section className="border-t border-line">
        <Container>
          <SectionHeading
            label="Ongoing"
            title="Monthly retainers"
            description="Work with no end date, reported against the numbers that matter to the business."
          />
          <Reveal delay={0.05}>
            <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {monthlyTiers.map((tier) => (
                <TierCard key={tier.id} tier={tier} />
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <Section className="border-t border-line">
        <Container>
          <SectionHeading
            label="Cost"
            title="What changes the price?"
            description="The four questions that decide most quotes, answered directly."
          />
          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-x-16">
            {pricingFactors.map((factor, index) => (
              <Reveal key={factor.question} delay={0.05 + index * 0.03}>
                <h3 className="text-h3">{factor.question}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted">{factor.answer}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-line">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-h2">Not sure which one you need?</h2>
            <p className="mt-4 text-lead text-muted">
              Describe what you are trying to achieve rather than what you think you
              should buy, and you will get a straight answer about whether the work is
              worth doing, including when it is not.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button href="/contact" size="lg" showArrow>
                Ask for a quote
              </Button>
              <Button href="/services" variant="outline" size="lg">
                See all services
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSeo('page', 'pricing');
  return buildMetadata(withSeoMeta(pricingSEO, meta), await getSiteSettings());
}
