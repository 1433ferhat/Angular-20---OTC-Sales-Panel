import { Component, computed, inject, resource, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerModel, initialCustomer } from '@shared/models/customer.model';
import { CustomerStore } from '@shared/stores/customer.store';
import {
  getPriceTypeLabel,
  getPriceTypeOptions,
} from '@shared/enums/price-type.enum';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { CustomerCreateForm } from './customer-create.form';

@Component({
  selector: 'app-customer-create',
  templateUrl: './customer-create.html',
  styleUrl: './customer-create.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    ReactiveFormsModule,
  ],
})
export default class CustomerCreate {
  readonly id = signal<string | undefined>(undefined);
  readonly #customerCreateForm = inject(CustomerCreateForm);

  form: FormGroup = this.#customerCreateForm.createForm(initialCustomer);
  readonly #customerStore = inject(CustomerStore);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  readonly #activate = inject(ActivatedRoute);
  readonly #http = inject(HttpClient);
  readonly result = resource({
    params: () => this.id(),
    loader: async () => {
      const form = await lastValueFrom(
        this.#http.get<CustomerModel>(`api/customers/${this.id()}`)
      );
      this.form.patchValue(form);
      return form;
    },
  });

  readonly loading = computed(() => this.result?.isLoading() ?? true);

  constructor() {
    this.#activate.params.subscribe((res) => {
      if (res['id']) this.id.set(res['id']);
    });
  }

  save() {
    const formValue = this.form.value;
    if (
      !this.form.valid ||
      !this.#customerCreateForm.isFormValidCustom(formValue)
    ) {
      this.snackBar.open('Lütfen gerekli alanları doğru girin.', 'Tamam', {
        duration: 3000,
      });
      return;
    }

    const payload = this.form.value;

    if (this.id()) {
      payload.id = this.id();
      this.#customerStore.updateCustomer(payload).then(() => {
        this.snackBar.open('Müşteri güncellendi', 'Tamam', { duration: 2000 });
        this.router.navigate(['/customer']);
      });
    } else {
      this.#customerStore.createCustomer(payload).then(() => {
        this.snackBar.open('Müşteri eklendi', 'Tamam', { duration: 2000 });
        this.router.navigate(['/customer']);
      });
    }
  }

  onIsEInvoiceChange(isEInvoice: boolean) {
    const value: CustomerModel = this.result.value() ?? initialCustomer;

    this.form.patchValue({
      isEInvoice,
      tcNo: isEInvoice ? null : value.tcNo,
      taxNumber: isEInvoice ? value.taxNumber : null,
    });
  }
  onTypeChange(isCorporate: boolean) {
    const value: CustomerModel = this.result.value() ?? initialCustomer;
    this.form.patchValue({
      isCorporate,
      tcNo: isCorporate ? null : value.tcNo,
      companyName: isCorporate ? value.companyName : null,
      taxNumber: isCorporate ? value.taxNumber : null,
    });
  }

  priceTypeOptions = getPriceTypeOptions(); // sadece bir kere çağrılır
  getPriceTypeLabel = getPriceTypeLabel;
}
