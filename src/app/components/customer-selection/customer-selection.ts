// src/app/components/customer-selection/customer-selection.ts
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  ViewEncapsulation,
  inject,
  computed,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridReadyEvent,
  GridApi,
  GridOptions,
} from 'ag-grid-community';
import { CustomerModel } from '@shared/models/customer.model';
import { CustomerStore } from '@shared/stores/customer.store';
import { getPriceTypeLabel } from '@shared/enums/price-type.enum';

@Component({
  selector: 'app-customer-selection',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    AgGridAngular,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './customer-selection.html',
  styleUrl: './customer-selection.scss',
})
export default class CustomerSelection {
  private customerStore = inject(CustomerStore);
  private gridApi!: GridApi;

  // Store'dan gelen computed değerler
  customers = computed(() => this.customerStore.customers());
  loading = computed(() => this.customerStore.loading());

  columnDefs: ColDef[] = [
    {
      headerName: 'Müşteri Adı',
      field: 'displayName',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      sortable: true,
      resizable: true,
      flex: 2,
      valueGetter: (params) => {
        const customer = params.data;
        return customer.isCorporate && customer.companyName
          ? customer.companyName
          : `${customer.firstName} ${customer.lastName}`.trim();
      },
      cellRenderer: (params: any) => {
        const customer = params.data;
        const displayName =
          customer.isCorporate && customer.companyName
            ? customer.companyName
            : `${customer.firstName} ${customer.lastName}`.trim();

        return `
          <div style="display: flex; flex-direction: column; padding: 4px 0;">
            <div style="font-weight: 500; font-size: 14px;">${displayName}</div>
            <div style="font-size: 12px; color: #666;">
              ${
                customer.isCorporate ? 'Kurumsal' : 'Bireysel'
              } - ${getPriceTypeLabel(customer.type)}
            </div>
          </div>
        `;
      },
    },
    {
      headerName: 'Telefon',
      field: 'phone',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      sortable: true,
      resizable: true,
      flex: 1,
    },
    {
      headerName: 'E-posta',
      field: 'email',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      sortable: true,
      resizable: true,
      flex: 1,
    },
    {
      headerName: 'Tip',
      field: 'type',
      filter: 'agTextColumnFilter',
      sortable: true,
      resizable: true,
      flex: 1,
      valueGetter: (params) => getPriceTypeLabel(params.data.type),
    },
    {
      headerName: 'İşlemler',
      field: 'actions',
      sortable: false,
      filter: false,
      resizable: false,
      width: 120,
      pinned: 'right',
      cellRenderer: (params: any) => {
        return `
          <button 
            class="select-button" 
            onclick="window.selectCustomer('${params.data.id}')"
            type="button">
            ✓ Seç
          </button>
        `;
      },
    },
  ];

  defaultColDef: ColDef = {
    flex: 1,
    sortable: true,
    filter: true,
    resizable: true,
  };

  gridOptions: GridOptions = {
    suppressRowClickSelection: false,
    rowSelection: 'single',
    animateRows: true,
    pagination: true,
    paginationPageSize: 10,
    suppressCellFocus: true,
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { selectedCustomer?: CustomerModel },
    private dialogRef: MatDialogRef<CustomerSelection>
  ) {
    // Global fonksiyon tanımla (ag-grid button onclick için)
    (window as any).selectCustomer = (customerId: string) => {
      this.selectCustomerById(customerId);
    };
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  selectCustomerById(customerId: string) {
    const customer = this.customers().find((c) => c.id === customerId);
    if (customer) {
      this.selectCustomer(customer);
    }
  }

  selectCustomer(customer: CustomerModel) {
    // CustomerStore'daki selectCustomer metodunu çağır
    this.customerStore.selectCustomer(customer.id);

    // Dialog'u seçilen müşteri ile kapat
    this.dialogRef.close(customer);
  }

  close() {
    this.dialogRef.close();
  }
}