import { Route } from '@angular/router';

export  const  routes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./customer'),
  },
  {
    path: 'musteri-ekle',
    loadComponent: () => import('./create/customer-create'),
  },
];

export default routes;