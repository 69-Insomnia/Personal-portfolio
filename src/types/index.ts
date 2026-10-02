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
   * Robots directives for this page. Omit to inherit the site-wide default
   * (`index, follow` in `src/app/layout.tsx`); set it to override that, which
   * is what the 404 needs — without it, Next's own `noindex` for unmatched
   * routes and the layout's `index, follow` are emitted side by side.
   */
  robots?: Metadata['robots'];
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
