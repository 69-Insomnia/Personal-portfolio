import type { BlogPost, Project, SEOData, Service } from '@/types';
import { profile } from '@/data/profile';
import { isoDate } from '@/utils/dates';

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

/**
 * Origins that are real on a developer's machine and meaningless anywhere else.
 *
 * This guard exists because the previous version of this function trusted
 * `NEXT_PUBLIC_SITE_URL` unconditionally, and the site then shipped with every
 * canonical, `og:url`, JSON-LD `@id`, the whole sitemap and the `Sitemap:` line
 * in robots.txt pointing at `http://localhost:3000` — including into `llms.txt`,
 * which the AI crawlers allowlisted in `robots.ts` read. The production build
 * guard below never fired, because the configured-value branch returned first.
 * A guard that only catches "nothing resolved" does not catch "resolved to
 * something that cannot be fetched."
 */
const LOOPBACK_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?$/i;

/**
 * Rejects anything that is not an absolute `http(s)://host` origin.
 *
 * A bare `dipendraguragain.tech` (no protocol) is the other way this value gets
 * set wrong, and it produces canonical tags like `dipendraguragain.tech/about`
 * — relative strings that resolve against the *current* page and are therefore
 * worse than no canonical at all.
 */
function isUsableOrigin(value: string): boolean {
  if (LOOPBACK_ORIGIN.test(value)) return false;
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

function resolveSiteUrl(): string {
  /**
   * The browser cannot recover the production origin.
   *
   * Every variable that identifies it — Vercel's `VERCEL_PROJECT_PRODUCTION_URL`
   * and `VERCEL_URL` — is server-only and reads as `undefined` in the client
   * bundle. `NEXT_PUBLIC_SITE_URL` is the only one that survives, and if it
   * holds a rejected value we have nothing left to try.
   *
   * This matters more than it looks: this module is evaluated at module scope
   * during hydration, so an uncaught error here does not fail one component, it
   * fails the whole React tree and Next.js replaces the entire page with its
   * built-in global error screen. That is exactly what happened — the server
   * rendered perfect HTML and every real browser showed "This page couldn't
   * load", which no crawler could see because the HTML was never the problem.
   *
   * So the browser never throws. It falls back to whatever origin it is
   * actually on, which is at worst a preview URL and is always self-consistent.
   */
  const isBrowser = typeof window !== 'undefined';
  const isProduction = process.env.NODE_ENV === 'production';

  // An explicit value always wins: it is the only way to point the site at a
  // custom domain that is not the one the host thinks it is serving. In
  // production it has to be a usable absolute origin, otherwise it is skipped
  // in favour of the host's own variables rather than being trusted.
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '');
  if (configured) {
    if (isUsableOrigin(configured)) return configured;
    // In development a loopback value is correct and expected.
    if (!isProduction && LOOPBACK_ORIGIN.test(configured)) return configured;
  }

  const vercel = vercelOrigin();
  if (vercel) return vercel;

  if (isBrowser) return window.location.origin;

  /**
   * The build-failure guard applies only to a hosted build.
   *
   * `next build` loads `.env.local` in every environment, and a developer's
   * `.env.local` correctly holds `http://localhost:3000`. Failing the build on
   * that value would break local production builds to protect an artifact that
   * is never deployed. On Vercel the host's own variables have already resolved
   * above, so reaching here means the deploy genuinely cannot name itself —
   * which is the case worth failing loudly for.
   */
  if (isProduction && process.env.VERCEL) {
    const rejected =
      configured && !isUsableOrigin(configured)
        ? ` NEXT_PUBLIC_SITE_URL was set to "${configured}", which is not a ` +
          'usable public origin and has been ignored.'
        : '';

    throw new Error(
      '[seo] Cannot resolve the site origin.' +
        rejected +
        ' Set NEXT_PUBLIC_SITE_URL to the production origin (absolute, no ' +
        'trailing slash) in the deploy environment, and note that because it ' +
        'is a NEXT_PUBLIC_* variable it is inlined at build time — changing ' +
        'it requires a redeploy, not a restart. Canonical tags, og:url, ' +
        'sitemap.xml, robots.txt, llms.txt and every JSON-LD @id are built ' +
        'from it. See .env.example.',
    );
  }

  return 'http://localhost:3000';
}

