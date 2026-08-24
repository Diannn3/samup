export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export const mainNav: NavItem[] = [
  { label: 'About SAM-UP', href: '/about' },
  { label: 'Events & Programs', href: '/events' },
  { label: 'Leadership Archive', href: '/alumni' },
  { label: 'Resources', href: '/resources' }
];

export const membershipAction: NavItem = {
  label: 'Join SAM-UP',
  href: '/#membership'
};
