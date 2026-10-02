import type { PlatformTool, TechnologyCategory, ToolLogo } from '@/types';

const SIMPLE_ICONS = 'https://cdn.simpleicons.org';

/**
 * Brand mark for every tool the site names, keyed by the name shown in the UI.
 *
 * `slug` is a Simple Icons identifier, which the CDN serves in the brand's own
 * colour. Two entries carry a `src` instead, because the CDN doesn't publish
 * those marks at all — they're checked into `public/logos/`. See that folder's
 * README before adding more.
 *
 * `white` fetches a second, white mark for dark chips. It is set only where the
 * brand mark is near-black and would otherwise vanish against a dark surface;
 * every other brand colour already reads on both, so this stays the exception
 * rather than the rule.
 *
 * A name absent from this map is not an error — `ToolMark` falls back to a
 * lettered monogram. `Meta Pixel` relies on that today: Simple Icons has never
 * carried a mark for it.
 *
 * NOTE: the CDN entries are hotlinks, so the Hero and the Technologies section
 * together make a couple of dozen third-party requests per page load, and the
 * visitor's IP reaches that CDN. Downloading these into `public/logos/` and
 * changing each entry to `{ slug, src: '/logos/<slug>.svg' }` is the production
 * fix, and is the only edit the components need.
 */
export const toolLogos: Record<string, ToolLogo> = {
  React: { slug: 'react' },
  'Next.js': { slug: 'nextdotjs', white: true },
  JavaScript: { slug: 'javascript' },
  TypeScript: { slug: 'typescript' },
  HTML: { slug: 'html5' },
  CSS: { slug: 'css' },
  'Tailwind CSS': { slug: 'tailwindcss' },

  'Node.js': { slug: 'nodedotjs' },
  'Express.js': { slug: 'express', white: true },
  PHP: { slug: 'php' },

  MongoDB: { slug: 'mongodb' },
  MySQL: { slug: 'mysql' },

  WordPress: { slug: 'wordpress' },
  WooCommerce: { slug: 'woocommerce' },
  Shopify: { slug: 'shopify' },

  'Google Ads': { slug: 'googleads' },
  'Meta Ads': { slug: 'meta' },
  'Google Analytics': { slug: 'googleanalytics' },
  'Google Tag Manager': { slug: 'googletagmanager' },
  'Search Console': { slug: 'googlesearchconsole' },
  /* The Hero panel is half the viewport wide, so its strip uses the short forms
     of the three long Google names. Same marks, different label. */
  Analytics: { slug: 'googleanalytics' },
  'Tag Manager': { slug: 'googletagmanager' },

  Figma: { slug: 'figma' },
  Photoshop: { slug: 'adobephotoshop', src: '/logos/adobephotoshop.svg' },
  Canva: { slug: 'canva', src: '/logos/canva.svg' },
};

/**
 * Resolves a tool name to the marks the components render.
 *
 * An unregistered name yields `{ name }` with no `logo`, which `ToolMark` draws
 * as a monogram — a missing mark degrades to a lettered tile rather than a
 * broken image, so a new tool added to a category list is never a crash.
 */
export function toPlatformTool(name: string): PlatformTool {
  const logo = toolLogos[name];
  if (!logo) return { name };

  return {
    name,
    logo: logo.src ?? `${SIMPLE_ICONS}/${logo.slug}`,
    logoDark: logo.white ? `${SIMPLE_ICONS}/${logo.slug}/FFFFFF` : undefined,
  };
}

/**
 * The Hero dashboard's "platforms & tools" strip.
 *
 * Ordered by how the Hero's owner thinks about them — storefront, then code,
 * then the measurement stack — rather than alphabetically, and the same ten
 * chips the Hero has always carried.
 */
export const platformTools: PlatformTool[] = [
  'Shopify',
  'WooCommerce',
  'WordPress',
  'Next.js',
  'PHP',
  'Google Ads',
  'Meta Ads',
  'Analytics',
  'Tag Manager',
  'Search Console',
].map(toPlatformTool);

