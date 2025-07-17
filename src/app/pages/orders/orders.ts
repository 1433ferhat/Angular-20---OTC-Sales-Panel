import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import OrderList from '../../components/order-list/order-list';
import Layout from '../../layout/layout';
import { OrderModel } from '@shared/models/order.model';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, MatCardModule, MatIconModule, OrderList],
})
export default class Orders {
  private layout = inject(Layout);

  orders = computed(() => this.layout.orderHistory());

  onOrderSelected(order: OrderModel) {
    this.layout.viewOrderDetails(order);
  }
}
