import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

interface MenuItem {
  name: string;
  icon: string;
  route: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
  ],
})
export default class Sidebar {
  private router = inject(Router);

  currentRoute = signal<string>('');
  expandedCategories = signal<Set<string>>(new Set(['Satış İşlemleri']));

  singleItems: MenuItem[] = [
    { name: 'Dashboard', icon: 'dashboard', route: 'dashboard' },
  ];

  categories: MenuItem[] = [
    {
      name: 'Satış İşlemleri',
      icon: 'point_of_sale',
      route: '',
      children: [
        { name: 'Satış Yap', icon: 'shopping_cart', route: 'sales' },
        { name: 'Hızlı Satış', icon: 'flash_on', route: 'quick-sales' },
        { name: 'Fiyat Sorgula', icon: 'search', route: 'price-check' },
      ],
    },
    {
      name: 'Siparişler',
      icon: 'receipt_long',
      route: '',
      children: [
        {
          name: 'Sipariş Oluştur',
          icon: 'add_shopping_cart',
          route: 'create-order',
        },
        { name: 'Sipariş Listesi', icon: 'list_alt', route: 'orders' },
        {
          name: 'Bekleyen Siparişler',
          icon: 'schedule',
          route: 'pending-orders',
        },
      ],
    },
    {
      name: 'Stok Yönetimi',
      icon: 'inventory_2',
      route: '',
      children: [
        { name: 'Ürün Listesi', icon: 'inventory', route: 'inventory' },
        { name: 'Stok Girişi', icon: 'add_box', route: 'stock-in' },
        {
          name: 'Stok Çıkışı',
          icon: 'remove_shopping_cart',
          route: 'stock-out',
        },
        { name: 'Stok Sayımı', icon: 'fact_check', route: 'stock-count' },
      ],
    },
    {
      name: 'Raporlar',
      icon: 'analytics',
      route: '',
      children: [
        { name: 'Satış Raporları', icon: 'trending_up', route: 'reports' },
        { name: 'Stok Raporları', icon: 'storage', route: 'stock-reports' },
        {
          name: 'Finansal Raporlar',
          icon: 'account_balance',
          route: 'financial-reports',
        },
      ],
    },
    {
      name: 'Ayarlar',
      icon: 'settings',
      route: '',
      children: [
        { name: 'Genel Ayarlar', icon: 'tune', route: 'settings' },
        { name: 'Kullanıcı Yönetimi', icon: 'people', route: 'users' },
        { name: 'Yedekleme', icon: 'backup', route: 'backup' },
      ],
    },
  ];

  constructor() {
    // Set initial route
    this.updateCurrentRoute();
  }

  navigate(route: string) {
    console.log(`Navigating to: ${route}`);
    this.router
      .navigate([route])
      .then((success) => {
        console.log('Navigation result:', success);
        if (success) {
          this.updateCurrentRoute();
        }
      })
      .catch((error) => {
        console.error('Navigation error:', error);
      });
  }

  toggleCategory(categoryName: string) {
    const expanded = this.expandedCategories();
    const newExpanded = new Set(expanded);

    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }

    this.expandedCategories.set(newExpanded);
    console.log(`Toggled category: ${categoryName}`, newExpanded);
  }

  isExpanded(categoryName: string): boolean {
    return this.expandedCategories().has(categoryName);
  }

  isActive(route: string): boolean {
    const current = this.currentRoute();
    return current === route;
  }

  private updateCurrentRoute() {
    const url = this.router.url;
    const route = url.split('/').filter((segment) => segment)[0] || 'dashboard';
    this.currentRoute.set(route);
    console.log(`Current route updated to: ${route}`);
  }
}
