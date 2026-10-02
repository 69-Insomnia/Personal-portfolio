import {
  personNode,
  professionalServiceNode,
  websiteNode,
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
 */
export function SiteJsonLd() {
  return <JsonLd graph={[personNode(), websiteNode(), professionalServiceNode()]} />;
}
