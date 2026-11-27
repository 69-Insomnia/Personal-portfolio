import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/common/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Service } from '@/types';

/**
 * The four services the home page sells, as a bento grid.
 *
 * Chosen by slug rather than by slicing the array, so the homepage does not
 * silently change what it advertises when the CMS reorders rows. The first
 * slug is the featured tile (wide, with all capabilities); the slice is the
 * fallback when a slug is missing — better adjacent services than an empty band.
 *
 * `data` comes from `getServices()` (the database); there is no static-file
 * fallback, so a failed read renders no band rather than stale repo copy.
 */
const HOMEPAGE_SLUGS = ['ecommerce-growth', 'web-development', 'seo-services', 'digital-marketing'];

function pickHomepageServices(all: Service[]): Service[] {
  const chosen = HOMEPAGE_SLUGS.map((slug) => all.find((service) => service.slug === slug)).filter(
    (service): service is Service => Boolean(service),
  );

  return chosen.length === HOMEPAGE_SLUGS.length ? chosen : all.slice(0, HOMEPAGE_SLUGS.length);
}

/**
 * Grid placement per position. The featured tile spans two columns on desktop;
 * the last tile spans two as well so the 3-column grid closes flush:
 *   [ featured (2) ][ 2 ]
 *   [ 3 ][ last (2)     ]
 */
const TILE_SPAN = ['md:col-span-2', 'md:col-span-1', 'md:col-span-1', 'md:col-span-2'];

export function Services({ data }: { data: Service[] }) {
  const featured = pickHomepageServices(data);

  if (featured.length === 0) return null;

  return (
    <Section id="services" className="border-t border-line">
      <Container>
        <SectionHeading
          section="services"
          title="What does an ecommerce growth expert do? One accountable partner for the whole funnel."
          description="The store, the search result and the ad usually get handed to different specialists, and the customer only ever meets them together. Doing all of it myself is useful because the fix is so often in the gap between them."
          action={
            <Link
              href="/services"
              className="group inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-medium text-ink transition-colors duration-200 hover:text-accent"
            >
              All services
              <ArrowRight
                size={16}
                aria-hidden
                className="transition-transform duration-200 ease-out group-hover:translate-x-1"
              />
            </Link>
          }
        />

        <ul className="mt-14 grid gap-4 md:grid-cols-3 md:gap-5">
          {featured.map((service, index) => {
            const isFeatured = index === 0;
            const capabilities = service.capabilities.slice(0, isFeatured ? 5 : 3);

            return (
              <Reveal
                key={service.slug}
                as="li"
                delay={index * 0.06}
                className={TILE_SPAN[index] ?? 'md:col-span-1'}
              >
                <Link
                  href={`/services/${service.slug}`}
                  className={[
                    'group relative flex h-full flex-col overflow-hidden rounded-card border p-6 transition-all duration-200 ease-out md:p-8',
                    'hover:-translate-y-0.5 hover:shadow-lg focus-visible:-translate-y-0.5',
                    isFeatured
                      ? 'section-inverse border-transparent bg-inverse text-inverse-ink'
                      : 'border-line bg-surface shadow-xs hover:border-accent',
                  ].join(' ')}
                >
                  {isFeatured ? (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rotate-45 rounded-[3rem] border-2 border-marigold opacity-40"
                    />
                  ) : null}

                  <span
                    className={[
                      'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-control border transition-colors duration-200',
                      isFeatured
                        ? 'border-inverse-line bg-inverse-raised text-inverse-accent'
                        : 'border-line bg-subtle text-accent group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent',
                    ].join(' ')}
                  >
                    <Icon name={service.icon} size={20} />
                  </span>

                  <h3
                    className={[
                      'relative mt-6 font-display font-semibold tracking-[-0.02em]',
                      isFeatured ? 'text-[clamp(1.5rem,2.4vw,2rem)]' : 'text-h3',
                    ].join(' ')}
                  >
                    {service.title}
                  </h3>

                  <p
                    className={[
                      'relative mt-3 leading-relaxed',
                      isFeatured ? 'max-w-xl text-inverse-muted' : 'text-muted',
                    ].join(' ')}
                  >
                    {service.shortDescription}
                  </p>

                  <ul className="relative mt-6 flex flex-wrap gap-2">
                    {capabilities.map((capability) => (
                      <li
                        key={capability}
                        className={
                          isFeatured
                            ? 'rounded-control border border-inverse-line px-3 py-1 text-[0.8125rem] text-inverse-ink'
                            : 'chip'
                        }
                      >
                        {capability}
                      </li>
                    ))}
                  </ul>

                  <span
                    className={[
                      'relative mt-auto inline-flex items-center gap-1.5 pt-8 text-[15px] font-semibold',
                      isFeatured ? 'text-inverse-accent' : 'text-accent',
                    ].join(' ')}
                  >
                    Learn more
                    <ArrowRight
                      size={15}
                      aria-hidden
                      className="transition-transform duration-200 ease-out group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
