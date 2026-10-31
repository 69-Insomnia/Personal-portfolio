import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type BadgeVariant = 'outline' | 'accent' | 'marigold' | 'solid';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

/**
 * Sentence case throughout.
 *
 * Every badge on the site was previously `uppercase` at 0.18em tracking, which
 * is the reference site's idiom (numbered service cards, slash-prefixed feature
 * lists) and reads as technical-chrome rather than the editorial voice this
 * design is after. The tracking that made uppercase legible makes lowercase
 * look broken, so it drops with the casing — see `fontSize.label` in
 * tailwind.config.ts.
 *
 * `marigold` exists for the one badge that should be noticed rather than read
 * passively — the hero's availability chip. It pairs the fill with
 * `marigold-ink` rather than the raw marigold, because the raw value is 2.0:1
 * on white and would fail as text.
 */
const variantClasses: Record<BadgeVariant, string> = {
  outline: 'border border-line text-muted',
  accent: 'border border-accent bg-accent-soft text-accent',
  marigold: 'border border-marigold bg-marigold-soft text-marigold-ink',
  solid: 'bg-ink text-paper',
};

export function Badge({ children, variant = 'outline', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
