export interface NavItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
  { label: 'Pegawai', icon: 'people', route: '/pegawai' },
  { label: 'Bidang', icon: 'corporate_fare', route: '/bidang' },
  { label: 'Pangkat & Golongan', icon: 'military_tech', route: '/pangkat-golongan' },
];
