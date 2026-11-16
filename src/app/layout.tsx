import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Inter, Sora } from 'next/font/google';
import { MotionConfig } from 'framer-motion';
import { ConditionalChrome } from '@/components/layout/ConditionalChrome';
import { resolveAnalytics } from '@/data/analytics';
import { DEFAULT_OG_IMAGE, defaultSEO, identity, site } from '@/data/seo';
import { getServices, getSiteSettings } from '@/lib/content';
import {
  clampDescription,
  clampTitle,
  normalizeMetadataImage,
  searchConsoleVerification,
} from '@/utils/metadata';
import { profile } from '@/data/profile';
import './globals.css';

/**
 * The site's two typefaces, on a strict split.
 *
 * ## Sora — headings
 *
 * A geometric sans with tall ascenders and tight apertures, used at 600/700.
 * It carries the "technology brand" half of the redesign: the even, engineered
 * strokes read as precise and product-grade, which suits a practice selling
 * measurement rather than vibes.
 *
 * Loaded at two weights — 600 for headings, 700 for display numerals and the
 * hero's landing line — because the display steps in `tailwind.config.ts`
 * lean on the heavier weight to hold their own at 4rem.
 *
 * ## Inter — everything else
 *
 * Body, UI, labels. The reference face for interface text: a large x-height,
 * unambiguous figures, and a neutral rhythm that keeps 17px comfortable at
 * the 68ch measure.
 *
 * Three weights, and no more: 400 body, 500 emphasis and nav, 600 for the
 * small supporting labels. Each extra weight is a separate font file on the
 * critical path, and this design has no use for a 700 in the body face.
 *
 * ## Why the split matters
 *
 * Two faces at the same size read as an accident; a geometric display over a
 * neutral body reads as a decision. `font-display` and `font-sans` in the
 * Tailwind theme are the only two ways to ask for either, and the base layer
 * in globals.css already points every h1–h4 at the display face.
 *
 * Both use `display: 'swap'`, so text is legible in the fallback immediately
 * rather than invisible until the webfont lands.
 */
const sora = Sora({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

/**
 * The site-wide metadata, now read from `site_settings` with the repo values
 * as the fallback for every field.
 *
 * This became a `generateMetadata` function rather than a `const` because the
 * admin owns these four values — default title, default description, default
 * OG image, verification tokens — and a `const` is evaluated once at build
 * time, which would make the panel's fields decorative until the next deploy.
 *
 * The two env vars it still reads (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and
 * its Bing equivalent) remain supported rather than being replaced: they are
 * build-time inlined, so an existing deploy that sets one keeps working, and
 * the database value takes precedence when it exists.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const title = clampTitle(
    `${settings.defaultMetaTitle ?? defaultSEO.title}${settings.titleSuffix ?? ''}`,
  );
  const description = clampDescription(
    settings.defaultMetaDescription ?? defaultSEO.description,
  );
  const ogImage = normalizeMetadataImage(
    settings.defaultOgImage ?? DEFAULT_OG_IMAGE,
  );

  return {
    metadataBase: new URL(site.url),
    title,
    description,
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
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${profile.name} — ${identity.role} in ${identity.location}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: ogImage, alt: `${profile.name} — ${identity.role}` }],
    },
    /**
     * The site-wide directive. Pages override it through `buildMetadata`, and
     * the 404 overrides it to `noindex, nofollow`.
     *
     * `max-image-preview:large` is the one that matters beyond the obvious: the
     * default is a thumbnail, and without this every result gets a small,
     * cropped preview instead of the full 1200×630 card. `max-snippet: -1` lifts
     * the length cap on the descriptive snippet, which is what lets a
     * well-written first paragraph be the thing that gets shown.
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
    verification: settings.googleSiteVerification || settings.bingSiteVerification
      ? {
          google: settings.googleSiteVerification ?? searchConsoleVerification?.google,
          other: settings.bingSiteVerification
            ? { 'msvalidate.01': settings.bingSiteVerification }
            : searchConsoleVerification?.other,
        }
      : searchConsoleVerification,
    // Icons come from the file convention: `src/app/icon.png` and
    // `src/app/apple-icon.png` are picked up automatically and emits a
    // content-hashed URL, so there is no `icons` entry to keep in sync here.
  };
}

export const viewport: Viewport = {
  // Must be literal — this is read before any CSS exists. Mirrors --color-paper
  // (#FFFFFF); the site is light-only (no theme toggle), so one entry.
  themeColor: '#FFFFFF',
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
export default async function RootLayout({ children }: { children: ReactNode }) {
  /**
   * Everything the chrome needs, read once here.
   *
   * This is the outermost — and only — server component above the client
   * boundary, so it is the only place in the tree that can await a database
   * read. `SiteChrome`, `SiteJsonLd` and `Analytics` all sit below
   * `ConditionalChrome`, which is a client component, so each of them receives
   * its values as a prop rather than looking them up. That constraint is the
   * reason this function reads five separate things.
   *
   * Each value is passed in the form its consumer expects, and none of them is
   * defaulted here:
   *
   *  - `socialLinks` is flattened from `{}` to an ordered array because
   *    `sameAs` wants URLs and the object's keys are only meaningful in the
   *    admin form.
   *  - `analytics` is resolved against the repo defaults by
   *    `resolveAnalytics`, which is where the GA4 fallback lives.
   *  - `person` carries the admin's job title and knows-about list; `personNode`
   *    falls back to the repo constants for either one.
   *  - `services` is the footer's Services column — the same `getServices()`
   *    read `/services` renders its cards from, narrowed to `slug` and
   *    `title`. Same source, so the column cannot link services the page
   *    does not list.
   *
   * Defaulting in this component as well would mean two places deciding what
   * an unset field means, which is exactly how they drift apart.
   */
  const settings = await getSiteSettings();
  const socialLinks = Object.entries(settings.socialLinks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, href]) => href);

  const analytics = resolveAnalytics(settings);

  const person = {
    jobTitle: settings.personJobTitle,
    knowsAbout: settings.personKnowsAbout,
  };

  const services = (await getServices()).map(({ slug, title }) => ({ slug, title }));

  /**
   * `data-scroll-behavior="smooth"` pairs with the `scroll-behavior: smooth`
   * on `html` in `globals.css`.
   *
   * Without it, Next warns on every route transition and — the actual problem,
   * which the warning is the symptom of — cannot suppress the smooth scroll
   * during navigation. The result is that clicking a nav link animates a long
   * scroll to the top of the new page instead of jumping to it, and browser
   * back/forward does the same, which is disorienting on a long page.
   *
   * The attribute does not turn smooth scrolling off. It tells the router it
   * may disable it *for the duration of a transition*, so in-page anchors — the
   * skip link, the section ids the nav scrolls to — keep the behaviour
   * `globals.css` asks for. That file still disables it entirely under
   * `prefers-reduced-motion`.
   */
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        {/* Hoisted into <head> by React 19. `/llms.txt` has always been
            served, but nothing pointed at it: the file only helps if a
            crawler thinks to ask. Google states llms.txt neither helps nor
            hurts its rankings — this exists for the AI crawlers that do
            read it, alongside the robots.txt allowances. */}
        <link rel="alternate" type="text/plain" title="llms.txt" href={`${site.url}/llms.txt`} />
        <MotionConfig reducedMotion="user">
          <ConditionalChrome
            socialLinks={socialLinks}
            analytics={analytics}
            person={person}
            customJsonLd={settings.customJsonLd}
            services={services}
          >
            {children}
          </ConditionalChrome>
        </MotionConfig>
      </body>
    </html>
  );
}
