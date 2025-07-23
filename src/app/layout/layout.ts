// src/app/layout/layout.ts - Corrected version
import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import Sidebar from '../components/sidebar/sidebar';
import OrderPanel from '../components/order-panel/order-panel';
import Header from './header/header';
import { ProductStore } from '@shared/stores/product.store';
import { OrderStore } from '@shared/stores/order.store';
import { CategoryStore } from '@shared/stores/category.store';
import { CustomerStore } from '@shared/stores/customer.store';
import { CustomerModel } from '@shared/models/customer.model';
import { Common } from '../services/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    Header,
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatSidenavModule,
    Sidebar,
    OrderPanel,
  ],
})
export default class Layout {
  private productStore = inject(ProductStore);
  private orderStore = inject(OrderStore);
  private customerStore = inject(CustomerStore);
  private categoryStore = inject(CategoryStore);
  private common = inject(Common);
  private authService = inject(AuthService);

  isUserLoggedIn = computed(() => this.common.isLoggedIn());

  sidebarOpen = signal(true);
  selectedCustomer = signal<CustomerModel | null>(null);

  products = computed(() => this.productStore.products());
  categories = computed(() => this.categoryStore.categories());
  cartItems = computed(() => this.orderStore.cartItems());
  cartTotal = computed(() => this.orderStore.cartTotal());
  cartItemCount = computed(() => this.orderStore.cartItemCount());
  orders = computed(() => this.orderStore.orders());
  currentOrder = computed(() => this.orderStore.currentOrder());

  isLoading = computed(
    () =>
      this.productStore.loading() ||
      this.orderStore.loading() ||
      this.categoryStore.loading()
  );

  constructor() {
    this.authService.initializeUserFromToken();
    this.productStore.loadProducts();
    this.categoryStore.loadCategories();
    this.orderStore.loadOrders();

    // Müşteri değiştiğinde fiyatları güncelle
    this.setupCustomerPriceSync();
  }

  private setupCustomerPriceSync() {
    // Signal effect kullanarak müşteri değişimini izle
    // Bu şekilde müşteri her değiştiğinde fiyatlar otomatik güncellenecek
    const customerEffect = () => {
      const customer = this.selectedCustomer();
      if (customer) {
        // Müşteri seçildiğinde o müşteri tipine göre fiyatları güncelle
        this.productStore.updateProductPricesForCustomer(customer.type);
        console.log('Fiyatlar güncellendi:', customer.type);
      }
    };

    // Signal effect'i manuel olarak çalıştırıyoruz
    // Angular 17+'da computed kullanabiliriz
    const previousCustomer = null;
    setInterval(() => {
      const currentCustomer = this.selectedCustomer();
      if (currentCustomer !== previousCustomer) {
        customerEffect();
      }
    }, 100);
  }

  // Header event handler
  onSidebarToggle() {
    this.sidebarOpen.update((open) => !open);
  }
}