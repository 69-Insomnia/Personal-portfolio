import type { Metadata } from 'next';
import type { SEOData } from '@/types';
import { site } from '@/data/seo';

export function buildMetadata(seo: SEOData): Metadata {
  const { title, description, keywords, canonical, ogImage, ogType, robots } = seo;
  const image = ogImage ?? '/og-image.png';

  return {
    title,
    description,
    keywords,
    // Undefined inherits the layout default. Set only where a page needs to
    // opt out of being indexed — see `not-found.tsx`.
    robots,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      url: canonical ?? undefined,
      siteName: site.name,
      locale: site.locale,
      type: ogType ?? 'website',
      // `alt` matters more than it looks. It is what a screen reader announces
      // in place of the preview card, and what a text-only consumer shows
      // instead of the image. Falling back to the title is honest here: the
      // card is a typographic treatment of that same title.
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: image, alt: title }],
    },
  };
}
