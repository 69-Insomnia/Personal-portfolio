'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { mainNavigation } from '@/data/navigation';
import { identity } from '@/data/seo';
import { profile } from '@/data/profile';
import { whatsappUrl } from '@/utils/links';
import { cn } from '@/utils/cn';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const waHref = whatsappUrl(profile.whatsapp);

  // Same rule as the desktop nav, so the two menus never disagree about which
  // item is current.
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  // Held in a ref so the keyboard effect can depend on `open` alone. Callers
  // pass an inline arrow, so depending on `onClose` directly would tear the
  // effect down on every parent render and thrash focus.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    // Whatever was focused before opening — normally the hamburger — so focus
    // can be handed back rather than dumped on the document body.
    const previouslyFocused = document.activeElement as HTMLElement | null;

    closeButtonRef.current?.focus();

    const dialog = dialogRef.current;

    // Hide the rest of the page from assistive tech and the tab order while the
    // dialog is open. `inert` covers both, and where it isn't supported the
    // focus trap below still keeps keyboard users inside the dialog. The
    // header, main and footer are direct children of <body> alongside the
    // dialog.
    const siblings = dialog
      ? Array.from(document.body.children).filter(
          (element) => element !== dialog && element.tagName !== 'SCRIPT',
        )
      : [];

    siblings.forEach((element) => element.setAttribute('inert', ''));

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialog) {
        return;
      }

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => element.getClientRects().length > 0,
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      // Wrap at both ends, and pull focus back in if it ever escaped. Without
      // this, Tab walks into the page behind the overlay.
      if (!dialog.contains(current)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      siblings.forEach((element) => element.removeAttribute('inert'));
      previouslyFocused?.focus();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={dialogRef}
          key="mobile-menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-0 z-menu bg-paper xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          {/*
            The redesign: a white sheet with a hairline header, oversized
            display-face links stacked with generous leading, and the CTAs in a
            pinned footer block rather than floating after the list. The sheet
            itself only fades — the links stagger in with a short travel, so the
            menu reads as one surface arriving rather than rows popping.
          */}
          <div className="flex h-full flex-col">
            <div className="flex h-20 shrink-0 items-center justify-between border-b border-line px-5 sm:px-8">
              <span className="flex items-center gap-3">
                <Image
                  src={profile.avatar}
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 shrink-0 rounded-control border border-line object-cover"
                />
                <span className="flex flex-col">
                  <span className="text-[15px] font-semibold leading-tight tracking-[-0.01em]">
                    {profile.name}
                  </span>
                  <span className="mt-0.5 text-xs font-medium text-muted">
                    {identity.role}
                  </span>
                </span>
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-control border border-line-strong transition-colors hover:border-accent hover:text-accent"
              >
                <X size={16} aria-hidden />
              </button>
            </div>

            <nav aria-label="Mobile" className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-8">
              <ul className="pt-3">
                {mainNavigation.map((item, index) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.06 * index + 0.05,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className="group flex min-h-[56px] items-center justify-between rounded-control px-3 py-3 transition-colors hover:bg-subtle"
                    >
                      {/* The two-digit ordinal that used to sit on the right of
                          this row is gone. It numbered the menu against the
                          reference site's numbered service cards, and it told a
                          reader nothing the list order did not. */}
                      <span
                        className={cn(
                          'font-display text-[1.6rem] font-semibold leading-tight tracking-[-0.02em] transition-colors group-hover:text-accent',
                          isActive(item.href) ? 'text-accent' : 'text-ink',
                        )}
                      >
                        {item.label}
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          'h-1.5 w-1.5 rotate-45 transition-colors',
                          isActive(item.href) ? 'bg-marigold' : 'bg-line group-hover:bg-marigold',
                        )}
                      />
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 border-t border-line pt-7"
              >
                {waHref ? (
                  <Button
                    href={waHref}
                    variant="whatsapp"
                    size="lg"
                    className="w-full"
                    ariaLabel={`Message me on WhatsApp at ${profile.whatsapp}`}
                  >
                    <WhatsAppIcon size={17} className="mr-2" aria-hidden />
                    Message me on WhatsApp
                  </Button>
                ) : null}
                <Button href="/contact" size="lg" showArrow className="mt-3 w-full">
                  Start a project
                </Button>
                <p className="mt-6 flex items-center gap-2.5 text-sm text-muted">
                  <span aria-hidden className="h-1.5 w-1.5 shrink-0 rotate-45 bg-marigold" />
                  {profile.availabilityText}
                </p>
              </motion.div>
            </nav>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
