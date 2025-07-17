import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTreeModule } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';

interface MenuNode {
  name: string;
  icon?: string;
  route?: string;
  children?: MenuNode[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatTreeModule,
  ],
})
export default class Sidebar implements OnInit {
  treeControl = new NestedTreeControl<MenuNode>((node) => node.children);
  dataSource = new MatTreeNestedDataSource<MenuNode>();
  currentRoute = signal<string>('dashboard');

  menuData: MenuNode[] = [
    {
      name: 'Dashboard',
      icon: 'dashboard',
      route: 'dashboard',
    },
    {
      name: 'Satış İşlemleri',
      icon: 'point_of_sale',
      children: [
        { name: 'Satış Yap', icon: 'shopping_cart', route: 'sales' },
        { name: 'Hızlı Satış', icon: 'flash_on', route: 'quick-sales' },
        { name: 'Fiyat Sorgula', icon: 'search', route: 'price-check' },
      ],
    },
    {
      name: 'Siparişler',
      icon: 'receipt_long',
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
      children: [
        { name: 'Genel Ayarlar', icon: 'tune', route: 'settings' },
        { name: 'Kullanıcı Yönetimi', icon: 'people', route: 'users' },
        { name: 'Yedekleme', icon: 'backup', route: 'backup' },
      ],
    },
  ];

  ngOnInit() {
    this.dataSource.data = this.menuData;
  }

  hasChild = (_: number, node: MenuNode) =>
    !!node.children && node.children.length > 0;

  toggleNode(node: MenuNode) {
    this.treeControl.toggle(node);
  }

  isActiveRoute(route?: string): boolean {
    return route === this.currentRoute();
  }

  navigateToRoute(route?: string) {
    if (route) {
      this.currentRoute.set(route);
    }
  }

  getCategoryColor(categoryId: string): string {
    const colors: { [key: string]: string } = {
      sales: 'primary',
      orders: 'accent',
      inventory: 'warn',
      reports: 'primary',
      settings: 'warn',
    };
    return colors[categoryId] || 'primary';
  }
}
