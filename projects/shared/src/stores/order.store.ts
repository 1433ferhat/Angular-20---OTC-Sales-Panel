import { Injectable, signal, computed, inject, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrderModel } from '../models/order.model';
import { OrderItemModel } from '../models/order-item.model';
import { ProductModel } from '../models/product.model';
import { CustomerModel } from '../models/customer.model';
import { lastValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaginateModel } from '@shared/models/paginate.model';
import { PriceType } from '@shared/enums/price-type.enum';

@Injectable({
  providedIn: 'root',
})
export class OrderStore {
  private http = inject(HttpClient);

  // Signals
  private _currentOrder = signal<OrderModel | null>(null);
  private _cartItems = signal<OrderItemModel[]>([]);

  // Resource with error handling
  ordersResource = resource({
    loader: () =>
      lastValueFrom(this.http.get<PaginateModel<OrderModel>>('api/orders')),
  });

  // Computed signals
  orders = computed(() => this.ordersResource.value()?.items || []);
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
        existingItem.productId,
        existingItem.quantity + quantity
      );
    } else {
      const unitPrice = product.prices?.[PriceType.ETIC]?.price || 0;
      if (unitPrice <= 0) return;
      const newItem: OrderItemModel = {
        id: '1',
        orderId: '',
        productId: product.id,
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: unitPrice * quantity,
        product: product,
      };
      this._cartItems.set([...items, newItem]);
    }
  }

  removeFromCart(id: string) {
    const items = this._cartItems();
    this._cartItems.set(items.filter((item) => item.id !== id));
  }

  updateCartItemQuantity(id: string, newQuantity: number) {
    const items = this._cartItems();
    const updatedItems = items.map((item) => {
      if (item.id === id) {
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
        this.http.post<OrderModel>('api/orders/create', order).pipe(
          catchError((error) => {
            console.error('Order creation error:', error);
            return of(null);
          })
        )
      );

      if (response) {
        this.loadOrders();
        this.clearCart();
        return response;
      }
      return null;
    } catch (error) {
      console.error('Order creation error:', error);
      return null;
    }
  }

  async completeOrder(
    customer: CustomerModel,
    paymentMethod: PaymentMethod
  ): Promise<boolean> {
    try {
      const orderData = {
        customerId: customer.id,
        customer: customer,
        items: this._cartItems(),
        totalPrice: this.cartTotal(),
        totalQuantity: this.cartItemCount(),
        paymentMethod: paymentMethod,
        status: OrderStatus.Completed,
      };

      const response = await lastValueFrom(
        this.http.post<OrderModel>('api/orders/complete', orderData).pipe(
          catchError((error) => {
            console.error('Order completion error:', error);
            return of(null);
          })
        )
      );

      if (response) {
        this.loadOrders();
        this.clearCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Order completion error:', error);
      return false;
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<boolean> {
    try {
      const response = await lastValueFrom(
        this.http
          .put<OrderModel>(`api/orders/${orderId}/status`, { status })
          .pipe(
            catchError((error) => {
              console.error('Order status update error:', error);
              return of(null);
            })
          )
      );

      if (response) {
        this.loadOrders();
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
    return this.orders()
      .filter((order) => order.status === OrderStatus.Completed)
      .reduce((total, order) => total + (order.totalPrice || 0), 0);
  }

  getTodaysSales(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.orders()
      .filter((order) => {
        if (!order.orderDate || order.status !== OrderStatus.Completed)
          return false;
        const orderDate = new Date(order.orderDate);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      })
      .reduce((total, order) => total + (order.totalPrice || 0), 0);
  }

  getOrdersCount(): number {
    return this.orders().length;
  }

  getPendingOrdersCount(): number {
    return this.orders().filter((o) => o.status === OrderStatus.Pending).length;
  }
}
