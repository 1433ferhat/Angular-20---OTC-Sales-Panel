import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, RouterOutlet } from "@angular/router";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatBadgeModule } from "@angular/material/badge";
import { MatDividerModule } from "@angular/material/divider";
import { MatSnackBar } from "@angular/material/snack-bar";
import Sidebar from "../components/sidebar/sidebar";
import OrderPanel from "../components/order-panel/order-panel";
import { ProductModel } from "@shared/models/product.model";
import { OrderItemModel } from "@shared/models/order-item.model";
import { OrderModel } from "@shared/models/order.model";

@Component({
  selector: "app-layout",
  templateUrl: "./layout.html",
  styleUrl: "./layout.scss",
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
  // Signals for state management
  currentUser = signal({ name: "Kasiyer Admin", role: "cashier" });
  notifications = signal<any[]>([]);
  cart = signal<OrderItemModel[]>([]);
  currentOrder = signal<OrderModel | null>(null);
  orderHistory = signal<OrderModel[]>([]);
  products = signal<ProductModel[]>([]);
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
          order.status === "completed"
      )
      .reduce((sum, order) => sum + order.total, 0);
  });

  lowStockProducts = computed(() =>
    this.products().filter((product) => product.stock < 10)
  );

  // Mock products data
  mockProducts: ProductModel[] = [
    {
      id: 1,
      name: "Vitamin D3 2000 IU",
      barcode: "8690131001",
      category: "vitamin",
      price: 45.5,
      brand: "Solgar",
      stock: 25,
    },
    {
      id: 2,
      name: "Omega-3 Fish Oil",
      barcode: "8690131002",
      category: "vitamin",
      price: 89.9,
      brand: "Pharma Nord",
      stock: 15,
    },
    {
      id: 3,
      name: "Hyaluronic Acid Serum",
      barcode: "8690131003",
      category: "skincare",
      price: 125.0,
      brand: "The Ordinary",
      stock: 8,
    },
    {
      id: 4,
      name: "Probiyotik 30 Kapsül",
      barcode: "8690131004",
      category: "supplement",
      price: 67.75,
      brand: "Culturelle",
      stock: 12,
    },
    {
      id: 5,
      name: "Çinko Bisglisinat",
      barcode: "8690131005",
      category: "vitamin",
      price: 34.9,
      brand: "Thorne",
      stock: 30,
    },
    {
      id: 6,
      name: "Bebek Şampuanı",
      barcode: "8690131006",
      category: "baby",
      price: 28.5,
      brand: "Johnson's",
      stock: 20,
    },
    {
      id: 7,
      name: "Dijital Termometre",
      barcode: "8690131007",
      category: "medical",
      price: 45.0,
      brand: "Braun",
      stock: 5,
    },
    {
      id: 8,
      name: "Vitamin C 1000mg",
      barcode: "8690131008",
      category: "vitamin",
      price: 52.3,
      brand: "Solgar",
      stock: 18,
    },
  ];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.products.set(this.mockProducts);
    this.initializeOrder();
    this.loadNotifications();
  }

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
      status: "pending",
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

    this.snackBar.open(`${product.name} sepete eklendi`, "Kapat", {
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

  completeOrder(paymentMethod: "cash" | "card") {
    const currentOrder = this.currentOrder();
    if (!currentOrder || this.cart().length === 0) {
      this.snackBar.open("Sepet boş!", "Kapat", { duration: 3000 });
      return;
    }

    const completedOrder: OrderModel = {
      ...currentOrder,
      status: "completed",
      paymentMethod: paymentMethod,
    };

    const history = this.orderHistory();
    this.orderHistory.set([completedOrder, ...history]);
    this.cart.set([]);
    this.initializeOrder();

    this.snackBar.open(
      `Sipariş tamamlandı! Ödeme: ${
        paymentMethod === "cash" ? "Nakit" : "Kart"
      }`,
      "Kapat",
      { duration: 5000 }
    );
  }

  cancelOrder() {
    this.cart.set([]);
    this.initializeOrder();
    this.snackBar.open("Sipariş iptal edildi", "Kapat", { duration: 3000 });
  }

  getFilteredProducts(): ProductModel[] {
    return this.products();
  }

  viewOrderDetails(order: OrderModel) {
    // Order details view logic
  }

  loadNotifications() {
    this.notifications.set([
      { id: 1, message: "Düşük stok uyarısı", type: "warning" },
      { id: 2, message: "Yeni sipariş", type: "info" },
    ]);
  }

  logout() {
    console.log("Çıkış yapılıyor...");
  }
}
