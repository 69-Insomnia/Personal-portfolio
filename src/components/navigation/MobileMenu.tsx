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
import { profile } from '@/data/profile';

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
          className="fixed inset-0 z-menu bg-paper lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <div className="flex h-full flex-col">
            <div className="flex h-20 shrink-0 items-center justify-between px-5 sm:px-8">
              <span className="flex items-center gap-2.5">
                <Image
                  src={profile.avatar}
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 shrink-0 rounded-full border border-line object-cover"
                />
                <span className="flex flex-col">
                  <span className="text-[15px] font-semibold leading-tight tracking-tight">
                    {profile.name}
                  </span>
                  <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                    {profile.title}
                  </span>
                </span>
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line transition-colors hover:border-ink"
              >
                <X size={16} aria-hidden />
              </button>
            </div>

            <nav aria-label="Mobile" className="min-h-0 flex-1 overflow-y-auto px-5 pb-10 sm:px-8">
              <ul className="border-t border-line">
                {mainNavigation.map((item, index) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.06 * index + 0.05,
                      duration: 0.45,
                      ease: 'easeOut',
                    }}
                    className="border-b border-line"
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="group flex items-center justify-between py-5"
                    >
                      <span className="text-2xl font-medium tracking-tight transition-colors group-hover:text-accent">
                        {item.label}
                      </span>
                      <span className="text-label font-semibold text-muted transition-colors group-hover:text-accent">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.45, ease: 'easeOut' }}
                className="mt-8"
              >
                <Button href="/contact" size="lg" showArrow className="w-full">
                  Let&apos;s Work Together
                </Button>
                {profile.whatsapp ? (
                  <Button
                    href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
                    variant="whatsapp"
                    size="lg"
                    className="mt-3 w-full"
                    ariaLabel={`Chat on WhatsApp at ${profile.whatsapp}`}
                  >
                    <WhatsAppIcon size={17} className="mr-2" />
                    Chat on WhatsApp
                  </Button>
                ) : null}
                <p className="mt-6 text-sm text-muted">{profile.availabilityText}</p>
              </motion.div>
            </nav>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
