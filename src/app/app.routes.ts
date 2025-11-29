import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home').then((m) => m.Home),
  },
  {
    path: 'hub/:id',
    loadComponent: () => import('./components/hub/hub').then((m) => m.Hub),
  },
  {
    path: 'timeline',
    loadComponent: () => import('./components/timeline/timeline').then((m) => m.Timeline),
  },
  {
    path: 'map',
    loadComponent: () => import('./components/map/map').then((m) => m.MapComponent),
  },
  {
    path: 'category/:id',
    loadComponent: () =>
      import('./components/category/category').then((m) => m.CategoryComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin').then((m) => m.Admin),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