/**
 * The single source of truth for who this site is about.
 *
 * Every one of these was previously restated wherever it was needed — the name
 * in the layout, the title in the Person node, the location in three separate
 * places — which is how `sameAs` ended up describing an entity whose job title
 * disagreed with the one on the page. Reading them from one object means a
 * corrected title cannot leave four stale copies behind it.
 *
 * `role` is the entity's positioning line, and it is deliberately different
 * from `profile.title` (the navbar's tracked micro-type, which has to stay
 * short enough to sit under a name). This is the version that goes into a
 * heading, a `jobTitle` and a meta description.
 */
export const identity = {
  name: profile.name,
  role: 'Web Developer & SEO Specialist',
  location: profile.location,
  email: profile.email,
  telephone: profile.whatsapp,
} as const;

export const site = {
  url: resolveSiteUrl(),
  name: identity.name,
  locale: 'en_US',
};

/**
 * The social profiles that identify this person elsewhere.
 *
 * Exported so `sameAs`, the contact page and the footer resolve to one list
 * rather than three filters over the same object that can disagree about
 * whether an empty string counts as a profile.
 */
export const socialProfiles: string[] = Object.values(profile.socialLinks).filter(
  (href): href is string => typeof href === 'string' && href.trim().length > 0,
);

/** 1200×630, served from `public/`. Absolute downstream via `metadataBase`. */
export const DEFAULT_OG_IMAGE = '/og-image.png';

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

/**
 * Project pages.
 *
 * The title named every project a "Website & SEO Project in Nepal", which was
 * not true of all of them — `poms-penthouse` carries no SEO work at all — so
 * the page asserted something about itself that its own case study contradicted.
 * Naming the real category instead is both accurate and a better description of
 * what someone clicking the result is going to get.
 *
 * The description is the project's own summary, which is the honest one, and it
 * is clamped by `buildMetadata` because several of these run past the length a
 * result will display.
 */
export function projectSEO(project: Project): SEOData {
  return {
    title: `${project.title} Case Study | ${project.category} in Nepal`,
    description: project.description,
    keywords: [project.title, `${project.category} Nepal`, ...project.technologies],
    canonical: `${site.url}/work/${project.slug}`,
  };
}

/**
 * Service pages.
 *
 * The title is `${service.title} in Nepal`, which means the page's own name
 * decides what it targets — so a service named "Ecommerce Growth Specialist"
 * and one named "Web Development Services" both produce a query-shaped title
 * without anything being forced into a template.
 *
 * `base` strips the role suffix so the shorter term is covered too. "Ecommerce
 * Growth Specialist" is how the service is named, but "Ecommerce Growth" and
 * "Ecommerce Growth Nepal" are what more people type, and a page should not
 * miss the shorter version of its own name because of the longer one it chose.
 * Nothing here is invented: every term is a prefix of the page's own title.
 */
export function serviceSEO(service: Service): SEOData {
  const base = service.title.replace(/\s+(Services|Specialist)$/i, '');

  return {
    title: `${service.title} in Nepal | ${profile.name}`,
    description: service.shortDescription,
    keywords: [
      `${service.title} Nepal`,
      `${service.title} Kathmandu`,
      `${base} Nepal`,
      `${base} Kathmandu`,
    ],
    canonical: `${site.url}/services/${service.slug}`,
  };
}

/**
 * Article pages carry the full set of fields `og:type=article` expects.
 *
 * These were previously left to Next's defaults, which means the published and
 * modified times existed in the BlogPosting JSON-LD and nowhere in the metadata
 * a social crawler or an aggregator actually reads.
 */
export function postSEO(post: BlogPost): SEOData {
  return {
    title: `${post.title} | ${profile.name}`,
    description: post.excerpt,
    keywords: post.tags,
    canonical: `${site.url}/blog/${post.slug}`,
    ogType: 'article',
    authors: [profile.name],
    publishedTime: isoDate(post.date),
    modifiedTime: isoDate(post.updatedAt),
    tags: post.tags,
  };
}
