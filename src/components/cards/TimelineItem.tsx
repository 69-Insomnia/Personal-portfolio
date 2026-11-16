'use client';

import { PlaceholderBadge } from '@/components/common/PlaceholderBadge';
import { Button } from '@/components/ui/Button';
import type { ExperienceItem } from '@/types';

/**
 * One role as a record card.
 *
 * ## The layout changed shape (redesign pass)
 *
 * It used to be a row of a vertical timeline: a continuous left border, a
 * round dot punched through it, the period in a narrow rail, the content in
 * the wide column. That composition leaned on chrome — the rule and the dot —
 * to say "these are ordered", and the dot was the last circle in the design.
 *
 * Now each role is a single bordered record: a fixed-width period rail on the
 * left, separated from the content by an internal hairline, so the card reads
 * as a filed document rather than a point on a line. Order is carried by the
 * DOM (the list is newest-first by construction) and by the rail's consistent
 * position, not by a drawn line.
 *
 * The marker is `bg-accent`, the primary blue — a repeated marker does
 * structural work here, so it is the interactive blue and not coral. Coral is
 * reserved for the hero's offset shape and the section rules.
 */
export function TimelineItem({ item }: { item: ExperienceItem }) {
  return (
    <li className="card group overflow-hidden transition-all duration-200 ease-out hover:border-line-strong hover:shadow-md">
      <div className="grid md:grid-cols-[13rem_1fr]">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 border-b border-line bg-subtle px-6 py-5 md:flex-col md:items-start md:gap-2 md:border-b-0 md:border-r md:py-7">
          <span className="flex items-center gap-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rotate-45 bg-marigold" />
            {item.period}
          </span>
          {item.isPlaceholder ? <PlaceholderBadge className="mt-1" /> : null}
        </div>

        <div className="px-6 py-6 md:px-8 md:py-7">
          <h3 className="font-display text-h3">{item.role}</h3>
          <p className="mt-1.5 text-sm font-medium text-accent">{item.company}</p>
          <p className="measure mt-4 leading-relaxed text-muted">{item.description}</p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {item.technologies.map((technology) => (
              <li key={technology} className="chip">
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
      </div>
    </li>
  );
}
