import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Space_Grotesk } from 'next/font/google';
import { MotionConfig } from 'framer-motion';
import { ConditionalChrome } from '@/components/layout/ConditionalChrome';
import { DEFAULT_OG_IMAGE, defaultSEO, identity, site } from '@/data/seo';
import { searchConsoleVerification } from '@/utils/metadata';
import { profile } from '@/data/profile';
import './globals.css';

/**
 * The site's only typeface.
 *
 * Space Grotesk is a grotesque derived from Space Mono, which is where it gets
 * the clipped `R`, the single-storey `g` and the wide geometric bowls that the
 * rest of the design leans on. That same geometry is why it takes MORE negative
 * tracking as the size climbs, not less — see `fontSize` in
 * tailwind.config.ts, where the display steps are tightened and the tracked
 * uppercase micro-type is opened up.
 *
 * It covers the whole scale now. It was previously paired with Inter on a
 * strict size split (grotesque at 30px and up, Inter below), because two
 * grotesques at the same size read as an accident rather than a choice. One
 * face removes that hazard entirely, along with the job of keeping two files'
 * worth of comments in step about which one owns which size.
 *
 * Weight range is 300–700, which comfortably covers every weight the components
 * use (400 / 500 / 600 / 700) with no synthetic bolding.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: defaultSEO.title,
  description: defaultSEO.description,
  keywords: defaultSEO.keywords,
  applicationName: profile.name,
  authors: [{ name: profile.name, url: site.url }],
  creator: profile.name,
  publisher: profile.name,
  category: 'technology',
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: site.url,
    siteName: profile.name,
    title: defaultSEO.title,
    description: defaultSEO.description,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${profile.name} — ${identity.role} in ${identity.location}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultSEO.title,
    description: defaultSEO.description,
    images: [{ url: DEFAULT_OG_IMAGE, alt: `${profile.name} — ${identity.role}` }],
  },
  /**
   * The site-wide directive. Pages override it through `buildMetadata`, and the
   * 404 overrides it to `noindex, nofollow`.
   *
   * `max-image-preview:large` is the one that matters beyond the obvious: the
   * default is a thumbnail, and without this every result gets a small, cropped
   * preview instead of the full 1200×630 card. `max-snippet: -1` lifts the
   * length cap on the descriptive snippet, which is what lets a well-written
   * first paragraph be the thing that gets shown.
   */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: searchConsoleVerification,
  // Icons come from the file convention: `src/app/icon.png` and
  // `src/app/apple-icon.png` are picked up automatically and emits a
  // content-hashed URL, so there is no `icons` entry to keep in sync here.
};

export const viewport: Viewport = {
  // Must be literal — this is read before any CSS exists. Mirrors
  // --color-paper; the site is light-only (no theme toggle), so one entry.
  themeColor: '#ffffff',
};

/**
 * The document shell, plus the public chrome for every route but `/admin`.
 *
 * This used to render the Navbar, Footer, skip link and JSON-LD
 * unconditionally, which is why the admin panel inherited all four. It now
 * delegates that to `ConditionalChrome`, which decides from the pathname.
 *
 * The `metadata` above is the site-wide default. Public pages override it via
 * `buildMetadata`, and `/admin` overrides it in `admin/layout.tsx`.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body>
        <MotionConfig reducedMotion="user">
          <ConditionalChrome>{children}</ConditionalChrome>
        </MotionConfig>
      </body>
    </html>
  );
}
