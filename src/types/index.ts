import type { Metadata } from 'next';

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  x?: string;
}

export interface Profile {
  name: string;
  title: string;
  headline: string;
  description: string;
  location: string;
  availability: boolean;
  availabilityText: string;
  /** Circular brand avatar shown next to the name (navbar, menu, footer). */
  avatar: string;
  profileImage: string;
  resumeUrl?: string;
  email?: string;
  /** Display format, e.g. '+977-9840814142'. Digits are used for the wa.me link. */
  whatsapp?: string;
  socialLinks: SocialLinks;
}

export interface NavigationItem {
  label: string;
  href: string;
  description?: string;
}

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  /**
   * Social overrides.
   *
   * A Google result and a LinkedIn card are different surfaces with different
   * limits, so the same sentence is rarely the best text for both: a meta
   * description is written to be truncated at ~158 characters under a title,
   * while a share card shows the whole thing next to a large image. When these
   * are unset `buildMetadata` falls back to `title`/`description`, so they are
   * purely additive and a page that sets none of them is unaffected.
   */
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  /**
   * Admin-supplied JSON-LD nodes for this page's `@graph`.
   *
   * Carried on `SEOData` so a page component can read it without a second
   * database call. `buildMetadata` ignores it — it returns `<head>` values and
   * JSON-LD lives in the body — so this is a passenger on the same object
   * rather than something the metadata builder acts on.
   */
  customJsonLd?: unknown;
  /**
   * Robots directives for this page. Omit to inherit the site-wide default
   * (`index, follow` in `src/app/layout.tsx`); set it to override that, which
   * is what the 404 needs — without it, Next's own `noindex` for unmatched
   * routes and the layout's `index, follow` are emitted side by side.
   */
  robots?: Metadata['robots'];
  /**
   * Article metadata, only read when `ogType` is `'article'`.
   *
   * These feed `og:type=article`'s `article:published_time`, `article:modified_time`,
   * `article:author` and `article:tag`. They are the same values the BlogPosting
   * JSON-LD carries, so the two cannot describe different publication dates.
   */
  authors?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}

/**
 * One row of `seo_meta` — the admin-editable overrides for a single entity.
 *
 * Every field is optional because an absent row, and an unset column inside a
 * present one, both mean the same thing: inherit the template in
 * `src/data/seo.ts`. There is no "empty string means empty" case, which is why
 * the readers in `src/lib/content.ts` normalise blank strings to `undefined`
 * rather than passing them through — an empty meta title that reached
 * `buildMetadata` would emit an empty `<title>` tag instead of falling back.
 *
 * `noindex`/`nofollow` are the exception and are always present, defaulting to
 * `false`. A missing row must mean "indexable", which is the behaviour the
 * site had before this table existed.
 */
export interface SeoMeta {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  /** Absolute URL. Takes precedence over the generated canonical. */
  canonicalOverride?: string;
  /**
   * Raw JSON-LD the admin pasted in, merged into this page's `@graph`.
   *
   * `unknown` rather than a node type, because it arrives from a `jsonb` column
   * that a human typed into. `customJsonLdNodes` in `src/lib/structured-data.ts`
   * is what makes it safe to emit — it filters to objects rather than trusting
   * the shape.
   */
  customJsonLd?: unknown;
  noindex: boolean;
  nofollow: boolean;
  /** ISO-8601 last edit, from the `touch_seo_meta` trigger. */
  updatedAt?: string;
}

/**
 * What a row in `seo_meta` is attached to.
 *
 * `page` covers the routes that have no database table — home, about, work,
 * services, blog, contact — keyed by a stable name rather than a URL fragment.
 */
export type SeoEntityType = 'project' | 'post' | 'service' | 'page';

/**
 * The `site_settings` singleton, as the site reads it.
 *
 * Every field is optional and every one falls back to the value already in
 * `src/data/seo.ts` or `src/data/profile.ts`. That is what keeps the global
 * panel additive: an unconfigured install renders exactly what it rendered
 * before the table existed, and the admin is an override layer rather than a
 * second source of truth that can disagree with the repo.
 */
export interface SiteSettings {
  /** Appended to page titles, e.g. ` | Junior Developer Portfolio`. */
  titleSuffix?: string;
  defaultMetaTitle?: string;
  defaultMetaDescription?: string;
  defaultOgImage?: string;
  personJobTitle?: string;
  personKnowsAbout?: string[];
  /** Keyed by platform — `{ github: 'https://…' }`. */
  socialLinks: Record<string, string>;
  ga4MeasurementId?: string;
  gtmContainerId?: string;
  metaPixelId?: string;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
  /** Raw robots.txt body. Absent means "render the generated default". */
  robotsTxt?: string;
  /** Raw JSON-LD merged into the site-wide graph. */
  customJsonLd?: unknown;
}

export interface Stat {
  label: string;
  value: string;
  note?: string;
}

export type IconName =
  | 'code'
  | 'search'
  | 'target'
  | 'chart'
  | 'shopping-bag'
  | 'megaphone'
  | 'layers'
  | 'server'
  | 'database'
  | 'palette'
  | 'sparkles';

