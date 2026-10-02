import type { ReactNode } from 'react';

/**
 * Intentionally inert.
 *
 * The chrome is currently applied by `ConditionalChrome` in the root layout,
 * because the public routes could not be moved into this group when the change
 * was made. This layout exists so the group is structurally correct, and it
 * deliberately renders nothing — if it rendered `SiteChrome` as well, moving
 * the public pages in here would give the site two Navbars.
 *
 * If the routing is ever done the way it should be, move the pages into this
 * group, put `<SiteChrome>{children}</SiteChrome>` here, and delete
 * `src/components/layout/ConditionalChrome.tsx`.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return children;
}
