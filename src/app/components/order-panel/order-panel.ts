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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { OrderItemModel } from '@shared/models/order-item.model';
import { OrderModel } from '@shared/models/order.model';
import { CustomerModel } from '@shared/models/customer.model';
import { PaymentMethod } from '@shared/enums/payment-method.enum';
import { PriceType } from '@shared/enums/price-type.enum';

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
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    FormsModule,
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

  PaymentMethod = PaymentMethod;

  changeQuantity(itemId: string, change: number) {
    const item = this.cart.find((i) => i.id === itemId);
    if (item) {
      this.quantityChanged.emit({ productId: item.productId, change });
    }
  }

  updateQuantityManual(itemId: string, event: any) {
    const newQuantity = parseInt(event.target.value) || 1;
    const item = this.cart.find((i) => i.id === itemId);
    if (item) {
      const change = newQuantity - item.quantity;
      if (change !== 0) {
        this.quantityChanged.emit({ productId: item.productId, change });
      }
    }
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

  getPriceTypeText(priceType: PriceType): string {
    const priceTypes: Record<PriceType, string> = {
      [PriceType.Undefined]: 'Tanımsız',
      [PriceType.ZON]: 'Zon',
      [PriceType.LZON]: 'L-Zon',
      [PriceType.E1]: 'E1',
      [PriceType.NV]: 'NV',
      [PriceType.FB]: 'FB',
      [PriceType.TY]: 'TY',
      [PriceType.HB]: 'HB',
      [PriceType.N11]: 'N11',
      [PriceType.PTT]: 'PTT',
      [PriceType.AMZ]: 'AMZ',
      [PriceType.PZR]: 'PZR',
      [PriceType.IDE]: 'IDE',
      [PriceType.ETIC]: 'ETIC',
      [PriceType.ECZ]: 'Eczane',
      [PriceType.T1]: 'T1',
      [PriceType.T2]: 'T2',
      [PriceType.T3]: 'T3',
      [PriceType.T4]: 'T4',
      [PriceType.T5]: 'T5',
    };
    return priceTypes[priceType] || 'Bilinmeyen';
  }
}
