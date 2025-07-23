// src/app/components/customer-selection/customer-selection.ts - Updated with enum utils
import { Component, Inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { CustomerModel, initialCustomer } from '@shared/models/customer.model';
import {
  PriceType,
  getPriceTypeLabel,
  getPriceTypeOptions,
} from '@shared/enums/price-type.enum';

@Component({
  selector: 'app-customer-selection',
  templateUrl: './customer-selection.html',
  styleUrl: './customer-selection.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatRadioModule,
    MatListModule,
    MatTabsModule,
    MatDividerModule,
  ],
})
export default class CustomerSelection {
  selectedTabIndex = signal(0);
  searchQuery = signal('');

  customerData: CustomerModel = initialCustomer;

  PriceType = PriceType;
  isCorporate = signal(false);

  constructor(
    public dialogRef: MatDialogRef<CustomerSelection>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  selectExistingCustomer(customer: CustomerModel) {
    this.dialogRef.close(customer);
  }

  onCustomerTypeChange() {
    if (this.isCorporate()) {
      this.customerData.tcNo = undefined;
    } else {
      this.customerData.taxNumber = undefined;
    }
  }

  isFormValid(): boolean {
    const { firstName, phone, email, tcNo, taxNumber, type } =
      this.customerData;

    if (!firstName || !phone || !email || type === undefined) {
      return false;
    }

    if (this.isCorporate()) {
      return !!(taxNumber && taxNumber.length === 10);
    } else {
      return !!(tcNo && tcNo.length === 11);
    }
  }

  onEInvoiceChange() {
    // E-fatura değişikliği
  }

  saveNewCustomer() {
    // if (this.isFormValid()) {
    //   // LocalStorage'a kaydet
    //   this.savedCustomers.push(this.customerData);
    //   localStorage.setItem('customers', JSON.stringify(this.savedCustomers));
    //   this.dialogRef.close(customer);
    // }
  }

  onCancel() {
    this.dialogRef.close();
  }

  // Enum utility functions
  getPriceTypeLabel = getPriceTypeLabel;
  getPriceTypeOptions = getPriceTypeOptions;
}
