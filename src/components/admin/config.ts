import type { ProjectCategory, BlogCategory, IconName } from '@/types';
import { postSEO, projectSEO, serviceSEO } from '@/data/seo';

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

export type FieldType =
  | 'text'
  | 'textarea'
  | 'paragraphs'
  | 'array'
  | 'select'
  | 'number'
  | 'toggle'
  | 'results'
  /**
   * The Project-Level SEO panel.
   *
   * A field type rather than a fixed part of the form, so the panel's position
   * stays declarative alongside every other field. It is the one type that is
   * not a single database column — `AdminForm` renders `SeoPanel` for it and
   * writes `seo_meta` as a second table after the content row.
   */
  | 'seo';

export interface Field {
  /** Database column name (forms edit columns directly — no mapping layer). */
  name: string;
  label: string;
  type: FieldType;
  options?: readonly string[];
  required?: boolean;
  placeholder?: string;
  help?: string;
  /** Primary key: rendered read-only while editing, required while creating. */
  pk?: boolean;
}

/**
 * Attaches a collection to the SEO layer.
 *
 * Only the three collections with public pages have this. `experience` and
 * `testimonials` render as sections of other pages, so they have no URL of
 * their own and nothing for a canonical, a slug or an OG card to describe.
 */
export interface SeoConfig {
  entityType: 'project' | 'post' | 'service';
  /** First path segment of the public URL, e.g. `work` for `/work/drillthru`. */
  pathPrefix: string;
  /** Field seeding the slug generator and the SERP preview. */
  titleField: string;
  /**
   * The title and description the site would emit if the SEO fields were left
   * blank — i.e. the panel's placeholders and its preview fallback.
   *
   * Built by calling the real `projectSEO` / `postSEO` / `serviceSEO`, not by
   * restating their templates. The templates are the thing this preview exists
   * to show, so a copy of them here would be a preview that drifts from the
   * site and quietly stops being true.
   */
  fallback: (row: Record<string, unknown>) => { title: string; description: string };
}

export interface Collection {
  /** URL segment under /admin and the Postgres table name. */
  key: string;
  table: string;
  label: string;
  singular: string;
  pk: string;
  fields: Field[];
  columns: { name: string; label: string }[];
  defaults: Record<string, unknown>;
  seo?: SeoConfig;
}

const PROJECT_CATEGORIES: ProjectCategory[] = [
  'Web Development',
  'Ecommerce',
  'SEO',
  'Marketing',
  'Ads',
];

const BLOG_CATEGORIES: BlogCategory[] = [
  'Web Development',
  'SEO',
  'Google Ads',
  'Meta Ads',
  'Ecommerce',
  'Digital Marketing',
  'Technology',
  'Tutorials',
];

const ICONS: IconName[] = [
  'code',
  'search',
  'target',
  'chart',
  'shopping-bag',
  'megaphone',
  'layers',
  'server',
  'database',
  'palette',
  'sparkles',
];

const publishedField: Field = { name: 'published', label: 'Published', type: 'toggle' };
const placeholderField: Field = {
  name: 'is_placeholder',
  label: 'Placeholder content',
  type: 'toggle',
  help: 'Marks rows that are template content rather than real work.',
};
const sortField: Field = { name: 'sort_order', label: 'Sort order', type: 'number' };
/** Rendered by `SeoPanel`, not by `FieldControl` — see the `FieldType` note. */
const seoField: Field = { name: 'seo', label: 'SEO settings', type: 'seo' };

