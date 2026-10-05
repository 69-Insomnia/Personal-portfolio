import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { blogPosts as staticPosts } from '@/data/blog';
import { experience as staticExperience } from '@/data/experience';
import { projects as staticProjects } from '@/data/projects';
import { numberServices, services as staticServices, type UnnumberedService } from '@/data/services';
import { testimonials as staticTestimonials } from '@/data/testimonials';
import type {
  BlogPost,
  ExperienceItem,
  Project,
  SeoEntityType,
  SeoMeta,
  Service,
  ServiceSection,
  SiteSettings,
  Testimonial,
} from '@/types';

/**
 * Server-side content reads with the static `src/data` files as fallback.
 *
 * The site keeps rendering exactly what it renders today whenever the
 * database is unreachable, unprovisioned or returns nothing — the CMS only
 * takes over once real rows exist. GETs are cached for 5 minutes by Next.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null = null;
let clientTried = false;

function db(): SupabaseClient | null {
  if (!url || !key) return null;
  if (!clientTried) {
    clientTried = true;
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) =>
          fetch(input as RequestInfo | URL, {
            ...init,
            next: { revalidate: 300 },
          } as RequestInit),
      },
    });
  }
  return client;
}

async function readAll<T>(
  table: string,
  map: (row: Record<string, unknown>) => T,
  fallback: T[],
): Promise<T[]> {
  const c = db();
  if (!c) return fallback;
  try {
    const { data, error } = await c
      .from(table)
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) return fallback;
    return data.map(map);
  } catch {
    return fallback;
  }
}

const str = (v: unknown, d = ''): string => (typeof v === 'string' ? v : d);
const strOr = (v: unknown): string | undefined => (typeof v === 'string' && v ? v : undefined);
const strList = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

// ---------------------------------------------------------------- projects --

interface ProjectRow {
  slug: string;
  title: string;
  category: string;
  secondary_categories: unknown;
  description: string;
  image: string;
  images: unknown;
  technologies: unknown;
  year: string | null;
  overview: string | null;
  challenge: string | null;
  approach: string | null;
  development: string | null;
  marketing: string | null;
  results: unknown;
  link: string | null;
  is_placeholder: boolean;
  updated_at: string | null;
}

function mapProject(row: ProjectRow): Project {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category as Project['category'],
    secondaryCategories: strList(row.secondary_categories) as Project['secondaryCategories'],
    description: row.description,
    image: row.image,
    images: strList(row.images),
    technologies: strList(row.technologies),
    year: strOr(row.year),
    overview: strOr(row.overview),
    challenge: strOr(row.challenge),
    approach: strOr(row.approach),
    development: strOr(row.development),
    marketing: strOr(row.marketing),
    results: Array.isArray(row.results)
      ? (row.results as NonNullable<Project['results']>).filter(
          (r) => r && typeof r.label === 'string' && typeof r.value === 'string',
        )
      : undefined,
    link: strOr(row.link),
    isPlaceholder: row.is_placeholder === true,
    updatedAt: strOr(row.updated_at),
  };
}

export async function getProjects(): Promise<Project[]> {
  return readAll('projects', (row) => mapProject(row as unknown as ProjectRow), staticProjects);
}

export async function getProject(slug: string): Promise<Project | undefined> {
  const list = await getProjects();
  return list.find((p) => p.slug === slug);
}

// ------------------------------------------------------------ testimonials --

function mapTestimonial(row: Record<string, unknown>): Testimonial {
  return {
    id: str(row.id),
    name: str(row.name),
    role: str(row.role),
    company: strOr(row.company),
    content: str(row.content),
    avatar: strOr(row.avatar),
  };
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return readAll('testimonials', mapTestimonial, staticTestimonials);
}

// ------------------------------------------------------------------ posts --

interface PostRow {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  reading_time: string;
  image: string;
  content: unknown;
  tags: unknown;
  is_placeholder: boolean;
  updated_at: string | null;
}

function mapPost(row: PostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category as BlogPost['category'],
    date: row.date,
    readingTime: row.reading_time,
    image: row.image,
    content: strList(row.content),
    tags: strList(row.tags),
    isPlaceholder: row.is_placeholder === true,
    updatedAt: strOr(row.updated_at),
  };
}

export async function getPosts(): Promise<BlogPost[]> {
  const rows = await readAll<BlogPost>(
    'posts',
    (row) => mapPost(row as unknown as PostRow),
    staticPosts,
  );
  return rows;
}

export async function getPost(slug: string): Promise<BlogPost | undefined> {
  const list = await getPosts();
  return list.find((p) => p.slug === slug);
}

// ------------------------------------------------------------- experience --

function mapExperience(row: Record<string, unknown>): ExperienceItem {
  return {
    id: str(row.id),
    period: str(row.period),
    role: str(row.role),
    company: str(row.company),
    description: str(row.description),
    technologies: strList(row.technologies),
    isPlaceholder: row.is_placeholder === true,
  };
}

export async function getExperience(): Promise<ExperienceItem[]> {
  return readAll('experience', mapExperience, staticExperience);
}

// --------------------------------------------------------------- services --

interface ServiceRow {
  slug: string;
  title: string;
  short_description: string;
  description: string;
  body: unknown;
  capabilities: unknown;
  icon: string;
  updated_at: string | null;
}

/**
 * `body` is a jsonb array of { heading, paragraphs }. Rows written before the
 * column existed, or malformed ones, fall through to an empty array rather
 * than throwing — the page then renders exactly as it did before the column.
 */
