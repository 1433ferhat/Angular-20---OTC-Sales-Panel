// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guard/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login'),
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout'),
    canActivate: [authGuard],
    children: [
      // {
      //   path: 'dashboard',
      //   loadComponent: () => import('./pages/dashboard/dashboard'),
      //   title: 'Dashboard - OTC Satış',
      // },
      {
        path: '',
        loadComponent: () => import('./pages/orders/create/order-create'),
        title: 'Satış Yap - OTC Satış',
      },
      {
        path: 'siparisler',
        loadChildren: () => import('./pages/orders/orders.routes'),
      },
      {
        path: 'urunler',
        title: 'Fiyat Sorgula - OTC Satış',
        loadChildren: () => import('./pages/products/products.routes'),
      },
      {
        path: 'musteriler',
        loadChildren: () => import('./pages/customer/customer.routes'),
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders/orders'),
        title: 'Sipariş Listesi - OTC Satış',
      },
      {
        path: 'pending-orders',
        loadComponent: () => import('./pages/orders/orders'),
        title: 'Bekleyen Siparişler - OTC Satış',
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports'),
        title: 'Satış Raporları - OTC Satış',
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings'),
        title: 'Genel Ayarlar - OTC Satış',
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users'),
        title: 'Kullanıcı Yönetimi - OTC Satış',
      },
      {
        path: 'backup',
        loadComponent: () => import('./pages/backup/backup'),
        title: 'Yedekleme - OTC Satış',
      },
      {
        path: '**',
        redirectTo: 'dashboard',
      },
    ],
  },
];
