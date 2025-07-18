// projects/shared/src/stores/order.store.ts
import { Injectable, signal, computed, inject, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrderModel } from '../models/order.model';
import { OrderItemModel } from '../models/order-item.model';
import { ProductModel } from '../models/product.model';
import { lastValueFrom } from 'rxjs';
import { OrderStatus } from '@shared/enums/order-status.enum';

@Injectable({
  providedIn: 'root',
})
export class OrderStore {
  private http = inject(HttpClient);

  // Signals
  private _currentOrder = signal<OrderModel | null>(null);
  private _cartItems = signal<OrderItemModel[]>([]);

  // Resource for orders (Angular 20 approach)
  ordersResource = resource({
    loader: () =>
      lastValueFrom(this.http.get<OrderModel[]>('api/orders/getall')),
  });

  // Computed signals
  orders = computed(() => this.ordersResource.value() || []);
  currentOrder = computed(() => this._currentOrder());
  cartItems = computed(() => this._cartItems());
  loading = computed(() => this.ordersResource.isLoading());
  error = computed(() => this.ordersResource.error());

  // Cart computations
  cartTotal = computed(() => {
    return this._cartItems().reduce((total, item) => {
      const price = item.product?.prices?.[0]?.price || 0;
      return total + price * item.quantity;
    }, 0);
  });

  cartItemCount = computed(() => {
    return this._cartItems().reduce((count, item) => count + item.quantity, 0);
  });

  constructor() {
    // Resource automatically loads on initialization
  }

  // Actions
  loadOrders() {
    this.ordersResource.reload();
  }

  // Cart operations
  addToCart(product: ProductModel, quantity: number = 1) {
    const items = this._cartItems();
    const existingItem = items.find((item) => item.productId === product.id);

    if (existingItem) {
      this.updateCartItemQuantity(
        existingItem.id,
        existingItem.quantity + quantity
      );
    } else {
      const newItem: OrderItemModel = {
        id: crypto.randomUUID(),
        orderId: '',
        expiration: undefined,
        productId: product.id,
        quantity: quantity,
        unitPrice: product.prices?.[0]?.price || 0,
        totalPrice: (product.prices?.[0]?.price || 0) * quantity,
        product: product,
      };

      this._cartItems.set([...items, newItem]);
    }
  }

  removeFromCart(itemId: string) {
    const items = this._cartItems();
    this._cartItems.set(items.filter((item) => item.id !== itemId));
  }

  updateCartItemQuantity(itemId: string, newQuantity: number) {
    const items = this._cartItems();
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.unitPrice * newQuantity,
        };
      }
      return item;
    });

    this._cartItems.set(updatedItems);
  }

  clearCart() {
    this._cartItems.set([]);
  }

  // Order operations
  async createOrder(
    orderData: Partial<OrderModel>
  ): Promise<OrderModel | null> {
    try {
      const order: Partial<OrderModel> = {
        ...orderData,
        items: this._cartItems(),
        totalPrice: this.cartTotal(),
        totalQuantity: this.cartItemCount(),
        orderDate: new Date(),
        status: OrderStatus.Pending,
      };

      const response = await lastValueFrom(
        this.http.post<OrderModel>('api/orders/create', order)
      );

      if (response) {
        this.loadOrders(); // Reload orders after creation
        this.clearCart();
        return response;
      }

      return null;
    } catch (error) {
      console.error('Order creation error:', error);
      return null;
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      const response = await lastValueFrom(
        this.http.put<OrderModel>(`api/orders/${orderId}/status`, { status })
      );

      if (response) {
        this.loadOrders(); // Reload orders after update
        return true;
      }

      return false;
    } catch (error) {
      console.error('Order status update error:', error);
      return false;
    }
  }

  getOrderById(id: string): OrderModel | undefined {
    return this.orders().find((o) => o.id === id);
  }

  getOrdersByStatus(status: OrderStatus): OrderModel[] {
    return this.orders().filter((o) => o.status === status);
  }

  getOrdersByDateRange(startDate: Date, endDate: Date): OrderModel[] {
    return this.orders().filter((o) => {
      if (!o.orderDate) return false;
      const orderDate = new Date(o.orderDate);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }

  // Statistics
  getTotalSales(): number {
    return this.orders().reduce(
      (total, order) =>
        total + order.items.reduce((sum, item) => sum + item.totalPrice, 0),
      0
    );
  }

  getOrdersCountByStatus(): Record<string, number> {
    const orders = this.orders();
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}