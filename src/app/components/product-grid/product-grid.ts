import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ColDef, GridReadyEvent, GridApi, GridOptions } from 'ag-grid-community';
import { ProductModel } from '@shared/models/product.model';
import { AgGridAngular } from 'ag-grid-angular';

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.html',
  styleUrl: './product-grid.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    AgGridAngular,
  ],
})
export default class ProductGrid {
  @Input() products: ProductModel[] = [];
  @Output() productSelected = new EventEmitter<ProductModel>();

  private gridApi!: GridApi; // Bu satırı ekle

  columnDefs: ColDef[] = [
    {
      headerName: 'Ürün Adı',
      field: 'name',
      filter: 'agTextColumnFilter',
      sortable: true,
      resizable: true,
      flex: 2,
      cellRenderer: (params: any) => {
        const product = params.data;
        return `
          <div style="display: flex; flex-direction: column; padding: 4px 0;">
            <div style="font-weight: 500; font-size: 14px;">${
              product.name
            }</div>
            <div style="font-size: 12px; color: #666;">${
              product.category?.name || 'Kategorisiz'
            }</div>
          </div>
        `;
      },
    },
    {
      headerName: 'Barkod',
      field: 'barcodes',
      filter: 'agTextColumnFilter',
      sortable: true,
      resizable: true,
      flex: 1,
      valueGetter: (params) => {
        return params.data.barcodes?.[0]?.value || 'Barkod Yok';
      },
    },
    {
      headerName: 'Kategori',
      field: 'category.name',
      filter: 'agSetColumnFilter',
      sortable: true,
      resizable: true,
      flex: 1,
      valueGetter: (params) => {
        return params.data.category?.name || 'Kategorisiz';
      },
    },
    {
      headerName: 'Stok',
      field: 'stock',
      filter: 'agNumberColumnFilter',
      sortable: true,
      resizable: true,
      flex: 1,
      cellStyle: (params) => {
        const stock = params.value || 0;
        if (stock === 0) return { color: '#f44336', fontWeight: 'bold' };
        if (stock < 10) return { color: '#ff9800', fontWeight: 'bold' };
        return { color: '#4caf50', fontWeight: 'bold' };
      },
      valueFormatter: (params) => {
        return `${params.value || 0} adet`;
      },
    },
    {
      headerName: 'Fiyat',
      field: 'prices',
      filter: 'agNumberColumnFilter',
      sortable: true,
      resizable: true,
      flex: 1,
      valueGetter: (params) => {
        return params.data.prices?.[0]?.price || 0;
      },
      valueFormatter: (params) => {
        return new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY',
        }).format(params.value);
      },
      cellStyle: { color: '#2e7d32', fontWeight: '500' },
    },
    {
      headerName: 'İşlemler',
      field: 'actions',
      sortable: false,
      filter: false,
      resizable: false,
      width: 150,
      cellRenderer: (params: any) => {
        const product = params.data;
        const isOutOfStock = (product.stock || 0) === 0;

        return `
          <button 
            class="ag-action-button ${isOutOfStock ? 'disabled' : ''}"
            onclick="window.addToCart('${product.id}')"
            ${isOutOfStock ? 'disabled' : ''}>
            <span class="material-icons">add_shopping_cart</span>
            Sepete Ekle
          </button>
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

  // GridOptions tipini düzelt
  gridOptions: GridOptions = {
    pagination: true,
    paginationPageSize: 20,
    rowHeight: 60,
    headerHeight: 50,
    animateRows: true,
    enableRangeSelection: true,
    suppressRowClickSelection: true,
    rowSelection: 'single', // Bu doğru
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;

    // Global addToCart fonksiyonu
    (window as any).addToCart = (productId: string) => {
      const product = this.products.find((p) => p.id === productId);
      if (product) {
        this.productSelected.emit(product);
      }
    };

    // Grid'i otomatik boyutlandır
    params.api.sizeColumnsToFit();
  }
}
