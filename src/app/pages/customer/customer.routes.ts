import { Route } from '@angular/router';

export const routes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./customer'),
  },
  {
    path: 'ekle',
    loadComponent: () => import('./create/customer-create'),
  },
  {
    path: 'ekle/:id',
    loadComponent: () => import('./create/customer-create'),
  },
];

export default routes;