export const COLLECTIONS: Record<string, Collection> = {
  projects: {
    key: 'projects',
    table: 'projects',
    label: 'Projects',
    singular: 'Project',
    pk: 'slug',
    seo: {
      entityType: 'project',
      pathPrefix: 'work',
      titleField: 'title',
      fallback: (row) => {
        const seo = projectSEO({
          slug: str(row.slug),
          title: str(row.title),
          category: (str(row.category) || 'Web Development') as ProjectCategory,
          description: str(row.description),
          technologies: [],
          image: '',
        });
        return { title: seo.title, description: seo.description };
      },
    },
    fields: [
      { name: 'slug', label: 'Slug (URL id)', type: 'text', pk: true, required: true, placeholder: 'my-project' },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: PROJECT_CATEGORIES, required: true },
      { name: 'secondary_categories', label: 'Extra categories', type: 'array', options: PROJECT_CATEGORIES, help: 'One per line — project also appears under these filters.' },
      { name: 'description', label: 'Short description', type: 'textarea', required: true },
      { name: 'image', label: 'Card image path or URL', type: 'text', required: true, placeholder: '/images/project-x.png' },
      { name: 'images', label: 'Gallery images', type: 'array', help: 'One path or URL per line.' },
      { name: 'technologies', label: 'Technologies', type: 'array', help: 'One per line.' },
      { name: 'year', label: 'Year', type: 'text', placeholder: '2026' },
      { name: 'overview', label: 'Overview', type: 'textarea' },
      { name: 'challenge', label: 'Challenge', type: 'textarea' },
      { name: 'approach', label: 'Approach', type: 'textarea' },
      { name: 'development', label: 'Development', type: 'textarea' },
      { name: 'marketing', label: 'Marketing / SEO', type: 'textarea' },
      { name: 'results', label: 'Results', type: 'results' },
      { name: 'link', label: 'Live link', type: 'text', placeholder: 'https://…' },
      placeholderField,
      publishedField,
      sortField,
      seoField,
    ],
    columns: [
      { name: 'title', label: 'Title' },
      { name: 'category', label: 'Category' },
      { name: 'year', label: 'Year' },
      { name: 'published', label: 'Published' },
    ],
    defaults: {
      slug: '',
      title: '',
      category: 'Web Development',
      secondary_categories: [],
      description: '',
      image: '',
      images: [],
      technologies: [],
      year: '',
      overview: '',
      challenge: '',
      approach: '',
      development: '',
      marketing: '',
      results: [],
      link: '',
      is_placeholder: false,
      published: true,
      sort_order: 0,
    },
  },

  posts: {
    key: 'posts',
    table: 'posts',
    label: 'Blog Posts',
    singular: 'Post',
    pk: 'slug',
    seo: {
      entityType: 'post',
      pathPrefix: 'blog',
      titleField: 'title',
      fallback: (row) => {
        const seo = postSEO({
          slug: str(row.slug),
          title: str(row.title),
          excerpt: str(row.excerpt),
          category: (str(row.category) || 'Web Development') as BlogCategory,
          date: str(row.date),
          readingTime: str(row.reading_time),
          image: '',
          tags: [],
        });
        return { title: seo.title, description: seo.description };
      },
    },
    fields: [
      { name: 'slug', label: 'Slug (URL id)', type: 'text', pk: true, required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', required: true },
      { name: 'category', label: 'Category', type: 'select', options: BLOG_CATEGORIES, required: true },
      { name: 'date', label: 'Date', type: 'text', required: true, placeholder: 'March 12, 2026' },
      { name: 'reading_time', label: 'Reading time', type: 'text', placeholder: '6 min read' },
      { name: 'image', label: 'Cover image path or URL', type: 'text', required: true },
      { name: 'content', label: 'Article body', type: 'paragraphs', help: 'One paragraph per blank line.' },
      { name: 'tags', label: 'Tags', type: 'array', help: 'One per line.' },
      placeholderField,
      publishedField,
      sortField,
      seoField,
    ],
    columns: [
      { name: 'title', label: 'Title' },
      { name: 'category', label: 'Category' },
      { name: 'date', label: 'Date' },
      { name: 'published', label: 'Published' },
    ],
    defaults: {
      slug: '',
      title: '',
      excerpt: '',
      category: 'Web Development',
      date: '',
      reading_time: '',
      image: '',
      content: [],
      tags: [],
      is_placeholder: false,
      published: true,
      sort_order: 0,
    },
  },

  experience: {
    key: 'experience',
    table: 'experience',
    label: 'Experience',
    singular: 'Entry',
    pk: 'id',
    fields: [
      { name: 'id', label: 'ID', type: 'text', pk: true, required: true, placeholder: 'drillthru' },
      { name: 'company', label: 'Company / project', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text', required: true },
      { name: 'period', label: 'Period', type: 'text', required: true, placeholder: '1 Year' },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'technologies', label: 'Technologies / focus', type: 'array', help: 'One per line.' },
      placeholderField,
      publishedField,
      sortField,
    ],
    columns: [
      { name: 'company', label: 'Company' },
      { name: 'role', label: 'Role' },
      { name: 'period', label: 'Period' },
      { name: 'published', label: 'Published' },
    ],
    defaults: {
      id: '',
      company: '',
      role: '',
      period: '',
      description: '',
      technologies: [],
      is_placeholder: false,
      published: true,
      sort_order: 0,
    },
  },

  testimonials: {
    key: 'testimonials',
    table: 'testimonials',
    label: 'Testimonials',
    singular: 'Testimonial',
    pk: 'id',
    fields: [
      { name: 'id', label: 'ID', type: 'text', pk: true, required: true, placeholder: 'drillthru' },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'role', label: 'Role line', type: 'text', required: true, placeholder: 'Web Development · drillthru.tech' },
      { name: 'company', label: 'Company (optional)', type: 'text' },
      { name: 'content', label: 'Content', type: 'textarea', required: true },
      { name: 'avatar', label: 'Logo / avatar path or URL', type: 'text', placeholder: '/images/clients/x.png' },
      publishedField,
      sortField,
    ],
    columns: [
      { name: 'name', label: 'Name' },
      { name: 'role', label: 'Role' },
      { name: 'published', label: 'Published' },
    ],
    defaults: {
      id: '',
      name: '',
      role: '',
      company: '',
      content: '',
      avatar: '',
      published: true,
      sort_order: 0,
    },
  },

  services: {
    key: 'services',
    table: 'services',
    label: 'Services',
    singular: 'Service',
    pk: 'slug',
    seo: {
      entityType: 'service',
      pathPrefix: 'services',
      titleField: 'title',
      fallback: (row) => {
        const seo = serviceSEO({
          slug: str(row.slug),
          index: str(row.service_index) || '01',
          title: str(row.title),
          shortDescription: str(row.short_description),
          description: str(row.description),
          capabilities: [],
          icon: 'code',
        });
        return { title: seo.title, description: seo.description };
      },
    },
    fields: [
      { name: 'slug', label: 'Slug (URL id)', type: 'text', pk: true, required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'short_description', label: 'Short description', type: 'textarea', required: true },
      { name: 'description', label: 'Full description', type: 'textarea', required: true },
      { name: 'capabilities', label: 'Capabilities', type: 'array', help: 'One per line.' },
      { name: 'icon', label: 'Icon', type: 'select', options: ICONS, required: true },
      publishedField,
      sortField,
      seoField,
    ],
    columns: [
      { name: 'title', label: 'Title' },
      { name: 'published', label: 'Published' },
    ],
    defaults: {
      slug: '',
      title: '',
      short_description: '',
      description: '',
      capabilities: [],
      icon: 'code',
      published: true,
      sort_order: 0,
    },
  },
};

export const COLLECTION_KEYS = Object.keys(COLLECTIONS);
