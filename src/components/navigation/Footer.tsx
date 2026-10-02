import Link from 'next/link';
import Image from 'next/image';
import { SocialIcon } from '@/components/common/SocialIcon';
import { Container } from '@/components/ui/Container';
import { footerNavigation } from '@/data/navigation';
import { services } from '@/data/services';
import { profile } from '@/data/profile';
import type { SocialLinks as SocialLinksType } from '@/types';

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
    <footer className="border-t border-line">
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
                  className="inline-block py-1 text-xl font-semibold tracking-tight transition-colors hover:text-accent"
                >
                  {profile.name}
                </Link>
                <p className="mt-1 text-label font-medium uppercase text-muted">
                  {profile.title}
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-[38ch] text-[15px] leading-[1.75] text-muted">
              {profile.description}
            </p>

            {socials.length > 0 ? (
              <ul className="mt-6 flex gap-2.5">
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
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-muted transition-colors duration-300 hover:border-ink hover:text-ink"
                    >
                      <SocialIcon network={key} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <nav aria-label="Site">
            <p className="text-label font-medium uppercase text-muted">Site</p>
            <ul className="mt-4 flex flex-col">
              {footerNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-1.5 text-[15px] text-muted transition-colors duration-300 hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Services">
            <p className="text-label font-medium uppercase text-muted">Services</p>
            <ul className="mt-4 flex flex-col">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="block py-1.5 text-[15px] text-muted transition-colors duration-300 hover:text-accent"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-label font-medium uppercase text-muted">Get in touch</p>
            <div className="mt-4 flex flex-col gap-1">
              {telHref ? (
                <a
                  href={telHref}
                  className="block py-1.5 text-[15px] font-semibold tracking-tight transition-colors duration-300 hover:text-accent"
                >
                  {profile.whatsapp}
                </a>
              ) : null}
              {waHref ? (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-1.5 text-[15px] text-muted transition-colors duration-300 hover:text-accent"
                >
                  WhatsApp
                </a>
              ) : null}
              {profile.email ? (
                <a
                  href={`mailto:${profile.email}`}
                  className="block py-1.5 break-words text-[15px] text-muted transition-colors duration-300 hover:text-accent"
                >
                  {profile.email}
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            © {year} {profile.name}. All rights reserved.
          </p>
          <p className="text-sm text-muted">{profile.title}</p>
        </div>
      </Container>
    </footer>
  );
}
