import type { Metadata } from 'next';
import type { SEOData } from '@/types';
import { site } from '@/data/seo';

export function buildMetadata(seo: SEOData): Metadata {
  const { title, description, keywords, canonical, ogImage, ogType } = seo;
  const image = ogImage ?? '/og-image.png';

  return {
    title,
    description,
    keywords,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      url: canonical ?? undefined,
      siteName: site.name,
      locale: site.locale,
      type: ogType ?? 'website',
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
