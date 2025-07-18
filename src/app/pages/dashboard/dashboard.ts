// src/app/pages/dashboard/dashboard.ts
import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  computed,
  inject,
} from '@angular/core';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
} from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Layout from '../../layout/layout';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    CurrencyPipe,
    DatePipe,
  ],
})
export default class Dashboard {
  private layout = inject(Layout);

  // Layout'tan doğru computed signal'ları kullan
  todaysSales = computed(() => this.layout.todaysSales());
  lowStockProducts = computed(() => this.layout.lowStockProducts());

  getTodaysOrderCount(): number {
    // Gerçek veri için layout'tan günlük siparişleri hesapla
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.layout.orders().filter((order) => {
      if (!order.orderDate) return false;
      const orderDate = new Date(order.orderDate);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    }).length;
  }

  getTotalProducts(): number {
    return this.layout.products().length;
  }

  getRecentActivities() {
    // Gerçek verilerden son aktiviteleri al
    const recentOrders = this.layout.recentOrders();
    const activities: any[] = [];

    // Son siparişlerden aktivite oluştur
    recentOrders.forEach((order) => {
      activities.push({
        id: `order-${order.id}`,
        type: 'order',
        icon: 'receipt',
        message: `Sipariş #${order.documentNumber} tamamlandı`,
        time: order.orderDate || new Date(),
      });
    });

    // Düşük stok uyarılarından aktivite oluştur
    const lowStock = this.lowStockProducts().slice(0, 3);
    lowStock.forEach((product) => {
      activities.push({
        id: `stock-${product.id}`,
        type: 'stock',
        icon: 'warning',
        message: `${product.name} stoğu azaldı (${product.stock || 0})`,
        time: new Date(),
      });
    });

    return activities.slice(0, 5); // Son 5 aktiviteyi göster
  }
}
