import type { Profile } from '@/types';

export const profile: Profile = {
  name: 'Dipendra Guragain',

  title: 'Web Developer · SEO · Digital Growth',

  headline: 'I Build Websites. Then I Get Them Found.',

  description:
    "I'm a web developer in Kathmandu. I build the site, then do the search and paid work that brings people to it, and stay long enough to see what they actually do.",

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
