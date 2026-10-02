'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { MobileMenu } from '@/components/navigation/MobileMenu';
import { useScrolled } from '@/hooks/useScrolled';
import { mainNavigation } from '@/data/navigation';
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

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-nav transition-all duration-300 ease-out',
          scrolled
            ? 'border-b border-line bg-paper-blur backdrop-blur-md'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <Container
          className={cn(
            'flex items-center justify-between transition-all duration-300 ease-out',
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
              <span className="text-[15px] font-semibold leading-tight tracking-tight text-ink transition-colors group-hover:text-accent">
                {profile.name}
              </span>
              <span className="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-muted sm:block">
                {profile.title}
              </span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {mainNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'relative px-3.5 py-2 text-sm tracking-tight transition-colors duration-300',
                  isActive(item.href) ? 'text-ink' : 'text-muted hover:text-ink',
                )}
              >
                {item.label}
                {isActive(item.href) ? (
                  <motion.span
                    layoutId="nav-active-link"
                    className="absolute inset-x-3.5 -bottom-0.5 h-px bg-accent"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            {profile.whatsapp ? (
              <a
                href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chat on WhatsApp at ${profile.whatsapp}`}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-whatsapp text-whatsapp-ink transition-colors hover:bg-whatsapp-hover lg:h-9 lg:w-9"
              >
                <WhatsAppIcon size={17} />
              </a>
            ) : null}
            <Button
              href="/contact"
              variant="inverse"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Let&apos;s Work Together
            </Button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink lg:hidden"
            >
              <Menu size={16} aria-hidden />
            </button>
          </div>
        </Container>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
