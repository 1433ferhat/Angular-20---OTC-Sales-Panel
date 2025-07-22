import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerModel } from '@shared/models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);

  getAllCustomers(): Observable<CustomerModel[]> {
    return this.http.get<CustomerModel[]>('api/customers/getall');
  }

  getCustomerById(id: string): Observable<CustomerModel> {
    return this.http.get<CustomerModel>(`api/customers/${id}`);
  }

  createCustomer(customer: Omit<CustomerModel, 'id' | 'createdDate'>): Observable<CustomerModel> {
    return this.http.post<CustomerModel>('api/customers', customer);
  }

  updateCustomer(id: string, customer: Partial<CustomerModel>): Observable<CustomerModel> {
    return this.http.put<CustomerModel>(`api/customers/${id}`, customer);
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`api/customers/${id}`);
  }
}