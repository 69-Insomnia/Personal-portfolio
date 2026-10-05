import type { BlogPost, Project, Service } from '@/types';

/**
 * The site's internal link graph, written down in one place.
 *
 * Every page had a "related" block of exactly one kind: services linked to
 * other services, projects to other projects, articles to other articles. The
 * site therefore had three separate loops and no edges between them, which is
 * the shape that leaves a crawler able to reach everything but unable to tell
 * what relates to what — a service page and the case study proving it was
 * built were two clicks apart with nothing pointing either way.
 *
 * The relationships are listed explicitly rather than computed from shared
 * categories. A rule like "same category means related" would have put
 * `poms-penthouse` next to a study-abroad consultancy because both are tagged
 * Web Development, which is true and useless. These are the pairs where one
 * page genuinely answers a question the other raises.
 *
 * Nothing here is invented: every link points at work that appears in
 * `src/data/projects.ts`, `src/data/blog.ts` and `src/data/services.ts`, and
 * each pairing is justified by what those files already say the project
 * involved. Where a service has no project that demonstrates it, the list is
 * empty and the block is not rendered — an empty "Related work" heading, or a
 * padded one, is worse than its absence.
 */
interface Relations {
  services: string[];
  projects: string[];
  posts: string[];
}

const EMPTY: Relations = { services: [], projects: [], posts: [] };

/**
 * Service → the work that proves it, and the writing that explains it.
 *
 * `drillthru` appears under `digital-marketing` and `google-ads` because its
 * recorded scope names Google Ads, Meta Ads and search; `trip-zone`'s names
 * technical SEO; `poms-penthouse`'s names none, so it is listed only under
 * `web-development`, where the build itself is the evidence.
 */
const SERVICE_RELATIONS: Record<string, Relations> = {
  'web-development': {
    ...EMPTY,
    projects: ['drillthru', 'trip-zone', 'starglobalvision', 'poms-penthouse'],
    posts: ['whatsapp-booking-site'],
  },
  seo: {
    ...EMPTY,
    projects: ['drillthru', 'trip-zone'],
    posts: ['technical-seo-foundations'],
  },
  'ai-search': {
    ...EMPTY,
    // No project is presented as AI-search work, and claiming one would be.
    // The article is the honest lead here.
    posts: ['technical-seo-foundations'],
  },
  'meta-ads': {
    ...EMPTY,
    posts: ['ecommerce-one-system'],
  },
  'google-ads': {
    ...EMPTY,
    projects: ['drillthru'],
    posts: ['ecommerce-one-system'],
  },
  'ecommerce-growth': {
    ...EMPTY,
    posts: ['ecommerce-one-system'],
  },
  'digital-marketing': {
    ...EMPTY,
    projects: ['drillthru'],
    posts: ['ecommerce-one-system'],
  },
};

/**
 * Project → the service it demonstrates and the article it illustrates.
 *
 * This is the direction that was missing entirely. A case study is the only
 * page on the site with first-hand evidence on it, and it was linking to other
 * case studies instead of to the service it exists to support.
 */
const PROJECT_RELATIONS: Record<string, Relations> = {
  drillthru: {
    ...EMPTY,
    services: ['web-development', 'seo', 'digital-marketing', 'google-ads'],
    posts: ['technical-seo-foundations'],
  },
  'trip-zone': {
    ...EMPTY,
    services: ['web-development', 'seo'],
    posts: ['technical-seo-foundations'],
  },
  starglobalvision: {
    ...EMPTY,
    services: ['web-development'],
    posts: ['technical-seo-foundations'],
  },
  'poms-penthouse': {
    ...EMPTY,
    services: ['web-development'],
    // The article is about this build specifically.
    posts: ['whatsapp-booking-site'],
  },
};

/**
 * Article → the service it argues for and the project it came out of.
 *
 * `whatsapp-booking-site` and `poms-penthouse` are the same piece of work seen
 * from two sides, and linking them is the clearest single edge on the site.
 */
const POST_RELATIONS: Record<string, Relations> = {
  'technical-seo-foundations': {
    ...EMPTY,
    services: ['seo', 'ai-search'],
    projects: ['drillthru'],
  },
  'whatsapp-booking-site': {
    ...EMPTY,
    services: ['web-development'],
    projects: ['poms-penthouse'],
  },
  'ecommerce-one-system': {
    ...EMPTY,
    services: ['ecommerce-growth', 'digital-marketing'],
    projects: [],
  },
};

/**
 * Resolves a list of slugs against whatever the caller is actually rendering.
 *
 * Taking the live lists as arguments rather than importing the static files is
 * deliberate: the same pages are served from Supabase when it has rows, and a
 * related block that silently vanished because it was matched against the
 * fallback data would be worse than no block at all.
 */
function pick<T extends { slug: string }>(items: T[], slugs: string[]): T[] {
  const bySlug = new Map(items.map((item) => [item.slug, item]));
  return slugs.flatMap((slug) => {
    const match = bySlug.get(slug);
    return match ? [match] : [];
  });
}

export function relatedToService(
  serviceSlug: string,
  all: { projects: Project[]; posts: BlogPost[] },
): { projects: Project[]; posts: BlogPost[] } {
  const relations = SERVICE_RELATIONS[serviceSlug] ?? EMPTY;
  return {
    projects: pick(all.projects, relations.projects),
    posts: pick(all.posts, relations.posts),
  };
}

export function relatedToProject(
  projectSlug: string,
  all: { services: Service[]; posts: BlogPost[] },
): { services: Service[]; posts: BlogPost[] } {
  const relations = PROJECT_RELATIONS[projectSlug] ?? EMPTY;
  return {
    services: pick(all.services, relations.services),
    posts: pick(all.posts, relations.posts),
  };
}

export function relatedToPost(
  postSlug: string,
  all: { services: Service[]; projects: Project[] },
): { services: Service[]; projects: Project[] } {
  const relations = POST_RELATIONS[postSlug] ?? EMPTY;
  return {
    services: pick(all.services, relations.services),
    projects: pick(all.projects, relations.projects),
  };
}
