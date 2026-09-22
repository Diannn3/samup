export type Visibility =
  | 'public'
  | 'public-summary-only'
  | 'historical'
  | 'internal'
  | 'needs-approval'
  | 'private';

export type EvidenceStatus =
  | 'verified-current'
  | 'verified-foundational'
  | 'historical'
  | 'official-but-stale'
  | 'needs-approval'
  | 'unknown'
  | 'blocked';

export interface EvidenceMeta {
  status: EvidenceStatus;
  visibility: Visibility;
  sourceLabel: string;
  sourceUrl?: string;
  sourceDocument?: string;
  sourceDate?: string;
  reviewedAt: string;
  validUntil?: string;
  notes?: string;
}

export const isPublicVisibility = (visibility: Visibility) =>
  visibility === 'public' ||
  visibility === 'public-summary-only' ||
  visibility === 'historical';

export const isPublishableEvidence = (evidence: EvidenceMeta) =>
  isPublicVisibility(evidence.visibility) &&
  evidence.status !== 'unknown' &&
  evidence.status !== 'blocked' &&
  evidence.status !== 'needs-approval';

export const constitutionEvidence = (
  sourceLabel: string,
  sourceDocument: string,
  notes?: string,
): EvidenceMeta => ({
  status: 'verified-foundational',
  visibility: 'public',
  sourceLabel,
  sourceDocument,
  sourceDate: '2018-11-10',
  reviewedAt: '2026-09-22',
  notes,
});

export const needsVerificationEvidence = (
  sourceLabel: string,
  notes: string,
): EvidenceMeta => ({
  status: 'needs-approval',
  visibility: 'needs-approval',
  sourceLabel,
  reviewedAt: '2026-09-22',
  notes,
});
