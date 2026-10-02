import Link from 'next/link';
import { JsonLd } from '@/components/common/JsonLd';
import { breadcrumbNode } from '@/lib/structured-data';
import { cn } from '@/utils/cn';

interface BreadcrumbProps {
  /** Ordered trail, first item usually Home. The last is the current page. */
  items: Array<{ name: string; path: string }>;
  className?: string;
}

/**
 * Visible breadcrumb trail, with the matching BreadcrumbList schema.
 *
 * The schema was already being emitted by the detail routes but nothing on the
 * page showed the trail, so the markup described a navigation the visitor could
 * not see. Rendering both from one prop list keeps them from drifting.
 *
 * The last item is `aria-current="page"` and not a link — a breadcrumb that
 * links to the page you are already on is a dead control.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <>
      <JsonLd graph={[breadcrumbNode(items)]} />
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-label font-medium uppercase text-muted">
          {items.map((item, index) => {
            const isCurrent = index === items.length - 1;

            return (
              <li key={item.path} className="flex items-center gap-2.5">
                {index > 0 ? (
                  <span aria-hidden className="text-line-strong">
                    /
                  </span>
                ) : null}
                {isCurrent ? (
                  <span aria-current="page">{item.name}</span>
                ) : (
                  <Link
                    href={item.path}
                    className="transition-colors duration-300 hover:text-accent"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
