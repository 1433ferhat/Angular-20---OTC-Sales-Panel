import { Component, Inject, signal } from '@angular/core';
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
import { CustomerModel } from '@shared/models/customer.model';
import { PriceType } from '@shared/enums/price-type.enum';

@Component({
  selector: 'app-customer-selection',
  templateUrl: './customer-selection.html',
  styleUrl: './customer-seleciton.scss',
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
  ],
})
export default class CustomerSelection {
  customerData: Partial<CustomerModel> = {
    name: '',
    phone: '',
    email: '',
    isEInvoice: true,
    priceType: PriceType.ECZ, // Default eczane fiyatı
  };

  // Enum'ları template'te kullanabilmek için
  PriceType = PriceType;
  isCorporate = signal(false);

  // Fiyat tipi seçenekleri
  priceTypeOptions = [
    { value: PriceType.ECZ, label: 'Eczane Fiyatı' },
    { value: PriceType.ZON, label: 'Zon Fiyatı' },
    { value: PriceType.LZON, label: 'L-Zon Fiyatı' },
    { value: PriceType.E1, label: 'E1 Fiyatı' },
    { value: PriceType.NV, label: 'NV Fiyatı' },
    { value: PriceType.T1, label: 'T1 Fiyatı' },
    { value: PriceType.T2, label: 'T2 Fiyatı' },
    { value: PriceType.T3, label: 'T3 Fiyatı' },
  ];

  constructor(
    public dialogRef: MatDialogRef<CustomerSelection>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  // Kurumsal/Bireysel değişiminde form temizle
  onCustomerTypeChange() {
    if (this.isCorporate()) {
      // Kurumsal seçildi
      this.customerData.tcNo = undefined;
    } else {
      // Bireysel seçildi
      this.customerData.taxOffice = undefined;
      this.customerData.taxNo = undefined;
    }
  }

  // Form validasyonu
  isFormValid(): boolean {
    const {
      name,
      phone,
      email,
      isEInvoice,
      tcNo,
      taxOffice,
      taxNo,
      priceType,
    } = this.customerData;

    // Temel alanlar kontrolü
    if (!name || !phone || !email || priceType === undefined) {
      return false;
    }

    // Kurumsal ise
    if (this.isCorporate()) {
      return !!(taxOffice && taxNo && taxNo.length === 10);
    }
    // Bireysel ise
    else {
      return !!(tcNo && tcNo.length === 11);
    }
  }

  // E-fatura checkbox değişimi
  onEInvoiceChange() {
    // E-fatura seçilirse otomatik olarak gerekli alanları göster
  }

  onCancel() {
    this.dialogRef.close();
  }

  onConfirm() {
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

      this.dialogRef.close(customer);
    }
  }
}
