import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

/**
 * The vertical rhythm between page bands: 80px on a phone, 96px at tablet,
 * 120px at desktop. That is the brief's 80–120px range read as three steps, and
 * the ramp matters more than the endpoints — a single 120px value at 360px wide
 * is a fifth of the viewport spent on nothing.
 */
export function Section({ id, children, className, padded = true }: SectionProps) {
  return (
    <section
      id={id}
      className={cn('relative', padded && 'py-20 md:py-24 lg:py-[7.5rem]', className)}
    >
      {children}
    </section>
  );
}
