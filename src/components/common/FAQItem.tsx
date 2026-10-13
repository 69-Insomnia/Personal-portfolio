'use client';

import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

export function FAQItem({ question, answer, index, isOpen, onToggle }: FAQItemProps) {
  const number = String(index + 1).padStart(2, '0');
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <li className="border-b border-line">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="group flex w-full items-start justify-between gap-6 py-6 text-left transition-colors duration-300 md:py-7"
        >
          <span className="flex items-start gap-4 md:gap-6">
            <span className="mt-1.5 text-label font-semibold text-accent">{number}</span>
            <span className="text-lg font-medium tracking-tight transition-colors duration-300 group-hover:text-accent md:text-xl">
              {question}
            </span>
          </span>
          <span
            aria-hidden
            className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
              isOpen ? 'border-accent bg-accent text-on-accent' : 'border-line text-ink group-hover:border-ink'
            }`}
          >
            {isOpen ? <Minus size={14} /> : <Plus size={14} />}
          </span>
        </button>
      </h3>

      {/*
        The answer is **always rendered**, and animated between a closed height
        and its natural one rather than mounted and unmounted.

        This used to be an `<AnimatePresence>` branch that returned `null` when
        closed, which meant a collapsed answer was not merely hidden — it was
        absent from the HTML entirely. Six of the seven answers were therefore
        invisible to any crawler that does not execute JavaScript, which is all
        of the ones this block exists for: GPTBot, PerplexityBot, ClaudeBot and
        Google-Extended. The questions were readable and the answers were not,
        which is precisely the wrong half.

        Animating `height` between `0` and `auto` keeps the movement and the
        same easing, so the section looks and behaves as it did.

        `aria-hidden` while closed, to match what a native `<details>` does:
        the content stays in the DOM for machines, and out of the accessibility
        tree for people, who hear the expanded state from the button instead.
      */}
      <motion.div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!isOpen}
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="overflow-hidden"
      >
        <p className="max-w-3xl pb-7 pl-0 text-muted md:pl-12">{answer}</p>
      </motion.div>
    </li>
  );
}
