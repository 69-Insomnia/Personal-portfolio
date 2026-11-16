import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/common/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Service } from '@/types';

/**
 * The three services the home page sells, in the order the hero promises them:
 * built, found, sold.
 *
 * Chosen by slug rather than by slicing the array, because the homepage should
 * not silently change what it advertises when a service is added to the
 * registry or the CMS reorders rows. The slice is the fallback for the case
 * where a slug is missing — better to show three adjacent services than an
 * empty band.
 *
 * `data` comes from `getServices()` (the database) and is required: there is
 * no static-file fallback here anymore, so an empty or failed read renders no
 * band rather than quietly reverting the homepage to the repo's copy.
 *
 * This used to be three hand-written "pillars" (Search / Paid Ads / Ecommerce)
 * built from `skills.ts`, which were prose — they had no slugs, so no card
 * could link anywhere and the band could not be navigated. These are the real
 * records, so every card resolves to a live page and the copy is the copy the
 * `/services` grid shows.
 */
const HOMEPAGE_SLUGS = ['web-development', 'seo-services', 'ecommerce-growth'];

function pickHomepageServices(all: Service[]): Service[] {
  const chosen = HOMEPAGE_SLUGS.map((slug) => all.find((service) => service.slug === slug)).filter(
    (service): service is Service => Boolean(service),
  );

  return chosen.length === 3 ? chosen : all.slice(0, 3);
}

export function Services({ data }: { data: Service[] }) {
  const featured = pickHomepageServices(data);

  if (featured.length === 0) return null;

  return (
    <Section id="services" className="border-t border-line">
      <Container>
        <SectionHeading
          section="services"
          title="Three jobs, usually split between three people."
          description="The site, the search result and the ad get handed to different specialists, and the customer only ever meets them together. Doing all three myself is mostly useful because the fix is so often in the gap between them."
          action={
            <Link
              href="/services"
              className="inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-medium text-ink transition-colors duration-200 hover:text-accent"
            >
              All services
              <ArrowRight
                size={16}
                aria-hidden
                className="transition-transform duration-200 ease-out hover:translate-x-1"
              />
            </Link>
          }
        />

        {/*
          An index of full-width rows, not three cards.

          The band used to be a 3-up grid of icon-tile cards — the same card
          language Projects, Blog and the About beat all spoke. Each service is
          now one horizontal record: icon tile and title on the left, the
          description and three capability chips in the middle, the link at the
          far right, hairlines between. Hovering a row warms it and fills the
          icon tile, which is the whole interaction — no lift, because a row
          that jumps off a list reads as a card pretending.
        */}
        <ul className="mt-14 border-t border-line">
          {featured.map((service, index) => (
            <Reveal key={service.slug} as="li" delay={index * 0.07} className="border-b border-line">
              <Link
                href={`/services/${service.slug}`}
                className="group grid gap-4 rounded-card px-2 py-7 transition-colors duration-200 ease-out hover:bg-subtle md:grid-cols-12 md:items-center md:gap-8 md:px-4 md:py-9"
              >
                <div className="flex items-center gap-4 md:col-span-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control border border-line bg-surface text-accent shadow-xs transition-all duration-200 ease-out group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
                    <Icon name={service.icon} size={20} />
                  </span>
                  <h3 className="font-display text-h3 transition-colors duration-200 group-hover:text-accent">
                    {service.title}
                  </h3>
                </div>

                <div className="md:col-span-6">
                  <p className="leading-relaxed text-muted">{service.shortDescription}</p>

                  {/* Three tags, not the full capability list. The row's job is
                      to place the service, not to enumerate it — the previous
                      version printed four capabilities plus a "+N more" counter,
                      which turned the card into a table of contents. */}
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {service.capabilities.slice(0, 3).map((capability) => (
                      <li key={capability} className="chip">
                        {capability}
                      </li>
                    ))}
                  </ul>
                </div>

                <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-accent md:col-span-2 md:justify-end">
                  Learn more
                  <ArrowRight
                    size={15}
                    aria-hidden
                    className="transition-transform duration-200 ease-out group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
