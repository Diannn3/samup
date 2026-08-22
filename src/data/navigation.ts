export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export const mainNav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About & Heritage', href: '/about' },
  { label: 'Events & Programs', href: '/events' },
  { label: 'Alumni & Leadership', href: '/alumni' },
  { label: 'Academic Hub', href: '/resources' }
];

export const membershipAction: NavItem = {
  label: 'Join SAM-UP',
  href: '/#membership'
};
