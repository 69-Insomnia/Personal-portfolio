import type { BlogPost, Project, SEOData, Service } from '@/types';
import { profile } from '@/data/profile';

/**
 * Production origin for canonical tags, Open Graph URLs, the sitemap, robots.txt
 * and every JSON-LD `@id`.
 *
 * This used to be a hardcoded `https://example.com`, which shipped a canonical
 * pointing at a domain we do not own on every page — the single most damaging
 * value you can put in a canonical tag, because it tells Google the real copy
 * of each page lives somewhere else.
 *
 * Set `NEXT_PUBLIC_SITE_URL` to the production origin (no trailing slash) in
 * Vercel and in `.env.local`. The localhost fallback keeps development
 * coherent, and production warns loudly rather than silently shipping a wrong
 * canonical again.
 */
function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');

  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '[seo] NEXT_PUBLIC_SITE_URL is not set. Canonical tags, sitemap.xml, ' +
        'robots.txt and structured data are being built against localhost. ' +
        'Set it to the production origin before this deploy goes live.',
    );
  }

  return 'http://localhost:3000';
}

export const site = {
  url: resolveSiteUrl(),
  name: profile.name,
  locale: 'en_US',
};

/**
 * Titles lead with the query, not the name. A portfolio for someone who is not
 * yet a known entity gains nothing from brand-first titles, and everything the
 * site is trying to rank for is a generic-plus-place query: web developer
 * Nepal, SEO specialist Kathmandu, ecommerce growth Nepal.
 */
export const defaultSEO: SEOData = {
  title: 'Web Developer & SEO Specialist in Nepal | Dipendra Guragain',
  description:
    'Dipendra Guragain builds websites and then gets them found. Web development, SEO and ecommerce growth for businesses in Kathmandu and across Nepal.',
  keywords: [
    'web developer Nepal',
    'SEO specialist Nepal',
    'SEO expert Kathmandu',
    'ecommerce growth Nepal',
    'digital marketing Nepal',
    'Next.js developer Nepal',
  ],
  canonical: site.url,
};

export const homeSEO: SEOData = {
  title: 'Web Developer & SEO Specialist in Nepal | Dipendra Guragain',
  description:
    'I build websites, get them found in search, and run the paid campaigns that bring people to them. Kathmandu-based, working with businesses across Nepal.',
  keywords: [
    'web developer Nepal',
    'SEO specialist Nepal',
    'SEO expert Kathmandu',
    'ecommerce growth Nepal',
    'digital marketing Kathmandu',
    'freelance web developer Nepal',
  ],
  canonical: `${site.url}/`,
};

export const aboutSEO: SEOData = {
  title: `About | Web Developer & SEO in Kathmandu, Nepal`,
  description:
    'Kathmandu-based web developer working across React, Next.js, search and paid media. Where I have worked, what I studied, and how I approach a project.',
  keywords: ['web developer Kathmandu', 'React developer Nepal', 'SEO consultant Nepal'],
  canonical: `${site.url}/about`,
};

export const workSEO: SEOData = {
  title: `Work | Web & Ecommerce Projects in Nepal | ${profile.name}`,
  description:
    'Websites, booking systems and ecommerce builds for businesses in Nepal, including DrillThru, Trip Zone, Star Global Vision and POM\'s Penthouse.',
  keywords: ['web design Nepal', 'ecommerce website Nepal', 'website portfolio Nepal'],
  canonical: `${site.url}/work`,
};

export const servicesSEO: SEOData = {
  title: 'Services | SEO, Web Development & Ecommerce Growth in Nepal',
  description:
    'Web development, SEO, paid ads, ecommerce growth and digital marketing. Seven services that usually get used together rather than one at a time.',
  keywords: [
    'SEO services Nepal',
    'web development services Nepal',
    'ecommerce growth Nepal',
    'Google Ads Nepal',
    'Meta Ads Nepal',
  ],
  canonical: `${site.url}/services`,
};

export const blogSEO: SEOData = {
  title: 'Insights | SEO, Ecommerce & Web Development | Dipendra Guragain',
  description:
    'Writing on technical SEO, ecommerce, web development and paid campaigns, mostly worked up from problems that showed up in real projects.',
  keywords: ['SEO blog Nepal', 'ecommerce tips', 'technical SEO'],
  canonical: `${site.url}/blog`,
};

export const contactSEO: SEOData = {
  title: `Contact | Web Developer & SEO in Nepal | ${profile.name}`,
  description:
    'Have a project in mind? Send a short note about what you are trying to build or fix, and you will get a reply with the questions I still need answered.',
  keywords: ['hire web developer Nepal', 'contact SEO specialist Nepal'],
  canonical: `${site.url}/contact`,
};

export function projectSEO(project: Project): SEOData {
  return {
    title: `${project.title} | Website & SEO Project in Nepal`,
    description: project.description,
    canonical: `${site.url}/work/${project.slug}`,
  };
}

export function serviceSEO(service: Service): SEOData {
  return {
    title: `${service.title} in Nepal | ${profile.name}`,
    description: service.shortDescription,
    keywords: [`${service.title} Nepal`, `${service.title} Kathmandu`],
    canonical: `${site.url}/services/${service.slug}`,
  };
}

export function postSEO(post: BlogPost): SEOData {
  return {
    title: `${post.title} | ${profile.name}`,
    description: post.excerpt,
    keywords: post.tags,
    canonical: `${site.url}/blog/${post.slug}`,
    ogType: 'article',
  };
}
