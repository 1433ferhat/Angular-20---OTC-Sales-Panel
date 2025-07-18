import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewEncapsulation, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductModel } from '@shared/models/product.model';

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.html',
  styleUrl: './product-grid.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
})
export default class ProductGrid {
  @Input() products = signal<ProductModel[]>([]);
  @Output() productSelected = new EventEmitter<ProductModel>();

  selectProduct(product: ProductModel) {
    this.productSelected.emit(product);
  }

  getCategoryIcon(categoryName?: string): string {
    if (!categoryName) return 'category';
    switch (categoryName.toLowerCase()) {
      case 'vitamin': return 'medication';
      case 'skincare': return 'face';
      case 'supplement': return 'eco';
      default: return 'category';
    }
  }

  getFirstBarcode(product: ProductModel): string {
    return product.barcodes?.[0]?.value || 'Barkod Yok';
  }

  getProductPrice(product: ProductModel): number {
    return product.prices?.[0]?.price || 0;
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'normal-stock';
  }

  getStockIcon(stock: number): string {
    if (stock === 0) return 'error';
    if (stock < 10) return 'warning';
    return 'check_circle';
  }
}
