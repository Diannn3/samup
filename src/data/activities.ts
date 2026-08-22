export interface Activity {
  id: string;
  title: string;
  description: string;
  metrics?: string;
}

export const activities: Activity[] = [
  {
    id: 'math-wizard',
    title: 'Academic Tutoring & Outreach',
    description: 'Free peer tutorial caravans, comprehensive mock exam review crash courses, and formula repositories for Math 27/28 (Calculus), Math 110 (Linear Algebra), and Math 180 (Differential Equations) at the UPLB Math Building.',
    metrics: '500+ Students Tutored Annually'
  },
  {
    id: 'research',
    title: 'Applied Math Research Frontier',
    description: 'Undergraduate research initiatives across linear & non-linear optimization, Topological Data Analysis (TDA), computational biometric models, Filipino Sign Language (FSL) AI, and quantitative risk modeling.',
    metrics: 'IMSP Faculty Collaboration'
  },
  {
    id: 'tournaments',
    title: 'Academic Tournaments',
    description: 'Hosting the annual nationwide UPLB Math Wizard, bringing together the brightest high school and collegiate analytical minds in advanced mathematical problem-solving.',
    metrics: 'Flagship National Tournament'
  },
  {
    id: 'brotherhood',
    title: 'Leadership & Brotherhood',
    description: 'Nurturing well-rounded scholars through athletic delegations (STRASUC swimming & track), executive governance leadership training, anniversary galas, and active alumni mentorship.',
    metrics: '40+ Years of Camaraderie'
  }
];
