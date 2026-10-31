import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-dashed border-line-strong bg-surface px-6 py-12 text-center md:py-16',
        className,
      )}
    >
      <p className="font-display text-h3">{title}</p>
      {description ? (
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
