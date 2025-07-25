import { Injectable, signal, computed, inject, resource } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
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
  readonly ordersResource = httpResource<OrderModel[]>(
    () => 'api/orders/getAll'
  );

  // Computed signals
  orders = computed(() => this.ordersResource.value() || []);
  currentOrder = computed(() => this.order());
  loading = computed(() => this.ordersResource.isLoading());
  error = computed(() => this.ordersResource.error());

  async createOrder(paymentMethod: PaymentMethod): Promise<boolean> {
    try {
      const customer = this.#customerStore.customer();
      const items = this.items().map(({ productId, quantity, unitPrice }) => ({
        productId,
        quantity,
        unitPrice,
      }));
      const orderData = {
        customerId: customer?.id,
        items: items,
        paymentMethod: paymentMethod,
        status: OrderStatus.Completed,
      };

      const response = await lastValueFrom(
        this.http.post<OrderModel>('api/orders', orderData).pipe(
          catchError((error) => {
            return of(null);
          })
        )
      );

      if (response) {
        this.ordersResource.reload();
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
        this.ordersResource.reload();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Order status update error:', error);
      return false;
    }
  }
  cancelOrder() {
    this.#orderItemStore.items.set([]);
    this.#customerStore.selectCustomer('');
  }
}
