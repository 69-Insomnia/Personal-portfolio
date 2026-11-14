'use client';

import { PlaceholderBadge } from '@/components/common/PlaceholderBadge';
import { Button } from '@/components/ui/Button';
import type { ExperienceItem } from '@/types';

/**
 * One role on the vertical timeline.
 *
 * The dot is `bg-accent`, which is the primary green — the timeline is the one
 * place on the page where a repeated green marker does structural work, so it
 * is green and not marigold. Marigold is reserved for the hero's offset shape
 * and the section rules; using it here as well would spend the accent's
 * scarcity on a decorative dot.
 *
 * The marker sits at `-left-[calc(2rem+4.5px)]`, which places its centre on the
 * `<ol>`'s left border at the mobile padding. It carries a ring of the page
 * colour so it punches a hole in the rule rather than sitting on top of a
 * visible seam.
 */
export function TimelineItem({ item }: { item: ExperienceItem }) {
  return (
    <li className="relative pb-12 last:pb-0 md:grid md:grid-cols-12 md:gap-8">
      <span
        aria-hidden
        className="absolute -left-[calc(2rem+4.5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-paper md:top-1"
      />

      <div className="md:col-span-3">
        <span className="text-sm text-muted">{item.period}</span>
        {item.isPlaceholder ? <PlaceholderBadge className="mt-3" /> : null}
      </div>

      <div className="mt-3 md:col-span-8 md:col-start-5 md:mt-0">
        <h3 className="font-display text-h3">{item.role}</h3>
        <p className="mt-1.5 text-sm font-medium text-accent">{item.company}</p>
        <p className="measure mt-4 leading-relaxed text-muted">{item.description}</p>

        <ul className="mt-5 flex flex-wrap gap-2">
          {item.technologies.map((technology) => (
            <li
              key={technology}
              className="chip"
            >
              {technology}
            </li>
          ))}
        </ul>

        {item.url ? (
          <Button href={item.url} variant="outline" size="sm" showArrow className="mt-5">
            Visit site
          </Button>
        ) : null}
      </div>
    </li>
  );
}
