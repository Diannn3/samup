export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export const mainNav: NavItem[] = [
  { label: 'Explore', href: '/explore' },
  { label: 'Programs', href: '/events' },
  { label: 'Resources', href: '/resources' },
  { label: 'About', href: '/about' },
  { label: 'Partners', href: '/partners' },
];

export const membershipAction: NavItem = {
  label: 'Join SAM-UP',
  href: '/join',
};

export const utilityNav: NavItem[] = [
  { label: 'Governance', href: '/governance' },
  { label: 'Leadership Archive', href: '/alumni' },
];