function serviceSections(value: unknown): ServiceSection[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return [];
    const { heading, paragraphs } = entry as { heading?: unknown; paragraphs?: unknown };
    if (typeof heading !== 'string' || !Array.isArray(paragraphs)) return [];
    const clean = paragraphs.filter((p): p is string => typeof p === 'string' && p.length > 0);
    return clean.length > 0 ? [{ heading, paragraphs: clean }] : [];
  });
}

function mapService(row: ServiceRow): UnnumberedService {
  return {
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    description: row.description,
    body: serviceSections(row.body),
    capabilities: strList(row.capabilities),
    icon: row.icon as Service['icon'],
    updatedAt: strOr(row.updated_at),
  };
}

/**
 * The number is derived from list position, not read from the table's
 * `service_index` column — see `numberServices` in `src/data/services.ts`. The
 * column is admin-editable and separate from `sort_order`, so the two could
 * (and did) disagree with each other and with render order.
 */
export async function getServices(): Promise<Service[]> {
  const rows = await readAll<UnnumberedService>(
    'services',
    (row) => mapService(row as unknown as ServiceRow),
    staticServices,
  );
  return numberServices(rows);
}

export async function getService(slug: string): Promise<Service | undefined> {
  const list = await getServices();
  return list.find((s) => s.slug === slug);
}

// --------------------------------------------------------------- seo_meta --

/**
 * Admin-editable SEO overrides, read with the same DB-first discipline as the
 * content above — but with an empty result as the fallback rather than a
 * static default set.
 *
 * That difference is deliberate. Every other reader here falls back to a file
 * in `src/data` because the file holds the only copy of that content. The
 * templates these overrides sit on top of — `projectSEO`, `postSEO`,
 * `serviceSEO` — are *code*, and they already produce a complete result on
 * their own. A static fallback table would mean maintaining the same titles
 * twice and letting the two drift, which is the exact failure
 * `scripts/sync-content.ts` was written to clean up.
 *
 * So: no row means "inherit the template", and the merge in `src/data/seo.ts`
 * is where that decision is made. Nothing here throws — a database that is
 * unprovisioned, unreachable or simply has no rows yields the same result, and
 * every page renders what it rendered before this table existed.
 */

function mapSeoMeta(row: Record<string, unknown>): SeoMeta {
  const keywords = strList(row.keywords);

  return {
    metaTitle: strOr(row.meta_title),
    metaDescription: strOr(row.meta_description),
    focusKeyword: strOr(row.focus_keyword),
    // `undefined`, not `[]`, so the merge can tell "no keywords set" from
    // "keywords set to an empty list" and fall back to the template's.
    keywords: keywords.length > 0 ? keywords : undefined,
    ogTitle: strOr(row.og_title),
    ogDescription: strOr(row.og_description),
    ogImage: strOr(row.og_image),
    twitterTitle: strOr(row.twitter_title),
    twitterDescription: strOr(row.twitter_description),
    twitterImage: strOr(row.twitter_image),
    canonicalOverride: strOr(row.canonical_override),
    customJsonLd: row.custom_json_ld ?? undefined,
    noindex: row.noindex === true,
    nofollow: row.nofollow === true,
    updatedAt: strOr(row.updated_at),
  };
}

/** Key format for `getSeoMap`, and the pair `getSeo` queries on. */
export function seoKey(entityType: SeoEntityType, entitySlug: string): string {
  return `${entityType}:${entitySlug}`;
}

