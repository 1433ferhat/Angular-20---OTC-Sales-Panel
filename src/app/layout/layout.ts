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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import Sidebar from '../components/sidebar/sidebar';
import OrderPanel from '../components/order-panel/order-panel';
import CustomerSelection from '../components/customer-selection/customer-selection';
import Header from './header/header';
import { ProductStore } from '@shared/stores/product.store';
import { OrderStore } from '@shared/stores/order.store';
import { CategoryStore } from '@shared/stores/category.store';
import { CustomerStore } from '@shared/stores/customer.store';
import { ProductModel } from '@shared/models/product.model';
import { OrderModel } from '@shared/models/order.model';
import { CustomerModel } from '@shared/models/customer.model';
import { PaymentMethod } from '@shared/enums/payment-method.enum';
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
  private snackBar = inject(MatSnackBar);
  private common = inject(Common);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

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
    this.sidebarOpen.update(open => !open);
  }

  // addToCart işlemi product listesi componentlerinden yapılacak

  updateQuantity(productId: string, change: number) {
    const cartItems = this.cartItems();
    const item = cartItems.find((i) => i.productId === productId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      this.orderStore.updateCartItemQuantity(item.id, newQuantity);
    }
  }

  removeFromCart(productId: string) {
    this.orderStore.removeFromCart(productId);
    this.snackBar.open('Ürün sepetten çıkarıldı', 'Tamam', { duration: 2000 });
  }

  selectCustomer() {
    const dialogRef = this.dialog.open(CustomerSelection, {
      width: '700px',
      maxHeight: '90vh',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Seçilen müşteri:', result);
        this.selectedCustomer.set(result);
        // Customer type'a göre fiyat güncelle
        this.productStore.updateProductPricesForCustomer(result.type);
        this.snackBar.open(`${result.firstName} ${result.lastName} seçildi`, 'Tamam', {
          duration: 2000,
        });
      }
    });
  }

  async completeOrder(paymentMethod: PaymentMethod) {
    const customer = this.selectedCustomer();
    if (!customer) {
      this.snackBar.open('Lütfen müşteri seçin', 'Tamam', { duration: 3000 });
      return;
    }

    const cartItems = this.cartItems();
    if (cartItems.length === 0) {
      this.snackBar.open('Sepet boş', 'Tamam', { duration: 3000 });
      return;
    }

    const order = await this.orderStore.completeOrder(customer, paymentMethod);

    if (order) {
      this.selectedCustomer.set(null);
      this.snackBar.open('Sipariş tamamlandı!', 'Tamam', { duration: 3000 });
    } else {
      this.snackBar.open('Sipariş tamamlanırken hata oluştu', 'Tamam', {
        duration: 3000,
      });
    }
  }

  cancelOrder() {
    this.orderStore.clearCart();
    this.selectedCustomer.set(null);
    this.snackBar.open('Sipariş iptal edildi', 'Tamam', { duration: 2000 });
  }

  viewOrderDetails(order: OrderModel): void {
    console.log('Order Details:', order);
  }
}