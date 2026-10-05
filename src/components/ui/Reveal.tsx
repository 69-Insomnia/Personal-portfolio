'use client';

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { useRevealOnView } from '@/hooks/useRevealOnView';
import { fadeUp } from '@/utils/variants';
import { cn } from '@/utils/cn';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variants?: Variants;
}

/**
 * The site's standard entrance animation.
 *
 * Driven by `useRevealOnView` rather than `whileInView` directly — see that
 * hook for the missed-callback bug it guards against. The one behavioural
 * difference is that the old `viewport.margin` of `-50px` (which delayed the
 * trigger until the element was 50px past the fold) is gone. It was there to
 * stop things animating in at the very edge of the screen, and the watchdog in
 * the hook cannot honour it, so keeping it would have meant two different
 * definitions of "in view" between the observer and the fallback.
 */
export function Reveal({ children, className, delay = 0, variants = fadeUp }: RevealProps) {
  const { ref, shown } = useRevealOnView<HTMLDivElement>(0.15);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={shown ? 'show' : 'hidden'}
      custom={delay}
      variants={variants}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
