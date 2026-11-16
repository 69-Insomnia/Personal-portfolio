import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

/**
 * The vertical rhythm between page bands: 96px on a phone, 128px at tablet,
 * 160px at desktop. The previous design ran 80/96/120; the extra breathing
 * room at each step is most of what makes a long page read as "composed"
 * rather than "stacked" — sections that were touching now have air around
 * their mastheads.
 */
export function Section({ id, children, className, padded = true }: SectionProps) {
  return (
    <section
      id={id}
      className={cn('relative', padded && 'py-24 md:py-32 lg:py-40', className)}
    >
      {children}
    </section>
  );
}
