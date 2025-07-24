import { Injectable, signal, computed, inject, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrderModel } from '../models/order.model';
import { OrderItemModel } from '../models/order-item.model';
import { CustomerModel } from '../models/customer.model';
import { lastValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaginateModel } from '@shared/models/paginate.model';
import { OrderItemStore } from './order-item.store';
import { CustomerStore } from './customer.store';

@Injectable({
  providedIn: 'root',
})
export class OrderStore {
  private http = inject(HttpClient);
  readonly #orderItemStore = inject(OrderItemStore);
  readonly #customerStore = inject(CustomerStore);
  readonly items = computed<OrderItemModel[]>(() =>
    this.#orderItemStore.items()
  );
  // Signals
  private order = signal<OrderModel | null>(null);

  // Resource with error handling
  ordersResource = resource({
    loader: () =>
      lastValueFrom(this.http.get<PaginateModel<OrderModel>>('api/orders')),
  });

  // Computed signals
  orders = computed(() => this.ordersResource.value()?.items || []);
  currentOrder = computed(() => this.order());
  loading = computed(() => this.ordersResource.isLoading());
  error = computed(() => this.ordersResource.error());

  // Actions
  loadOrders() {
    this.ordersResource.reload();
  }

  async createOrder(paymentMethod: PaymentMethod): Promise<boolean> {
    try {
      const customer = this.#customerStore.customer();
      const orderData = {
        customerId: customer?.id,
        customer: customer,
        items: this.items(),
        totalPrice: this.#orderItemStore.itemTotal(),
        totalQuantity: this.#orderItemStore.itemCount(),
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
        this.cancelOrder();
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
  cancelOrder() {
    this.#orderItemStore.clearItems();
    this.#customerStore.selectCustomer('');
  }
}
