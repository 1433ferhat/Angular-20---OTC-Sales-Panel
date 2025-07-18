import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OrderItemModel } from '@shared/models/order-item.model';
import { OrderModel } from '@shared/models/order.model';
import { CustomerModel } from '@shared/models/customer.model';
import { PaymentMethod } from '@shared/enums/payment-method.enum';

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
    CurrencyPipe,
  ],
})
export default class OrderPanel {
  @Input() currentOrder: OrderModel | null = null;
  @Input() cart: OrderItemModel[] = [];
  @Input() cartTotal: number = 0;
  @Input() cartItemCount: number = 0;
  @Input() selectedCustomer: CustomerModel | null = null;

  @Output() quantityChanged = new EventEmitter<{
    productId: string;
    change: number;
  }>();
  @Output() itemRemoved = new EventEmitter<string>();
  @Output() orderCompleted = new EventEmitter<PaymentMethod>();
  @Output() orderCancelled = new EventEmitter<void>();
  @Output() customerSelectionRequested = new EventEmitter<void>();

  // Enum'u template'te kullanabilmek için
  PaymentMethod = PaymentMethod;

  changeQuantity(itemId: string, change: number) {
    this.quantityChanged.emit({ productId: itemId, change });
  }

  removeItem(itemId: string) {
    this.itemRemoved.emit(itemId);
  }

  completeOrder(paymentMethod: PaymentMethod) {
    if (!this.selectedCustomer) return;
    this.orderCompleted.emit(paymentMethod);
  }

  cancelOrder() {
    this.orderCancelled.emit();
  }

  selectCustomer() {
    this.customerSelectionRequested.emit();
  }

  getItemName(item: OrderItemModel): string {
    return item.product?.name || 'Bilinmeyen Ürün';
  }

  getItemBrand(item: OrderItemModel): string {
    return item.product?.category?.name || 'Bilinmeyen';
  }

  getItemBarcode(item: OrderItemModel): string {
    return item.product?.barcodes?.[0]?.value || '';
  }
}
