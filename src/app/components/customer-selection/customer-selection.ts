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
import { CustomerModel } from '@shared/models/customer.model';
import { PriceType, getPriceTypeLabel, getPriceTypeOptions } from '@shared/enums/price-type.enum';

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
  ],
})
export default class CustomerSelection implements OnInit {
  selectedTabIndex = signal(0);
  searchQuery = signal('');
  
  customerData: Partial<CustomerModel> = {
    name: '',
    phone: '',
    email: '',
    isEInvoice: true,
    priceType: PriceType.ECZ,
  };

  savedCustomers: CustomerModel[] = [];
  filteredCustomers = signal<CustomerModel[]>([]);

  PriceType = PriceType;
  isCorporate = signal(false);

  constructor(
    public dialogRef: MatDialogRef<CustomerSelection>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.loadSavedCustomers();
    this.filterCustomers();
  }

  loadSavedCustomers() {
    const saved = localStorage.getItem('customers');
    this.savedCustomers = saved ? JSON.parse(saved) : [];
    this.filteredCustomers.set(this.savedCustomers);
  }

  filterCustomers() {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      this.filteredCustomers.set(this.savedCustomers);
      return;
    }

    const filtered = this.savedCustomers.filter(customer =>
      customer.name.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      customer.email.toLowerCase().includes(query)
    );
    this.filteredCustomers.set(filtered);
  }

  selectExistingCustomer(customer: CustomerModel) {
    this.dialogRef.close(customer);
  }

  onCustomerTypeChange() {
    if (this.isCorporate()) {
      this.customerData.tcNo = undefined;
    } else {
      this.customerData.taxOffice = undefined;
      this.customerData.taxNo = undefined;
    }
  }

  isFormValid(): boolean {
    const { name, phone, email, tcNo, taxOffice, taxNo, priceType } = this.customerData;

    if (!name || !phone || !email || priceType === undefined) {
      return false;
    }

    if (this.isCorporate()) {
      return !!(taxOffice && taxNo && taxNo.length === 10);
    } else {
      return !!(tcNo && tcNo.length === 11);
    }
  }

  onEInvoiceChange() {
    // E-fatura değişikliği
  }

  saveNewCustomer() {
    if (this.isFormValid()) {
      const customer: CustomerModel = {
        id: crypto.randomUUID(),
        name: this.customerData.name!,
        phone: this.customerData.phone!,
        email: this.customerData.email!,
        isEInvoice: this.customerData.isEInvoice!,
        priceType: this.customerData.priceType!,
        ...(this.isCorporate()
          ? {
              taxOffice: this.customerData.taxOffice!,
              taxNo: this.customerData.taxNo!,
            }
          : {
              tcNo: this.customerData.tcNo!,
            }),
      };

      // LocalStorage'a kaydet
      this.savedCustomers.push(customer);
      localStorage.setItem('customers', JSON.stringify(this.savedCustomers));

      this.dialogRef.close(customer);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  // Enum utility functions
  getPriceTypeLabel = getPriceTypeLabel;
  getPriceTypeOptions = getPriceTypeOptions;
}