import {
  customJsonLdNodes,
  personNode,
  professionalServiceNode,
  websiteNode,
  type PersonOverrides,
} from '@/lib/structured-data';

/**
 * Renders a JSON-LD graph.
 *
 * This emits **only** the nodes it is given. The site-wide entity graph is
 * emitted once by `SiteJsonLd` below, and pages reference those entities by
 * `@id` rather than restating them. An earlier version had this component
 * always prepend the base graph, which meant every page emitted Person,
 * WebSite and ProfessionalService a second time — harmless, since Google
 * merges identical `@id`s, but duplicated markup on every URL.
 */
export function JsonLd({ graph }: { graph: object[] }) {
  const data = { '@context': 'https://schema.org', '@graph': graph };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * The base entity graph: who this is, what the site is, and the service-area
 * business. Mounted once, from `SiteChrome`.
 *
 * Every value here arrives from the root layout rather than being read in this
 * component, because this renders inside the client tree and the admin's
 * settings live in the database. Omission is always safe: each falls back to
 * the repo constant, so a site with an unreachable database and a site whose
 * admin has never opened the SEO panel both emit exactly what they emitted
 * before these props existed.
 *
 * `customJsonLd` is the *site-wide* field from `site_settings`. Per-page
 * custom nodes are a separate column on `seo_meta`, merged by each page as
 * `customJsonLdNodes(seoMeta?.customJsonLd)` — see `services/[slug]/page.tsx`.
 * This one used to have no consumer at all.
 */
export function SiteJsonLd({
  socialLinks,
  person,
  customJsonLd,
}: {
  socialLinks?: string[];
  /** Admin overrides for the Person node. See `PersonOverrides`. */
  person?: Omit<PersonOverrides, 'socials'>;
  customJsonLd?: unknown;
} = {}) {
  return (
    <JsonLd
      graph={[
        personNode({ socials: socialLinks, ...person }),
        websiteNode(),
        professionalServiceNode(),
        ...customJsonLdNodes(customJsonLd),
      ]}
    />
  );
}
