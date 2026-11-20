export interface NavItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
  { label: 'Products', icon: 'inventory_2', route: '/products' },
  { label: 'Categories', icon: 'category', route: '/categories' },
  { label: 'Users', icon: 'group', route: '/users' },
];
