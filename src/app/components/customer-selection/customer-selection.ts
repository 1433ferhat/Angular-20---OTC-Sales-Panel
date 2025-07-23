// src/app/components/customer-selection/customer-selection.ts - Corrected
import { Component, Inject, signal, OnInit, computed, inject } from '@angular/core';
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
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerModel, initialCustomer } from '@shared/models/customer.model';
import { CustomerStore } from '@shared/stores/customer.store';
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
    MatCardModule,
  ],
})
export default class CustomerSelection implements OnInit {
  private customerStore = inject(CustomerStore);
  private snackBar = inject(MatSnackBar);
  
  selectedTabIndex = signal(0);
  searchQuery = signal('');
  
  customerData: CustomerModel = { ...initialCustomer };
  
  // Store'dan müşteri listesi
  customers = computed(() => this.customerStore.customers());
  
  // Filtered customers based on search
  filteredCustomers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allCustomers = this.customers();
    
    if (!query) {
      return allCustomers;
    }
    
    return allCustomers.filter(customer =>
      customer.firstName.toLowerCase().includes(query) ||
      customer.lastName.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      (customer.tcNo && customer.tcNo.includes(query)) ||
      (customer.taxNumber && customer.taxNumber.includes(query))
    );
  });

  PriceType = PriceType;
  isCorporate = signal(false);

  // Form validation
  isFormValid = computed(() => {
    const { firstName, lastName, phone, email, tcNo, taxNumber, type } = this.customerData;

    if (!firstName || !lastName || !phone || !email || type === undefined) {
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    // Phone validation
    if (phone.length < 10) {
      return false;
    }

    if (this.isCorporate()) {
      return !!(taxNumber && taxNumber.length === 10);
    } else {
      return !!(tcNo && tcNo.length === 11);
    }
  });

  constructor(
    public dialogRef: MatDialogRef<CustomerSelection>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    console.log('CustomerSelection initialized');
    // Store'dan müşterileri yükle
    this.customerStore.customersResource.reload();
  }

  selectExistingCustomer(customer: CustomerModel) {
    console.log('Müşteri seçildi:', customer);
    this.dialogRef.close(customer);
  }

  onCustomerTypeChange() {
    if (this.isCorporate()) {
      this.customerData.tcNo = undefined;
      this.customerData.isCorporate = true;
    } else {
      this.customerData.taxNumber = undefined;
      this.customerData.companyName = undefined;
      this.customerData.isCorporate = false;
    }
  }

  async saveNewCustomer() {
    if (!this.isFormValid()) {
      this.snackBar.open('Lütfen tüm alanları doğru şekilde doldurun', 'Tamam', {
        duration: 3000,
      });
      return;
    }

    try {
      // Store kullanarak müşteri kaydet
      const savedCustomer = await this.customerStore.createCustomer(this.customerData);
      
      this.snackBar.open('Müşteri başarıyla kaydedildi', 'Tamam', {
        duration: 2000,
      });

      this.dialogRef.close(savedCustomer);
    } catch (error) {
      console.error('Müşteri kaydetme hatası:', error);
      this.snackBar.open('Müşteri kaydedilirken hata oluştu', 'Tamam', {
        duration: 3000,
      });
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }

  // Utility methods
  formatPhoneNumber(phone: string): string {
    return phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '($1) $2 $3 $4');
  }

  getCustomerDisplayName(customer: CustomerModel): string {
    return `${customer.firstName} ${customer.lastName}`;
  }

  // Enum utility functions
  getPriceTypeLabel = getPriceTypeLabel;
  getPriceTypeOptions = getPriceTypeOptions;
}