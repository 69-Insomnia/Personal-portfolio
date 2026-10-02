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
 * The replacement was a localhost fallback plus a `console.warn`, which turned
 * out to be barely better. The warning only reaches someone reading a build
 * log, and the site went to production with every canonical, every `og:url`,
 * every JSON-LD `@id`, the whole of `sitemap.xml` and the `Sitemap:` line in
 * `robots.txt` pointing at `http://localhost:3000` — 18 occurrences on the home
 * page alone.
 *
 * So the origin is now resolved from whatever the environment can actually
 * tell us, and in production a total failure to resolve is a build error rather
 * than a quiet downgrade to a domain that does not exist. A build that fails is
 * recoverable in a minute; a site that tells Google its real pages live on
 * localhost is not.
 */

/**
 * Vercel sets both of these to a bare hostname, no protocol.
 *
 * `VERCEL_PROJECT_PRODUCTION_URL` is the stable production domain and is
 * present on preview and development deploys too, which is why it is tried
 * first: it makes a preview build canonicalise to production, so preview URLs
 * cannot be indexed as duplicates of the live pages.
 *
 * `VERCEL_URL` is that specific deployment's hostname, so it changes on every
 * push. It is only a last resort — a self-consistent origin beats a wrong one,
 * but a per-deploy origin in a sitemap is not something to opt into.
 */
const VERCEL_ORIGIN_VARS = ['VERCEL_PROJECT_PRODUCTION_URL', 'VERCEL_URL'] as const;

function vercelOrigin(): string | undefined {
  for (const name of VERCEL_ORIGIN_VARS) {
    const value = process.env[name]?.trim();
    if (!value) continue;
    // Tolerate a protocol being set on the variable even though Vercel omits it.
    return `https://${value.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`;
  }
  return undefined;
}

function resolveSiteUrl(): string {
  // An explicit value always wins: it is the only way to point the site at a
  // custom domain that is not the one the host thinks it is serving.
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');

  const vercel = vercelOrigin();
  if (vercel) return vercel;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '[seo] Cannot resolve the site origin. Set NEXT_PUBLIC_SITE_URL to the ' +
        'production origin, with no trailing slash, in the deploy environment. ' +
        'Canonical tags, og:url, sitemap.xml, robots.txt and every JSON-LD @id ' +
        'are built from it, and shipping them as localhost is worse than not ' +
        'shipping at all. See .env.example.',
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
