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
      // Pegawai routes
      {
        path: 'pegawai',
        title: 'Data Pegawai',
        loadComponent: () => import('./features/pegawai/pegawai').then((m) => m.Pegawai),
      },
      {
        path: 'pegawai/create',
        title: 'Tambah Pegawai',
        loadComponent: () => import('./features/pegawai/pegawai-form').then((m) => m.PegawaiForm),
      },
      {
        path: 'pegawai/:uuid/edit',
        title: 'Ubah Data Pegawai',
        loadComponent: () => import('./features/pegawai/pegawai-form').then((m) => m.PegawaiForm),
      },
      {
        path: 'pegawai/:uuid',
        title: 'Detail Pegawai',
        loadComponent: () => import('./features/pegawai/pegawai-detail').then((m) => m.PegawaiDetail),
      },
      // Bidang routes
      {
        path: 'bidang',
        title: 'Data Bidang',
        loadComponent: () => import('./features/bidang/bidang').then((m) => m.Bidang),
      },
      {
        path: 'bidang/create',
        title: 'Tambah Bidang',
        loadComponent: () => import('./features/bidang/bidang-form').then((m) => m.BidangForm),
      },
      {
        path: 'bidang/:uuid/edit',
        title: 'Ubah Data Bidang',
        loadComponent: () => import('./features/bidang/bidang-form').then((m) => m.BidangForm),
      },
      // Pangkat & Golongan routes
      {
        path: 'pangkat-golongan',
        title: 'Pangkat & Golongan',
        loadComponent: () =>
          import('./features/pangkat-golongan/pangkat-golongan').then((m) => m.PangkatGolongan),
      },
      {
        path: 'pangkat-golongan/create',
        title: 'Tambah Pangkat & Golongan',
        loadComponent: () =>
          import('./features/pangkat-golongan/pangkat-golongan-form').then((m) => m.PangkatGolonganForm),
      },
      {
        path: 'pangkat-golongan/:uuid/edit',
        title: 'Ubah Pangkat & Golongan',
        loadComponent: () =>
          import('./features/pangkat-golongan/pangkat-golongan-form').then((m) => m.PangkatGolonganForm),
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
