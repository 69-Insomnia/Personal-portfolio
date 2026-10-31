import { cn } from '@/utils/cn';

export function PlaceholderBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-ink px-2.5 py-1 text-micro font-medium text-paper',
        className,
      )}
    >
      Placeholder
    </span>
  );
}
