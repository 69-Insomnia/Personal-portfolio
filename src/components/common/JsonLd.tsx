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
 *
 * `socialLinks` arrives from the root layout rather than being read here,
 * because this renders inside the client tree and the admin's social handles
 * live in the database. Omitting it falls back to the repo's
 * `profile.socialLinks` — see `personNode`.
 */
export function SiteJsonLd({ socialLinks }: { socialLinks?: string[] } = {}) {
  return (
    <JsonLd graph={[personNode(socialLinks), websiteNode(), professionalServiceNode()]} />
  );
}
