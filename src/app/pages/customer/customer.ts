import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
import { CustomerStore } from '@shared/stores/customer.store';
import { getPriceTypeLabel } from '@shared/enums/price-type.enum';
import { FlexiGridModule } from 'flexi-grid';
@Component({
  selector: 'app-customers',
  templateUrl: './customer.html',
  styleUrl: './customer.scss',
  standalone: true,
  imports: [
    FlexiGridModule,
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
export default class Customers {
  private customerStore = inject(CustomerStore);
  private snackBar = inject(MatSnackBar);

  // Computed properties using store signals
  customers = computed(() => this.customerStore.customers());
  loading = computed(() => this.customerStore.loading());
  refresh() {
    this.customerStore.customersResource.reload();
  }
  async deleteCustomer(customer: CustomerModel) {
    if (
      confirm(
        `${customer.firstName} müşterisini silmek istediğinizden emin misiniz?`
      )
    ) {
      try {
        await this.customerStore.deleteCustomer(customer.id!);
        this.snackBar.open('Müşteri silindi', 'Tamam', { duration: 2000 });
      } catch (error) {
        console.error('Müşteri silinirken hata:', error);
        this.snackBar.open('Müşteri silinirken hata oluştu', 'Tamam', {
          duration: 3000,
        });
      }
    }
  }
}
