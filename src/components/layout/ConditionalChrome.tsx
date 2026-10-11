'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SiteChrome } from '@/components/layout/SiteChrome';
import type { AnalyticsConfig } from '@/types';
import type { PersonOverrides } from '@/lib/structured-data';

/**
 * Applies the public site chrome to everything except `/admin`.
 *
 * The tidier way to do this is a route group — move the public pages into
 * `(site)/`, give that group its own layout, and let the router decide. That
 * needs the pages physically moved, which was not possible when this was
 * written (the sandbox refused file-moving commands), and leaving the site
 * without a Navbar in the meantime was not acceptable. This gets the same
 * result with no moves.
 *
 * `usePathname` resolves during server rendering too, so the public markup
 * still ships with its Navbar in the initial HTML — this is not a
 * render-then-correct flicker.
 *
 * If the pages are ever moved into `(site)/`, delete this and let
 * `(site)/layout.tsx` own the chrome instead. Do not do both: the two would
 * stack and the site would render two Navbars.
 *
 * ## Why the admin values are passed straight through
 *
 * This component is the client boundary — everything below it is in the client
 * tree and cannot await a database read. The root layout reads `site_settings`
 * once and hands the values here, and this forwards them unchanged. It makes
 * no decisions about them, which is deliberate: defaulting and merging belong
 * in one place each (`resolveAnalytics`, `personNode`), not in a layout
 * component that happens to be in the way.
 */
export function ConditionalChrome({
  children,
  socialLinks,
  analytics,
  person,
  customJsonLd,
}: {
  children: ReactNode;
  /** Read from `site_settings` by the root layout. */
  socialLinks?: string[];
  /** Resolved measurement IDs — see `resolveAnalytics`. */
  analytics?: AnalyticsConfig;
  /** Admin overrides for the Person node. */
  person?: Omit<PersonOverrides, 'socials'>;
  /** Site-wide custom JSON-LD. Plain JSON, so it crosses the boundary safely. */
  customJsonLd?: unknown;
}) {
  const pathname = usePathname();

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return <>{children}</>;
  }

  return (
    <SiteChrome
      socialLinks={socialLinks}
      analytics={analytics}
      person={person}
      customJsonLd={customJsonLd}
    >
      {children}
    </SiteChrome>
  );
}
