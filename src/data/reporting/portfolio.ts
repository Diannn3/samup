export interface PortfolioItem {
  id: string;
  title: string;
  event: string;
  year: string;
  category: 'cinema' | 'video' | 'publications' | 'campaigns' | 'fieldwork' | 'photography';
  roles: string[];
  aspectRatio: '16:9' | '4:3' | '1:1' | '2.39:1';
  caption: string;
  details: string;
  featured?: boolean;
}

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'math-in-sight',
    title: 'Math in Sight: Everyday Geometry & Flow',
    event: 'SAM-UP Promotions Flagship',
    year: '2026',
    category: 'cinema',
    roles: ['Director', 'Cinematographer', 'Editor'],
    aspectRatio: '2.39:1',
    featured: true,
    caption: 'Cinematic short film weaving mathematical mechanics with local Philippine streetscapes.',
    details:
      "Dian's proudest SAM-UP production. Directed, filmed, and edited on location in Los Baños. The project translates abstract applied mathematics—vector trajectories, fluid currents, and modular grids—into evocative human cinematography. Features bespoke monochrome color-grading, optical grain, and a custom score.",
  },
  {
    id: 'enable-2026',
    title: 'ENABLE 2026: Voices of the Route',
    event: 'ENABLE 2026 Community Initiative',
    year: '2026',
    category: 'fieldwork',
    roles: ['Publication Team', 'Field Producer & Interviewer'],
    aspectRatio: '16:9',
    featured: true,
    caption: 'Documentary fieldwork and narrative interviews with Laguna jeepney drivers.',
    details:
      'Conducted on-the-ground interviews capturing the daily lived experiences, economic pressures, and transit realities of jeepney drivers in Los Baños. Synthesized complex community stories into an empathetic, high-engagement social media video series.',
  },
  {
    id: 'nimp-2027',
    title: 'NIMP 2027: Hanayan ng Isipan',
    event: 'National Invitational Math Pairs 2027',
    year: '2027',
    category: 'campaigns',
    roles: ['Publication Subteam', 'Visual Identity'],
    aspectRatio: '1:1',
    featured: true,
    caption:
      'Full promotional identity and social countdown system for the nationwide junior high competition.',
    details:
      'Co-engineered the visual language for NIMP 2027. Created the Hanayan ng Isipan master theme, official competition countdown releases, primer layout standards, and participant announcement graphics designed to inspire school pride across the country.',
  },
  {
    id: 'mia-2027',
    title: 'Math In Action (MIA) 2027 Design System',
    event: 'MIA 2027 Nationwide Symposium',
    year: '2027',
    category: 'campaigns',
    roles: ['Publication Subteam', 'Template Architect'],
    aspectRatio: '4:3',
    caption: 'Complete modular event suite: primer templates, certificate designs, and social headers.',
    details:
      'Developed the editorial system for MIA 2027, including registration headers, participant certificate layouts, speaker placards, tarpaulin specifications, and social media countdown materials.',
  },
  {
    id: 'open-tambayan',
    title: 'SAM-UP Open Tambayan: The Convergence',
    event: 'Open Tambayan 2025',
    year: '2025',
    category: 'publications',
    roles: ['Publication Committee', 'Tech Operations'],
    aspectRatio: '1:1',
    caption: 'High-contrast promotional graphics welcoming students into the math tambayan.',
    details:
      'Designed vibrant community-invitation graphics and handled technical setup for the semester-opening tambayan, driving member engagement and student community discovery.',
  },
  {
    id: 'org-orientation-2025',
    title: '1st Semester Org Orientation Coverage',
    event: 'SAM-UP Orientation A.Y. 2025–2026',
    year: '2025',
    category: 'photography',
    roles: ['Event Photographer'],
    aspectRatio: '16:9',
    caption: 'First official assignment upon joining Batch Florensimus Vincula.',
    details:
      "Comprehensive documentary photography of the first semester organization orientation, establishing Dian's reputation for dependable creative execution and prompt delivery.",
  },
  {
    id: 'razzmatazz-2026',
    title: 'Razzmatazz 2026 Publicity System',
    event: 'Razzmatazz 2026',
    year: '2026',
    category: 'publications',
    roles: ['Publicity Team'],
    aspectRatio: '16:9',
    caption: 'Collaborative event branding and promotional teaser graphics.',
    details:
      'External affiliation contribution designing high-impact social teasers and promotional assets for major university events.',
  },
  {
    id: 'uplb-tools-identity',
    title: 'UPLB Tools: Campus Infrastructure Interface',
    event: 'UPLB Open Source',
    year: '2026',
    category: 'publications',
    roles: ['Maintaining Team'],
    aspectRatio: '16:9',
    caption: 'Digital tools maintenance and student utility graphics.',
    details:
      'Active involvement maintaining open-source digital infrastructure for the UPLB student body, blending applied software architecture with clear civic UX.',
  },
];
