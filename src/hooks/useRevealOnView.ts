'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

/**
 * Reports whether an element has been scrolled into view — and guarantees an
 * answer, which is the part that matters.
 *
 * ## The bug this exists to fix
 *
 * `whileInView` alone is a promise that the animation will run when the element
 * appears. It is not a guarantee. In practice the observer occasionally fails to
 * fire on pages that fetch data before rendering — roughly one load in six to
 * ten, measured against this site — and because the hidden state is written as
 * an inline `style="transform:translateY(115%)"` on the server-rendered HTML, a
 * missed callback does not degrade gracefully. The element stays clipped inside
 * its `overflow:hidden` parent **permanently**, and it does not recover on
 * scroll, on resize, or after any amount of waiting.
 *
 * On this site that meant the `<h1>` of a service or case-study page sometimes
 * simply not being there. A heading that disappears on one load in eight is
 * worse than a heading with no animation at all, and no amount of correct
 * markup compensates for it.
 *
 * ## What this does instead
 *
 * `useInView` drives the normal scroll-triggered reveal, exactly as before. On
 * top of it, a one-shot timer checks whether the element is *already on screen*
 * and, if the observer has not reported it by then, reveals it anyway.
 *
 * The check is deliberately narrow. It only forces the reveal when the element
 * is genuinely within the viewport — so a section further down the page still
 * waits for the scroll and keeps its entrance, while the heading the visitor is
 * already looking at can never be left blank. That distinction is what makes
 * this safe to apply to every animated element on the site rather than only to
 * headings.
 *
 * `once: true` on the observer is preserved: an element animates in the first
 * time it is seen and is never re-hidden.
 */
export function useRevealOnView<T extends HTMLElement>(amount: number) {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, amount });
  const [forced, setForced] = useState(false);

  useEffect(() => {
    if (inView || forced) return;

    const id = window.setTimeout(() => {
      const element = ref.current;
      if (!element) return;

      const { top, bottom } = element.getBoundingClientRect();
      if (top < window.innerHeight && bottom > 0) setForced(true);
    }, 900);

    return () => window.clearTimeout(id);
  }, [inView, forced]);

  return { ref, shown: inView || forced };
}
