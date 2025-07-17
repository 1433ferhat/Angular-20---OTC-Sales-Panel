import { OrderItemModel } from './order-item.model';

export interface OrderModel {
  id: string;
  date: Date;
  items: OrderItemModel[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'card';
  customerName?: string;
}
