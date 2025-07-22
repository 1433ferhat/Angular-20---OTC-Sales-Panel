import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CustomerModel } from '@shared/models/customer.model';
import { CustomerService } from '@shared/stores/customer.store';
import { getPriceTypeLabel } from '@shared/enums/price-type.enum';

@Component({
  selector: 'app-customers',
  templateUrl: './customer.html',
  styleUrl: './customer.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSnackBarModule,
    RouterModule,
  ],
})
export default class Customers implements OnInit {
  private customerService = inject(CustomerService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  customers: CustomerModel[] = [];
  searchQuery = '';

  displayedColumns = ['name', 'phone', 'email', 'priceType', 'type', 'actions'];

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
      },
      error: (error) => {
        console.error('Müşteriler yüklenirken hata:', error);
        this.snackBar.open('Müşteriler yüklenirken hata oluştu', 'Tamam', {
          duration: 3000,
        });
      },
    });
  }

  addCustomer() {
    this.router.navigate(['/customer/create']);
  }

  editCustomer(customer: CustomerModel) {
    this.router.navigate(['/customer/create', customer.id]);
  }

  getPriceTypeLabel = getPriceTypeLabel;

  getCustomerType(customer: CustomerModel): string {
    return customer.tcNo ? 'Bireysel' : 'Kurumsal';
  }

  deleteCustomer(customer: CustomerModel) {
    if (
      confirm(
        `${customer.name} müşterisini silmek istediğinizden emin misiniz?`
      )
    ) {
      this.customerService.deleteCustomer(customer.id!).subscribe({
        next: () => {
          this.customers = this.customers.filter((c) => c.id !== customer.id);
          this.snackBar.open('Müşteri silindi', 'Tamam', { duration: 2000 });
        },
        error: (error) => {
          console.error('Müşteri silinirken hata:', error);
          this.snackBar.open('Müşteri silinirken hata oluştu', 'Tamam', {
            duration: 3000,
          });
        },
      });
    }
  }

  get filteredCustomers() {
    if (!this.searchQuery) return this.customers;

    return this.customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        customer.phone.includes(this.searchQuery) ||
        customer.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
}
