import { Injectable, signal, computed, inject, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CustomerModel } from '../models/customer.model';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomerStore {
  private http = inject(HttpClient);
  customersResource = resource({
    loader: () =>
      lastValueFrom(this.http.get<CustomerModel[]>('api/customers/getall')),
  });

  // Computed signals
  readonly customers = computed(() => this.customersResource.value() || []);
  readonly loading = computed(() => this.customersResource.isLoading());
  readonly error = computed(() => this.customersResource.error());

  readonly selectedCustomerId = signal<string | undefined>(undefined);
  readonly customer = computed(() => {
    const id = this.selectedCustomerId();
    const customer = id ? this.customers().find((c) => c.id === id) : undefined;
    return customer;
  });

  selectCustomer(id: string) {
    this.selectedCustomerId.set(id);
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
