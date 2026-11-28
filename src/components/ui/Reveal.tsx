'use client';

import { createElement, useEffect, useRef } from 'react';
import type { CSSProperties, ElementType, ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * Fade-up on scroll, implemented with one shared native IntersectionObserver
 * and a CSS animation (see `.reveal` in globals.css) instead of a Framer Motion
 * component, a per-instance observer and a fallback timer.
 *
 * Why it changed: the page renders this ~50 times, and each instance paid for
 * a motion component, its own observer and a timer during hydration — real
 * main-thread cost on phones. One observer for all of them is much cheaper and
 * the visual result is the same (18px rise + fade, 0.55s, same easing).
 *
 * Crawlers: the hidden state only applies when scripting is enabled
 * (`@media (scripting: enabled)`), so a client that does not run JavaScript
 * receives the content fully visible instead of `opacity: 0`.
 */
let sharedObserver: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.shown = 'true';
          sharedObserver?.unobserve(entry.target);
        }
      },
      // Threshold 0 + a small bottom margin: reliable for elements taller than
      // the viewport, which a fractional threshold can never satisfy.
      { threshold: 0, rootMargin: '0px 0px -6% 0px' },
    );
  }
  return sharedObserver;
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
}

export function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.dataset.shown = 'true';
      return;
    }
    const observer = getObserver();
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  return createElement(
    as,
    {
      ref,
      className: cn('reveal', className),
      style: delay ? ({ '--reveal-delay': `${delay}s` } as CSSProperties) : undefined,
    },
    children,
  );
}
