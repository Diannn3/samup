// Canonical event & program data model.
// Evidence policy: only facts supported by the repository or constitution.
// Locations: only peer tutorials have a verified home (UPLB Math Building,
// per tutorial caravan descriptions); others defer to official updates.
// MIA Colloquium removed: no supporting source in repository or wiki.

export interface OrgEvent {
  id: string;
  title: string;
  category: 'Competition' | 'Academic Outreach' | 'Athletics & Socials';
  badge: string;
  description: string;
  targetAudience: string;
  schedule: string;
  ctaText?: string;
  ctaLink?: string;
  /** Verified venue, or null to show "See official updates". */
  venue: string | null;
  status: 'active' | 'informational';
}

export const getEventLocationLabel = (event: OrgEvent) =>
  event.venue ?? 'See official updates';

export const flagshipEvents: OrgEvent[] = [
  {
    id: 'math-wizard',
    title: 'UPLB Math Wizard',
    category: 'Competition',
    badge: 'Annual Tournament',
    description:
      'The annual UPLB Math Wizard competition organized by the Scholastics Committee, covering advanced calculus, combinatorics, and applied problem-solving.',
    targetAudience: 'High School & University Students',
    schedule: 'Annual',
    ctaText: 'View Guidelines & Updates',
    ctaLink: 'https://facebook.com/SAMUPLB',
    venue: null,
    status: 'informational',
  },
  {
    id: 'peer-tutorials',
    title: 'CAS Peer Tutorial Caravans',
    category: 'Academic Outreach',
    badge: 'Campus Service',
    description:
      'Free peer-to-peer tutoring and exam review sessions at the UPLB Mathematics Building, covering foundational courses such as Math 27/28 (Calculus), Math 110 (Linear Algebra), and Math 180 (Differential Equations).',
    targetAudience: 'UPLB Undergraduates',
    schedule: 'Per Semester',
    ctaText: 'Tutorial Schedule',
    ctaLink: '/resources',
    venue: 'UPLB Mathematics Building',
    status: 'active',
  },
  {
    id: 'strasuc-olympics',
    title: 'STRASUC & Intramural Athletics',
    category: 'Athletics & Socials',
    badge: 'Athletics & Camaraderie',
    description:
      'SAM-UP members represent UPLB in swimming, track, and university sports leagues, championing physical discipline alongside academic work.',
    targetAudience: 'University Community',
    schedule: 'Annual Sports Season',
    ctaText: 'Learn More',
    ctaLink: '/about',
    venue: null,
    status: 'informational',
  },
];
