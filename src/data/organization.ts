import seniorExecs from './senior_executives.json';

export const organization = {
  name: 'Society of Applied Mathematics of UPLB',
  shortName: 'SAM-UP',
  tagline: 'Bridging Abstract Reason with Real-World Impact',
  foundingDate: 'November 27, 1984',
  foundingYear: 1984,
  institution: 'University of the Philippines Los Baños',
  department: 'Institute of Mathematical Sciences and Physics (IMSP)',
  college: 'College of Arts and Sciences (CAS)',
  officialColors: ['Black', 'Gold'],
  totalLeadershipTerms: seniorExecs.length,
  latestRecordedExecutive: seniorExecs[seniorExecs.length - 1],
  mottos: [
    { tag: '#TatakSAMUP', label: 'Academic Rigor & Integrity' },
    { tag: '#BeyondSAMUP', label: 'Applied Mathematics in Society' },
    { tag: '#SAMUPSpotlight', label: 'Excellence in Research & Leadership' }
  ],
  socials: {
    facebook: 'https://facebook.com/SAMUPLB',
    email: 'samup.uplb@gmail.com'
  },
  location: {
    building: 'UPLB Mathematics Building',
    coordinates: '14.1675° N, 121.2433° E',
    campus: 'UPLB Campus, Los Baños, Laguna, Philippines'
  }
};
