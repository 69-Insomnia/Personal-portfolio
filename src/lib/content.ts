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
  Service,
  ServiceSection,
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
