import type { PlatformTool, TechnologyCategory, ToolLogo } from '@/types';

/**
 * Brand mark for every tool the site names, keyed by the name shown in the UI.
 *
 * Every mark is a file in `public/logos/`. These used to be hotlinked from the
 * Simple Icons CDN, which cost a couple of dozen third-party requests per page
 * load, handed every visitor's IP to a CDN with no other business with it, and
 * broke the section behind a strict `Content-Security-Policy`. `slug` is kept
 * as provenance — it is what you search for when a mark needs re-fetching. See
 * `public/logos/README.md`.
 *
 * `srcDark` is a second, white mark for dark chips. It is set only where the
 * brand mark is near-black and would otherwise vanish against a dark surface;
 * every other brand colour already reads on both, so this stays the exception
 * rather than the rule.
 *
 * A name absent from this map is not an error — `ToolMark` falls back to a
 * lettered monogram. `Meta Pixel` relies on that today: Simple Icons has never
 * carried a mark for it.
 */
export const toolLogos: Record<string, ToolLogo> = {
  React: { slug: 'react', src: '/logos/react.svg' },
  'Next.js': { slug: 'nextdotjs', src: '/logos/nextdotjs.svg', srcDark: '/logos/nextdotjs-white.svg' },
  JavaScript: { slug: 'javascript', src: '/logos/javascript.svg' },
  TypeScript: { slug: 'typescript', src: '/logos/typescript.svg' },
  HTML: { slug: 'html5', src: '/logos/html5.svg' },
  CSS: { slug: 'css', src: '/logos/css.svg' },
  'Tailwind CSS': { slug: 'tailwindcss', src: '/logos/tailwindcss.svg' },

  'Node.js': { slug: 'nodedotjs', src: '/logos/nodedotjs.svg' },
  'Express.js': { slug: 'express', src: '/logos/express.svg', srcDark: '/logos/express-white.svg' },
  PHP: { slug: 'php', src: '/logos/php.svg' },

  MongoDB: { slug: 'mongodb', src: '/logos/mongodb.svg' },
  MySQL: { slug: 'mysql', src: '/logos/mysql.svg' },

  WordPress: { slug: 'wordpress', src: '/logos/wordpress.svg' },
  WooCommerce: { slug: 'woocommerce', src: '/logos/woocommerce.svg' },
  Shopify: { slug: 'shopify', src: '/logos/shopify.svg' },

  'Google Ads': { slug: 'googleads', src: '/logos/googleads.svg' },
  'Meta Ads': { slug: 'meta', src: '/logos/meta.svg' },
  'Google Analytics': { slug: 'googleanalytics', src: '/logos/googleanalytics.svg' },
  'Google Tag Manager': { slug: 'googletagmanager', src: '/logos/googletagmanager.svg' },
  'Search Console': { slug: 'googlesearchconsole', src: '/logos/googlesearchconsole.svg' },
  /* The Hero panel is half the viewport wide, so its strip uses the short forms
     of the three long Google names. Same marks, different label. */
  Analytics: { slug: 'googleanalytics', src: '/logos/googleanalytics.svg' },
  'Tag Manager': { slug: 'googletagmanager', src: '/logos/googletagmanager.svg' },

  Figma: { slug: 'figma', src: '/logos/figma.svg' },
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
    logo: logo.src,
    logoDark: logo.srcDark,
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
