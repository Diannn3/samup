import seniorExecs from './senior_executives.json';

export const organization = {
  name: 'Society of Applied Mathematics of UPLB',
  shortName: 'SAM-UP',
  foundingDate: 'November 27, 1984',
  foundingYear: 1984,
  institution: 'University of the Philippines Los Baños',
  department: 'Institute of Mathematical Sciences and Physics (IMSP)',
  college: 'College of Arts and Sciences (CAS)',
  officialColors: ['Black', 'Gold'],
  totalLeadershipTerms: seniorExecs.length,
  latestRecordedExecutive: seniorExecs[seniorExecs.length - 1],
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
