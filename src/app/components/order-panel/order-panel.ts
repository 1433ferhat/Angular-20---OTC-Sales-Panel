import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OrderItemModel } from '@shared/models/order-item.model';
import { OrderModel } from '@shared/models/order.model';

@Component({
  selector: 'app-order-panel',
  templateUrl: './order-panel.html',
  styleUrl: './order-panel.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    CurrencyPipe
  ]
})
export default class OrderPanel {
  @Input() currentOrder: OrderModel | null = null;
  @Input() cart: OrderItemModel[] = [];
  @Input() cartTotal: number = 0;
  @Input() cartItemCount: number = 0;

  @Output() quantityChanged = new EventEmitter<{productId: number, change: number}>();
  @Output() itemRemoved = new EventEmitter<number>();
  @Output() orderCompleted = new EventEmitter<'cash' | 'card'>();
  @Output() orderCancelled = new EventEmitter<void>();

  changeQuantity(productId: number, change: number) {
    this.quantityChanged.emit({ productId, change });
  }

  removeItem(productId: number) {
    this.itemRemoved.emit(productId);
  }

  completeOrder(paymentMethod: 'cash' | 'card') {
    this.orderCompleted.emit(paymentMethod);
  }

  cancelOrder() {
    this.orderCancelled.emit();
  }
}
