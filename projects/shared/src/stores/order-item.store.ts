import {
  computed,
  effect,
  inject,
  Injectable,
  signal,
  untracked,
} from '@angular/core';
import { OrderItemModel } from '@shared/models/order-item.model';
import { ProductModel } from '@shared/models/product.model';
import { CustomerStore } from './customer.store';
import { ProductStore } from './product.store';
import { PriceType } from '@shared/enums/price-type.enum';
@Injectable({
  providedIn: 'root',
})
export class OrderItemStore {
  readonly #customerStore = inject(CustomerStore);
  readonly #productStore = inject(ProductStore);

  readonly customerType = computed(
    () => this.#customerStore.customer()?.type ?? PriceType.ETIC
  );
  readonly items = signal<OrderItemModel[]>([]);
  readonly products = signal<ProductModel[]>(this.#productStore.products());

  constructor() {
    effect(() => {
      const items = untracked(() => this.items());
      const type = this.customerType();
      if (!items.length) return;
      const updatedItems = items.map((item) => {
        const price =
          item?.product?.prices?.find((p) => p.priceType == type)?.price ?? 0;
        item.unitPrice = price;
        item.totalPrice = price * item.quantity;
        return { ...item };
      });
      this.items.set(updatedItems);
    });
  }

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

    this.updateItemQuantity(existingItem.id, 1);
  }

  updateItemQuantity(itemId: string, newQuantity: number) {
    const existingItem = this.items().find((item) => itemId === itemId);
    if (!existingItem) return;
    const customerType = this.customerType();
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
      return { ...item };
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
    const type = untracked(() => this.customerType());
    return this.items().reduce((total, item) => {
      const price =
        item.product?.prices?.find((p) => p.priceType == type)?.price ?? 0;
      return total + price * item.quantity;
    }, 0);
  });
  itemCount = computed(() => {
    return this.items().reduce((count, item) => count + item.quantity, 0);
  });
}
