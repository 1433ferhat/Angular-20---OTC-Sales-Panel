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
import { CustomerModel } from '@shared/models/customer.model';

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
  ],
})
export class CustomerSelectionComponent {
  customerData: Partial<CustomerModel> = {
    name: '',
    phone: '',
    email: '',
    isEInvoice: true,
  };

  constructor(
    public dialogRef: MatDialogRef<CustomerSelectionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onInvoiceTypeChange() {
    if (this.customerData.isEInvoice === true) {
      this.customerData.taxOffice = undefined;
      this.customerData.taxNo = undefined;
      this.customerData.isEInvoice = undefined;
    } else {
      this.customerData.tcNo = undefined;
    }
  }

  isFormValid(): boolean {
    const { name, phone, email, isEInvoice, tcNo, taxOffice, taxNo } =
      this.customerData;

    const basicValid = name && phone && email && isEInvoice;

    if (isEInvoice === true) {
      return basicValid && tcNo && tcNo.length === 11 ? true : false;
    } else {
      return basicValid && taxOffice && taxNo && taxNo.length === 10
        ? true
        : false;
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onConfirm() {
    if (this.isFormValid()) {
      const customer: CustomerModel = {
        ...(this.customerData as CustomerModel),
      };
      this.dialogRef.close(customer);
    }
  }
}