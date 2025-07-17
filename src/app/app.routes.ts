// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout'),
    children: [
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./pages/dashboard/dashboard'),
        title: 'Dashboard - OTC Satış'
      },
      { 
        path: 'sales', 
        loadComponent: () => import('./pages/home/home'),
        title: 'Satış Yap - OTC Satış'
      },
      { 
        path: 'quick-sales', 
        loadComponent: () => import('./pages/home/home'),
        title: 'Hızlı Satış - OTC Satış'
      },
      { 
        path: 'price-check', 
        loadComponent: () => import('./pages/home/home'),
        title: 'Fiyat Sorgula - OTC Satış'
      },
      { 
        path: 'create-order', 
        loadComponent: () => import('./pages/orders/orders'),
        title: 'Sipariş Oluştur - OTC Satış'
      },
      { 
        path: 'orders', 
        loadComponent: () => import('./pages/orders/orders'),
        title: 'Sipariş Listesi - OTC Satış'
      },
      { 
        path: 'pending-orders', 
        loadComponent: () => import('./pages/orders/orders'),
        title: 'Bekleyen Siparişler - OTC Satış'
      },
      { 
        path: 'inventory', 
        loadComponent: () => import('./pages/inventory/inventory'),
        title: 'Ürün Listesi - OTC Satış'
      },
      { 
        path: 'stock-in', 
        loadComponent: () => import('./pages/inventory/inventory'),
        title: 'Stok Girişi - OTC Satış'
      },
      { 
        path: 'stock-out', 
        loadComponent: () => import('./pages/inventory/inventory'),
        title: 'Stok Çıkışı - OTC Satış'
      },
      { 
        path: 'stock-count', 
        loadComponent: () => import('./pages/inventory/inventory'),
        title: 'Stok Sayımı - OTC Satış'
      },
      { 
        path: 'reports', 
        loadComponent: () => import('./pages/reports/reports'),
        title: 'Satış Raporları - OTC Satış'
      },
      { 
        path: 'stock-reports', 
        loadComponent: () => import('./pages/reports/reports'),
        title: 'Stok Raporları - OTC Satış'
      },
      { 
        path: 'financial-reports', 
        loadComponent: () => import('./pages/reports/reports'),
        title: 'Finansal Raporlar - OTC Satış'
      },
      { 
        path: 'settings', 
        loadComponent: () => import('./pages/settings/settings'),
        title: 'Genel Ayarlar - OTC Satış'
      },
      { 
        path: 'users', 
        loadComponent: () => import('./pages/users/users'),
        title: 'Kullanıcı Yönetimi - OTC Satış'
      },
      { 
        path: 'backup', 
        loadComponent: () => import('./pages/backup/backup'),
        title: 'Yedekleme - OTC Satış'
      },
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  }
];