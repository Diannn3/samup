export interface OrgEvent {
  id: string;
  title: string;
  category: 'Competition' | 'Academic Outreach' | 'Athletics & Socials' | 'Symposium';
  badge: string;
  description: string;
  targetAudience: string;
  schedule: string;
  ctaText?: string;
  ctaLink?: string;
}

export const getEventLocationLabel = (event: OrgEvent) =>
  event.id === 'peer-tutorials' ? 'UPLB Mathematics Building' : 'See official updates';

export const flagshipEvents: OrgEvent[] = [
  {
    id: 'math-wizard',
    title: 'UPLB Math Wizard',
    category: 'Competition',
    badge: 'Premier Academic Tournament',
    description: 'The flagship inter-high school and collegiate mathematics competition organized by the Scholastics Committee, challenging the brightest analytical minds in advanced calculus, combinatorics, and applied problem-solving.',
    targetAudience: 'High School & University Students Nationwide',
    schedule: 'Annual Flagship Season',
    ctaText: 'View Guidelines & Updates',
    ctaLink: 'https://facebook.com/SAMUPLB'
  },
  {
    id: 'peer-tutorials',
    title: 'CAS Peer Tutorial Caravans',
    category: 'Academic Outreach',
    badge: 'Campus Service',
    description: 'Free peer-to-peer tutoring caravans and comprehensive exam review crash courses hosted at the UPLB Math Building for foundational courses including Math 27/28 (Calculus), Math 110 (Linear Algebra), and Math 180 (Differential Equations).',
    targetAudience: 'UPLB Undergraduates',
    schedule: 'Midterm & Final Exam Periods',
    ctaText: 'Tutorial Schedule',
    ctaLink: '/resources'
  },
  {
    id: 'strasuc-olympics',
    title: 'STRASUC & Intramural Athletics',
    category: 'Athletics & Socials',
    badge: 'Athletics & Camaraderie',
    description: 'SAM-UP members actively represent UPLB in swimming, track, and university sports leagues, championing physical discipline alongside quantitative excellence.',
    targetAudience: 'University Community & Regional Delegates',
    schedule: 'Annual Sports Season',
    ctaText: 'Learn More',
    ctaLink: '/about'
  },
  {
    id: 'math-in-action',
    title: 'Math in Action (MIA) Colloquium',
    category: 'Symposium',
    badge: 'Research & Industry',
    description: 'Specialized seminar series featuring alumni and faculty presenting cutting-edge industry applications of operations research, topological data analysis, and quantitative finance.',
    targetAudience: 'Students, Faculty & Researchers',
    schedule: 'Semestral Lecture Series',
    ctaText: 'Research Frontier',
    ctaLink: '/about#disciplines'
  }
];