/**
 * One long-form block on a service page.
 *
 * Headings are written as questions where the query is a question ("What does
 * SEO actually involve?"), because that is the shape AI answers and
 * featured snippets extract. Each block aims to be self-contained enough to be
 * quoted without the surrounding page.
 */
export interface ServiceSection {
  heading: string;
  paragraphs: string[];
}

export interface Service {
  slug: string;
  index: string;
  title: string;
  shortDescription: string;
  /**
   * The front-loaded answer block. Written to stand alone in roughly 134-167
   * words, which is the passage length AI citations tend to pull.
   */
  description: string;
  /** Long-form page body. Code-managed — not exposed in the admin editor. */
  body?: ServiceSection[];
  capabilities: string[];
  icon: IconName;
  /** ISO-8601 last-edit timestamp from Supabase; absent on static fallback data. */
  updatedAt?: string;
}

export type ProjectCategory =
  | 'Web Development'
  | 'Ecommerce'
  | 'SEO'
  | 'Marketing'
  | 'Ads';

export type ProjectFilter = 'All' | ProjectCategory;

export interface ProjectResult {
  label: string;
  value: string;
}

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  /** Extra categories this project should appear under in filters (e.g. SEO). */
  secondaryCategories?: ProjectCategory[];
  description: string;
  image: string;
  images?: string[];
  technologies: string[];
  year?: string;
  overview?: string;
  challenge?: string;
  approach?: string;
  development?: string;
  marketing?: string;
  results?: ProjectResult[];
  link?: string;
  isPlaceholder?: boolean;
  /** ISO-8601 last-edit timestamp from Supabase; absent on static fallback data. */
  updatedAt?: string;
}

export interface ExperienceItem {
  id: string;
  period: string;
  role: string;
  company: string;
  description: string;
  technologies: string[];
  isPlaceholder?: boolean;
}

export interface EducationItem {
  institution: string;
  degree: string;
  field: string;
  year: string;
  description: string;
  isPlaceholder?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  content: string;
  avatar?: string;
}

export type BlogCategory =
  | 'Web Development'
  | 'SEO'
  | 'Google Ads'
  | 'Meta Ads'
  | 'Ecommerce'
  | 'Digital Marketing'
  | 'Technology'
  | 'Tutorials';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  date: string;
  readingTime: string;
  image: string;
  /**
   * Article body, one entry per block.
   *
   * An entry beginning with `## ` is rendered as an `<h2>` rather than a
   * paragraph — see `ArticleBody`. The convention exists so a heading can be
   * added without a schema change and without a second CMS field, and because
   * these posts previously shipped as ~350 words of unbroken prose with nothing
   * for a retrieval system to chunk on.
   */
  content?: string[];
  tags?: string[];
  isPlaceholder?: boolean;
  /** ISO-8601 last-edit timestamp from Supabase; absent on static fallback data. */
  updatedAt?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface TechnologyCategory {
  id: string;
  name: string;
  icon: IconName;
  items: string[];
}

/**
 * A tool as the components render it: a name plus the marks to show beside it.
 *
 * `logo` is the mark shown in light mode — either a local path in `/logos/` or
 * a URL. Marks are sized by HEIGHT with `width: auto`, so a wide wordmark
 * (WooCommerce) renders at its natural aspect instead of being crushed into a
 * square slot.
 *
 * `logoDark` is only for marks that are effectively invisible on a dark chip —
 * a near-black logo like Next.js. Everything else keeps one asset for both
 * themes, since brand colours already read against a dark surface.
 *
 * Both are optional: a tool with no mark renders as a monogram, which is the
 * intended fallback rather than an error state.
 */
export interface PlatformTool {
  name: string;
  /** Mark used in light mode. Local path or URL. */
  logo?: string;
  /** Optional replacement for dark mode, when the default is too dark to read. */
  logoDark?: string;
}

/**
 * A tool's entry in the brand-mark registry (`src/data/skills.ts`), keyed there
 * by the name shown in the UI.
 *
 * Every mark is served from `public/logos/`. These used to be hotlinked from
 * the Simple Icons CDN, which cost a couple of dozen third-party requests per
 * page load, sent every visitor's IP to that CDN, and made the section fail
 * behind a strict `Content-Security-Policy`. `slug` is kept as provenance — it
 * is what you search for when a mark needs re-fetching, and it is how these
 * files were originally obtained.
 *
 * `srcDark` is a second, white mark for a near-black logo that would otherwise
 * vanish against a dark chip. See `toPlatformTool` for how the two become a
 * `PlatformTool`.
 */
export interface ToolLogo {
  /** Simple Icons identifier, kept for provenance and re-fetching. */
  slug: string;
  /** The mark, as a path relative to `public/`. */
  src: string;
  /** Optional white variant, for a near-black mark on a dark chip. */
  srcDark?: string;
}

export interface CapabilityGroup {
  id: string;
  label: string;
  items: string[];
}

export interface EngagementOption {
  title: string;
  summary: string;
  href: string;
}
