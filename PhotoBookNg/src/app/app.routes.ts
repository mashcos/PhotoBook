import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { TenantService } from './services/tenant.service';
import { AdminActivate } from './services/admin-activate';

const tenantGuard = (route: ActivatedRouteSnapshot) => {
  const tenantId = route.paramMap.get('tenantId');
  if (tenantId && tenantId.length > 16) {
    inject(TenantService).setTenant(tenantId);
    return true;
  }
  return false;
};

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [AdminActivate],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./components/admin/index/admin').then((m) => m.AdminIndexComponent),
      },
      {
        // TODO
        path: 'login',
        pathMatch: 'full',
        loadComponent: () => import('./components/admin/index/admin').then((m) => m.AdminIndexComponent),
      },
      {
        path: 'photo/index',
        loadComponent: () => import('./components/admin/photo/index/index').then((m) => m.AdminPhotoIndexComponent),
      },
      {
        path: 'photo/detail/:id',
        loadComponent: () => import('./components/admin/photo/detail/detail').then((m) => m.AdminPhotoDetailComponent),
      },
      {
        path: 'category/:id',
        loadComponent: () =>
          import('./components/category/category').then((m) => m.CategoryComponent),
      }
    ]
  },
  {
    // TODO
    path: 'logout',
    canActivate: [AdminActivate],
    loadComponent: () => import('./components/admin/index/admin').then((m) => m.AdminIndexComponent),
  },
  {
    path: 'pb/:tenantId',
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
      }
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./components/intro/intro').then((m) => m.Intro),
  },
];