/**
 * The `site_settings` singleton.
 *
 * Unlike every other reader in this file, the fallback here is an **empty
 * object** rather than a set of defaults copied out of the repo. Every
 * consumer already has a repo-side default — `defaultSEO.title`,
 * `DEFAULT_OG_IMAGE`, `profile.socialLinks` — and duplicating those values
 * into this file would create a second copy to keep in step with the first.
 *
 * So: an unset field is `undefined`, and the consumer's `??` picks up the
 * value the site has always used. A missing table, a missing row and a row of
 * nulls are all the same thing here, and all mean "use what the repo says".
 *
 * Reads the single row by its `true` primary key. `maybeSingle` rather than
 * `single` so a fresh database with no row yet returns nothing instead of an
 * error the caller would have to distinguish from a real failure.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const empty: SiteSettings = { socialLinks: {} };
  const c = db();
  if (!c) return empty;
  try {
    const { data, error } = await c
      .from('site_settings')
      .select('*')
      .eq('id', true)
      .maybeSingle();
    if (error || !data) return empty;

    const row = data as Record<string, unknown>;
    const social = row.social_links;

    return {
      titleSuffix: strOr(row.title_suffix),
      defaultMetaTitle: strOr(row.default_meta_title),
      defaultMetaDescription: strOr(row.default_meta_description),
      defaultOgImage: strOr(row.default_og_image),
      personJobTitle: strOr(row.person_job_title),
      personKnowsAbout: strList(row.person_knows_about),
      socialLinks:
        social && typeof social === 'object' && !Array.isArray(social)
          ? Object.fromEntries(
              Object.entries(social as Record<string, unknown>).filter(
                (entry): entry is [string, string] =>
                  typeof entry[1] === 'string' && entry[1].trim() !== '',
              ),
            )
          : {},
      ga4MeasurementId: strOr(row.ga4_measurement_id),
      gtmContainerId: strOr(row.gtm_container_id),
      metaPixelId: strOr(row.meta_pixel_id),
      googleSiteVerification: strOr(row.google_site_verification),
      bingSiteVerification: strOr(row.bing_site_verification),
      robotsTxt: strOr(row.robots_txt),
      customJsonLd: row.custom_json_ld ?? undefined,
    };
  } catch {
    return empty;
  }
}

// ------------------------------------------------------------------ media --

/**
 * Alt text for one image, from the media library, or `undefined`.
 *
 * `undefined` is the signal to fall back to the hand-written lookup in
 * `src/utils/images.ts`, and it is the expected result for every image that
 * lives in `public/` — those have no `media` row and never will, because they
 * are committed to the repo rather than uploaded. Only uploaded images have a
 * row, and those are exactly the ones nobody has written alt text for by hand.
 *
 * That is why this is additive rather than a replacement. The comment on
 * `projectImageAlt` explains that the lookup exists because an `image_alt`
 * column would have been null for every row at the time; this table does not
 * change that for existing images, it just gives new ones somewhere to be
 * described.
 */
export async function getImageAlt(src: string): Promise<string | undefined> {
  if (!src) return undefined;
  const c = db();
  if (!c) return undefined;
  try {
    const { data, error } = await c
      .from('media')
      .select('alt')
      .eq('src', src)
      .maybeSingle();
    if (error || !data) return undefined;
    return strOr(data.alt);
  } catch {
    return undefined;
  }
}

/**
 * A permanent redirect for a path that no longer resolves, or `null`.
 *
 * Rows are written by `on_slug_change` when a slug is edited, and by hand from
 * `/admin/redirects`. The lookup is exact-match against a normalised path
 * (`/work/old-slug`), which is the shape the migration's check constraints
 * enforce, so a request path and a stored path cannot differ by case or a
 * trailing slash and silently fail to match.
 *
 * Returning `null` rather than throwing on every failure mode is deliberate:
 * this is only ever called on the path where the page has *already* failed to
 * resolve. A database outage there must produce a 404, not a 500, and a 404 is
 * what the caller does with `null`.
 */
export async function getRedirect(path: string): Promise<string | null> {
  const c = db();
  if (!c) return null;
  try {
    const { data, error } = await c
      .from('redirects')
      .select('to_path')
      .eq('from_path', path)
      .maybeSingle();
    if (error || !data) return null;
    return typeof data.to_path === 'string' && data.to_path ? data.to_path : null;
  } catch {
    return null;
  }
}

/**
 * One entity's overrides, for a page's `generateMetadata`.
 *
 * A null row is the normal case, not an error — every page that has never been
 * opened in the admin panel has no row.
 */
export async function getSeo(
  entityType: SeoEntityType,
  entitySlug: string,
): Promise<SeoMeta | undefined> {
  const c = db();
  if (!c) return undefined;
  try {
    const { data, error } = await c
      .from('seo_meta')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_slug', entitySlug)
      .maybeSingle();
    if (error || !data) return undefined;
    return mapSeoMeta(data as Record<string, unknown>);
  } catch {
    return undefined;
  }
}

/**
 * Every override at once, keyed by `seoKey`. For callers that need to consult
 * the whole set — the sitemap, which has to know which URLs are noindexed
 * before it can decide what to list.
 *
 * One query for the table rather than one per URL: the sitemap touches every
 * project, post and service, and a per-slug read would turn a single render
 * into three dozen round trips. The response is cached for 5 minutes by the
 * same `revalidate` on the client's fetch, so the cost is one request per
 * revalidation window.
 */
export async function getSeoMap(): Promise<Map<string, SeoMeta>> {
  const c = db();
  if (!c) return new Map();
  try {
    const { data, error } = await c.from('seo_meta').select('*');
    if (error || !data) return new Map();
    return new Map(
      data.map((row) => [
        seoKey(row.entity_type as SeoEntityType, String(row.entity_slug)),
        mapSeoMeta(row as Record<string, unknown>),
      ]),
    );
  } catch {
    return new Map();
  }
}
