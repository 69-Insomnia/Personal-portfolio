import type { ExperienceItem } from '@/types';

/**
 * Real experience — newest first.
 * Do not publish experience that is not real.
 */
export const experience: ExperienceItem[] = [
  {
    id: 'drillthru',
    period: '1 Year',
    role: 'Web Developer',
    company: 'DrillThru',
    description:
      "A year at DrillThru, a web design and digital marketing agency in Nepal. I built the agency's own site on Next.js: service pages, work showcase, testimonials, blog and enquiry flows, plus the structured data that feeds their search results. Sitting next to the SEO and ads work is where I stopped thinking of a website as the finish line.",
    technologies: ['Next.js', 'Technical SEO', 'Digital Marketing'],
    isPlaceholder: false,
  },
  {
    id: 'poms-penthouse',
    period: '6 Months',
    role: 'Web Developer',
    company: "POM's Penthouse",
    description:
      "Six months on the booking site for POM's Penthouse, a serviced-apartment residence in Lakeside, Pokhara. Guests compare 1, 2 and 3 BHK apartments with amenities and nightly rates at a glance, then reserve over WhatsApp in one tap rather than filling in a form and waiting.",
    technologies: ['Responsive Web Design', 'WhatsApp Booking', 'Dark Mode'],
    isPlaceholder: false,
  },
];
