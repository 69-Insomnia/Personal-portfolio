import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * A row that scrolls horizontally with snap points on small screens and becomes
 * a normal responsive grid from `md` up.
 *
 * On a phone, a long list of image-heavy cards stacks into thousands of pixels
 * of vertical scroll. Below `md` this keeps the cards side by side so the
 * section stays a manageable height and the whole set is still reachable by
 * swiping. The cards themselves contain links, so the row is keyboard-navigable
 * without an extra tab stop on the container.
 *
 * `no-scrollbar` comes from globals.css.
 */
const rowBase =
  'no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:overflow-visible md:pb-0';

/** Applied to each direct child of the row. */
export const scrollRowItemClassName =
  'w-[85vw] max-w-sm shrink-0 snap-start md:w-auto md:max-w-none';

const columnClasses = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
} as const;

export type ScrollRowColumns = keyof typeof columnClasses;

/**
 * Class-string form, for elements that need their own tag or their own motion
 * component (e.g. `motion.ul` with layout animations).
 */
export function scrollRow(columns: ScrollRowColumns = 3, className?: string): string {
  return cn(rowBase, columnClasses[columns], className);
}

interface ScrollRowProps {
  children: ReactNode;
  /** Column count from `md` up. */
  columns?: ScrollRowColumns;
  className?: string;
  'aria-label'?: string;
}

export function ScrollRow({ children, columns = 3, className, ...rest }: ScrollRowProps) {
  return (
    <div className={scrollRow(columns, className)} {...rest}>
      {children}
    </div>
  );
}
