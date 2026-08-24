// Organizational milestones — only constitutionally or data-verified facts.
// Source: SAM-UP Constitution Article I Section 3 (founding), senior_executives.json (terms).
// Anything not verifiable stays out. No invented milestones.

import seniorExecs from './senior_executives.json';

export type EvidenceState = 'verified' | 'defined' | 'needsApproval' | 'unknown';

export interface Milestone {
  id: string;
  year: string;
  title: string;
  description: string;
  evidence: EvidenceState;
  source: string;
}

export const milestones: Milestone[] = [
  {
    id: 'founding',
    year: '1984',
    title: 'SAM-UP is founded',
    description:
      'The organization officially began to exist after being recognized by the Office of Student Affairs on November 27, 1984.',
    evidence: 'verified',
    source: 'SAM-UP Constitution — Article I, Section 3',
  },
  {
    id: 'first-term',
    year: '1985',
    title: 'First recorded leadership term',
    description:
      `Edmund Campos served as Senior Executive for the 2nd Sem 84-85 term, the first entry in the documented leadership archive.`,
    evidence: 'verified',
    source: 'src/data/senior_executives.json',
  },
  {
    id: 'latest-term',
    year: 'Latest',
    title: 'Forty-plus years of documented terms',
    description:
      `The leadership archive now records ${seniorExecs.length} terms from 1984 through its latest recorded entry.`,
    evidence: 'verified',
    source: 'src/data/senior_executives.json',
  },
];
