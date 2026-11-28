import { PlaceholderBadge } from '@/components/common/PlaceholderBadge';
import { Button } from '@/components/ui/Button';
import type { ExperienceItem } from '@/types';

/**
 * One entry on the vertical experience timeline: period on the left (desktop),
 * a rail with a marker in the middle, and the role card on the right. On
 * phones the rail sits on the left edge and the period moves above the card.
 * `isFirst` gets the filled "current" marker; `isLast` stops the rail.
 */
export function TimelineItem({
  item,
  isFirst = false,
  isLast = false,
}: {
  item: ExperienceItem;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <li className="group relative grid grid-cols-[1.75rem_1fr] gap-x-4 md:grid-cols-[11rem_2.5rem_1fr] md:gap-x-6">
      <div className="hidden pt-7 text-right md:block">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink">
          {item.period}
        </span>
      </div>

      <div className="relative flex justify-center">
        {!isLast ? (
          <span aria-hidden className="absolute bottom-0 top-9 w-px bg-line" />
        ) : null}
        <span
          aria-hidden
          className={`relative mt-7 flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
            isFirst
              ? 'border-accent bg-accent'
              : 'border-line-strong bg-paper group-hover:border-accent'
          }`}
        >
          {isFirst ? <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-marigold" /> : null}
        </span>
      </div>

      <div className={isLast ? '' : 'pb-6'}>
        <article className="rounded-[1.25rem] border border-line bg-surface p-6 shadow-xs transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-line-strong group-hover:shadow-md md:p-8">
          <div className="flex flex-wrap items-center gap-2 md:hidden">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink">
              {item.period}
            </span>
          </div>
          {item.isPlaceholder ? <PlaceholderBadge className="mb-3" /> : null}

          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 md:mt-0">
            <h3 className="font-display text-h3">{item.role}</h3>
            <p className="text-sm font-semibold text-accent">{item.company}</p>
          </div>
          <p className="measure mt-4 leading-relaxed text-muted">{item.description}</p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {item.technologies.map((technology) => (
              <li key={technology} className="chip">
                {technology}
              </li>
            ))}
          </ul>

          {item.url ? (
            <Button href={item.url} variant="outline" size="sm" showArrow className="mt-6">
              Visit site
            </Button>
          ) : null}
        </article>
      </div>
    </li>
  );
}
