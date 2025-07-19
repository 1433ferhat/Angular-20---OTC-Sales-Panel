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
import { MatDialog } from '@angular/material/dialog';
import Sidebar from '../components/sidebar/sidebar';
import OrderPanel from '../components/order-panel/order-panel';
import CustomerSelection from '../components/customer-selection/customer-selection';
import { ProductStore } from '@shared/stores/product.store';
import { OrderStore } from '@shared/stores/order.store';
import { CategoryStore } from '@shared/stores/category.store';
import { ProductModel } from '@shared/models/product.model';
import { OrderModel } from '@shared/models/order.model';
import { CustomerModel } from '@shared/models/customer.model';
import { OrderStatus } from '@shared/enums/order-status.enum';
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
  private common = inject(Common);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  currentUser = computed(() => this.common.getCurrentUser());
  currentUserName = computed(() => this.common.getFullName() || 'Kullanıcı');
  currentUserInitials = computed(() => this.common.getUserInitials());
  isUserLoggedIn = computed(() => this.common.isLoggedIn());

  isOrderPanelOpen = signal(false);
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

  lowStockProducts = computed(() => this.productStore.getLowStockProducts(10));
  recentOrders = computed(() => this.orderStore.orders().slice(0, 5));

  todaysSales = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.orderStore.orders()
      .filter(order => {
        if (!order.orderDate) return false;
        const orderDate = new Date(order.orderDate);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime() && 
               order.status === OrderStatus.Completed;
      })
      .reduce((total, order) => total + order.totalPrice, 0);
  });

  notifications = computed(() => {
    const lowStock = this.lowStockProducts();
    const pendingOrders = this.orderStore.orders().filter(
      order => order.status === OrderStatus.Pending
    );

    return [
      ...lowStock.map(product => ({
        id: `low-stock-${product.id}`,
        type: 'warning' as const,
        message: `${product.name} stoku düşük`
      })),
      ...pendingOrders.map(order => ({
        id: `pending-order-${order.id}`,
        type: 'info' as const,
        message: `Bekleyen sipariş: ${order.id}`
      }))
    ];
  });

  ngOnInit() {
    this.authService.initializeUserFromToken();
    this.loadInitialData();
  }

  private loadInitialData() {
    this.productStore.loadProducts();
    this.categoryStore.loadCategories();
    this.orderStore.loadOrders();
  }

  toggleSidebar() {
    this.sidebarOpen.update(open => !open);
  }

  toggleOrderPanel() {
    this.isOrderPanelOpen.update(open => !open);
  }

  addToCart(product: ProductModel) {
    this.orderStore.addToCart(product, 1);
    this.snackBar.open(
      `${product.name} sepete eklendi`,
      'Tamam',
      { duration: 2000 }
    );
  }

  updateQuantity(productId: string, change: number) {
    const cartItems = this.cartItems();
    const item = cartItems.find(i => i.productId === productId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      this.orderStore.updateCartItemQuantity(item.id, newQuantity);
    }
  }

  removeFromCart(productId: string) {
    this.orderStore.removeFromCart(productId);
    this.snackBar.open(
      'Ürün sepetten çıkarıldı',
      'Tamam',
      { duration: 2000 }
    );
  }

  // Müşteri seçimi dialogu
  selectCustomer() {
    const dialogRef = this.dialog.open(CustomerSelection, {
      width: '500px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedCustomer.set(result);
        // Müşteri seçildiğinde ürün fiyatlarını güncelle
        this.productStore.updateProductPricesForCustomer(result.priceType);
      }
    });
  }

  // Sipariş tamamlama
  async completeOrder(paymentMethod: PaymentMethod) {
    const customer = this.selectedCustomer();
    if (!customer) {
      this.snackBar.open(
        'Lütfen müşteri seçin',
        'Tamam',
        { duration: 3000 }
      );
      return;
    }

    const cartItems = this.cartItems();
    if (cartItems.length === 0) {
      this.snackBar.open(
        'Sepet boş',
        'Tamam',
        { duration: 3000 }
      );
      return;
    }

    const order = await this.orderStore.completeOrder(customer, paymentMethod);
    
    if (order) {
      this.selectedCustomer.set(null);
      this.snackBar.open(
        'Sipariş tamamlandı!',
        'Tamam',
        { duration: 3000 }
      );
    } else {
      this.snackBar.open(
        'Sipariş tamamlanırken hata oluştu',
        'Tamam',
        { duration: 3000 }
      );
    }
  }

  cancelOrder() {
    this.orderStore.clearCart();
    this.selectedCustomer.set(null);
    this.snackBar.open(
      'Sipariş iptal edildi',
      'Tamam',
      { duration: 2000 }
    );
  }

  logout() {
    this.authService.logout();
  }
}