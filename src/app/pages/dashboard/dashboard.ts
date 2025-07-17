import { Component, ChangeDetectionStrategy, ViewEncapsulation, computed, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
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
  ]
})
export default class Dashboard {
  private layout = inject(Layout);

  todaysSales = computed(() => this.layout.todaysSales());
  lowStockProducts = computed(() => this.layout.lowStockProducts());

  getTodaysOrderCount(): number {
    return 24; // Mock data
  }

  getTotalProducts(): number {
    return this.layout.products().length;
  }

  getRecentActivities() {
    return [
      { id: 1, type: 'sale', icon: 'shopping_cart', message: 'Vitamin D3 satışı yapıldı', time: new Date() },
      { id: 2, type: 'stock', icon: 'inventory', message: 'Omega-3 stok girişi', time: new Date() },
      { id: 3, type: 'order', icon: 'receipt', message: 'Sipariş #ORD-123 tamamlandı', time: new Date() }
    ];
  }
}