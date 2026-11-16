import type { Variants } from 'framer-motion';

/**
 * The shared entrance.
 *
 * `y: 26` at 0.7s was the previous design's value; the redesign tightens both.
 * A shorter travel (18px) reads as "settling" rather than "flying in", which
 * is what a premium/agency site's scroll animation should feel like — the
 * movement is noticed only if you look for it. The custom easing (a strong
 * ease-out) keeps the landing crisp instead of the limp tail `easeOut`
 * gives a translate.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

export const wordReveal: Variants = {
  hidden: { y: '115%' },
  show: {
    y: '0%',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};
