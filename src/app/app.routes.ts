import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'pegawai',
        title: 'Data Pegawai',
        loadComponent: () => import('./features/pegawai/pegawai').then((m) => m.Pegawai),
      },
      {
        path: 'bidang',
        title: 'Data Bidang',
        loadComponent: () => import('./features/bidang/bidang').then((m) => m.Bidang),
      },
      {
        path: 'pangkat-golongan',
        title: 'Pangkat & Golongan',
        loadComponent: () =>
          import('./features/pangkat-golongan/pangkat-golongan').then((m) => m.PangkatGolongan),
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
