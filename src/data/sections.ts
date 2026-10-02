/**
 * Single source of truth for the section eyebrow registry and the home page's
 * ordered sections.
 *
 * The eyebrow index is DERIVED from the home-page position rather than
 * hand-typed, so inserting, removing or reordering a section renumbers
 * everything downstream automatically. Previously the index/label were string
 * literals duplicated across 17 section files, which silently drifted out of
 * sync with render order.
 *
 * Keep the `home: true` entries in the same order as the JSX in
 * `src/app/page.tsx`.
 */

export type ChapterId = 'intro' | 'capabilities' | 'work' | 'background' | 'engage';

export interface SectionMeta {
  /** Anchor id, matching the `id` prop on the rendered `<Section>`. */
  id: string;
  /** Two-digit eyebrow index, derived from home-page position. */
  index: string;
  /** Eyebrow label. */
  label: string;
  /** Short name for the chapter nav, where space is tight. */
  navLabel: string;
  chapter: ChapterId;
}

export const chapterLabels: Record<ChapterId, string> = {
  intro: 'Introduction',
  capabilities: 'Capabilities',
  work: 'Work & Services',
  background: 'Background',
  engage: 'Work Together',
};

export const chapterOrder: ChapterId[] = [
  'intro',
  'capabilities',
  'work',
  'background',
  'engage',
];

/**
 * Every section id the site knows about, in the order the HOME page renders
 * them. `home: false` marks a section that still renders on a subpage — /about
 * and /work reuse Philosophy, Education and Work With Me — but no longer sits
 * in the home-page run.
 *
 * They stay in the registry because `SectionLabel` resolves its copy through
 * `getSection()` and that throws on an unknown id. Dropping them here would
 * crash /about and /work rather than quietly un-number them.
 */
const sectionOrder = [
  { id: 'about', label: 'About Me', navLabel: 'About', chapter: 'intro', home: true },
  /* Work sits directly under the intro. It is the proof, and it used to be
     buried under three explanatory sections — the thing a visitor most wants
     to see was a full scroll away. */
  { id: 'work', label: 'Selected Work', navLabel: 'Work', chapter: 'work', home: true },
  { id: 'services', label: 'Services', navLabel: 'Services', chapter: 'capabilities', home: true },
  { id: 'approach', label: 'Approach', navLabel: 'Approach', chapter: 'capabilities', home: true },
  { id: 'technologies', label: 'Stack', navLabel: 'Stack', chapter: 'capabilities', home: true },
  { id: 'experience', label: 'Journey', navLabel: 'Experience', chapter: 'background', home: true },
  { id: 'insights', label: 'Insights', navLabel: 'Insights', chapter: 'background', home: true },
  { id: 'testimonials', label: 'Testimonials', navLabel: 'Testimonials', chapter: 'engage', home: true },
  { id: 'faq', label: 'FAQ', navLabel: 'FAQ', chapter: 'engage', home: true },
  { id: 'contact', label: 'Contact', navLabel: 'Contact', chapter: 'engage', home: true },

  { id: 'philosophy', label: 'Philosophy', navLabel: 'Philosophy', chapter: 'background', home: false },
  { id: 'education', label: 'Education', navLabel: 'Education', chapter: 'background', home: false },
  { id: 'work-with-me', label: 'Work With Me', navLabel: 'Work With Me', chapter: 'engage', home: false },
] as const;

/** The numbered run — home page only. Index follows home position, not registry position. */
export const homeSections: SectionMeta[] = sectionOrder
  .filter((section) => section.home)
  .map((section, position) => ({
    ...section,
    index: String(position + 1).padStart(2, '0'),
  }));

const byId = new Map<string, Omit<SectionMeta, 'index'>>(
  sectionOrder.map((section) => [section.id, section] as const),
);

/**
 * Stable id list for `useActiveSection`. Module-level so the reference never
 * changes between renders — the hook uses it as an effect dependency.
 */
export const homeSectionIds: string[] = homeSections.map((section) => section.id);

/**
 * Throws on an unknown id so a typo fails the build instead of silently
 * rendering an empty eyebrow. Subpage-only sections resolve here too, with an
 * empty index — they are never numbered.
 */
export function getSection(id: string): SectionMeta {
  const section = byId.get(id);

  if (!section) {
    throw new Error(
      `Unknown section id "${id}". Add it to sectionOrder in src/data/sections.ts.`,
    );
  }

  const indexed = homeSections.find((s) => s.id === id);
  return { ...section, index: indexed?.index ?? '' };
}

export function sectionsInChapter(chapter: ChapterId): SectionMeta[] {
  return homeSections.filter((section) => section.chapter === chapter);
}
