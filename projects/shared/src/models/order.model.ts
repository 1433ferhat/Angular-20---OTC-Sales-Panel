import { OrderStatus } from '@shared/enums/order-status.enum';
import { OrderItemModel } from './order-item.model';
import { CustomerModel } from './customer.model';
import { PaymentMethod } from '@shared/enums/payment-method.enum';

export interface OrderModel {
  id: string | undefined;
  documentNumber: string | undefined;
  orderDate: Date | undefined;
  customerId: string | undefined;
  customer: CustomerModel | undefined;
  items: OrderItemModel[];
  totalPrice: number;
  totalQuantity: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
}
