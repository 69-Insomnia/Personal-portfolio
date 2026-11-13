import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { SocialIcon } from '@/components/common/SocialIcon';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { footerNavigation } from '@/data/navigation';
import { services } from '@/data/services';
import { identity } from '@/data/seo';
import { profile } from '@/data/profile';
import type { SocialLinks as SocialLinksType } from '@/types';

const footerServiceSlugs = [
  'ecommerce-growth-expert-nepal',
  'ecommerce-growth-specialist-kathmandu',
  'ecommerce-growth-specialist-nepal',
  'shopify-seo-nepal',
  'woocommerce-seo-nepal',
];

const socialLabels: Record<keyof SocialLinksType, string> = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X',
};

export function Footer() {
  // Server component, so this is resolved at render time on the server — no
  // hydration mismatch, and it stops going stale the way a literal did.
  const year = new Date().getFullYear();

  const socials = Object.entries(profile.socialLinks).filter(
    ([, href]) => typeof href === 'string' && href.trim().length > 0,
  ) as Array<[keyof SocialLinksType, string]>;

  const telHref = profile.whatsapp
    ? `tel:${profile.whatsapp.replace(/[^\d+]/g, '')}`
    : null;
  const waHref = profile.whatsapp
    ? `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`
    : null;

  return (
    <footer>
      {/*
        The CTA band.

        `.section-inverse` re-points every semantic token for its subtree, so
        the band is written with ordinary utilities — `text-muted` resolves to
        the band's own muted, `bg-accent` to marigold. That is why the buttons
        below need no special-casing: inside the band `primary` is marigold on
        deep green (6.8:1) and `whatsapp` keeps its fixed brand colours.

        It sits inside <footer> rather than above it so the page has one
        closing landmark, not two.
      */}
      <section className="section-inverse">
        <Container className="py-20 md:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <h2 className="max-w-2xl text-h2">
                Let&apos;s find out what&apos;s holding your store back.
              </h2>
              <p className="measure mt-5 text-lead text-muted">
                Send over the store and the problem, and you&apos;ll get an honest read on
                which fix is worth making first — usually before anything is paid for.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:col-span-5 lg:justify-end">
              {waHref ? (
                <Button
                  href={waHref}
                  variant="whatsapp"
                  size="lg"
                  ariaLabel={`Message me on WhatsApp at ${profile.whatsapp}`}
                >
                  <WhatsAppIcon size={17} className="mr-2" aria-hidden />
                  WhatsApp
                </Button>
              ) : null}
              <Button href="/contact" variant="primary" size="lg" showArrow>
                Start a project
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <div className="border-t border-line">
        <Container className="pt-14 pb-10 md:pt-20 md:pb-12">
          <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1fr_1.05fr]">
            <div className="md:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3.5">
                <Image
                  src={profile.avatar}
                  alt=""
                  width={56}
                  height={56}
                  className="h-14 w-14 shrink-0 rounded-full border border-line object-cover"
                />
                <div>
                  <Link
                    href="/"
                    className="inline-block py-1 font-display text-xl font-semibold transition-colors hover:text-accent"
                  >
                    {profile.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{identity.role}</p>
                </div>
              </div>

              <p className="mt-5 max-w-[38ch] text-[15px] leading-[1.7] text-muted">
                {profile.description}
              </p>

              {socials.length > 0 ? (
                <ul className="mt-6 flex flex-wrap gap-2.5">
                  {socials.map(([key, href]) => (
                    <li key={key}>
                      {/* The brand mark is the label. These used to render the
                          same external-link arrow for every network, so a row of
                          them was a row of identical circles — the aria-label
                          named them for screen readers and left everyone else
                          guessing. */}
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={socialLabels[key]}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-muted transition-colors duration-200 hover:border-accent hover:text-accent"
                      >
                        <SocialIcon network={key} />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <nav aria-label="Site">
              <p className="text-sm font-medium text-ink">Site</p>
              <ul className="mt-4 flex flex-col">
                {footerNavigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block py-1.5 text-[15px] text-muted transition-colors duration-200 hover:text-accent"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Services">
              <p className="text-sm font-medium text-ink">Services</p>
              <ul className="mt-4 flex flex-col">
                {services
                  .filter((service) => footerServiceSlugs.includes(service.slug))
                  .map((service) => (
                    <li key={service.slug}>
                      <Link
                        href={`/services/${service.slug}`}
                        className="block py-1.5 text-[15px] text-muted transition-colors duration-200 hover:text-accent"
                      >
                        {service.title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </nav>

            <div>
              <p className="text-sm font-medium text-ink">Get in touch</p>
              <div className="mt-4 flex flex-col gap-1">
                {telHref ? (
                  <a
                    href={telHref}
                    className="block py-1.5 text-[15px] font-medium text-ink transition-colors duration-200 hover:text-accent"
                  >
                    {profile.whatsapp}
                  </a>
                ) : null}
                {waHref ? (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-1.5 text-[15px] text-muted transition-colors duration-200 hover:text-accent"
                  >
                    WhatsApp
                  </a>
                ) : null}
                {profile.email ? (
                  <a
                    href={`mailto:${profile.email}`}
                    className="block py-1.5 break-words text-[15px] text-muted transition-colors duration-200 hover:text-accent"
                  >
                    {profile.email}
                  </a>
                ) : null}
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Kathmandu%2C%20Nepal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-1.5 text-[15px] text-muted transition-colors duration-200 hover:text-accent"
                  aria-label={`View ${profile.location} service area on Google Maps`}
                >
                  {profile.location}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              © {year} {profile.name}. All rights reserved.
            </p>
            {/* The target keyword as a literal, sentence case — not
                `identity.role` (title case) and not paired with the location.
                Kathmandu still appears in the contact column above, so the
                local signal is not lost by dropping it from this line. */}
            <p className="text-sm text-muted">Ecommerce growth expert in Nepal</p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
