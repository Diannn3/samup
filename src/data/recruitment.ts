import type { EvidenceMeta } from './evidence';

export type RecruitmentStatus = 'open' | 'closed' | 'check-latest-announcement';

export interface RecruitmentGuidance {
  term: string;
  registrationState: 'registered';
  applicationScope: string;
  status: RecruitmentStatus;
  statusLabel: string;
  nextStep: string;
  evidence: EvidenceMeta;
}

/**
 * Current public recruitment guidance.
 *
 * UPLB OSA states that, for First Semester A.Y. 2026–2027, SAM-UP is a
 * college-based organization and only CAS students may apply. OSA does not,
 * by itself, establish that recruitment is presently open or provide every
 * degree-program-specific condition used by the current SAM-UP application
 * process. Those details remain tied to SAM-UP's latest official announcement.
 */
export const currentRecruitment: RecruitmentGuidance = {
  term: 'First Semester, A.Y. 2026–2027',
  registrationState: 'registered',
  applicationScope:
    'Current OSA guidance: only students from the College of Arts and Sciences (CAS) may apply.',
  status: 'check-latest-announcement',
  statusLabel: 'Check the latest recruitment announcement',
  nextStep:
    'Confirm the current application window and degree-program-specific requirements through SAM-UP’s latest official announcement before applying.',
  evidence: {
    status: 'verified-current',
    visibility: 'public',
    sourceLabel: 'UPLB Office of the Vice Chancellor for Student Affairs — SAM-UP organization record',
    sourceUrl: 'https://uplbosa.org/orgs/upsam',
    sourceDate: 'First Semester, A.Y. 2026–2027',
    reviewedAt: '2026-09-22',
    notes:
      'The OSA record confirms current registration and the CAS-only application scope. It does not prove that recruitment is open today.',
  },
};

export const recruitmentLinks = {
  osaRecord: 'https://uplbosa.org/orgs/upsam',
  officialFacebook: 'https://facebook.com/SAMUPLB',
} as const;
