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

/**
 * One row of the FAQ accordion.
 *
 * ## What changed
 *
 * The two-digit index that used to sit beside each question is gone — see the
 * note in `src/components/ui/SectionLabel` for why the design dropped numbered
 * labels wholesale.
 *
 * The question is set in the display face at `text-h3`, so an accordion reads
 * as a table of contents rather than a list of paragraphs, and the toggle is a
 * 44px target because it is the most-tapped control on the page on a phone.
 *
 * ## What deliberately did NOT change
 *
 * The answer is **always rendered**, and animated between a closed height and
 * its natural one rather than mounted and unmounted.
 *
 * This was once an `<AnimatePresence>` branch that returned `null` when closed,
 * which meant a collapsed answer was not merely hidden — it was absent from the
 * HTML entirely. Six of the seven answers were therefore invisible to any
 * crawler that does not execute JavaScript, which is all of the ones this block
 * exists for: GPTBot, PerplexityBot, ClaudeBot and Google-Extended. The
 * questions were readable and the answers were not, which is precisely the
 * wrong half.
 *
 * `aria-hidden` while closed, to match what a native `<details>` does: the
 * content stays in the DOM for machines, and out of the accessibility tree for
 * people, who hear the expanded state from the button instead.
 */
export function FAQItem({ question, answer, index, isOpen, onToggle }: FAQItemProps) {
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
          className="group flex min-h-[44px] w-full items-start justify-between gap-6 py-6 text-left md:py-7"
        >
          <span className="font-display text-h3 text-ink transition-colors duration-200 group-hover:text-accent">
            {question}
          </span>

          <span
            aria-hidden
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
              isOpen
                ? 'border-accent bg-accent text-on-accent'
                : 'border-line-strong text-ink group-hover:border-accent group-hover:text-accent'
            }`}
          >
            {isOpen ? <Minus size={14} /> : <Plus size={14} />}
          </span>
        </button>
      </h3>

      <motion.div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!isOpen}
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="overflow-hidden"
      >
        <p className="measure pb-7 text-muted">{answer}</p>
      </motion.div>
    </li>
  );
}
