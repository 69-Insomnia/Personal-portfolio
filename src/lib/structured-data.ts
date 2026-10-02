import { profile } from '@/data/profile';
import { site } from '@/data/seo';
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

export function personNode(): Node {
  /* Every social link is currently an empty string, so `sameAs` is omitted
     rather than emitted as `["", "", ""]` — which would be worse than absent. */
  const sameAs = Object.values(profile.socialLinks).filter(
    (href): href is string => typeof href === 'string' && href.trim().length > 0,
  );

  return {
    '@type': 'Person',
    '@id': personId,
    name: profile.name,
    jobTitle: profile.title,
    description: profile.description,
    url: site.url,
    image: `${site.url}${profile.profileImage}`,
    email: `mailto:${profile.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: locality,
      addressCountry: COUNTRY_CODE,
    },
    areaServed: [
      { '@type': 'Country', name: country },
      { '@type': 'City', name: locality },
    ],
    knowsAbout: [
      'Web Development',
      'React',
      'Next.js',
      'Search Engine Optimization',
      'Technical SEO',
      'Ecommerce',
      'Google Ads',
      'Meta Ads',
      'Conversion Optimization',
    ],
    ...(sameAs.length > 0 ? { sameAs } : {}),
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
 */
export function professionalServiceNode(): Node {
  return {
    '@type': 'ProfessionalService',
    '@id': `${site.url}/#service`,
    name: profile.name,
    description: profile.description,
    url: site.url,
    image: `${site.url}${profile.profileImage}`,
    founder: { '@id': personId },
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
 */
function isoDate(display: string): string | undefined {
  const parsed = new Date(display);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10);
}

export function articleNode(post: BlogPost): Node {
  const url = `${site.url}/blog/${post.slug}`;
  const published = isoDate(post.date);

  return {
    '@type': 'BlogPosting',
    '@id': `${url}/#article`,
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@id': personId },
    publisher: { '@id': personId },
    image: `${site.url}${post.image}`,
    articleSection: post.category,
    ...(post.tags && post.tags.length > 0 ? { keywords: post.tags.join(', ') } : {}),
    ...(published ? { datePublished: published } : {}),
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
    image: `${site.url}${project.image}`,
    creator: { '@id': personId },
    ...(project.year ? { dateCreated: project.year } : {}),
    ...(project.technologies.length > 0 ? { keywords: project.technologies.join(', ') } : {}),
  };
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
