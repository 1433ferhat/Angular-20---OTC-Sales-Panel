import { Injectable, signal, computed, inject, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductModel } from '../models/product.model';
import { CategoryModel } from '../models/category.model';
import { lastValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PriceType } from '../enums/price-type.enum';

@Injectable({
  providedIn: 'root',
})
export class ProductStore {
  private http = inject(HttpClient);

  // Signals
  private _selectedCategory = signal<string>('all');

  // Resources with error handling
  productsResource = resource({
    loader: () =>
      lastValueFrom(
        this.http.get<ProductModel[]>('api/products/getall').pipe(
          catchError((error) => {
            console.warn('Products API hatası:', error);
            return of([]); // Boş array döndür
          })
        )
      ),
  });

  // Computed signals
  products = computed(() => this.productsResource.value() || []);
  loading = computed(() => this.productsResource.isLoading());
  error = computed(() => this.productsResource.error());

  refresh() {
    this.productsResource.reload();
  }

  // Filtered products
  filteredProducts = computed(() => {
    const products = this.products();
    const category = this._selectedCategory();

    if (category === 'all') return products;
    return products.filter((p) => p.categoryId === category);
  });

  setSelectedCategory(categoryId: string) {
    this._selectedCategory.set(categoryId);
  }

  getProductById(id: string): ProductModel | undefined {
    return this.products().find((p) => p.id === id);
  }

  getProductByBarcode(barcode: string): ProductModel | undefined {
    return this.products().find((p) =>
      p.barcodes?.some((b) => b.value === barcode)
    );
  }

  searchProducts(query: string): ProductModel[] {
    const searchTerm = query.toLowerCase();
    return this.products().filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.code.toLowerCase().includes(searchTerm) ||
        product.barcodes?.some((b) => b.value.includes(query))
    );
  }

  getProductPrice(
    product: ProductModel,
    priceType: PriceType = PriceType.ECZ
  ): number {
    const price = product.prices?.find((p) => p.priceType === priceType);
    return price?.price || product.prices?.[0]?.price || 0;
  }

  getProductStock(product: ProductModel): number {
    return product.stock || 0;
  }

  isProductInStock(
    product: ProductModel,
    requiredQuantity: number = 1
  ): boolean {
    return this.getProductStock(product) >= requiredQuantity;
  }

  // Category helpers
  getProductsByCategory(categoryId: string): ProductModel[] {
    return this.products().filter((p) => p.categoryId === categoryId);
  }

  getCategoryProducts(category: CategoryModel): ProductModel[] {
    return this.getProductsByCategory(category.id);
  }

  // Stock management
  async updateProductStock(
    productId: string,
    newStock: number
  ): Promise<boolean> {
    try {
      const response = await lastValueFrom(
        this.http
          .put<ProductModel>(`api/products/${productId}/stock`, {
            stock: newStock,
          })
          .pipe(
            catchError((error) => {
              console.error('Stock update error:', error);
              return of(null);
            })
          )
      );

      if (response) {
        this.productsResource.reload();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Stock update error:', error);
      return false;
    }
  }

  // Statistics
  getTotalProductCount(): number {
    return this.products().length;
  }

  getLowStockProducts(threshold: number = 10): ProductModel[] {
    return this.products().filter((p) => (p.stock || 0) < threshold);
  }

  getOutOfStockProducts(): ProductModel[] {
    return this.products().filter((p) => (p.stock || 0) === 0);
  }

  getProductsByPriceRange(minPrice: number, maxPrice: number): ProductModel[] {
    return this.products().filter((product) => {
      const price = this.getProductPrice(product);
      return price >= minPrice && price <= maxPrice;
    });
  }
  updateProductPricesForCustomer(customerPriceType: PriceType): void {
    // Müşteri seçildiğinde fiyatları güncelle
    // Bu method sadece fiyat tipini belirlemek için kullanılıyor
    // Gerçek fiyat hesaplaması getProductPrice() metodunda yapılıyor
    console.log('Customer price type updated:', customerPriceType);
  }
}
