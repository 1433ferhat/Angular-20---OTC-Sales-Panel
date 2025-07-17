import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewEncapsulation, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ProductModel } from '@shared/models/product.model';

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.html',
  styleUrl: './product-grid.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule
  ]
})
export default class ProductGrid {
  @Input() products: ProductModel[] = [];
  @Output() productSelected = new EventEmitter<ProductModel>();

  selectedCategory = signal<string>('all');
  
  filteredProducts = computed(() => {
    const category = this.selectedCategory();
    if (category === 'all') return this.products;
    return this.products.filter(p => p.category === category);
  });

  selectCategory(category: string) {
    this.selectedCategory.set(category);
  }

  selectProduct(product: ProductModel) {
    this.productSelected.emit(product);
  }

  getCategoryCount(category: string): number {
    return this.products.filter(p => p.category === category).length;
  }

  getCategoryIcon(category: string): string {
    const icons:any = {
      'vitamin': 'medication',
      'skincare': 'face',
      'supplement': 'eco',
      'hygiene': 'soap',
      'baby': 'child_care',
      'medical': 'medical_services'
    };
    return icons[category] || 'inventory';
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'normal-stock';
  }

  getStockIcon(stock: number): string {
    if (stock === 0) return 'block';
    if (stock < 10) return 'warning';
    return 'check_circle';
  }
}