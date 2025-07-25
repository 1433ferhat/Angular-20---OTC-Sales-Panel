// src/app/pages/orders/orders.ts
import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import { OrderStore } from '@shared/stores/order.store';
import { OrderModel } from '@shared/models/order.model';
import { OrderStatus } from '@shared/enums/order-status.enum';
import { PaymentMethod } from '@shared/enums/payment-method.enum';

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
export default class Orders {
  readonly orderStore = inject(OrderStore);
  readonly orderStatus = OrderStatus;
  readonly paymentMethod = PaymentMethod;
 
  // Grid state
  private gridApi!: GridApi;
  selectedOrders = signal<OrderModel[]>([]);

  // Store computed values
  readonly orders = computed(() => this.orderStore.orders());
  readonly loading = computed(() => this.orderStore.loading());

  // Grid configuration
  columnDefs: ColDef[] = [
    {
      headerName: 'Sipariş No',
      field: 'documentNumber',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      sortable: true,
      resizable: true,
      width: 150,
      cellRenderer: (params: ICellRendererParams) => {
        const order = params.data as OrderModel;
        return `
          <div style="display: flex; align-items: center; height: 100%; font-weight: 500;">
            ${order.documentNumber || `#${order.id?.slice(-8)}`}
          </div>
        `;
      },
    },
    {
      headerName: 'Tarih',
      field: 'orderDate',
      filter: 'agDateColumnFilter',
      floatingFilter: true,
      sortable: true,
      resizable: true,
      width: 130,
      valueFormatter: (params: ValueFormatterParams) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
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
      flex: 2,
      valueGetter: (params) => {
        const customer = params.data.customer;
        const customerId = params.data.customerId;

        if (!customer && customerId) {
          return `Müşteri ID: ${customerId.slice(-8)}`;
        }
        if (!customer) return 'Bilinmeyen Müşteri';

        if (customer.isCorporate && customer.companyName) {
          return customer.companyName;
        }
        return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
      },
      cellRenderer: (params: ICellRendererParams) => {
        const customer = params.data.customer;
        const customerId = params.data.customerId;

        if (!customer && customerId) {
          return `
            <div style="display: flex; flex-direction: column; padding: 2px 0;">
              <div style="font-weight: 500; font-size: 14px;">Müşteri ID: ${customerId.slice(
                -8
              )}</div>
              <div style="font-size: 12px; color: #999;">Müşteri bilgisi yüklenemedi</div>
            </div>
          `;
        }

        if (!customer) {
          return '<div style="color: #999;">Bilinmeyen Müşteri</div>';
        }

        const displayName =
          customer.isCorporate && customer.companyName
            ? customer.companyName
            : `${customer.firstName || ''} ${customer.lastName || ''}`.trim();

        return `
          <div style="display: flex; flex-direction: column; padding: 2px 0;">
            <div style="font-weight: 500; font-size: 14px;">${displayName}</div>
            <div style="font-size: 12px; color: #666;">
              ${customer.isCorporate ? 'Kurumsal' : 'Bireysel'} Müşteri
            </div>
          </div>
        `;
      },
    },
    {
      headerName: 'Ürün Sayısı',
      field: 'totalQuantity',
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      sortable: true,
      resizable: true,
      width: 120,
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params: ICellRendererParams) => {
        const order = params.data as OrderModel;
        return `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
            <span style="background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
              ${order.totalQuantity} adet
            </span>
          </div>
        `;
      },
    },
    {
      headerName: 'Toplam Tutar',
      field: 'totalPrice',
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      sortable: true,
      resizable: true,
      width: 140,
      cellStyle: { textAlign: 'right', fontWeight: '500' },
      valueFormatter: (params: ValueFormatterParams) => {
        if (params.value == null) return '';
        return new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY',
          minimumFractionDigits: 2,
        }).format(params.value);
      },
    },
    {
      headerName: 'Ödeme Yöntemi',
      field: 'paymentMethod',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      sortable: true,
      resizable: true,
      width: 140,
      cellRenderer: (params: ICellRendererParams) => {
        const paymentMethod = params.data.paymentMethod;
        const getPaymentInfo = (method?: number) => {
          switch (method) {
            case 1: // Cash
              return { text: 'Nakit', icon: '💰', color: '#4caf50' };
            case 2: // CreditCard
              return { text: 'Kredi Kartı', icon: '💳', color: '#2196f3' };
            default:
              return { text: 'Bilinmeyen', icon: '❓', color: '#999' };
          }
        };

        const info = getPaymentInfo(paymentMethod);
        return `
          <div style="display: flex; align-items: center; height: 100%;">
            <span style="margin-right: 6px;">${info.icon}</span>
            <span style="color: ${info.color}; font-weight: 500;">${info.text}</span>
          </div>
        `;
      },
    },
    {
      headerName: 'Durum',
      field: 'status',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      sortable: true,
      resizable: true,
      width: 130,
      cellRenderer: (params: ICellRendererParams) => {
        const status = params.data.status;
        const getStatusInfo = (status: number) => {
          switch (status) {
            case 1: // Pending
              return { text: 'Bekliyor', color: '#ff9800', bgColor: '#fff3e0' };
            case 2: // Processing
              return {
                text: 'İşleniyor',
                color: '#2196f3',
                bgColor: '#e3f2fd',
              };
            case 3: // Shipped
              return { text: 'Kargoda', color: '#9c27b0', bgColor: '#f3e5f5' };
            case 4: // Delivered
              return {
                text: 'Teslim Edildi',
                color: '#4caf50',
                bgColor: '#e8f5e8',
              };
            case 5: // Completed
              return {
                text: 'Tamamlandı',
                color: '#4caf50',
                bgColor: '#e8f5e8',
              };
            case 6: // Cancelled
              return {
                text: 'İptal Edildi',
                color: '#f44336',
                bgColor: '#ffebee',
              };
            default:
              return { text: 'Bilinmeyen', color: '#999', bgColor: '#f5f5f5' };
          }
        };

        const info = getStatusInfo(status);
        return `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
            <span style="
              background: ${info.bgColor}; 
              color: ${info.color}; 
              padding: 4px 12px; 
              border-radius: 16px; 
              font-size: 12px; 
              font-weight: 500;
              border: 1px solid ${info.color}20;
            ">
              ${info.text}
            </span>
          </div>
        `;
      },
    },
    {
      headerName: 'İşlemler',
      field: 'actions',
      sortable: false,
      filter: false,
      resizable: false,
      width: 120,
      cellRenderer: (params: ICellRendererParams) => {
        return `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; gap: 8px;">
            <button 
              class="action-btn view-btn" 
              title="Detayları Görüntüle"
              onclick="window.viewOrder('${params.data.id}')"
            >
              👁️
            </button>
            <button 
              class="action-btn edit-btn" 
              title="Düzenle"
              onclick="window.editOrder('${params.data.id}')"
            >
              ✏️
            </button>
            <button 
              class="action-btn print-btn" 
              title="Yazdır"
              onclick="window.printOrder('${params.data.id}')"
            >
              🖨️
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
      enableClickSelection: false,
    },
    animateRows: true,
    rowHeight: 60,
    headerHeight: 48,
    floatingFiltersHeight: 40,
    pagination: true,
    paginationPageSize: 25,
    paginationPageSizeSelector: [10, 25, 50, 100],
    localeText: {
      // Türkçe yerelleştirme
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

  // Lifecycle
  ngOnInit() {
    // Global action handlers
    (window as any).viewOrder = (orderId: string) => this.viewOrder(orderId);
    (window as any).editOrder = (orderId: string) => this.editOrder(orderId);
    (window as any).printOrder = (orderId: string) => this.printOrder(orderId);
  }

  ngOnDestroy() {
    // Cleanup global handlers
    delete (window as any).viewOrder;
    delete (window as any).editOrder;
    delete (window as any).printOrder;
  }

  // Grid events
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onSelectionChanged() {
    const selectedRows = this.gridApi.getSelectedRows();
    this.selectedOrders.set(selectedRows);
  }

  // Actions
  viewOrder(orderId: string) {
    const order = this.orders().find((o) => o.id === orderId);
    if (order) {
      console.log('Viewing order:', order);
      // TODO: Navigate to order detail page or open modal
    }
  }

  editOrder(orderId: string) {
    const order = this.orders().find((o) => o.id === orderId);
    if (order) {
      console.log('Editing order:', order);
      // TODO: Navigate to order edit page or open modal
    }
  }

  printOrder(orderId: string) {
    const order = this.orders().find((o) => o.id === orderId);
    if (order) {
      console.log('Printing order:', order);
      // TODO: Generate and print order receipt
    }
  }

  exportToExcel() {
    if (this.gridApi) {
      this.gridApi.exportDataAsExcel({
        fileName: `siparisler_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName: 'Siparişler',
      });
    }
  }

  exportSelectedToExcel() {
    if (this.gridApi && this.selectedOrders().length > 0) {
      this.gridApi.exportDataAsExcel({
        fileName: `secili_siparisler_${
          new Date().toISOString().split('T')[0]
        }.xlsx`,
        sheetName: 'Seçili Siparişler',
        onlySelected: true,
      });
    }
  }

  refreshData() {
    this.orderStore.ordersResource.reload();
  }

  // Bulk actions
  deleteSelectedOrders() {
    const selected = this.selectedOrders();
    if (selected.length > 0) {
      // TODO: Implement bulk delete
      console.log('Deleting orders:', selected);
    }
  }

  changeSelectedOrdersStatus(newStatus: OrderStatus) {
    const selected = this.selectedOrders();
    if (selected.length > 0) {
      // TODO: Implement bulk status change
      console.log('Changing status to:', newStatus, selected);
    }
  }
}
