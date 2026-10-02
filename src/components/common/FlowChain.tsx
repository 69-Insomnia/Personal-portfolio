'use client';

import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { listItem, staggerContainer } from '@/utils/variants';
import { cn } from '@/utils/cn';

interface FlowChainProps {
  steps: string[];
  className?: string;
}

export function FlowChain({ steps, className }: FlowChainProps) {
  return (
    <motion.ol
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={staggerContainer}
      className={cn('flex flex-col items-stretch gap-1.5 lg:flex-row lg:items-center lg:gap-0', className)}
    >
      {steps.map((step, index) => (
        <Fragment key={step}>
          <motion.li
            variants={listItem}
            className={cn(
              'flex flex-1 items-center justify-center gap-2.5 whitespace-nowrap rounded-full border px-4 py-2.5 text-center text-sm font-medium tracking-tight',
              'border-line bg-surface text-ink',
            )}
          >
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {step}
          </motion.li>
          {index < steps.length - 1 ? (
            <motion.li
              variants={listItem}
              aria-hidden
              className="flex shrink-0 items-center justify-center px-1 py-1 text-muted lg:px-1.5"
            >
              <ArrowDown size={14} className="lg:hidden" />
              <ArrowRight size={14} className="hidden lg:block" />
            </motion.li>
          ) : null}
        </Fragment>
      ))}
    </motion.ol>
  );
}
