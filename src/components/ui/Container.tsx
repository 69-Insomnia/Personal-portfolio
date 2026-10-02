import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-container px-5 sm:px-8 lg:px-12 xl:px-16', className)}>
      {children}
    </div>
  );
}
