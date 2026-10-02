'use client';

import { PlaceholderBadge } from '@/components/common/PlaceholderBadge';
import type { ExperienceItem } from '@/types';

export function TimelineItem({ item }: { item: ExperienceItem }) {
  return (
    <li className="relative pb-12 last:pb-0 md:grid md:grid-cols-12 md:gap-8">
      <span
        aria-hidden
        className="absolute -left-[calc(2rem+4.5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-accent transition-transform duration-300 md:top-1"
      />
      <div className="md:col-span-3">
        <span className="text-label font-semibold uppercase text-muted">{item.period}</span>
        {item.isPlaceholder ? <PlaceholderBadge className="mt-3" /> : null}
      </div>
      <div className="mt-4 md:col-span-8 md:col-start-5 md:mt-0">
        <h3 className="text-xl font-medium tracking-tight md:text-2xl">{item.role}</h3>
        <p className="mt-1.5 text-sm font-medium text-accent">{item.company}</p>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">{item.description}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {item.technologies.map((technology) => (
            <li
              key={technology}
              className="border border-line px-2.5 py-1 text-label font-medium uppercase text-muted"
            >
              {technology}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
