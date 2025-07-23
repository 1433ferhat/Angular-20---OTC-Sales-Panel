// src/app/components/order-panel/order-panel.ts
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

  updateQuantity(id: string, change: number) {
    const cartItems = this.cartItems();
    const item = cartItems.find((i) => i.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      this.orderStore.updateCartItemQuantity(item.id, newQuantity);
    }
  }

  removeFromCart(id: string) {
    this.orderStore.removeFromCart(id);
    this.snackBar.open('Ürün sepetten çıkarıldı', 'Tamam', { duration: 2000 });
  }

  selectCustomer() {
    const dialogRef = this.dialog.open(CustomerSelection, {
      width: '600px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selectedCustomer.set(result);
        this.productStore.updateProductPricesForCustomer(result.priceType);
      }
    });
  }

  async completeOrder(paymentMethod: PaymentMethod) {
    const customer = this.selectedCustomer();
    if (!customer) {
      this.snackBar.open('Lütfen müşteri seçin', 'Tamam', { duration: 3000 });
      return;
    }

    const cartItems = this.cartItems();
    if (cartItems.length === 0) {
      this.snackBar.open('Sepet boş', 'Tamam', { duration: 3000 });
      return;
    }

    const order = await this.orderStore.completeOrder(customer, paymentMethod);

    if (order) {
      this.selectedCustomer.set(null);
      this.snackBar.open('Sipariş tamamlandı!', 'Tamam', { duration: 3000 });
    } else {
      this.snackBar.open('Sipariş tamamlanırken hata oluştu', 'Tamam', {
        duration: 3000,
      });
    }
  }

  cancelOrder() {
    this.orderStore.clearCart();
    this.selectedCustomer.set(null);
    this.snackBar.open('Sipariş iptal edildi', 'Tamam', { duration: 2000 });
  }

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
