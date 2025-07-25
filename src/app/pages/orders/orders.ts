// src/app/pages/orders/orders.ts
import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  computed,
  inject,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AgGridAngular } from 'ag-grid-angular';
import { Router } from '@angular/router';
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import { OrderStore } from '@shared/stores/order.store';
import { OrderStatus, getOrderStatusLabel } from '@shared/enums/order-status.enum';
import { PaymentMethod, getPaymentMethodLabel } from '@shared/enums/payment-method.enum';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    AgGridAngular,
  ],
})
export default class Orders implements OnInit, OnDestroy {
  readonly orderStore = inject(OrderStore);
  readonly router = inject(Router);
  readonly orderStatus = OrderStatus;
  readonly paymentMethod = PaymentMethod;
 
  private gridApi!: GridApi;
  selectedRowCount = signal(0);

  orders = computed(() => this.orderStore.orders());
  loading = computed(() => this.orderStore.loading());

  columnDefs: ColDef[] = [
    {
      headerName: '',
      width: 50,
      pinned: 'left',
    },
    {
      headerName: 'Belge No',
      field: 'documentNumber',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      sortable: true,
      resizable: true,
      width: 150,
      pinned: 'left',
    },
    {
      headerName: 'Tarih',
      field: 'orderDate',
      filter: 'agDateColumnFilter',
      floatingFilter: true,
      sortable: true,
      resizable: true,
      width: 140,
      valueFormatter: (params: ValueFormatterParams) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      headerName: 'Müşteri',
      field: 'customer',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      sortable: true,
      resizable: true,
      flex: 1,
      valueGetter: (params) => {
        const customer = params.data.customer;
        if (!customer) return 'Bilinmeyen Müşteri';
        if (customer.isCorporate && customer.companyName) {
          return customer.companyName;
        }
        return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
      },
    },
    {
      headerName: 'Durum',
      field: 'status',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      sortable: true,
      resizable: true,
      width: 120,
      cellRenderer: (params: ICellRendererParams) => {
        return getOrderStatusLabel(params.value);
      },
    },
    {
      headerName: 'Ödeme',
      field: 'paymentMethod',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      sortable: true,
      resizable: true,
      width: 120,
      cellRenderer: (params: ICellRendererParams) => {
        return getPaymentMethodLabel(params.value);
      },
    },
    {
      headerName: 'Toplam Tutar',
      field: 'totalPrice',
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      sortable: true,
      resizable: true,
      width: 130,
      valueFormatter: (params: ValueFormatterParams) => {
        if (params.value == null) return '0,00 ₺';
        return new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY',
          minimumFractionDigits: 2,
        }).format(params.value);
      },
    },
    {
      headerName: 'Adet',
      field: 'totalQuantity',
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      sortable: true,
      resizable: true,
      width: 80,
    },
    {
      headerName: 'İşlemler',
      field: 'actions',
      sortable: false,
      filter: false,
      resizable: false,
      width: 120,
      pinned: 'right',
      cellRenderer: (params: ICellRendererParams) => {
        const orderId = params.data.id;
        return `
          <div class="action-buttons">
            <button type="button" class="action-btn view-btn" onclick="viewOrder('${orderId}')" title="Görüntüle">
              👁️
            </button>
            <button type="button" class="action-btn edit-btn" onclick="editOrder('${orderId}')" title="Düzenle">
              ✏️
            </button>
          </div>
        `;
      },
    },
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
  };

  gridOptions: GridOptions = {
    rowSelection: {
      mode: 'multiRow',
      checkboxes: true,
    },
    animateRows: true,
    rowHeight: 60,
    headerHeight: 48,
    floatingFiltersHeight: 40,
    pagination: true,
    paginationPageSize: 25,
    paginationPageSizeSelector: [10, 25, 50, 100],
    localeText: {
      page: 'Sayfa',
      more: 'Daha fazla',
      to: '-',
      of: 'toplam',
      next: 'Sonraki',
      last: 'Son',
      first: 'İlk',
      previous: 'Önceki',
      loadingOoo: 'Yükleniyor...',
      selectAll: 'Tümünü Seç',
      searchOoo: 'Ara...',
      blanks: 'Boş',
      noRowsToShow: 'Gösterilecek sipariş bulunamadı',
      filterOoo: 'Filtrele...',
      equals: 'Eşittir',
      notEqual: 'Eşit değildir',
      lessThan: 'Küçüktür',
      greaterThan: 'Büyüktür',
      contains: 'İçerir',
      startsWith: 'İle başlar',
      endsWith: 'İle biter',
    },
  };

  ngOnInit() {
    (window as any).viewOrder = (orderId: string) => this.viewOrder(orderId);
    (window as any).editOrder = (orderId: string) => this.editOrder(orderId);
    
    this.orderStore.ordersResource.reload();
  }

  ngOnDestroy() {
    delete (window as any).viewOrder;
    delete (window as any).editOrder;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onSelectionChanged() {
    if (!this.gridApi) return;
    const selectedRows = this.gridApi.getSelectedRows();
    this.selectedRowCount.set(selectedRows.length);
  }

  viewOrder(orderId: string) {
    this.router.navigate(['/orders', orderId]);
  }

  editOrder(orderId: string) {
    this.router.navigate(['/orders', orderId, 'edit']);
  }

  refreshGrid() {
    this.orderStore.ordersResource.reload();
  }
}