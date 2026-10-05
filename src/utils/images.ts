/**
 * Alt text for the site's real image assets.
 *
 * These are written per asset rather than derived from the content, because
 * there is no rule that produces a useful description of a picture. The
 * previous approach — feeding `project.description` and `post.excerpt` into
 * `alt` — meant a screen reader announced a 30-word paragraph about build
 * strategy before reaching the first heading, and an image search had nothing
 * to index but marketing copy. Alt text answers "what is in this picture"; a
 * description answers "what is this project". They are not interchangeable.
 *
 * Kept as a lookup keyed by slug, rather than as an `image_alt` column on the
 * content tables, because the column would be null for every row that exists
 * today and the pages render from the database. A map works immediately for
 * both the CMS rows and the static fallback, and the fallback below covers any
 * slug added later without one.
 *
 * Every description here was written by looking at the actual file.
 */

const PROJECT_IMAGE_ALT: Record<string, string> = {
  drillthru:
    'Homepage of the DrillThru agency website, with its dark hero headline and a row of proof statistics',
  'trip-zone':
    'Homepage of the Trip Zone Travel & Tours website, with a Himalayan hero image, a destination and tour-type search, and tour package counts',
  starglobalvision:
    'Homepage of the Star Global Vision consultancy website, headed "Study Abroad & Education Consultancy in Kathmandu, Nepal" over a photograph of students',
  'poms-penthouse':
    "Featured apartments section of the POM's Penthouse booking website, showing 3 BHK, 2 BHK and 1 BHK studio options with nightly rates and a WhatsApp booking button",
};

const POST_IMAGE_ALT: Record<string, string> = {
  'technical-seo-foundations':
    'Infographic setting out six technical SEO checks in order: crawlability, clear page focus, metadata, structured data, site speed, and content last',
  'whatsapp-booking-site':
    "Infographic contrasting a booking form with a WhatsApp conversation, and the mobile-first decisions behind the POM's Penthouse build",
  'ecommerce-one-system':
    'Infographic showing the storefront, search, advertising and reporting work as four separate desks feeding one customer experience',
};

interface ImageSubject {
  slug: string;
  title: string;
  category: string;
  isPlaceholder?: boolean;
}

/**
 * The fallbacks describe the *kind* of image, which is true for every asset in
 * `public/images/` — project covers are website screenshots and article covers
 * are infographics. Vague, but accurate, which is the right trade: an alt that
 * is merely unhelpful costs nothing, and one that describes something the
 * picture does not show is a lie told to every screen reader.
 */
export function projectImageAlt(project: ImageSubject): string {
  if (project.isPlaceholder) return `Placeholder image for the ${project.title} project`;
  return (
    PROJECT_IMAGE_ALT[project.slug] ??
    `Homepage of the ${project.title} website, a ${project.category} project`
  );
}

export function postImageAlt(post: ImageSubject): string {
  if (post.isPlaceholder) return `Placeholder image for the article "${post.title}"`;
  return POST_IMAGE_ALT[post.slug] ?? `Infographic summarising the article "${post.title}"`;
}