export const technologyCategories: TechnologyCategory[] = [
  {
    id: 'frontend',
    name: 'Frontend',
    icon: 'code',
    items: ['React', 'Next.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS'],
  },
  {
    id: 'backend',
    name: 'Backend',
    icon: 'server',
    items: ['Node.js', 'Express.js', 'PHP'],
  },
  {
    id: 'database',
    name: 'Database',
    icon: 'database',
    items: ['MongoDB', 'MySQL'],
  },
  {
    id: 'cms',
    name: 'CMS & Ecommerce',
    icon: 'shopping-bag',
    items: ['WordPress', 'WooCommerce', 'Shopify'],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: 'megaphone',
    items: [
      'Google Ads',
      'Meta Ads',
      'Google Analytics',
      'Google Tag Manager',
      'Search Console',
      'Meta Pixel',
    ],
  },
  {
    id: 'design',
    name: 'Design',
    icon: 'palette',
    items: ['Figma', 'Photoshop', 'Canva'],
  },
];

/**
 * Web development capabilities.
 *
 * This used to list the tools — React, Next.js, JavaScript, TypeScript, PHP,
 * WordPress, Shopify — while every other service listed what it delivers
 * ("Technical SEO", "Conversion Optimization", "Core Web Vitals"). On the
 * /services grid that made the first card read in a different register from
 * the six beside it: one was a tech list, the rest were offerings. The stack
 * has its own section on the home page; what a service card owes the reader is
 * what the service gets them.
 */
export const webDevelopmentCapabilities: string[] = [
  'Custom Websites',
  'Web Applications',
  'Ecommerce Stores',
  'Landing Pages',
  'WordPress',
  'Shopify',
  'Headless CMS',
  'API Integration',
  'Site Speed',
];

export const seoCapabilities: string[] = [
  'Technical SEO',
  'Keyword Research',
  'On-Page SEO',
  'Content SEO',
  'Ecommerce SEO',
  'Local SEO',
  'Schema',
  'Internal Linking',
  'Core Web Vitals',
];

export const metaAdsCapabilities: string[] = [
  'Facebook Ads',
  'Instagram Ads',
  'Retargeting',
  'Lead Generation',
  'Ecommerce Ads',
  'Creative Testing',
  'Meta Pixel',
];

export const googleAdsCapabilities: string[] = [
  'Search Ads',
  'Display Ads',
  'YouTube Ads',
  'Remarketing',
  'Conversion Tracking',
  'Keyword Strategy',
  'Google Tag Manager',
];

export const ecommerceCapabilities: string[] = [
  'Shopify',
  'WooCommerce',
  'Product SEO',
  'Conversion Optimization',
  'Meta Ads',
  'Google Ads',
  'Analytics',
  'Retargeting',
];

export const digitalMarketingCapabilities: string[] = [
  'Content',
  'Search',
  'Advertising',
  'Conversion',
  'Analytics',
];

/**
 * AI search capabilities.
 *
 * The acronyms live here as named capabilities rather than as separate service
 * pages. They are alternate labels for overlapping work, and Google's own AI
 * optimisation guide describes AEO and GEO as "rebranded labels" for SEO — so
 * five near-identical pages targeting them would be thin duplicate content
 * rather than five ranking opportunities.
 */
export const aiSearchCapabilities: string[] = [
  'AI Overviews',
  'ChatGPT & Perplexity',
  'Generative Engine Optimization',
  'Answer Engine Optimization',
  'Citable Passages',
  'Entity & Brand Signals',
  'Structured Data',
  'AI Crawler Access',
];

export const growthFlowSteps: string[] = [
  'Website',
  'SEO',
  'Traffic',
  'Conversion',
  'Customer',
  'Growth',
];

/**
 * The one flow the merged Services band shows. The old page ran three of these
 * (search, paid, ecommerce) in three separate sections, which said the same
 * thing three times — a customer walks one path, not three.
 */
export const serviceFlowSteps: string[] = [
  'Website',
  'Search',
  'Ads',
  'Conversion',
  'Repeat Customer',
];
