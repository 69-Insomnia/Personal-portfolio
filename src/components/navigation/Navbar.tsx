'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { MobileMenu } from '@/components/navigation/MobileMenu';
import { useScrolled } from '@/hooks/useScrolled';
import { mainNavigation } from '@/data/navigation';
import { identity } from '@/data/seo';
import { profile } from '@/data/profile';
import { cn } from '@/utils/cn';

export function Navbar() {
  const scrolled = useScrolled(24);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  const whatsappHref = profile.whatsapp
    ? `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`
    : null;

  return (
    <>
      {/*
        Ivory and blurred at ALL times, not only once scrolled.

        The old header was transparent at the top of the page and only picked up
        its background after 24px of scroll. On a page that opens on a
        full-height hero that reads as intentional, but this hero is a split
        layout with content starting immediately below the header — so a
        transparent bar put the portrait and the availability badge directly
        behind the navigation on short viewports.

        It stays `sticky` in effect (fixed + the page's own top padding) rather
        than becoming `sticky`, because the mobile menu's focus trap relies on
        the header being a direct child of <body>.
      */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-nav border-b border-line bg-paper-blur backdrop-blur-md transition-all duration-200 ease-out',
        )}
      >
        <Container
          className={cn(
            'flex items-center justify-between transition-all duration-200 ease-out',
            scrolled ? 'h-16' : 'h-20 md:h-24',
          )}
        >
          <Link href="/" className="group flex items-center gap-2.5">
            <Image
              src={profile.avatar}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full border border-line object-cover"
            />
            <span className="flex flex-col">
              <span className="text-[15px] font-semibold leading-tight text-ink transition-colors group-hover:text-accent">
                {profile.name}
              </span>
              {/*
                `identity.role`, not `profile.title`.

                The two are different lengths on purpose. `profile.title` is the
                full positioning line — "Ecommerce Growth Specialist · SEO ·
                Meta & Google Ads" — which is far too long for the navigation.
                This slot needs the short form of the same claim, and
                `identity.role` is exactly that: it is already the phrase the
                Person node publishes as `jobTitle`, so the navbar and the
                structured data say the same words.
              */}
              <span className="mt-0.5 hidden text-xs font-medium text-muted sm:block">
                {identity.role}
              </span>
            </span>
          </Link>

          {/*
            Shown only from `xl`, not `lg`.

            Seven nav items plus the WhatsApp pill need about 1200px. At the old
            `lg` breakpoint (1024px) they did not fit and the row overflowed; at
            1280px there is room. Below that the hamburger takes over, which is
            what it is for. The breakpoint and the reasoning are unchanged from
            the fix that originally set it.
          */}
          <nav aria-label="Primary" className="hidden items-center gap-1 xl:flex">
            {mainNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'relative px-3 py-2 text-sm transition-colors duration-200',
                  isActive(item.href) ? 'text-ink' : 'text-muted hover:text-ink',
                )}
              >
                {item.label}
                {isActive(item.href) ? (
                  <motion.span
                    layoutId="nav-active-link"
                    className="absolute inset-x-3 -bottom-0.5 h-px bg-accent"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            {/*
              One action, not two.

              The header used to carry both a WhatsApp icon circle and a "Let's
              Work Together" button pointing at /contact. Two CTAs side by side
              in a fixed bar split the intent rather than reinforcing it, and
              with seven nav items the row had no room for a third element
              anyway. The pill IS the header's call to action; /contact is one
              tap away in the nav itself.
            */}
            {whatsappHref ? (
              <>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Message me on WhatsApp at ${profile.whatsapp}`}
                  className="hidden h-11 items-center gap-2 rounded-full bg-whatsapp pl-4 pr-5 text-[15px] font-medium text-whatsapp-ink transition-colors duration-200 hover:bg-whatsapp-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:inline-flex"
                >
                  <WhatsAppIcon size={17} aria-hidden />
                  Message me on WhatsApp
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Message me on WhatsApp at ${profile.whatsapp}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-whatsapp text-whatsapp-ink transition-colors duration-200 hover:bg-whatsapp-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:hidden"
                >
                  <WhatsAppIcon size={17} aria-hidden />
                </a>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-ink transition-colors duration-200 hover:border-accent hover:text-accent xl:hidden"
            >
              <Menu size={18} aria-hidden />
            </button>
          </div>
        </Container>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
