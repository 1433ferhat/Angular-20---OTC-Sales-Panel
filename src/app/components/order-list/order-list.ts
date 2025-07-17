import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewEncapsulation, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { OrderModel } from '@shared/models/order.model';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    CurrencyPipe,
    DatePipe
  ]
})
export default class OrderList {
  @Input() orders: OrderModel[] = [];
  @Output() orderSelected = new EventEmitter<OrderModel>();

  selectedStatus = signal<string>('all');
  
  filteredOrders = computed(() => {
    const status = this.selectedStatus();
    if (status === 'all') return this.orders;
    return this.orders.filter(o => o.status === status);
  });

  selectOrder(order: OrderModel) {
    this.orderSelected.emit(order);
  }

  getStatusIcon(status: string): string {
    const icons:any = {
      'pending': 'schedule',
      'completed': 'check_circle',
      'cancelled': 'cancel'
    };
    return icons[status] || 'help';
  }

  getStatusText(status: string): string {
    const texts:any = {
      'pending': 'Bekleyen',
      'completed': 'Tamamlandı',
      'cancelled': 'İptal Edildi'
    };
    return texts[status] || 'Bilinmiyor';
  }
}