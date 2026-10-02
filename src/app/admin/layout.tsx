import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Admin metadata, applied to everything under `/admin` — including the login
 * page, which sits outside the `(app)` group.
 *
 * This segment exists mainly for `robots`. Without it the admin panel inherits
 * the root layout's `index: true` and its site title, so `/admin/login` was
 * publishable to search engines and would share with the portfolio's OG card.
 *
 * It is a server component (no `'use client'`) because metadata can only be
 * exported from one. It renders no markup — the visual shell for signed-in
 * pages lives in `(app)/layout.tsx`, since the login page must not have it.
 */
export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
