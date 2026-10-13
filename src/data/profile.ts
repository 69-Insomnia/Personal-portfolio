import type { Profile } from '@/types';

export const profile: Profile = {
  name: 'Dipendra Guragain',

  /**
   * The navbar's tracked micro-type. Short enough to sit under a name at ~10px,
   * which is why it is not the full positioning line — `identity.role` in
   * `src/data/seo.ts` carries that.
   */
  title: 'Ecommerce Growth Specialist · SEO · Meta & Google Ads',

  headline: 'I Build Websites. Then I Get Them Found.',

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
    "I'm Dipendra Guragain, an ecommerce growth specialist in Kathmandu. I build online stores, fix the SEO that gets them found, and run Meta and Google Ads that turn visitors into customers.",

  location: 'Kathmandu, Nepal',

  availability: true,

  availabilityText: 'Available for Freelance & Remote Projects',

  avatar: '/images/dipendra-avatar.jpg',
  profileImage: '/images/profile.png',

  resumeUrl: '',

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
    github: 'https://github.com/guragain11',
    facebook: 'https://www.facebook.com/dipendra.guragain11',
    instagram: 'https://www.instagram.com/guragai12/',
    tiktok: '',
    youtube: '',
  },
};
