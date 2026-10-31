'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/common/Icon';
import type { Service } from '@/types';

export function ServiceCard({ service }: { service: Service }) {
  /* Three, not four. At four the tags wrapped to a second row on the narrower
     columns and the cards in a row stopped lining up; three fits one line at
     every breakpoint the grid uses. The full capability list is on the service
     page, which is where someone comparing offerings will go anyway. */
  const visibleCapabilities = service.capabilities.slice(0, 3);

  return (
    <Card as="article" interactive className="group h-full">
      <Link
        href={`/services/${service.slug}`}
        className="flex h-full flex-col p-6 md:p-7"
      >
        {/*
          The two-digit index that used to sit opposite this icon is gone — the
          redesign drops numbered labels site-wide. See the note in
          `src/components/ui/SectionLabel`.
        */}
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-on-accent">
          <Icon name={service.icon} size={20} />
        </span>

        <h3 className="mt-6 font-display text-h3">{service.title}</h3>

        <p className="mt-3 flex-1 leading-relaxed text-muted">
          {service.shortDescription}
        </p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {visibleCapabilities.map((capability) => (
            <li
              key={capability}
              className="rounded-full border border-line px-3 py-1 text-label text-muted"
            >
              {capability}
            </li>
          ))}
        </ul>

        <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-accent">
          See what&apos;s included
          <ArrowRight
            size={15}
            aria-hidden
            className="transition-transform duration-200 ease-out group-hover:translate-x-1"
          />
        </span>
      </Link>
    </Card>
  );
}
