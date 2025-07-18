// projects/shared/src/stores/product.store.ts
import { Injectable, signal, computed, inject, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductModel } from '../models/product.model';
import { CategoryModel } from '../models/category.model';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductStore {
  private http = inject(HttpClient);

  // Signals
  private _selectedCategory = signal<string>('all');
  private _refreshTrigger = signal(0);

  // Resource for products (Angular 20 approach)
  productsResource = resource({
    loader: () =>
      lastValueFrom(this.http.get<ProductModel[]>('api/products/getall')),
  });

  // Resource for categories
  categoriesResource = resource({
    loader: () =>
      lastValueFrom(this.http.get<CategoryModel[]>('api/categories/getall')),
  });

  // Computed signals
  products = computed(() => this.productsResource.value() || []);
  categories = computed(() => this.categoriesResource.value() || []);
  selectedCategory = computed(() => this._selectedCategory());
  loading = computed(
    () =>
      this.productsResource.isLoading() || this.categoriesResource.isLoading()
  );
  error = computed(
    () => this.productsResource.error() || this.categoriesResource.error()
  );

  // Filtered products based on selected category
  filteredProducts = computed(() => {
    const products = this.products();
    const category = this._selectedCategory();

    if (category === 'all') return products;
    return products.filter((p) => p.categoryId === category);
  });

  constructor() {
    // Resources automatically load on initialization
  }

  // Actions
  loadProducts() {
    this.productsResource.reload();
  }

  loadCategories() {
    this.categoriesResource.reload();
  }

  refreshData() {
    this._refreshTrigger.set(this._refreshTrigger() + 1);
    this.loadProducts();
    this.loadCategories();
  }

  setSelectedCategory(categoryId: string) {
    this._selectedCategory.set(categoryId);
  }

  getProductById(id: string): ProductModel | undefined {
    return this.products().find((p) => p.id === id);
  }

  getProductByBarcode(barcode: string): ProductModel | undefined {
    return this.products().find(
      (p) => p.barcodes?.some((b) => b.value === barcode) // VALUE kullanılmalı
    );
  }

  searchProducts(query: string): ProductModel[] {
    const searchTerm = query.toLowerCase();
    return this.products().filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.code.toLowerCase().includes(searchTerm) ||
        p.barcodes?.some((b) => b.value.includes(searchTerm)) // VALUE kullanılmalı
    );
  }

  updateProduct(product: ProductModel) {
    // Bu manuel güncelleme için bir signal kullanabilirsiniz
    // Veya API çağrısı yapıp reload edebilirsiniz
    this.loadProducts();
  }

  updateStock(productId: string, newStock: number) {
    // API çağrısı yapıp sonra reload
    this.http
      .put(`api/products/${productId}/stock`, { stock: newStock })
      .subscribe({
        next: () => this.loadProducts(),
        error: (error) => console.error('Stock update error:', error),
      });
  }

  // Low stock products
  getLowStockProducts(threshold: number = 10): ProductModel[] {
    return this.products().filter((p) => (p.stock || 0) < threshold);
  }

  // Out of stock products
  getOutOfStockProducts(): ProductModel[] {
    return this.products().filter((p) => (p.stock || 0) === 0);
  }

  // Product price helpers
  getProductPrice(product: ProductModel): number {
    return product.prices?.[0]?.price || 0;
  }

  getProductPriceHistory(product: ProductModel): number[] {
    return product.prices?.map((p) => p.price) || [];
  }

  // Product expiration helpers
  getProductExpirations(product: ProductModel): Date[] {
    return product.expirations?.map((e) => new Date(e.expiration ?? '')) || [];
  }

  getExpiringSoonProducts(days: number = 30): ProductModel[] {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.products().filter((p) => {
      const expirations = this.getProductExpirations(p);
      return expirations.some((exp) => exp <= futureDate);
    });
  }

  // Barcode helpers
  getProductBarcodes(product: ProductModel): string[] {
    return product.barcodes?.map((b) => b.value) || [];
  }

  getProductByAnyBarcode(barcodes: string[]): ProductModel | undefined {
    return this.products().find((p) =>
      p.barcodes?.some((b) => barcodes.includes(b.value))
    );
  }
}
