'use client';

import Image from 'next/image';
import { Mail } from 'lucide-react';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { profile } from '@/data/profile';

/**
 * The about page as a profile: a first-person column beside a card carrying the
 * portrait and the practical facts.
 *
 * Every claim here is one the site can stand behind. There is no "five years of
 * experience" and no invented job title — the two roles at DrillThru and POM's
 * Penthouse are the real ones, named as they were. Padding a portfolio with
 * years it cannot support is the fastest way to lose the room in a client call.
 */
/** Split by hand — the breaks are a typographic decision, not the measure's. */
const HEADLINE = ['Web Development,', 'SEO and Ads,', 'ALL IN ONE.'];

const BIO = [
  "I'm Dipendra Guragain — a web developer and SEO specialist based in Kathmandu, Nepal. I work across React and Next.js on one side and search and paid media on the other. Most projects need both, and most teams split them between two people.",
  "I spent a year at DrillThru, a web design and digital marketing agency in Nepal, building the agency's own site on Next.js: service pages, a work showcase, testimonials, blog and enquiry flows, plus the structured data that feeds their search results. Working alongside the SEO and ads side is where I stopped thinking of a website as the finish line.",
  "Six months on POM's Penthouse, a serviced-apartment residence in Lakeside, Pokhara, went further. Guests compare 1, 2 and 3 BHK apartments with amenities and nightly rates, then reserve over WhatsApp in one tap rather than filling in a form and waiting. It is the clearest example I have of a decision that came from asking how the customer actually behaves rather than how the site usually works.",
  'The work usually starts with the same question: where are people dropping off? A page that takes four seconds to load on a phone, a query that lands somewhere that does not answer it, an ad pointing at a category when someone wanted one product. Finding it is usually cheaper than the thing everyone assumed was the problem.',
  'I am studying for a BCA at Ratna Rajyalaxmi Campus alongside client work. Most of what I know came from shipping things and then watching what happened.',
];

const CAPABILITIES = [
  'Web Development',
  'SEO',
  'Technical SEO',
  'Ecommerce SEO',
  'Meta Ads',
  'Google Ads',
  'Ecommerce',
  'AI Search',
  'React',
  'Next.js',
  'Shopify',
  'WooCommerce',
  'WordPress',
  'Analytics',
];

const FACTS = [
  {
    term: 'Currently',
    detail: 'Building client sites and running search and paid campaigns, alongside a BCA.',
  },
  {
    term: 'Based in',
    detail: 'Kathmandu, Nepal. Working with teams anywhere.',
  },
  {
    term: 'Also',
    detail: 'Ecommerce, AI search visibility, and the analytics that tell you which of it worked.',
  },
];

export function ProfileIntro() {
  const whatsappHref = profile.whatsapp
    ? `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`
    : null;

  return (
    <Section className="border-b border-line pb-14 pt-32 md:pb-20 md:pt-40 lg:pb-24 lg:pt-44">
      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Breadcrumb
              items={[
                { name: 'Home', path: '/' },
                { name: 'About', path: '/about' },
              ]}
            />

            <h1 className="mt-7 text-h1 font-medium">
              {HEADLINE.map((line) => (
                <span key={line} className="-mb-[0.06em] block pb-[0.06em]">
                  {line}
                </span>
              ))}
            </h1>

            <div className="mt-9 flex flex-col gap-5">
              {BIO.map((paragraph, index) => (
                <Reveal key={paragraph} delay={index * 0.04}>
                  <p className="max-w-2xl leading-relaxed text-muted">{paragraph}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.15}>
              <ul className="mt-10 flex flex-wrap gap-2">
                {CAPABILITIES.map((capability) => (
                  <li
                    key={capability}
                    className="border border-line bg-surface px-3 py-1.5 text-xs font-medium tracking-tight text-ink"
                  >
                    {capability}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="flex flex-col gap-4 lg:sticky lg:top-28">
              <Reveal>
                <div className="card p-4">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src="/images/dipendra-guragain.jpg"
                      alt={`Portrait of ${profile.name}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 380px"
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-lg font-semibold tracking-tight">{profile.name}</p>
                    <p className="mt-1 text-label font-medium uppercase text-muted">
                      {profile.title} · {profile.location}
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="card p-5">
                  <p className="flex items-start gap-2.5 text-label font-semibold uppercase text-ink">
                    <span
                      aria-hidden
                      className="mt-[0.35em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    />
                    {profile.availabilityText}
                  </p>

                  <dl className="mt-5 flex flex-col gap-4 border-t border-line pt-5">
                    {FACTS.map((fact) => (
                      <div key={fact.term}>
                        <dt className="text-label font-semibold uppercase text-muted">
                          {fact.term}
                        </dt>
                        <dd className="mt-1.5 text-sm leading-relaxed text-ink">{fact.detail}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-5 flex flex-col gap-2.5 border-t border-line pt-5">
                    {profile.email ? (
                      <Button
                        href={`mailto:${profile.email}`}
                        variant="outline"
                        className="w-full justify-center"
                        ariaLabel={`Email ${profile.email}`}
                      >
                        <Mail size={16} aria-hidden className="mr-2" />
                        {profile.email}
                      </Button>
                    ) : null}
                    {whatsappHref ? (
                      <Button
                        href={whatsappHref}
                        variant="whatsapp"
                        className="w-full justify-center"
                        ariaLabel={`Chat on WhatsApp at ${profile.whatsapp}`}
                      >
                        <WhatsAppIcon size={16} className="mr-2" />
                        Chat on WhatsApp
                      </Button>
                    ) : null}
                    <Button
                      href="/contact"
                      variant="inverse"
                      className="w-full justify-center"
                      showArrow
                    >
                      Start a Project
                    </Button>
                  </div>
                </div>
              </Reveal>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
