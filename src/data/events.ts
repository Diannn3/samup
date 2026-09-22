// Canonical event & program data model.
// Evidence policy: only facts supported by approved SAM-UP or current official sources.
//
// IMPORTANT:
// The Annual Search for the UPLB Math Wizard is intentionally not represented here.
// Current public evidence identifies UPLB Mathematical Sciences Society (UPLB MASS)
// as its organizer. Do not add it as a SAM-UP program unless a current authoritative
// source documents SAM-UP's specific role.

export interface OrgEvent {
  id: string;
  title: string;
  category: 'Academic Outreach' | 'Athletics & Socials';
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
