export interface FeaturedAlumni {
  name: string;
  title: string;
  affiliation: string;
  batch: string;
  quote: string;
  achievements: string[];
}

export const featuredAlumni: FeaturedAlumni = {
  name: 'Dr. Mark Lexter De Lara',
  title: 'Assistant Professor & Centennial Professorial Chair Awardee',
  affiliation: 'Institute of Mathematical Sciences and Physics (IMSP), UPLB',
  batch: 'Junior Adviser & SAM-UP Alumnus',
  quote:
    'Applied mathematics is the bridge between pure abstraction and societal impact. SAM-UP instills this dual discipline from day one.',
  achievements: [
    '2024 UP Centennial Professorial Chair in Applied Mathematics',
    'Ph.D. in Mathematics & Operations Research',
    'Pioneering TDA & Computer Vision for Filipino Sign Language (FSL)',
  ],
};
