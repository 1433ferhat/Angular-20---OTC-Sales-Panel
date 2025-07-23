import { Route } from '@angular/router';

export const routes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./orders'),
  },
  {
    path: 'ekle',
    loadComponent: () => import('./create/order-create'),
  },
];

export default routes;
