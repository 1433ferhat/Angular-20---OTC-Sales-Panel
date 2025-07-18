// src/app/layout/layout.ts
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import Sidebar from '../components/sidebar/sidebar';
import OrderPanel from '../components/order-panel/order-panel';
import { ProductStore } from '@shared/stores/product.store';
import { OrderStore } from '@shared/stores/order.store';
import { CategoryStore } from '@shared/stores/category.store';
import { ProductModel } from '@shared/models/product.model';
import { OrderModel } from '@shared/models/order.model';
import { CustomerModel } from '@shared/models/customer.model';
import { OrderStatus } from '@shared/enums/order-status.enum';
import { PaymentMethod } from '@shared/enums/payment-method.enum';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    Sidebar,
    OrderPanel,
  ],
})
export default class Layout implements OnInit {
  private productStore = inject(ProductStore);
  private orderStore = inject(OrderStore);
  private categoryStore = inject(CategoryStore);
  private snackBar = inject(MatSnackBar);

  // Signals for state management
  currentUser = signal({
    name: 'Eczacı',
    role: 'Admin'
  });

  isOrderPanelOpen = signal(false);
  
  // Computed signals from stores
  products = computed(() => this.productStore.products());
  categories = computed(() => this.categoryStore.categories());
  cartItems = computed(() => this.orderStore.cartItems());
  cartTotal = computed(() => this.orderStore.cartTotal());
  cartItemCount = computed(() => this.orderStore.cartItemCount());
  orders = computed(() => this.orderStore.orders());
  
  // Loading states
  isLoading = computed(() => 
    this.productStore.loading() || 
    this.orderStore.loading() || 
    this.categoryStore.loading()
  );

  // Low stock products
  lowStockProducts = computed(() => 
    this.productStore.getLowStockProducts(10)
  );

  // Recent orders
  recentOrders = computed(() => 
    this.orderStore.orders().slice(0, 5)
  );

  // Today's sales calculation
  todaysSales = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.orderStore.orders()
      .filter(order => {
        if (!order.orderDate) return false;
        const orderDate = new Date(order.orderDate);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      })
      .reduce((total, order) => total + order.totalPrice, 0);
  });

  ngOnInit() {
    // Initial data is loaded automatically by stores
    console.log('Layout initialized');
  }

  // Actions
  addToCart(product: ProductModel, quantity: number = 1) {
    this.orderStore.addToCart(product, quantity);
    this.showNotification(`${product.name} sepete eklendi`);
  }

  removeFromCart(itemId: string) {
    this.orderStore.removeFromCart(itemId);
    this.showNotification('Ürün sepetten kaldırıldı');
  }

  updateCartItemQuantity(itemId: string, quantity: number) {
    this.orderStore.updateCartItemQuantity(itemId, quantity);
  }

  clearCart() {
    this.orderStore.clearCart();
    this.showNotification('Sepet temizlendi');
  }

  async completeOrder() {
    try {
      // Get customer data (you can implement proper customer selection)
      const customer: CustomerModel = {
        id: 'default-customer',
        name: 'Müşteri',
        email: '',
        phone: ''
      };
      
      const cartItems = this.cartItems();
      if (cartItems.length === 0) {
        this.showNotification('Sepet boş!', 'error');
        return;
      }

      const orderData: Partial<OrderModel> = {
        id: crypto.randomUUID(),
        documentNumber: `ORD-${Date.now()}`,
        customerId: customer.id,
        customer: customer,
        items: cartItems,
        totalPrice: this.cartTotal(),
        totalQuantity: this.cartItemCount(),
        status: OrderStatus.Pending,
        paymentMethod: PaymentMethod.Cash,
        orderDate: new Date()
      };

      const order = await this.orderStore.createOrder(orderData);
      
      if (order) {
        this.showNotification('Sipariş başarıyla tamamlandı');
        this.toggleOrderPanel();
      } else {
        this.showNotification('Sipariş tamamlanırken hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Order completion error:', error);
      this.showNotification('Sipariş tamamlanırken hata oluştu', 'error');
    }
  }

  toggleOrderPanel() {
    this.isOrderPanelOpen.set(!this.isOrderPanelOpen());
  }

  viewOrderDetails(order: OrderModel) {
    // Navigate to order details or show modal
    console.log('Viewing order details:', order);
  }

  refreshData() {
    this.productStore.loadProducts();
    this.orderStore.loadOrders();
    this.categoryStore.loadCategories();
    this.showNotification('Veriler yenilendi');
  }

  // Search functionality
  searchProducts(query: string): ProductModel[] {
    return this.productStore.searchProducts(query);
  }

  getProductByBarcode(barcode: string): ProductModel | undefined {
    return this.productStore.getProductByBarcode(barcode);
  }

  // Category filtering
  setSelectedCategory(categoryId: string) {
    this.productStore.setSelectedCategory(categoryId);
  }

  // Notifications
  private showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.snackBar.open(message, 'Kapat', {
      duration: 3000,
      panelClass: type === 'error' ? 'error-snackbar' : 'success-snackbar'
    });
  }

  // Utility methods
  formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  // Stock management
  updateStock(productId: string, newStock: number) {
    this.productStore.updateStock(productId, newStock);
  }

  checkLowStock(): boolean {
    return this.lowStockProducts().length > 0;
  }

  // Order management
  async updateOrderStatus(orderId: string, status: string) {
    const success = await this.orderStore.updateOrderStatus(orderId, status);
    if (success) {
      this.showNotification('Sipariş durumu güncellendi');
    } else {
      this.showNotification('Sipariş durumu güncellenemedi', 'error');
    }
  }

  // Statistics
  getTotalSales(): number {
    return this.orderStore.getTotalSales();
  }

  getOrdersCountByStatus(): Record<string, number> {
    return this.orderStore.getOrdersCountByStatus();
  }
}