import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewEncapsulation, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { OrderModel } from '@shared/models/order.model';
import { OrderItemModel } from '@shared/models/order-item.model';
import { OrderStatus } from '@shared/enums/order-status.enum';
import { PaymentMethod } from '@shared/enums/payment-method.enum';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, MatCardModule, MatIconModule],
})
export default class OrderList {
  @Input() orders = signal<OrderModel[]>([]);
  @Output() orderSelected = new EventEmitter<OrderModel>();

  selectOrder(order: OrderModel) {
    this.orderSelected.emit(order);
  }

  getOrderDate(order: OrderModel): Date {
    return order.orderDate || new Date();
  }

  getStatusIcon(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending: return 'pending';
      case OrderStatus.Processing: return 'autorenew';
      case OrderStatus.Shipped: return 'local_shipping';
      case OrderStatus.Delivered: return 'check_circle';
      case OrderStatus.Cancelled: return 'cancel';
      default: return 'help';
    }
  }

  getStatusText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending: return 'Bekliyor';
      case OrderStatus.Processing: return 'İşleniyor';
      case OrderStatus.Shipped: return 'Kargoda';
      case OrderStatus.Delivered: return 'Teslim Edildi';
      case OrderStatus.Cancelled: return 'İptal Edildi';
      default: return 'Bilinmeyen';
    }
  }

  getItemName(item: OrderItemModel): string {
    return item.product?.name || 'Bilinmeyen Ürün';
  }

  getPaymentIcon(paymentMethod?: PaymentMethod): string {
    if (!paymentMethod) return 'payment';
    switch (paymentMethod) {
      case PaymentMethod.Cash: return 'payments';
      case PaymentMethod.CreditCard: return 'credit_card';
      default: return 'payment';
    }
  }

  getPaymentText(paymentMethod?: PaymentMethod): string {
    if (!paymentMethod) return 'Bilinmeyen';
    switch (paymentMethod) {
      case PaymentMethod.Cash: return 'Nakit';
      case PaymentMethod.CreditCard: return 'Kredi Kartı';
      default: return 'Bilinmeyen';
    }
  }
}
