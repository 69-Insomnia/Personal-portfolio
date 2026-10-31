import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/common/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { services as staticServices } from '@/data/services';
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
 * This used to be three hand-written "pillars" (Search / Paid Ads / Ecommerce)
 * built from `skills.ts`, which were prose — they had no slugs, so no card
 * could link anywhere and the band could not be navigated. These are the real
 * records, so every card resolves to a live page and the copy is the copy the
 * `/services` grid shows.
 */
const HOMEPAGE_SLUGS = ['web-development', 'seo', 'ecommerce-growth'];

function pickHomepageServices(all: Service[]): Service[] {
  const chosen = HOMEPAGE_SLUGS.map((slug) => all.find((service) => service.slug === slug)).filter(
    (service): service is Service => Boolean(service),
  );

  return chosen.length === 3 ? chosen : all.slice(0, 3);
}

export function Services({ data }: { data?: Service[] }) {
  const all = data && data.length > 0 ? data : staticServices;
  const featured = pickHomepageServices(all);

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

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((service, index) => (
            <Reveal key={service.slug} delay={index * 0.08} className="h-full">
              <Card as="article" interactive className="group h-full">
                <Link
                  href={`/services/${service.slug}`}
                  className="flex h-full flex-col p-7 md:p-8"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-on-accent">
                    <Icon name={service.icon} size={20} />
                  </span>

                  <h3 className="mt-6 font-display text-h3">{service.title}</h3>

                  <p className="mt-3 flex-1 leading-relaxed text-muted">
                    {service.shortDescription}
                  </p>

                  {/* Three tags, not the full capability list. The card's job is
                      to place the service, not to enumerate it — the previous
                      version printed four capabilities plus a "+N more" counter,
                      which turned the card into a table of contents. */}
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {service.capabilities.slice(0, 3).map((capability) => (
                      <li
                        key={capability}
                        className="rounded-full border border-line px-3 py-1 text-label text-muted"
                      >
                        {capability}
                      </li>
                    ))}
                  </ul>

                  <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-accent">
                    Learn more
                    <ArrowRight
                      size={15}
                      aria-hidden
                      className="transition-transform duration-200 ease-out group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
