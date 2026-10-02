import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type BadgeVariant = 'outline' | 'accent' | 'solid';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  outline: 'border border-line text-muted',
  accent: 'border border-accent bg-accent-soft text-accent',
  solid: 'bg-ink text-paper',
};

export function Badge({ children, variant = 'outline', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label font-medium uppercase',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
