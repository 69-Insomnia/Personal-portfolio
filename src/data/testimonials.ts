import type { Testimonial } from '@/types';

/**
 * Client project cards for the "What Clients Say" section.
 * Content is a short factual description of each delivered project — no
 * invented quotes, metrics or names. Replace content with real client
 * words whenever they are available.
 */
export const testimonials: Testimonial[] = [
  {
    id: 'drillthru',
    name: 'DrillThru',
    role: 'Web Design & SEO',
    company: 'drillthru.tech',
    content:
      'Agency website delivered on Next.js: services, work showcase, testimonials, blog and FAQ, with organization, website and FAQ structured data wired in for search.',
    avatar: '/images/clients/drillthru.png',
  },
  {
    id: 'trip-zone',
    name: 'Trip Zone Travel & Tours',
    role: 'Web Development',
    company: 'trip-zone-travel-tours.vercel.app',
    content:
      'Travel site with a mega-dropdown tours catalogue, package cards carrying location, route and price detail, trust stats and a floating WhatsApp booking path on a green-and-navy identity.',
    avatar: '/images/clients/tripzone.png',
  },
  {
    id: 'starglobalvision',
    name: 'Star Global Vision',
    role: 'Web Development',
    company: 'starglobalvision.com',
    content:
      'Consultancy website covering fourteen destinations, test-prep courses, success stories and a free-counselling booking flow, built in React with business structured data for search.',
    avatar: '/images/clients/starglobalvision.png',
  },
  {
    id: 'poms-penthouse',
    name: "POM's Penthouse",
    role: 'Web Development',
    company: 'pomspenthouse.com',
    content:
      'Mobile-first booking site for a Lakeside, Pokhara residence: apartment comparison with amenities and nightly rates, photo gallery and direct WhatsApp reservations.',
    avatar: '/images/clients/poms-penthouse.png',
  },
];
