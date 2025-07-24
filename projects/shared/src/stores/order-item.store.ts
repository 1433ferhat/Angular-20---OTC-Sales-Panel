import { computed, inject, Injectable, signal } from '@angular/core';
import { OrderItemModel } from '@shared/models/order-item.model';
import { ProductModel } from '@shared/models/product.model';
import { CustomerStore } from './customer.store';
@Injectable({
  providedIn: 'root',
})
export class OrderItemStore {
  readonly items = signal<OrderItemModel[]>([]);
  readonly #customerStore = inject(CustomerStore);
  readonly selectCustomer = computed(() => this.#customerStore.customer());

  addItem(product: ProductModel) {
    let existingItem = this.items().find((p) => p.productId == product.id);
    if (!existingItem) {
      existingItem = {
        id: crypto.randomUUID(),
        orderId: undefined,
        productId: product.id,
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
        product: product,
      };
      this.items.set([...this.items(), existingItem]);
    }

    this.updateCartItemQuantity(existingItem.id, 1);
  }

  updateCartItemQuantity(itemId: string, newQuantity: number) {
    const existingItem = this.items().find((item) => itemId === itemId);
    if (!existingItem) {
      return;
    }
    const customerType = this.selectCustomer()?.type;
    const product = existingItem?.product;
    const price =
      product?.prices?.find((p) => p.priceType == customerType)?.price ?? 0;
    const updatedItems = this.items().map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          unitPrice: price,
          totalPrice: price * newQuantity,
        };
      }
      return item;
    });

    this.items.set(updatedItems);
  }

  removeFromCart(id: string) {
    const items = this.items();
    this.items.set(items.filter((item) => item.id !== id));
  }
  clearCart() {
    this.items.set([]);
  }
}
