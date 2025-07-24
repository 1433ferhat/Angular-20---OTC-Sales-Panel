// src/app/components/order-panel/order-panel.ts - Corrected version
import { CurrencyPipe } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  computed,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PaymentMethod } from '@shared/enums/payment-method.enum';
import { OrderItemModel } from '@shared/models/order-item.model';
import { CustomerStore } from '@shared/stores/customer.store';
import { OrderStore } from '@shared/stores/order.store';
import { OrderItemStore } from '@shared/stores/order-item.store';
import { CustomerModel } from '@shared/models/customer.model';
import { getPriceTypeLabel } from '@shared/enums/price-type.enum';
import { ProductBarcodeModel } from '@shared/models/product-barcode.model';

@Component({
  selector: 'app-order-panel',
  templateUrl: './order-panel.html',
  styleUrl: './order-panel.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [MatCardModule, MatIconModule, CurrencyPipe, MatMenuModule],
})
export default class OrderPanel {
  readonly #orderItemStore = inject(OrderItemStore);
  readonly #orderStore = inject(OrderStore);
  readonly #customerStore = inject(CustomerStore);
  readonly items = computed<OrderItemModel[]>(() =>
    this.#orderItemStore.items()
  );
  readonly customer = computed<CustomerModel>(() =>
    this.#customerStore.customer()
  );
  readonly PaymentMethod = PaymentMethod;
  getBarcodeText(barcodes: ProductBarcodeModel[] | undefined) {
    return barcodes ? barcodes.map((b) => b.value).join(', ') : '';
  }

  updateQuantityManual(itemId: string, event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    const quantity = parseInt(input.value, 10);

    if (isNaN(quantity)) return;

    this.#orderItemStore.updateCartItemQuantity(itemId, quantity);
  }
  changeQuantity = this.#orderItemStore.updateCartItemQuantity;
  removeItem = this.#orderItemStore.removeItem;
  readonly itemTotal = computed(() => this.#orderItemStore.itemTotal());
  cancelOrder = this.#orderStore.cancelOrder;
  getPriceTypeText = getPriceTypeLabel;

  createOrder = this.#orderStore.createOrder;
}
