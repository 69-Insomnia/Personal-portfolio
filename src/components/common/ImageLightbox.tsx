'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';

interface ImageLightboxProps {
  src: string;
  alt: string;
  /** Forwarded to the inline `<Image>`; the overlay renders its own sizes. */
  sizes: string;
}

/**
 * Article hero, with a tap-to-enlarge overlay.
 *
 * The illustrations on these posts are dense — several panels, labels and
 * captions — and the article hero is about 290px wide on a phone, which puts
 * their body text somewhere around 7px. Without this they are decorative on
 * mobile and nothing more.
 *
 * Accessibility notes, since a modal is easy to get wrong:
 *  - The trigger is a real `<button>`, so it is reachable and operable by
 *    keyboard and announces as an action rather than as a bare image.
 *  - Opening moves focus to the close button; closing returns it to the
 *    trigger, so focus is never dropped at the top of the document.
 *  - Escape closes. Tab is trapped on the close button, because the page
 *    behind is still focusable and would otherwise swallow the next tab.
 *  - Background scroll is locked while open.
 *  - Motion is skipped entirely under `prefers-reduced-motion`.
 */
export function ImageLightbox({ src, alt, sizes }: ImageLightboxProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  const close = useCallback(() => {
    setOpen(false);
    // Return focus to what opened it, not to the document root.
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      // Only one focusable control in here, so hold Tab on it.
      if (event.key === 'Tab') {
        event.preventDefault();
        closeRef.current?.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  return (
    <>
      <div className="relative aspect-[16/9] overflow-hidden border border-line bg-surface">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes={sizes}
          className="object-contain"
        />

        {/* Covers the frame rather than sitting beside it: on a phone the whole
            image is the tap target. The badge is the affordance — without a
            visible cue nobody discovers the zoom. */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Enlarge image"
          className="group absolute inset-0 h-full w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus"
        >
          <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 border border-line bg-paper-blur px-2.5 py-1.5 text-micro font-semibold uppercase text-muted backdrop-blur-sm transition-colors duration-300 group-hover:text-accent">
            <Maximize2 size={12} aria-hidden />
            Enlarge
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-label="Enlarged image"
            className="fixed inset-0 z-modal flex flex-col bg-scrim p-4 backdrop-blur-sm md:p-8"
            onClick={close}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close enlarged image"
              className="ml-auto inline-flex h-11 w-11 shrink-0 items-center justify-center border border-inverse-line text-inverse-ink transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <X size={20} aria-hidden />
            </button>

            {/* The scrim closes on click; the figure stops that from firing
                when the artwork itself is clicked. */}
            <figure
              className="relative m-auto min-h-0 w-full max-w-6xl flex-1"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 1200px) 100vw, 1152px"
                className="object-contain"
              />
            </figure>

            {/* Hidden on phones: the article title already sits directly above
                the image, so this is repetition competing for the little
                vertical space there is. The image keeps its alt either way. */}
            <p className="mx-auto mt-3 hidden max-w-3xl text-center text-xs leading-relaxed text-inverse-muted md:block">
              {alt}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
