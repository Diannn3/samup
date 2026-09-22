export interface Station {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  category: 'origin' | 'foundation' | 'marketing' | 'cinema' | 'campaigns' | 'values' | 'applicant';
  position: { x: number; y: number };
  radius: number;
  theme: 'light' | 'darkroom' | 'applicant';
  roles?: string[];
  description: string;
  bulletPoints?: string[];
  keyPrompt?: string;
  portfolioTag?: string;
  nextStationId?: string;
}

export const STATIONS: Station[] = [
  {
    id: 'st-01',
    index: '01',
    title: 'Aedrian "Dian" Ponce',
    subtitle: 'BS APPLIED MATHEMATICS // BATCH 2025 // UPLB',
    category: 'origin',
    position: { x: 600, y: 1800 },
    radius: 90,
    theme: 'light',
    roles: ['Marketing Deputy Head (Promotions)', 'Business Committee'],
    description:
      'Welcome. This reporting is a conversation, not a lecture. I introduce myself, you introduce yourself, I share my journey in SAM-UP, and we talk about how we can build together.',
    bulletPoints: [
      'Hometown: Pagsanjan, Laguna',
      'Residence: Catalan Compound inside UPLB',
      'Degree Program: BS Applied Mathematics',
      'Pronouns: he/him',
      "Interests: Filming, Graphic Design, MCU, Comics, Chess, Rubik's Cube, Gym",
    ],
    nextStationId: 'st-02',
  },
  {
    id: 'st-02',
    index: '02',
    title: 'Florensimus Vincula',
    subtitle: 'ENTRY SEMESTER // 1ST SEM A.Y. 2025–2026',
    category: 'origin',
    position: { x: 1200, y: 1800 },
    radius: 90,
    theme: 'light',
    roles: ['Applicant → Member', 'Orientation Photographer'],
    description:
      'Joined SAM-UP under Batch Florensimus Vincula. Starting out as the photographer for the 1st Semester Organization Orientation, diving immediately into visual documentation and org life.',
    bulletPoints: [
      'Batch: Florensimus Vincula',
      'Standing Committee Assignment: Business Committee',
      'Immediate Involvement: Marketing & Photography',
      'First Task: 1st Sem Org Orientation Photographer',
    ],
    portfolioTag: 'events',
    nextStationId: 'st-03',
  },
  {
    id: 'st-03',
    index: '03',
    title: 'Business Committee',
    subtitle: 'STANDING COMMITTEE FOUNDATION',
    category: 'foundation',
    position: { x: 1800, y: 1400 },
    radius: 90,
    theme: 'light',
    roles: ['Thinkers & Doers', 'External Affairs & Documentation'],
    description:
      "Business Committee is Dian's constitutional standing committee. It manages SAM-UP's external affairs, public relations, event documentation, and publication systems.",
    bulletPoints: [
      'Thinkers: Conceptualize creative visions and campaign angles',
      'Doers: Execute layouts and graphics in production software',
      'Constructive Criticism: Critique the work to elevate the output, never to attack the person',
      'Documentation & Archive: Google Drive systemization & consent standards',
    ],
    portfolioTag: 'publications',
    nextStationId: 'st-04',
  },
  {
    id: 'st-04',
    index: '04',
    title: 'The Marketing Fork',
    subtitle: 'PARTNERSHIP VS PROMOTIONS',
    category: 'marketing',
    position: { x: 2400, y: 1800 },
    radius: 100,
    theme: 'light',
    roles: ['Two Deputy Heads', 'Unified Marketing Mandate'],
    description:
      'Dispelling the misconception that Marketing is only about partnerships. SAM-UP Marketing has two distinct, equally vital wings: Partnership and Promotions.',
    bulletPoints: [
      "Common Myth: 'Marketing is only for looking for sponsors.'",
      'Partnership: Sponsors, MOA, primers, external organizations, and compliance proof.',
      'Promotions: Attention, awareness, video content, campaign strategy, and audience engagement.',
      "Dian's Focus: Marketing Deputy Head overseeing the Promotions wing.",
    ],
    nextStationId: 'st-05',
  },
  {
    id: 'st-05',
    index: '05',
    title: 'Promotions Engine',
    subtitle: 'DEPUTY HEAD LEADERSHIP & PRODUCTION CYCLE',
    category: 'marketing',
    position: { x: 3000, y: 1800 },
    radius: 90,
    theme: 'light',
    roles: ['Auditor & Deputy Head', 'Execution & Task Delegation'],
    description:
      'Serving as Marketing Deputy Head for two semesters (2nd Sem 25-26 and 1st Sem 26-27). The Auditor coordinates with Execom and verifies direction; Dian manages tactical execution.',
    bulletPoints: [
      'Phase 1: PLAN — Define event objectives and audience emotional hooks',
      'Phase 2: ASSIGN — Match team members to scripts, acting, filming, and editing',
      'Phase 3: SCRIPT — Write natural, engaging promotional dialogues',
      'Phase 4: SHOOT — Field production, lighting, cinematography',
      'Phase 5: EDIT — Video cutting, pacing, audio mixing, color correction (the hardest part)',
      'Phase 6: PROMOTE — Launch release, monitor Facebook metrics, evaluate reach',
    ],
    portfolioTag: 'video',
    nextStationId: 'st-06',
  },
  {
    id: 'st-06',
    index: '06',
    title: 'Math in Sight',
    subtitle: 'CINEMATIC MASTERPIECE // THE DARKROOM',
    category: 'cinema',
    position: { x: 3600, y: 2400 },
    radius: 120,
    theme: 'darkroom',
    roles: ['Director', 'Cinematographer', 'Editor'],
    description:
      "Dian's proudest creative achievement in SAM-UP. A high-production short cinematic documentary proving how Applied Mathematics breathes inside everyday Philippine reality.",
    bulletPoints: [
      'Role: Director, Cinematographer, and Editor',
      'Atmosphere: Cinematic letterbox, continuous timecodes, optical grain',
      'Craft Challenge: Combining rigorous mathematical concepts with human cinematic emotion',
      'Production: Shot on location in Los Baños with full post-production color grading',
    ],
    portfolioTag: 'cinema',
    nextStationId: 'st-07',
  },
  {
    id: 'st-07',
    index: '07',
    title: 'ENABLE 2026',
    subtitle: 'FIELDWORK: JEEPNEY DRIVER INTERVIEWS',
    category: 'campaigns',
    position: { x: 4200, y: 1400 },
    radius: 90,
    theme: 'light',
    roles: ['Publication Team', 'Field Production & Interviewer'],
    description:
      'Stepping out of the classroom to capture real stories. Dian led videography and interviews with jeepney drivers in Laguna for the ENABLE 2026 initiative.',
    bulletPoints: [
      'Focus: Community transportation, grassroots realities, and lived experiences',
      'Execution: Live fieldwork, rapid audio setups, respectful community engagement',
      "Key Learning: Org media has a duty to reflect society, echoing SAM-UP's constitutional principles",
    ],
    portfolioTag: 'fieldwork',
    nextStationId: 'st-08',
  },
  {
    id: 'st-08',
    index: '08',
    title: 'Nationwide Campaigns',
    subtitle: 'NIMP 2026/2027 & MIA 2027',
    category: 'campaigns',
    position: { x: 4600, y: 1800 },
    radius: 90,
    theme: 'light',
    roles: ['Publication Subteam', 'Design Systems & Countdown Series'],
    description:
      'Large-scale institutional event packaging for high school and university mathematics competitions spanning the entire Philippines.',
    bulletPoints: [
      'NIMP 2027: Hanayan ng Isipan (National Invitational Math Pairs)',
      'MIA 2027: Math In Action event proposal branding, primers, and countdown releases',
      'Deliverables: Primers, certificate suites, social teasers, Facebook covers, countdown graphics',
      'Cross-Team Work: Seamless coordination between Secretariat, Academics, and Business',
    ],
    portfolioTag: 'campaigns',
    nextStationId: 'st-09',
  },
  {
    id: 'st-09',
    index: '09',
    title: 'How We Work Together',
    subtitle: 'LEADERSHIP PHILOSOPHY & EXPECTATIONS',
    category: 'values',
    position: { x: 4900, y: 1400 },
    radius: 90,
    theme: 'light',
    roles: ['Initiative & Growth', 'Sustainable Org Culture'],
    description:
      "Dian's leadership thesis. Derived from experience: ambiguous delegation causes burnout; clear communication creates mastery.",
    bulletPoints: [
      'Initiative: You do not need to wait for permission to suggest a better idea',
      'Willingness to Learn: You are not expected to know everything; ask questions early',
      'Communication > Assumptions: If you are overwhelmed or delayed, tell the team before the deadline',
      'Empathy & Accountability: We protect member wellbeing first while respecting shared commitments',
    ],
    nextStationId: 'st-10',
  },
  {
    id: 'st-10',
    index: '10',
    title: 'Your Turn',
    subtitle: 'APPLICANT CONVERSATION PROFILES',
    category: 'applicant',
    position: { x: 5300, y: 1800 },
    radius: 90,
    theme: 'applicant',
    roles: ['Future SAM-UP Member', 'The Unwritten Story'],
    description:
      'The line stops being about Dian. Now it is your turn. Dian listens to who you are, what drives you, and what makes you happy.',
    bulletPoints: [
      'Basic Profile: Name, Nickname, Degree Program, Hometown, Address',
      'Culture & Heart: Comfort Food, Favorite Films, Hobbies, Talents',
      'Core Reflection: What truly makes you happy?',
      'No Google Forms: A natural, human one-on-one conversation',
    ],
    nextStationId: 'st-11',
  },
  {
    id: 'st-11',
    index: '11',
    title: 'WHY SAM-UP?',
    subtitle: 'THE QUESTION OF SINCERITY',
    category: 'applicant',
    position: { x: 5900, y: 1800 },
    radius: 120,
    theme: 'applicant',
    roles: ['Core Reflection', 'Constitutional Purpose'],
    description:
      'This is the heart of the reporting. Not an interrogation, but an honest conversation about what you are seeking and what you hope to give back to this community.',
    bulletPoints: [
      'What drew you to Applied Mathematics and SAM-UP?',
      'What kind of growth or memories do you want to experience here?',
      "Dian's metric: Sincerity over memorized corporate jargon",
    ],
    nextStationId: 'st-12',
  },
  {
    id: 'st-12',
    index: '12',
    title: 'What Comes Next?',
    subtitle: 'YOUR STORY STARTS HERE',
    category: 'applicant',
    position: { x: 6400, y: 1800 },
    radius: 90,
    theme: 'applicant',
    roles: ['The Open Horizon', '?'],
    description:
      'My path in SAM-UP is drawn. Yours is completely open. Welcome to the Society of Applied Mathematics of UPLB.',
    bulletPoints: [
      'The grid fades into open possibilities',
      'You have a mentor, partner, and friend in Dian',
      "Let's build something meaningful together",
    ],
  },
];
