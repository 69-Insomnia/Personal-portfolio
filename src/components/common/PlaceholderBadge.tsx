import { cn } from '@/utils/cn';

export function PlaceholderBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center bg-ink px-2 py-1 text-micro font-semibold uppercase text-paper',
        className,
      )}
    >
      Placeholder
    </span>
  );
}
