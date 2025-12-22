import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { TenantService } from './services/tenant.service';

const tenantGuard = (route: ActivatedRouteSnapshot) => {
  const tenantId = route.paramMap.get('tenantId');
  if (tenantId && tenantId.length > 16) {
    inject(TenantService).setTenant(tenantId);
  }
  return true;
};

export const routes: Routes = [
  {
    path: ':tenantId',
    canActivate: [tenantGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./components/intro/intro').then((m) => m.Intro),
      },
      {
        path: 'home',
        loadComponent: () => import('./components/home/home').then((m) => m.Home),
      },
      {
        path: 'photo/:id',
        loadComponent: () => import('./components/photo/photo').then((m) => m.Photo),
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
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./components/intro/intro').then((m) => m.Intro),
  },
];
