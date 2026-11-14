'use client';

import { motion } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';
import { useRevealOnView } from '@/hooks/useRevealOnView';
import { fadeUp } from '@/utils/variants';
import { cn } from '@/utils/cn';

/** Tags this can render as. Anything needing different motion uses Reveal's classes directly. */
const motionTags = {
  div: motion.div,
  li: motion.li,
} as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /**
   * Rendered tag. Defaults to `div`.
   *
   * `li` exists because a `Reveal` that animates a row of a `<ul>`/`<ol>` has to
   * BE the `<li>` — wrapping one in a `<div>` puts a non-list child directly
   * inside a list, which is invalid and which some screen readers handle by
   * dropping the list semantics entirely. Where a list item needs the animation,
   * ask for `li` rather than nesting.
   */
  as?: ElementType;
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
export function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
}: RevealProps) {
  const { ref, shown } = useRevealOnView<HTMLDivElement>(0.15);

  /**
   * The cast is the one loose spot in this file, and it is deliberately narrow.
   *
   * `motion.li` and `motion.div` carry different ref types, so a tag chosen at
   * runtime produces a union that TypeScript will not accept a single ref
   * against. Widening to `typeof motion.div` lets both branches share the one
   * `useRevealOnView<HTMLDivElement>` ref.
   *
   * It is safe because the only thing that touches the ref is
   * `getBoundingClientRect()`, which is on every `HTMLElement`. The element that
   * actually renders is still whatever `as` asked for — the cast changes the
   * type, not the tag.
   */
  const Tag = (motionTags[as as keyof typeof motionTags] ??
    motion.div) as unknown as typeof motion.div;

  return (
    <Tag
      ref={ref}
      initial="hidden"
      animate={shown ? 'show' : 'hidden'}
      custom={delay}
      variants={fadeUp}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
