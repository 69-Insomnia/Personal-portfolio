'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Icon } from '@/components/common/Icon';
import type { Service } from '@/types';

export function ServiceCard({ service }: { service: Service }) {
  /* Four, not six. At six the line ran long enough to wrap twice, and the
     overflow notice was appended to the end of it — so "+3 more" landed in the
     same visual voice as the capabilities and as the title above them, and the
     card lost its reading order. Four reads as a sample of the work; the count
     of what is left is stated underneath instead of being tailed onto the
     run-on. */
  const visibleCapabilities = service.capabilities.slice(0, 4);
  const hiddenCount = service.capabilities.length - visibleCapabilities.length;

  return (
    <Link
      href={`/services/${service.slug}`}
      className="card card-interactive group flex h-full flex-col p-6 md:p-8"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent transition-all duration-500 ease-out group-hover:bg-accent group-hover:text-on-accent group-hover:scale-105">
          <Icon name={service.icon} size={18} />
        </span>
        <span className="text-label font-semibold text-muted transition-colors duration-300 group-hover:text-accent">
          {service.index}
        </span>
      </div>

      <h3 className="mt-7 text-h3">{service.title}</h3>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
        {service.shortDescription}
      </p>

      <p className="mt-5 text-sm leading-relaxed text-muted">
        {visibleCapabilities.join(' · ')}
      </p>
      {hiddenCount > 0 ? (
        <p className="mt-1.5 text-xs text-faint">+{hiddenCount} more</p>
      ) : null}

      <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors duration-300 group-hover:text-accent">
        Explore service
        <ArrowRight
          size={15}
          aria-hidden
          className="transition-transform duration-300 ease-out group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}
