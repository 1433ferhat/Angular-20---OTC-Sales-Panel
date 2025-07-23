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

  expandedMenus = signal<Set<string>>(new Set(['Siparişler'])); // doğru ismi yaz

  menus: MenuItem[] = [
    {
      name: 'Siparişler',
      icon: 'receipt_long',
      route: '',
      children: [
        {
          name: 'Sipariş Oluştur',
          icon: 'add_shopping_cart',
          route: 'siparisler/ekle',
        },
        { name: 'Sipariş Listesi', icon: 'list_alt', route: 'orders' },
        {
          name: 'Bekleyen Siparişler',
          icon: 'schedule',
          route: 'pending-orders',
        },
      ],
    },
    { name: 'Ürün Listesi', icon: 'inventory_2', route: 'urunler' },
    { name: 'Müşteriler', icon: 'people', route: 'musteriler' },
  ];

  toggleMenu(menuName: string) {
    const expanded = this.expandedMenus();
    const newExpanded = new Set(expanded);
    newExpanded.has(menuName)
      ? newExpanded.delete(menuName)
      : newExpanded.add(menuName);
    this.expandedMenus.set(newExpanded);
  }
  isExpanded(menuName: string): boolean {
    return this.expandedMenus().has(menuName);
  }
}
