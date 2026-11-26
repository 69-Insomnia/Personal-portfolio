import { cn } from '@/utils/cn';

interface RevealTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  /** Paint the final word in the accent colour — the landing word of a headline. */
  accentLast?: boolean;
}

/**
 * A heading that reveals word by word, as a pure CSS entrance rather than a
 * JS-driven, scroll-gated one.
 *
 * ## What this replaces
 *
 * The previous version held each word at `transform: translateY(115%)` in the
 * server-rendered HTML — a *layout* hidden state, not an opacity one — and
 * waited for an `IntersectionObserver` (via `useRevealOnView`) to flip it
 * visible once JS hydrated and the element scrolled into view. `PageHeader`
 * renders the `<h1>` of every non-home route through this component, which
 * made the page's single most important heading, carrying the exact target
 * query a visitor searched for, absent from the first paint on every service,
 * case-study, blog and pricing page until the bundle finished hydrating — the
 * same LCP hazard the homepage hero had (see `Hero/index.tsx`), site-wide
 * rather than on one page.
 *
 * `useRevealOnView`'s own comment documents a second failure mode this also
 * removes: the observer callback missing roughly one load in six to ten,
 * which left the heading permanently clipped with no scroll or wait able to
 * recover it. A 900ms forced-reveal timer patched that symptom; this removes
 * the cause; `useRevealOnView` and `useInView` are no longer imported here.
 *
 * ## What it does instead
 *
 * Each word gets a CSS `@keyframes` slide-up (`word-reveal-in`, defined in
 * `globals.css` next to the hero's `animate-hero-line`) with a staggered
 * `animation-delay`, so the text is in the raw HTML and visible immediately —
 * the stagger is cosmetic, not a visibility gate. `prefers-reduced-motion` is
 * respected globally by the same keyframe rule the hero's animation uses.
 */
export function RevealText({ text, className, as = 'h2', accentLast = false }: RevealTextProps) {
  const Tag = as;
  const words = text.split(' ');

  return (
    <Tag className={className}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <span
            className={cn(
              'inline-block animate-word-reveal',
              accentLast && index === words.length - 1 && 'text-accent',
            )}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {word}
            {index < words.length - 1 ? ' ' : ''}
          </span>
        </span>
      ))}
    </Tag>
  );
}
