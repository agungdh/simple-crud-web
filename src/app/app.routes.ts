import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'products',
        title: 'Products',
        loadComponent: () => import('./features/products/products').then((m) => m.Products),
      },
      {
        path: 'categories',
        title: 'Categories',
        loadComponent: () => import('./features/categories/categories').then((m) => m.Categories),
      },
      {
        path: 'users',
        title: 'Users',
        loadComponent: () => import('./features/users/users').then((m) => m.Users),
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
