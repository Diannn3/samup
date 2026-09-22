// Mission & Vision — sourced from the SAM-UP Constitution.
// Source: Fensalir wiki/concepts/sam_up_knowledge_base.md + wiki/sources/sam_up_constitution.md
// Preamble and Article IV (Objectives) are verbatim constitutional text.
// NOTE: SAM-UP's Constitution defines principles and objectives, not separate
// "mission" and "vision" statements. We present the constitutional objectives
// as the mission list and do not invent a vision statement.

export type EvidenceState = 'verified' | 'defined' | 'needsApproval' | 'unknown';

export interface MissionObjective {
  id: string;
  text: string;
  evidence: EvidenceState;
  source: string;
}

/** Constitutional Preamble (Article 0), condensed for the web. Full text on request. */
export const preamble = {
  full: 'We, the members of the Society of Applied Mathematics of the University of the Philippines Los Baños, realizing the need for an organized group to promote the relevance of Applied Mathematics to the Philippine Society, to contribute to the advancement of the Philippine Society through deeper appreciation and wider application of Applied Mathematics and its related fields, to help the University in the achievement of its purposes and missions, to promote academic excellence among its members…',
  evidence: 'verified' as EvidenceState,
  source: 'SAM-UP Constitution — Preamble',
};

/** Article IV objectives, verbatim. */
export const objectives: MissionObjective[] = [
  {
    id: 'obj-1',
    text: 'to promote awareness of the relevance of Applied Mathematics to the Philippine Society;',
    evidence: 'verified',
    source: 'SAM-UP Constitution — Article IV [1]',
  },
  {
    id: 'obj-2',
    text: 'to contribute to the advancement of the Philippine Society through deeper appreciation and wider application of Applied Mathematics and its related fields;',
    evidence: 'verified',
    source: 'SAM-UP Constitution — Article IV [2]',
  },
  {
    id: 'obj-3',
    text: 'to help the University in the achievement of its purposes and missions;',
    evidence: 'verified',
    source: 'SAM-UP Constitution — Article IV [3]',
  },
  {
    id: 'obj-4',
    text: 'to promote academic excellence among its members;',
    evidence: 'verified',
    source: 'SAM-UP Constitution — Article IV [4]',
  },
  {
    id: 'obj-5',
    text: 'to help in the moral upliftment and social awareness and development of its members.',
    evidence: 'verified',
    source: 'SAM-UP Constitution — Article IV [5]',
  },
];

/** Article III principles, verbatim. */
export const principles = [
  {
    id: 'p-1',
    text: 'The organization believes that the university is a microcosm of a larger society.',
    evidence: 'verified' as EvidenceState,
    source: 'SAM-UP Constitution — Article III, Section 1',
  },
  {
    id: 'p-2',
    text: 'The organization believes in equality, unity, loyalty and commitment.',
    evidence: 'verified' as EvidenceState,
    source: 'SAM-UP Constitution — Article III, Section 2',
  },
  {
    id: 'p-3',
    text: 'The organization believes in collective leadership and in criticism and self-criticism.',
    evidence: 'verified' as EvidenceState,
    source: 'SAM-UP Constitution — Article III, Section 3',
  },
];

/** Emblem symbology, Article II. The seal is the authentic Più identity. */
export const emblem = {
  colors: 'The official colors of the organization shall be black and gold.',
  seal: 'The official seal shall consist of two concentric circles, the central figure of which shall be called the "piu". The organization name, "1984", and two stars are inscribed between the circles.',
  piu: 'The "piu" stands for the summation of all efforts and capabilities of the members in their pursuit to form an organization that would meet their interests and needs as applied mathematicians.',
  circles:
    'The outer circle signifies the Philippine Society; the inner circle signifies the organization itself and the unity among its members. The two stars signify the principles and the objectives of the organization.',
  evidence: 'verified' as EvidenceState,
  source: 'SAM-UP Constitution — Article II',
};

/** Membership rules, Article VII — verbatim eligibility. */
export const membershipRules = {
  resident:
    'Any bona fide student of the University of the Philippines Los Baños, under the BS Applied Mathematics program, not belonging to any academic organization who, upon application, has earned at least six (6) units of Applied Mathematics or Mathematics courses, may avail of the privileges of being a Resident Member.',
  affiliate:
    'Any bona fide student of the University of the Philippines Los Baños, not under the BS Applied Mathematics program, not belonging to any academic organization who, upon application, has earned at least six (6) units of Applied Mathematics or Mathematics courses, may avail of the privileges of being an Affiliate Member.',
  evidence: 'verified' as EvidenceState,
  source: 'SAM-UP Constitution — Article VII, Sections 2–3',
};
