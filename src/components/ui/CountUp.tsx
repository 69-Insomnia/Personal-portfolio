'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

/**
 * Counts a figure up from zero once it scrolls into view. Accepts the display
 * string as-is ("2+", "15,000+", "100%") and only animates the leading number,
 * so the final text is always exactly the value passed in. Server-renders the
 * final value, so crawlers and no-JS readers never see a zero.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const match = /^([^\d]*)([\d,]+)(.*)$/.exec(value);
  const target = match ? Number(match[2].replace(/,/g, '')) : NaN;
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || reduce || !match || !Number.isFinite(target) || target === 0) return;
    const [, prefix, digits, suffix] = match;
    const grouped = digits.includes(',');
    const controls = animate(0, target, {
      duration: Math.min(1.6, 0.6 + target / 4000),
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        const n = Math.round(latest);
        setDisplay(`${prefix}${grouped ? n.toLocaleString('en-US') : n}${suffix}`);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, target]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
