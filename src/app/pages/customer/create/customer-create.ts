import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerModel } from '@shared/models/customer.model';
import { CustomerService } from '@shared/stores/customer.store';
import {
  PriceType,
  getPriceTypeLabel,
  getPriceTypeOptions,
} from '@shared/enums/price-type.enum';

@Component({
  selector: 'app-customer-create',
  templateUrl: './customer-create.html',
  styleUrl: './customer-create.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
  ],
})
export default class CustomerCreate implements OnInit {
  private customerService = inject(CustomerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  isEditing = false;
  customerId: string | null = null;
  isLoading = false;

  customerForm: Partial<CustomerModel> = {
    name: '',
    phone: '',
    email: '',
    isEInvoice: false,
    priceType: PriceType.ECZ,
    isActive: true,
  };

  ngOnInit() {
    this.customerId = this.route.snapshot.paramMap.get('id');
    if (this.customerId) {
      this.isEditing = true;
      this.loadCustomer();
    }
  }

  loadCustomer() {
    if (!this.customerId) return;

    this.isLoading = true;
    this.customerService.getCustomerById(this.customerId).subscribe({
      next: (customer) => {
        this.customerForm = { ...customer };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Müşteri yüklenirken hata:', error);
        this.snackBar.open('Müşteri yüklenirken hata oluştu', 'Tamam', {
          duration: 3000,
        });
        this.router.navigate(['/customer']);
        this.isLoading = false;
      },
    });
  }

  save() {
    if (!this.isFormValid()) {
      this.snackBar.open('Lütfen tüm alanları doldurun', 'Tamam', {
        duration: 3000,
      });
      return;
    }

    this.isLoading = true;

    if (this.isEditing && this.customerId) {
      // Update
      this.customerService
        .updateCustomer(this.customerId, this.customerForm)
        .subscribe({
          next: () => {
            this.snackBar.open('Müşteri güncellendi', 'Tamam', {
              duration: 2000,
            });
            this.router.navigate(['/customer']);
          },
          error: (error) => {
            console.error('Müşteri güncellenirken hata:', error);
            this.snackBar.open('Müşteri güncellenirken hata oluştu', 'Tamam', {
              duration: 3000,
            });
            this.isLoading = false;
          },
        });
    } else {
      // Create
      const customerData = { ...this.customerForm } as Omit<
        CustomerModel,
        'id' | 'createdDate'
      >;

      this.customerService.createCustomer(customerData).subscribe({
        next: () => {
          this.snackBar.open('Müşteri eklendi', 'Tamam', { duration: 2000 });
          this.router.navigate(['/customer']);
        },
        error: (error) => {
          console.error('Müşteri eklenirken hata:', error);
          this.snackBar.open('Müşteri eklenirken hata oluştu', 'Tamam', {
            duration: 3000,
          });
          this.isLoading = false;
        },
      });
    }
  }

  cancel() {
    this.router.navigate(['/customer']);
  }

  isFormValid(): boolean {
    const { name, phone, email, priceType } = this.customerForm;
    if (!name || !phone || !email || priceType === undefined) {
      return false;
    }

    const isCorporate = this.isCorporate();

    if (isCorporate) {
      return !!(
        this.customerForm.taxOffice &&
        this.customerForm.taxNo &&
        this.customerForm.taxNo.length === 10
      );
    } else {
      return !!(this.customerForm.tcNo && this.customerForm.tcNo.length === 11);
    }
  }

  isCorporate(): boolean {
    return !!(this.customerForm.taxOffice || this.customerForm.taxNo);
  }

  onCustomerTypeChange(isCorporate: boolean) {
    if (isCorporate) {
      this.customerForm.tcNo = undefined;
    } else {
      this.customerForm.taxOffice = undefined;
      this.customerForm.taxNo = undefined;
    }
  }

  getPriceTypeOptions = getPriceTypeOptions;
  getPriceTypeLabel = getPriceTypeLabel;
}
