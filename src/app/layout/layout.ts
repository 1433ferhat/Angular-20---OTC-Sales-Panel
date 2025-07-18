import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal,
  computed,
  effect,
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
import { ProductModel } from '@shared/models/product.model';
import { OrderItemModel } from '@shared/models/order-item.model';
import { OrderModel } from '@shared/models/order.model';
import { ProductStore } from '@shared/store/product-store.service';
import { AuthStore } from '@shared/store/auth-store.service';

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
  readonly productStore = inject(ProductStore);
  readonly products = this.productStore.products;
  readonly lowStockProducts = this.productStore.lowStockProducts;

  private auth = inject(AuthStore);
  user = this.auth.currentUser;

  ngOnInit() {
    this.initializeOrder();
    this.loadNotifications();
  }

  notifications = signal<any[]>([]);
  cart = signal<OrderItemModel[]>([]);
  currentOrder = signal<OrderModel | null>(null);
  orderHistory = signal<OrderModel[]>([]);
  sidebarOpen = signal<boolean>(true);

  // Computed values
  cartTotal = computed(() =>
    this.cart().reduce((sum, item) => sum + item.totalPrice, 0)
  );

  cartItemCount = computed(() =>
    this.cart().reduce((sum, item) => sum + item.quantity, 0)
  );

  todaysSales = computed(() => {
    const today = new Date();
    return this.orderHistory()
      .filter(
        (order) =>
          order.date.toDateString() === today.toDateString() &&
          order.status === 'completed'
      )
      .reduce((sum, order) => sum + order.total, 0);
  });

  toggleSidebar() {
    this.sidebarOpen.update((open) => !open);
  }

  initializeOrder() {
    const orderId = `ORD-${Date.now()}`;
    const newOrder: OrderModel = {
      id: orderId,
      date: new Date(),
      items: [],
      total: 0,
      status: 'pending',
    };
    this.currentOrder.set(newOrder);
  }

  addToCart(product: ProductModel) {
    const currentCart = this.cart();
    const existingItem = currentCart.find((item) => item.id === product.id);

    if (existingItem) {
      const updatedCart = currentCart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              totalPrice: (item.quantity + 1) * item.price,
            }
          : item
      );
      this.cart.set(updatedCart);
    } else {
      const newItem: OrderItemModel = {
        ...product,
        quantity: 1,
        totalPrice: product.price,
      };
      this.cart.set([...currentCart, newItem]);
    }

    this.snackBar.open(`${product.name} sepete eklendi`, 'Kapat', {
      duration: 2000,
    });
    this.updateCurrentOrder();
  }

  removeFromCart(productId: number) {
    const updatedCart = this.cart().filter((item) => item.id !== productId);
    this.cart.set(updatedCart);
    this.updateCurrentOrder();
  }

  updateQuantity(productId: number, change: number) {
    const currentCart = this.cart();
    const updatedCart = currentCart
      .map((item) => {
        if (item.id === productId) {
          const newQuantity = item.quantity + change;
          if (newQuantity > 0) {
            return {
              ...item,
              quantity: newQuantity,
              totalPrice: newQuantity * item.price,
            };
          }
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    this.cart.set(updatedCart);
    this.updateCurrentOrder();
  }

  updateCurrentOrder() {
    const currentOrder = this.currentOrder();
    if (currentOrder) {
      const updatedOrder: OrderModel = {
        ...currentOrder,
        items: this.cart(),
        total: this.cartTotal(),
      };
      this.currentOrder.set(updatedOrder);
    }
  }

  completeOrder(paymentMethod: 'cash' | 'card') {
    const currentOrder = this.currentOrder();
    if (!currentOrder || this.cart().length === 0) {
      this.snackBar.open('Sepet boş!', 'Kapat', { duration: 3000 });
      return;
    }

    const completedOrder: OrderModel = {
      ...currentOrder,
      status: 'completed',
      paymentMethod: paymentMethod,
    };

    const history = this.orderHistory();
    this.orderHistory.set([completedOrder, ...history]);
    this.cart.set([]);
    this.initializeOrder();

    this.snackBar.open(
      `Sipariş tamamlandı! Ödeme: ${
        paymentMethod === 'cash' ? 'Nakit' : 'Kart'
      }`,
      'Kapat',
      { duration: 5000 }
    );
  }

  cancelOrder() {
    this.cart.set([]);
    this.initializeOrder();
    this.snackBar.open('Sipariş iptal edildi', 'Kapat', { duration: 3000 });
  }

  getFilteredProducts(): ProductModel[] {
    return this.products();
  }

  viewOrderDetails(order: OrderModel) {
    // Order details view logic
  }

  loadNotifications() {
    this.notifications.set([
      { id: 1, message: 'Düşük stok uyarısı', type: 'warning' },
      { id: 2, message: 'Yeni sipariş', type: 'info' },
    ]);
  }

  logout() {
    this.auth.clearUser();
  }
}
