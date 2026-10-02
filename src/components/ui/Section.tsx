import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

export function Section({ id, children, className, padded = true }: SectionProps) {
  return (
    <section
      id={id}
      className={cn('relative', padded && 'py-20 md:py-28 lg:py-32', className)}
    >
      {children}
    </section>
  );
}
