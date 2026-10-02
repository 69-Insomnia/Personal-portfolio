import type { Project, ProjectCategory, ProjectFilter } from '@/types';

export const projectFilters: ProjectFilter[] = [
  'All',
  'Web Development',
  'SEO',
  'Marketing',
];

/**
 * Real project case studies, newest first.
 * Do not publish results, metrics or client names that are not real.
 */
export const projects: Project[] = [
  {
    slug: 'drillthru',
    title: 'DrillThru',
    category: 'Web Development',
    secondaryCategories: ['SEO', 'Marketing'],
    description:
      'Agency website for DrillThru: web design, development, SEO and ads services presented with proof stats, a proven-framework process, a work showcase and enquiry paths.',
    image: '/images/project-drillthru.png',
    technologies: ['Next.js', 'Technical SEO', 'Digital Marketing'],
    overview:
      'The website for DrillThru, a web design and digital marketing agency serving businesses in Kathmandu and across Nepal. It has to sell two things at once: the craft, since the site itself is the portfolio, and the growth story behind it. Services span web design and development, SEO, Google Ads, Meta Ads, brand identity and performance optimization, backed by a trust band (50+ projects delivered, 98% client satisfaction, 3x average ROI, 24/7 support), a proven-framework process section, a work showcase featuring Pent House, Consultancy Hunt, Ticket Nepal and VELURA, testimonials, a blog and a frequently-asked-questions block.',
    challenge:
      'An agency site competes with every other Nepali web shop on the same keywords, so looking capable is not enough. It has to demonstrate outcomes. The page needed to make web development, search and paid-media services legible to a business owner in seconds, prove them with work and testimonials, and turn that trust into an enquiry without adding friction.',
    approach:
      'A black-and-lime identity runs from the hero line ("Web design & development that drills through the competition") into every section. Two CTAs (Start Your Project, View Our Work) split ready-to-buy and still-browsing visitors, while floating Enquire Now and WhatsApp widgets keep a contact path on screen at all times. Proof is layered in order: trust stats under the hero, Our Proven Framework as the process, then work, testimonials and FAQ before the closing contact band.',
    development:
      'Built as a Next.js application, with Organization, WebSite and FAQPage JSON-LD injected through the framework\u2019s script pipeline. Services, work items and testimonials render from shared content so the catalogue stays consistent across sections, and the layout adapts from phone to desktop on the dark theme throughout.',
    marketing:
      'SEO is wired into the page metadata: a title and meta description aimed at "web design Nepal", "website design Kathmandu" and "SEO agency Nepal" queries, a matching keywords meta, robots set to index, follow, a canonical URL on the www domain and an Open Graph title for shared links. Structured data covers the organisation, the website and the FAQ page, while the blog and testimonials give searchers indexable depth beyond the homepage.',
    link: 'https://drillthru.tech/',
    isPlaceholder: false,
  },
  {
    slug: 'trip-zone',
    title: 'Trip Zone Travel & Tours',
    category: 'Web Development',
    secondaryCategories: ['SEO'],
    description:
      'Nepal tour-package website covering nine handpicked journeys from Kathmandu, with clear pricing, transport options, destination filters and trip planning by WhatsApp.',
    image: '/images/project-tripzone.png',
    technologies: ['React', 'Vercel', 'Technical SEO'],
    overview:
      'The website for Trip Zone Travel & Tours, a Kathmandu-based operator running curated Nepal tours including Manang, Muktinath, Pathivara, Halesi, Sailung & Kalinchowk, Gosaikunda, Aama Yangri, Char Dham and Dhorpatan. Visitors can browse packages, filter by destination and tour type, see duration and vehicle-inclusive pricing on every card, and start a trip plan or WhatsApp chat from anywhere on the page. A gallery, blog and FAQ carry the destination knowledge behind the packages.',
    challenge:
      'Travelers researching Nepal trips compare routes, durations and prices across scattered posts and PDFs. The site had to present nine very different journeys (mountain drives, pilgrimages, short escapes) as a consistent, scannable catalogue where price, transport and duration are visible without clicking, while keeping a direct enquiry path for visitors who would rather talk than browse.',
    approach:
      'A mega-dropdown Tours menu lists every package with thumbnail, location and trip length so the whole catalogue is one hover away. The hero pairs the mountain imagery with a journey-film card and a destination / tour-type search. Package cards carry a location caption, a short route description and price chips broken down by vehicle and group size. Trust stats (packages, travel styles, direct support), a Plan a trip button and a floating WhatsApp widget keep conversion within reach, on a green-and-navy identity throughout.',
    development:
      'Built as a React application and deployed on Vercel. Tour cards, dropdown entries and filters render from shared package data, so prices and durations stay consistent wherever a trip appears. The layout adapts from phone to desktop, and the gallery, blog and FAQ are separate indexable routes rather than a single long page.',
    marketing:
      'Search work on the site includes a destination-led meta title and description ("Nepal tour packages" plus the individual tour names), a canonical URL pointing at the production domain, and Schema.org structured data covering a WebSite entity, PostalAddress and Country markup, plus an FAQPage built from the real questions travellers ask. Open Graph title and image are set for shared links, while the blog and FAQ give the site indexable depth beyond the package pages.',
    link: 'https://trip-zone-travel-tours.vercel.app/',
    isPlaceholder: false,
  },
  {
    slug: 'starglobalvision',
    title: 'Star Global Vision',
    category: 'Web Development',
    description:
      'Website for a study-abroad consultancy in Kathmandu, with fourteen destination guides, test-prep courses, success stories and a free-counselling booking flow.',
    image: '/images/project-starglobalvision.png',
    technologies: ['React', 'Vite', 'Structured Data'],
    overview:
      'The website for Star Global Vision, an education consultancy in Bagbazar, Kathmandu that handles university applications, test preparation and visa filing. The homepage walks prospective students from \u201cwhere can I go\u201d to \u201cbook a free counselling session\u201d: four flagship destinations (Australia, Canada, USA, UK) with intake windows, a full country guide covering fourteen destinations, test-prep courses for IELTS, PTE, Duolingo and Japanese, a six-step process from first question to departure, success stories, a blog and an FAQ.',
    challenge:
      'Students comparing consultancies need country-specific facts fast (intakes, destinations, visa pathways) while the business needs enquiries to turn into counselling appointments. The site had to organise fourteen destinations and multiple services into a scannable flow, establish credibility (ministry approval, contact details and hours are pinned in the top bar), and keep a booking path visible from every scroll position.',
    approach:
      'A sticky top bar carries the ministry approval, opening hours, email and phone; the nav keeps Home, Destinations, Test Prep, Success Stories, Blog, About and Contact with a persistent Free counselling button. Destination cards lead with imagery and intake dates, the process is broken into six numbered steps, and a floating WhatsApp button plus a free-consultation modal (name, email, phone, preferred country, message) give two always-available conversion paths. A navy-and-orange identity, dark mode and social-proof badges carry the brand through the page.',
    development:
      'Built as a React application bundled with Vite. Destinations, steps and services render from shared data so the fourteen country entries stay consistent, and the site is responsive from phone to desktop with a dark mode toggle. Two JSON-LD blocks describe the business (address, contact points and an offer catalog of services) so search engines see the consultancy as an organisation, not just a page.',
    marketing:
      'Page-level SEO is wired in: a title and meta description targeting \u201cstudy abroad consultancy in Kathmandu\u201d plus destination and test-prep keywords, a canonical URL on the apex domain, and Schema.org structured data built from PostalAddress, ContactPoint, OfferCatalog, Service and City/Country entities. The blog and FAQ sections give the site indexable depth beyond the homepage.',
    link: 'https://www.starglobalvision.com/',
    isPlaceholder: false,
  },
  {
    slug: 'poms-penthouse',
    title: "POM's Penthouse",
    category: 'Web Development',
    description:
      'Booking website for a luxury serviced-apartment residence in Lakeside, Pokhara, with featured apartment listings, amenities and a gallery paired with nightly rates and direct WhatsApp reservations.',
    image: '/images/project-poms-penthouse.png',
    technologies: [
      'Responsive Web Design',
      'WhatsApp Booking',
      'Image Gallery',
      'Dark Mode',
    ],
    link: 'https://www.pomspenthouse.com/',
    overview:
      "POM's Penthouse is a luxury serviced-apartment residence in Lakeside, Pokhara, renting 1 BHK studios, 2 BHK and 3 BHK apartments to short-stay guests. The site introduces the residence, its rooms and its amenities, then turns that interest into a direct booking enquiry rather than passing the guest to a third-party marketplace.",
    challenge:
      'Short-stay guests decide quickly and mostly from a phone, so the site had to do the comparison work for them. Three very different apartment types, a long amenity list and nightly rates all had to be readable at a glance. The property also wanted guests to reach it directly instead of through an OTA that takes a commission and hides the brand.',
    approach:
      'I shaped the page around the booking decision rather than a property brochure. Featured apartments lead, each with its own photograph, a plain-language summary, amenity tags and a "from" nightly rate, so a visitor can compare 1, 2 and 3 BHK side by side without opening a single detail page. Every card carries its own booking action, and the primary reservation route is WhatsApp, which guests in the region already use, so an enquiry costs one tap with no form, no account and no drop-off.',
    development:
      'A mobile-first, responsive build with an image-led layout, viewport-sized apartment photographs, an amenities section, a photo gallery and a sticky booking call to action. A dark mode toggle lets guests browse comfortably for evening planning, and the whole interface was kept light so pages load quickly on mobile connections.',
    isPlaceholder: false,
  },
];

/** Primary + secondary categories — used for filter matching and badges. */
export function projectCategories(project: Project): ProjectCategory[] {
  return [project.category, ...(project.secondaryCategories ?? [])];
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getRelatedProjects(project: Project, limit = 2): Project[] {
  return projects
    .filter((item) => item.slug !== project.slug && item.category === project.category)
    .concat(projects.filter((item) => item.slug !== project.slug && item.category !== project.category))
    .slice(0, limit);
}
