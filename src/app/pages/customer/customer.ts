// src/app/pages/customers/customers.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CustomerModel } from '@shared/models/customer.model';
import { PriceType, getPriceTypeLabel, getPriceTypeOptions } from '@shared/enums/price-type.enum';

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
    MatSelectModule,
    MatCardModule,
    MatDialogModule,
    MatCheckboxModule,
    MatRadioModule,
    MatPaginatorModule,
  ],
})
export default class Customers implements OnInit {
  customers = signal<CustomerModel[]>([]);
  searchQuery = signal('');
  selectedCustomer = signal<CustomerModel | null>(null);
  isEditing = signal(false);
  showForm = signal(false);

  customerForm: Partial<CustomerModel> = this.getEmptyForm();

  displayedColumns = ['name', 'phone', 'email', 'priceType', 'type', 'actions'];

  filteredCustomers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.customers();
    
    return this.customers().filter(customer =>
      customer.name.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      customer.email.toLowerCase().includes(query)
    );
  });

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    const saved = localStorage.getItem('customers');
    this.customers.set(saved ? JSON.parse(saved) : []);
  }

  saveCustomers() {
    localStorage.setItem('customers', JSON.stringify(this.customers()));
  }

  getEmptyForm(): Partial<CustomerModel> {
    return {
      name: '',
      phone: '',
      email: '',
      isEInvoice: false,
      priceType: PriceType.ECZ,
      isActive: true,
    };
  }

  showAddForm() {
    this.customerForm = this.getEmptyForm();
    this.isEditing.set(false);
    this.showForm.set(true);
  }

  editCustomer(customer: CustomerModel) {
    this.customerForm = { ...customer };
    this.isEditing.set(true);
    this.showForm.set(true);
  }

  cancelForm() {
    this.showForm.set(false);
    this.customerForm = this.getEmptyForm();
  }

  saveCustomer() {
    if (!this.isFormValid()) {
      this.snackBar.open('Lütfen tüm alanları doldurun', 'Tamam', { duration: 3000 });
      return;
    }

    const customers = this.customers();
    
    if (this.isEditing()) {
      // Güncelleme
      const index = customers.findIndex(c => c.id === this.customerForm.id);
      if (index > -1) {
        customers[index] = {
          ...this.customerForm as CustomerModel,
          updatedDate: new Date()
        };
        this.snackBar.open('Müşteri güncellendi', 'Tamam', { duration: 2000 });
      }
    } else {
      // Yeni ekleme
      const newCustomer: CustomerModel = {
        ...this.customerForm as CustomerModel,
        id: crypto.randomUUID(),
        createdDate: new Date(),
        isActive: true
      };
      customers.push(newCustomer);
      this.snackBar.open('Müşteri eklendi', 'Tamam', { duration: 2000 });
    }

    this.customers.set([...customers]);
    this.saveCustomers();
    this.cancelForm();
  }

  deleteCustomer(customer: CustomerModel) {
    if (confirm(`${customer.name} müşterisini silmek istediğinizden emin misiniz?`)) {
      const customers = this.customers().filter(c => c.id !== customer.id);
      this.customers.set(customers);
      this.saveCustomers();
      this.snackBar.open('Müşteri silindi', 'Tamam', { duration: 2000 });
    }
  }

  isFormValid(): boolean {
    const { name, phone, email, tcNo, taxOffice, taxNo, priceType } = this.customerForm;
    
    if (!name || !phone || !email || priceType === undefined) {
      return false;
    }

    const isCorporate = !!(taxOffice || taxNo);
    
    if (isCorporate) {
      return !!(taxOffice && taxNo && taxNo.length === 10);
    } else {
      return !!(tcNo && tcNo.length === 11);
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

  getPriceTypeLabel = getPriceTypeLabel;
  getPriceTypeOptions = getPriceTypeOptions;

  getCustomerType(customer: CustomerModel): string {
    return customer.tcNo ? 'Bireysel' : 'Kurumsal';
  }
}