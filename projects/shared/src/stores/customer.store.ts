import { Injectable, signal, computed, inject, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CustomerModel } from '../models/customer.model';
import { first, firstValueFrom, lastValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomerStore {
  private http = inject(HttpClient);
  readonly customer = signal<CustomerModel | undefined>(undefined);

  // Resource for customers (Angular 20 approach)
  customersResource = resource({
    loader: () =>
      lastValueFrom(this.http.get<CustomerModel[]>('api/customers/getall')),
  });

  // Computed signals
  customers = computed(() => this.customersResource.value() || []);
  loading = computed(() => this.customersResource.isLoading());
  error = computed(() => this.customersResource.error());

  selectCustomer(id: string) {
    this.customer.set(this.customers().find((c) => c.id == id));
  }
  async createCustomer(customer: CustomerModel): Promise<CustomerModel> {
    const result = await firstValueFrom(
      this.http.post<CustomerModel>('api/customers', customer)
    );
    this.customersResource.reload(); // Reload after create
    return result;
  }

  async updateCustomer(customer: CustomerModel): Promise<CustomerModel> {
    const result = await firstValueFrom(
      this.http.put<CustomerModel>(`api/customers`, customer)
    );
    this.customersResource.reload(); // Reload after update
    return result;
  }

  async deleteCustomer(id: string): Promise<void> {
    await lastValueFrom(this.http.delete<void>(`api/customers/${id}`));
    this.customersResource.reload(); // Reload after delete
  }
}
