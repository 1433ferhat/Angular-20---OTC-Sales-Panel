// src/app/components/order-panel/order-panel.ts - Corrected version
import { CurrencyPipe } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  computed,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PaymentMethod } from '@shared/enums/payment-method.enum';
import { getPriceTypeLabel } from '@shared/enums/price-type.enum';
import { OrderItemModel } from '@shared/models/order-item.model';
import { initialOrder, OrderModel } from '@shared/models/order.model';
import { CustomerStore } from '@shared/stores/customer.store';
import { OrderStore } from '@shared/stores/order.store';
import BarcodeScanner from '../barcode-scanner/barcode-scanner';
import { ProductModel } from '@shared/models/product.model';

@Component({
  selector: 'app-order-panel',
  templateUrl: './order-panel.html',
  styleUrl: './order-panel.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    BarcodeScanner,
    MatCardModule,
    MatIconModule,
    CurrencyPipe,
    MatMenuModule,
  ],
})
export default class OrderPanel {
  readonly #customerStore = inject(CustomerStore);
  readonly #orderStore = inject(OrderStore);
  readonly getPriceTypeText = getPriceTypeLabel;
  readonly PaymentMethod = PaymentMethod;
  readonly items = signal<OrderItemModel[]>([]);

  readonly selectCustomer = computed(() => this.#customerStore.customer());

  readonly cartTotal = computed<number>(() =>
    this.items().reduce((sum, i) => sum + i.totalPrice, 0)
  );

  addItem(product: ProductModel) {
    this.items.set();
  }

  getBarcodeText(barcodes?: { value: string }[]): string {
    if (!barcodes || barcodes.length === 0) return '';
    return barcodes.map((b) => b.value).join(', ');
  }

  changeQuantity(itemId: string, change: number) {
    const currentItems = this.items();
    const updated = currentItems.map((item) => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + change);
        return {
          ...item,
          quantity: newQty,
          totalPrice: newQty * item.unitPrice,
        };
      }
      return item;
    });

    this.items.set(updated);
  }
  updateQuantityManual(itemId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const newQuantity = Math.max(1, parseInt(input.value || '1', 10));
    const updated = this.items().map((item) =>
      item.id === itemId
        ? {
            ...item,
            quantity: newQuantity,
            totalPrice: newQuantity * item.unitPrice,
          }
        : item
    );
    this.items.set(updated);
  }
  removeItem(itemId: string) {
    const updated = this.items().filter((item) => item.id !== itemId);
    this.items.set(updated);
  }
  cancelOrder() {
    this.items.set([]); // sepeti tamamen boşalt
  }

  completeOrder(paymentId: PaymentMethod) {
    const order = { ...initialOrder };
    order.customerId = this.selectCustomer()?.id;
    order.items = this.items();
    order.paymentMethod = paymentId;
    this.#orderStore.createOrder(order);
  }
}
