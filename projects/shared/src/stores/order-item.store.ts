import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { OrderItemModel } from '@shared/models/order-item.model';
import { ProductModel } from '@shared/models/product.model';
import { CustomerStore } from './customer.store';
import { ProductStore } from './product.store';
@Injectable({
  providedIn: 'root',
})
export class OrderItemStore {
  readonly #customerStore = inject(CustomerStore);
  readonly #productStore = inject(ProductStore);

  readonly items = signal<OrderItemModel[]>([]);
  readonly products = signal<ProductModel[]>(this.#productStore.products());
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
      newQuantity = newQuantity === 0 ? item.quantity : newQuantity;
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

  removeItem(id: string) {
    const items = this.items();
    this.items.set(items.filter((item) => item.id !== id));
  }
  clearItems() {
    this.items.set([]);
  }

  itemTotal = computed(() => {
    return this.items().reduce((total, item) => {
      const price = item.product?.prices?.[0]?.price || 0;
      return total + price * item.quantity;
    }, 0);
  });
  itemCount = computed(() => {
    return this.items().reduce((count, item) => count + item.quantity, 0);
  });

  updatePrice() {
    const items = this.items();
    if (!items) return;

    items.map((item) => {
      this.updateCartItemQuantity(item.id, 0);
    });
  }
}
