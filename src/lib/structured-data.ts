import { profile } from '@/data/profile';
import { monthlyTiers, oneOffTiers } from '@/data/pricing';
import { identity, site, socialProfiles } from '@/data/seo';
import { isoDate } from '@/utils/dates';
import type { BlogPost, Project, Service } from '@/types';

/**
 * Schema.org nodes for the site.
 *
 * Split from the `JsonLd` component so pages can compose a graph without
 * each one re-declaring the entity ids. Everything references `#person` and
 * `#website` by `@id` rather than repeating the properties inline, which is
 * what lets Google resolve them as one entity instead of several unrelated
 * ones.
 *
 * A note on what is deliberately absent:
 *  - No `FAQPage`. Google retired FAQ rich results for all sites in May 2026,
 *    so it would earn nothing and can be read as markup for a feature that no
 *    longer exists.
 *  - No `streetAddress`. There is no public business address to publish, and
 *    inventing one is both dishonest and a spam signal. `addressLocality` plus
 *    `areaServed` carries the geographic intent instead.
 *  - No `aggregateRating`. There are no collected reviews behind it.
 */

type Node = Record<string, unknown>;

export const personId = `${site.url}/#person`;
export const websiteId = `${site.url}/#website`;

/** Splits "Kathmandu, Nepal" into the locality and country schema wants. */
const [locality = profile.location, country = 'Nepal'] = profile.location
  .split(',')
  .map((part) => part.trim());

const COUNTRY_CODE = 'NP';

/**
 * The skills this person is claiming, and each one is backed by something a
 * visitor can check on this site: a service page, a project that used the
 * technology, or both. `knowsAbout` is a claim about expertise, so the list is
 * kept to things the site actually demonstrates rather than a keyword dump —
 * every entry below appears in the Services grid, the Technologies section or a
 * case study's technology list.
 *
 * `Search Engine Optimization` and `Technical SEO` are both present because
 * they are genuinely different queries; the rest are named as people search
 * for them rather than as schema.org types.
 */
const KNOWS_ABOUT = [
  'Web Development',
  'React',
  'Next.js',
  'WordPress',
  'Shopify',
  'WooCommerce',
  'Ecommerce Development',
  'Search Engine Optimization',
  'Technical SEO',
  'Local SEO',
  'Ecommerce SEO',
  'AI Search Optimization',
  'Google Ads',
  'Meta Ads',
  'Digital Marketing',
  'Conversion Optimization',
];

