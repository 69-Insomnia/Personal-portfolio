'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SiteChrome } from '@/components/layout/SiteChrome';

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
 */
export function ConditionalChrome({
  children,
  socialLinks,
}: {
  children: ReactNode;
  /**
   * Read from `site_settings` by the root layout, which is the only component
   * here that can await a database read. This one is a client component, and
   * `SiteJsonLd` sits below it in the client tree.
   */
  socialLinks?: string[];
}) {
  const pathname = usePathname();

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return <>{children}</>;
  }

  return <SiteChrome socialLinks={socialLinks}>{children}</SiteChrome>;
}
