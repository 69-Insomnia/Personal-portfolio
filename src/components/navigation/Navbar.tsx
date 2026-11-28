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
import { whatsappUrl } from '@/utils/links';

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

  const whatsappHref = whatsappUrl(profile.whatsapp);

  return (
    <>
      {/*
        White and blurred at ALL times, not only once scrolled.

        The old header was transparent at the top of the page and only picked up
        its background after 24px of scroll. On a page that opens on a
        full-height hero that reads as intentional, but this hero is a split
        layout with content starting immediately below the header — so a
        transparent bar put the portrait and the availability badge directly
        behind the navigation on short viewports.

        It stays `sticky` in effect (fixed + the page's own top padding) rather
        than becoming `sticky`, because the mobile menu's focus trap relies on
        the header being a direct child of <body>.

        The redesign: the navigation row is centred between the wordmark and
        the actions, and the active item is a soft blue pill rather than an
        underline — the layoutId spring slides it between items, which is the
        header's one piece of motion. Links grow a `rounded-control`
        background on hover so the row reads as controls, not as prose.
      */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-nav border-b transition-all duration-300 ease-out',
          scrolled || menuOpen
            ? 'border-line bg-paper-blur shadow-xs backdrop-blur-md'
            : 'border-transparent bg-transparent',
        )}
      >
        <Container
          className={cn(
            'flex items-center justify-between transition-all duration-200 ease-out',
            scrolled ? 'h-16' : 'h-20 md:h-24',
          )}
        >
          <Link href="/" className="group flex items-center gap-3">
            <Image
              src={profile.avatar}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full border border-line object-cover ring-2 ring-transparent transition-all duration-200 group-hover:ring-accent/30"
            />
            <span className="flex flex-col">
              <span className="text-[15px] font-semibold leading-tight tracking-[-0.01em] text-ink transition-colors group-hover:text-accent">
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
              {/* The second line, and only here and in the footer — see
                  `roleSecondary`. Same classes as the line above, so it reads
                  as one byline rather than as a second piece of navigation. */}
              <span className="hidden text-xs font-medium text-muted sm:block">
                {identity.roleSecondary}
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
          <nav
            aria-label="Primary"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 xl:flex"
          >
            {mainNavigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  title={item.title}
                  className={cn(
                    'relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200',
                    active ? 'text-ink' : 'text-muted hover:text-ink',
                  )}
                >
                  {item.label}
                  {active ? (
                    <motion.span
                      layoutId="nav-active-link"
                      className="absolute inset-0 -z-10 rounded-full bg-surface shadow-xs ring-1 ring-line"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Primary CTA (Book a Call) plus WhatsApp as a compact secondary. */}
            <Link
              href="/contact"
              className="hidden h-11 items-center gap-2 rounded-full bg-ink pl-5 pr-4 text-sm font-semibold text-paper shadow-sm transition-all duration-200 hover:bg-accent hover:text-on-accent hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:inline-flex"
            >
              Book a Call
              <span
                aria-hidden
                className="h-2 w-2 rounded-full bg-marigold shadow-[0_0_0_3px_rgba(132,204,22,0.25)]"
              />
            </Link>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Message me on WhatsApp at ${profile.whatsapp}`}
                title="Message me on WhatsApp"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-whatsapp text-whatsapp-ink transition-all duration-200 hover:bg-whatsapp-hover hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <WhatsAppIcon size={18} aria-hidden />
              </a>
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
