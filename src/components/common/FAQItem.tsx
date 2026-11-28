'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

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
    <li
      className={`overflow-hidden rounded-[1.25rem] border bg-surface transition-all duration-300 ${
        isOpen ? 'border-accent shadow-md' : 'border-line shadow-xs hover:border-line-strong'
      }`}
    >
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="group flex min-h-[44px] w-full items-start justify-between gap-6 px-5 py-5 text-left md:px-7 md:py-6"
        >
          <span className="font-display text-[1.125rem] font-semibold leading-snug tracking-[-0.01em] text-ink transition-colors duration-200 group-hover:text-accent md:text-[1.25rem]">
            {question}
          </span>

          <span
            aria-hidden
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
              isOpen
                ? 'rotate-45 border-ink bg-ink text-paper'
                : 'border-line-strong text-ink group-hover:border-accent group-hover:text-accent'
            }`}
          >
            <Plus size={15} />
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
        <p className="measure px-5 pb-6 leading-relaxed text-muted md:px-7 md:pb-7">{answer}</p>
      </motion.div>
    </li>
  );
}
