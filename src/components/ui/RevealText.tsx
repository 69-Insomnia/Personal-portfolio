'use client';

import { motion } from 'framer-motion';
import { useRevealOnView } from '@/hooks/useRevealOnView';
import { cn } from '@/utils/cn';
import { wordReveal } from '@/utils/variants';

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
};

interface RevealTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  /** Paint the final word in the accent colour — the landing word of a headline. */
  accentLast?: boolean;
}

/**
 * A heading that reveals word by word as it scrolls into view.
 *
 * The words sit in `motion.span`s inside `overflow:hidden` wrappers, which is
 * what makes each one appear to rise out of the line above rather than fade.
 * That also makes the hidden state a *layout* state rather than an opacity: a
 * word that never receives its `show` is clipped out of the line box, so it is
 * not merely faint, it is absent.
 *
 * Which is why this uses `useRevealOnView` rather than `whileInView` directly.
 * `PageHeader` renders the `<h1>` of every detail page through this component,
 * and an observer callback that failed to fire meant the primary heading of a
 * service or case-study page was sometimes not on the page at all — invisible
 * to sighted visitors, and not recoverable by scrolling or waiting. See the hook
 * for the measurement and the guard.
 */
export function RevealText({ text, className, as = 'h2', accentLast = false }: RevealTextProps) {
  const MotionTag = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p }[as];
  const words = text.split(' ');
  const { ref, shown } = useRevealOnView<HTMLHeadingElement>(0.35);

  return (
    <MotionTag
      ref={ref}
      initial="hidden"
      animate={shown ? 'show' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <motion.span
            variants={wordReveal}
            className={cn('inline-block', accentLast && index === words.length - 1 && 'text-accent')}
          >
            {word}
            {index < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
