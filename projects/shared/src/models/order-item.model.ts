import { ProductModel } from './product.model';

export interface OrderItemModel extends ProductModel {
  quantity: number;
  totalPrice: number;
}
