'use client';

import { motion } from 'framer-motion';
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

export function RevealText({ text, className, as = 'h2', accentLast = false }: RevealTextProps) {
  const MotionTag = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p }[as];
  const words = text.split(' ');

  return (
    <MotionTag
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
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
