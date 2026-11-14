import type { Profile } from '@/types';

export const profile: Profile = {
  name: 'Dipendra Guragain',

  /**
   * The navbar's tracked micro-type. Short enough to sit under a name at ~10px,
   * which is why it is not the full positioning line — `identity.role` in
   * `src/data/seo.ts` carries that.
   */
  title: 'Ecommerce Growth Expert',

  headline: 'I help ecommerce brands in Kathmandu and Nepal grow with SEO, Shopify and WooCommerce optimisation, and stronger conversion performance.',

  /**
   * The one sentence that describes what this is, reused rather than rewritten
   * in four places. It feeds the hero's intro paragraph, the `Person` and
   * `ProfessionalService` nodes, and `/llms.txt`.
   *
   * That reuse is the point. Search engines and AI assistants resolve an entity
   * by seeing the same claim repeated consistently; the previous version
   * described a web developer in one place and an ecommerce specialist in
   * another, which is a mixed signal rather than a rich one.
   *
   * Kept grammatically self-contained so it survives being lifted out of the
   * page — it is the most quotable sentence on the site.
   */
  description:
    "I'm Dipendra Guragain, an ecommerce growth specialist in Kathmandu, Nepal. I help online stores get found on Google, convert more visitors, and grow revenue through SEO, Shopify and WooCommerce optimisation, conversion rate optimisation, and Google and Meta Ads.",

  location: 'Kathmandu, Nepal',

  availability: true,

  /**
   * The one-line status, used in the mobile menu, the contact page and the
   * about page's sidebar.
   *
   * This used to read "Available for Freelance & Remote Projects", and it
   * appeared after "Based in Kathmandu, Nepal." — which, strung together, was
   * very close to the reference site's "Based in Kathmandu, Nepal. Taking on a
   * small number of ecommerce engagements at a time."
   *
   * The location half is now carried by `location` itself (the footer, the
   * contact card and the Google Maps link all state it) rather than being
   * restated in front of every status line.
   */
  availabilityText: 'Available for ecommerce growth projects',

  avatar: '/images/dipendra-avatar.jpg',
  profileImage: '/images/profile.png',
  /**
   * The hero portrait. Background-removed to transparent (rembg) so the figure
   * sits flush on the cream card and rests on the marigold base bar. Re-run the
   * cutout if `profile.png` changes; the hero falls back to `profileImage` if
   * this is ever unset.
   */
  profileImageCutout: '/images/profile-cutout.png',

  email: 'guragaidipendra6@gmail.com',

  whatsapp: '+977-9840814142',

  /**
   * Feeds `sameAs` in the Person structured data, so Google and AI assistants
   * can resolve these profiles as the same entity as this site. Brand mentions
   * off-site correlate with AI visibility far more strongly than backlinks do,
   * which is why an empty object here was the single biggest gap.
   */
  socialLinks: {
    linkedin: 'https://www.linkedin.com/in/dipendra-guragain-88988a272',
    github: 'https://github.com/69-Insomnia',
    facebook: 'https://www.facebook.com/dipendra.guragain11',
    instagram: 'https://www.instagram.com/guragai12/',
  },
};
