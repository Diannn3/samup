import type { EvidenceMeta } from './evidence';
import { isPublishableEvidence, needsVerificationEvidence } from './evidence';

// Public event/program data must be backed by evidence that is publishable under
// src/data/evidence.ts. Recurring or historically familiar programs are not
// treated as current merely because they previously appeared in the repository.

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
  venue: string | null;
  status: 'current' | 'historical' | 'needs-verification';
  evidence: EvidenceMeta;
}

export const getEventLocationLabel = (event: OrgEvent) => event.venue ?? 'See official updates';

/**
 * Records retained for verification work. These MUST NOT be rendered publicly
 * while their evidence remains needs-approval/needs-verification.
 */
export const programRecords: OrgEvent[] = [
  {
    id: 'peer-tutorials',
    title: 'CAS Peer Tutorial Caravans',
    category: 'Academic Outreach',
    badge: 'Needs current verification',
    description:
      'A peer-tutorial program previously represented in this repository. Current public status, course coverage, schedule, and venue require an approved source before publication.',
    targetAudience: 'To be verified',
    schedule: 'Check current official announcements',
    ctaText: 'Official SAM-UP updates',
    ctaLink: 'https://facebook.com/SAMUPLB',
    venue: null,
    status: 'needs-verification',
    evidence: needsVerificationEvidence(
      'Legacy repository program record',
      'Do not publish as an active SAM-UP program until current or approved evidence confirms the program name, status, coverage, and schedule.',
    ),
  },
  {
    id: 'strasuc-olympics',
    title: 'STRASUC & Intramural Athletics',
    category: 'Athletics & Socials',
    badge: 'Needs current verification',
    description:
      'An athletics/socials activity previously represented in this repository. Current SAM-UP role and active status require an approved source before publication.',
    targetAudience: 'To be verified',
    schedule: 'Check current official announcements',
    ctaText: 'Official SAM-UP updates',
    ctaLink: 'https://facebook.com/SAMUPLB',
    venue: null,
    status: 'needs-verification',
    evidence: needsVerificationEvidence(
      'Legacy repository program record',
      'Do not publish as a current SAM-UP program until current or approved evidence confirms SAM-UP participation and status.',
    ),
  },
];

/** Only publish records that pass the evidence policy. */
export const flagshipEvents = programRecords.filter((event) => isPublishableEvidence(event.evidence));