export function personNode(socials?: string[]): Node {
  /* `socialProfiles` filters the empties, so `sameAs` is omitted entirely
     rather than emitted as `["", "", ""]` — which would be worse than absent.

     `socials` comes from `site_settings.social_links` when the admin has set
     any, and `socialProfiles` (built from `src/data/profile.ts`) otherwise.
     The caller passes it rather than this function reading the database,
     because `SiteJsonLd` renders inside the client tree — see the note on
     `SiteChrome` — and a client component cannot await a server read. The
     root layout does the read and threads the value down. */
  const sameAs = socials && socials.length > 0 ? socials : socialProfiles;

  return {
    '@type': 'Person',
    '@id': personId,
    name: identity.name,
    /**
     * `identity.role`, not `profile.title`. The navbar renders a shortened
     * title ("Web Developer · SEO · Digital Growth") because it has to fit
     * under a name at 10px; that string was being published as this person's
     * `jobTitle`, so the entity described itself differently from every heading
     * and meta description on the site.
     */
    jobTitle: identity.role,
    description: profile.description,
    url: site.url,
    image: `${site.url}${profile.profileImage}`,
    email: `mailto:${profile.email}`,
    ...(identity.telephone ? { telephone: identity.telephone } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: locality,
      addressCountry: COUNTRY_CODE,
    },
    areaServed: [
      { '@type': 'Country', name: country },
      { '@type': 'City', name: locality },
    ],
    knowsAbout: KNOWS_ABOUT,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

/**
 * The `/about` page, declared as being about the Person above.
 *
 * `ProfilePage` is the type Google documents for exactly this shape, and
 * `mainEntity` is what ties the page to `#person` rather than leaving a search
 * engine to infer from prose that the page and the entity are the same thing.
 * It is emitted on /about only — a ProfilePage node on every route would claim
 * the whole site is a profile.
 */
export function profilePageNode(): Node {
  return {
    '@type': 'ProfilePage',
    '@id': `${site.url}/about#profilepage`,
    url: `${site.url}/about`,
    name: `About ${identity.name} — ${identity.role}`,
    isPartOf: { '@id': websiteId },
    mainEntity: { '@id': personId },
    about: { '@id': personId },
    inLanguage: 'en',
  };
}

export function websiteNode(): Node {
  return {
    '@type': 'WebSite',
    '@id': websiteId,
    name: site.name,
    url: site.url,
    inLanguage: site.locale.replace('_', '-'),
    publisher: { '@id': personId },
  };
}

/**
 * The service-area business, so "web developer Nepal" reads as a geographic
 * match rather than a person who happens to mention the country.
 *
 * `ProfessionalService` rather than `LocalBusiness` because there is no
 * storefront to visit; `areaServed` is what makes a service-area business
 * legitimate without a street address.
 *
 * The telephone number is included because it is displayed on the contact page
 * and in the footer, and a local service business that shows a number while
 * omitting it from its own structured data is leaving its strongest local
 * signal on the floor. `priceRange` and `geo` are still deliberately absent:
 * no pricing is published anywhere on the site, and inventing coordinates would
 * assert a physical location that does not exist. See the module note above.
 */
export function professionalServiceNode(): Node {
  return {
    '@type': 'ProfessionalService',
    '@id': `${site.url}/#service`,
    name: identity.name,
    description: profile.description,
    url: site.url,
    image: `${site.url}${profile.profileImage}`,
    founder: { '@id': personId },
    ...(identity.telephone ? { telephone: identity.telephone } : {}),
    ...(identity.email ? { email: `mailto:${identity.email}` } : {}),
    areaServed: [
      { '@type': 'Country', name: country },
      { '@type': 'City', name: locality },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: locality,
      addressCountry: COUNTRY_CODE,
    },
    knowsLanguage: ['en', 'ne'],
  };
}

/**
 * The content dates on this site are display strings ("9 August 2026"), not
 * ISO-8601. Parsing is guarded and the property is dropped when it does not
 * resolve, because an invalid `datePublished` is worse than an absent one.
 * `isoDate` is shared with the sitemap, which needs the same conversion.
 */
export function articleNode(post: BlogPost): Node {
  const url = `${site.url}/blog/${post.slug}`;
  const published = isoDate(post.date);
  const modified = isoDate(post.updatedAt);

  /**
   * Emitted only when it genuinely differs from the publish date. A
   * `dateModified` identical to `datePublished` carries no information, and
   * repeating the same value in both is the shape of markup that was filled in
   * mechanically rather than because anything was edited.
   */
  const edited = modified && modified !== published ? modified : undefined;

  return {
    '@type': 'BlogPosting',
    '@id': `${url}/#article`,
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@id': websiteId },
    author: { '@id': personId },
    /* A Person rather than an Organization, and that is the honest answer:
       there is no company behind this site, and minting an Organization node
       purely to satisfy the shape of Google's Article example would describe a
       business that does not exist. `publisher` accepts either. */
    publisher: { '@id': personId },
    image: `${site.url}${post.image}`,
    articleSection: post.category,
    ...(post.tags && post.tags.length > 0 ? { keywords: post.tags.join(', ') } : {}),
    ...(published ? { datePublished: published } : {}),
    ...(edited ? { dateModified: edited } : {}),
    inLanguage: 'en',
  };
}

export function serviceNode(service: Service): Node {
  const url = `${site.url}/services/${service.slug}`;

  return {
    '@type': 'Service',
    '@id': `${url}/#service`,
    name: service.title,
    description: service.description,
    serviceType: service.title,
    url,
    isPartOf: { '@id': websiteId },
    provider: { '@id': personId },
    areaServed: [
      { '@type': 'Country', name: country },
      { '@type': 'City', name: locality },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${service.title} capabilities`,
      itemListElement: service.capabilities.map((capability) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: capability },
      })),
    },
  };
}

export function projectNode(project: Project): Node {
  const url = `${site.url}/work/${project.slug}`;

  return {
    '@type': 'CreativeWork',
    '@id': `${url}/#project`,
    name: project.title,
    description: project.description,
    url,
    isPartOf: { '@id': websiteId },
    image: `${site.url}${project.image}`,
    creator: { '@id': personId },
    ...(project.year ? { dateCreated: project.year } : {}),
    ...(project.technologies.length > 0 ? { keywords: project.technologies.join(', ') } : {}),
  };
}

/**
 * Normalises the admin's custom JSON-LD into graph nodes.
 *
 * The column accepts an object or an array of objects (the migration's check
 * constraint rejects anything else), and the graph wants an array either way.
 *
 * Anything that is not an object is dropped rather than emitted. The database
 * constraint already prevents a bare scalar reaching here, but this is also
 * the function that runs against a value typed by hand into a textarea, so it
 * filters rather than trusts — a stray `null` inside an array would otherwise
 * serialise into the `@graph` as a node no validator can parse.
 */
export function customJsonLdNodes(value: unknown): Node[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value.filter(
      (node): node is Node => node !== null && typeof node === 'object' && !Array.isArray(node),
    );
  }
  if (typeof value === 'object') return [value as Node];
  return [];
}

export function breadcrumbNode(items: Array<{ name: string; path: string }>): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}

/**
 * The published starting prices, as an `OfferCatalog` on the `/pricing` page.
 *
 * **Returns `undefined` when no price is set, and the page emits nothing.**
 * That is the whole design of this function. An `OfferCatalog` whose every
 * `Offer` has no price is not a neutral absence — it is markup that asserts a
 * catalogue exists and then declines to say what anything costs, which is a
 * worse signal than saying nothing at all. The moment a real figure is filled
 * into `src/data/pricing.ts`, this begins emitting on its own.
 *
 * `minPrice` inside a `PriceSpecification`, rather than a bare `price`. Every
 * figure on that page is a floor, not a quote — "from NPR 45,000" — and a
 * plain `price` property would state it as the actual cost. `minPrice` is the
 * property schema.org provides for exactly this, and getting it wrong is the
 * kind of inaccuracy that a price-sensitive query is most likely to expose.
 *
 * Attached to `#service` by `@id` rather than restated, so the catalogue and
 * the business stay one entity. `serviceSlug` links an offer to its service
 * page where one exists; the audit and the SEO audit both point at internal
 * linking between these pages as the cluster's weakest part.
 */
export function pricingOffersNode(): Node | undefined {
  const priced = [...oneOffTiers, ...monthlyTiers].filter(
    (tier): tier is typeof tier & { fromNpr: number } => tier.fromNpr !== null,
  );

  if (priced.length === 0) return undefined;

  return {
    '@type': 'OfferCatalog',
    '@id': `${site.url}/pricing#offers`,
    name: `Starting prices — ${identity.name}`,
    url: `${site.url}/pricing`,
    isPartOf: { '@id': websiteId },
    provider: { '@id': personId },
    itemListElement: priced.map((tier) => ({
      '@type': 'Offer',
      name: tier.name,
      url: tier.serviceSlug ? `${site.url}/services/${tier.serviceSlug}` : `${site.url}/pricing`,
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'NPR',
        minPrice: tier.fromNpr,
      },
    })),
  };
}
