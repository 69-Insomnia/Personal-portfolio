'use client';

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp } from '@/utils/variants';
import { cn } from '@/utils/cn';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variants?: Variants;
}

export function Reveal({ children, className, delay = 0, variants = fadeUp }: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -50px 0px' }}
      custom={delay}
      variants={variants}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
