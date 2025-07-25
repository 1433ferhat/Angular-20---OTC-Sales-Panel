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
import { getPriceTypeLabel, PriceType } from '@shared/enums/price-type.enum';
import { ProductBarcodeModel } from '@shared/models/product-barcode.model';
import { MatButtonModule } from '@angular/material/button';
import CustomerSelection from '../customer-selection/customer-selection';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-order-panel',
  templateUrl: './order-panel.html',
  styleUrl: './order-panel.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    CurrencyPipe,
    MatMenuModule,
  ],
})
export default class OrderPanel {
  readonly #orderItemStore = inject(OrderItemStore);
  readonly #orderStore = inject(OrderStore);
  readonly #customerStore = inject(CustomerStore);
  private dialog = inject(MatDialog);

  readonly items = computed<OrderItemModel[]>(() =>
    this.#orderItemStore.items()
  );

  // customer - mevcut seçili müşteri
  readonly customer = computed<CustomerModel | undefined>(() =>
    this.#customerStore.customer()
  );

  readonly PaymentMethod = PaymentMethod;

  getBarcodeText(barcodes: ProductBarcodeModel[] | undefined) {
    return barcodes ? barcodes.map((b) => b.value).join(', ') : '';
  }

  updateQuantityManual(itemId: string, event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const quantity = parseInt(input.value, 10);

    if (isNaN(quantity)) return;

    this.#orderItemStore.updateItemQuantity(itemId, quantity);
  }

  readonly itemTotal = computed(() => this.#orderItemStore.itemTotal());

  //Siariş Oluştur
  createOrder = (paymentMethod: PaymentMethod) =>
    this.#orderStore.createOrder(paymentMethod);

  //Adet Değiştir
  changeQuantity = (itemId: string, quantity: number) =>
    this.#orderItemStore.updateItemQuantity(itemId, quantity);

  //Sepet'den Sil
  removeItem = (itemId: string) => this.#orderItemStore.removeItem(itemId);

  //Sepet boşalt
  cancelOrder = () => this.#orderStore.cancelOrder();

  getPriceTypeText = (priceType: PriceType) => getPriceTypeLabel(priceType);

  // selectCustomerDialog - müşteri seçim dialogunu açar
  selectCustomerDialog() {
    this.dialog.open(CustomerSelection, {
      width: '1100px',
      height: '800px',
      maxWidth: '100vw',
      maxHeight: '100vh',
    });
  }
}
