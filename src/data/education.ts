import type { EducationItem } from '@/types';

/**
 * Real education — newest first.
 * Do not publish education that is not real.
 */
export const education: EducationItem[] = [
  {
    institution: 'Ratna Rajyalaxmi Campus',
    degree: 'BCA (Bachelor in Computer Application)',
    field: 'Computer Application',
    year: 'Running',
    description:
      'Undergraduate study in computer application: programming and data structures, database management, web technologies, software engineering and networking. The formal version of what the project work does day to day.',
    isPlaceholder: false,
  },
  {
    institution: 'Hanumanteshwor Secondary School',
    degree: '+2 (Higher Secondary)',
    field: 'Computer Science',
    year: '2022',
    description:
      'Higher secondary computer science: programming fundamentals, control flow and data types, database basics, and an introduction to computer architecture and networking.',
    isPlaceholder: false,
  },
];
