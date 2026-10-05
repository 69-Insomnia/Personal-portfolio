/**
 * Turns a title into a URL slug.
 *
 * Matches the shape the database enforces (`slug = lower(slug)`, no leading or
 * trailing slash) and the shape every existing slug in this project already
 * has, so a generated slug never trips a check constraint on save.
 *
 * The apostrophe strip is the one rule worth calling out. `POM's Penthouse`
 * has to become `poms-penthouse` and not `pom-s-penthouse` or `pom's-penthouse`
 * — the first is what the live URL already is, and the other two would be a
 * silent URL change on a page that ranks. Both a straight and a typographic
 * apostrophe are stripped, because which one arrives depends on whether the
 * title was typed or pasted.
 *
 * Diacritics are decomposed and dropped rather than transliterated, so
 * `Pokharā` becomes `pokhara`. Transliteration would need a per-language table
 * and this site is written in English; NFKD covers the cases that actually
 * occur.
 *
 * Truncation happens *before* the trailing-dash trim, not after. Slicing at 80
 * characters can land mid-separator and leave `...-seo-` behind, so the trim
 * has to run last to be the thing that guarantees the invariant.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    // Combining marks left behind by the decomposition above. Written as
    // escapes rather than as literal marks: the literal range is invisible in
    // an editor and reordering it silently breaks the strip.
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

/**
 * Whether a slug is one the database will accept.
 *
 * Mirrors the `*_slug_lowercase` check constraints in the migrations. The form
 * validates against this before saving so the admin sees a labelled field
 * error instead of a raw Postgres constraint violation.
 */
export function isValidSlug(slug: string): boolean {
  return (
    slug.length > 0 &&
    slug.length <= 80 &&
    slug === slug.toLowerCase() &&
    !slug.startsWith('/') &&
    !slug.endsWith('/') &&
    /^[a-z0-9-]+$/.test(slug)
  );
}
