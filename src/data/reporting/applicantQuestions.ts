export interface ApplicantQuestion {
  id: string;
  category: 'identity' | 'culture' | 'core';
  label: string;
  hint: string;
  primary?: boolean;
}

export const APPLICANT_QUESTIONS: ApplicantQuestion[] = [
  // Basic Identity
  { id: 'name', category: 'identity', label: 'Full Name', hint: 'What is your official name?' },
  { id: 'nickname', category: 'identity', label: 'Preferred Nickname', hint: 'What should we call you?' },
  { id: 'pronouns', category: 'identity', label: 'Pronouns', hint: 'e.g., he/him, she/her, they/them' },
  { id: 'univ_batch', category: 'identity', label: 'University Batch', hint: 'e.g., Batch 2025, Batch 2026' },
  {
    id: 'degree',
    category: 'identity',
    label: 'Degree Program',
    hint: 'e.g., BS Applied Mathematics, BS Statistics',
  },
  { id: 'hometown', category: 'identity', label: 'Hometown', hint: 'Where are you originally from?' },
  {
    id: 'college_address',
    category: 'identity',
    label: 'College Address',
    hint: 'Where are you staying in Los Baños?',
  },

  // Personal / Cultural
  {
    id: 'batch_name',
    category: 'culture',
    label: 'SAM-UP Applicant Batch',
    hint: 'Your current applicant batch name',
  },
  {
    id: 'affiliations',
    category: 'culture',
    label: 'Other Affiliations',
    hint: 'Other orgs, student councils, or teams',
  },
  {
    id: 'sponsor_batch',
    category: 'culture',
    label: 'Sponsor (Batch)',
    hint: "Your applicant sponsor's batch",
  },
  {
    id: 'comfort_food',
    category: 'culture',
    label: 'Comfort Food',
    hint: 'What food restores your soul after a long day?',
  },
  {
    id: 'favorite_films',
    category: 'culture',
    label: 'Favorite Film(s)',
    hint: 'Movies, series, or stories you love',
  },
  {
    id: 'hobbies_talents',
    category: 'culture',
    label: 'Hobbies & Talents',
    hint: 'Things you enjoy outside academics',
  },
  {
    id: 'happiness',
    category: 'culture',
    label: 'What makes you happy?',
    hint: 'Something that brings you pure, effortless joy',
  },

  // The Big Question
  {
    id: 'why_samup',
    category: 'core',
    label: 'WHY SAM-UP?',
    hint: 'What draws you here, and what do you hope to learn, experience, and give back to our community?',
    primary: true,
  },
];
