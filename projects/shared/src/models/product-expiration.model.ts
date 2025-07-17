import { ProductModel } from './product.model';

export interface ProductExpirationModel {
  id: string;
  expiration?: string;
  quantity: number;
  productId: string;
  product?: ProductModel;
}

export const initialProductExpiration: ProductExpirationModel = {
  id: '',
  expiration: '',
  quantity: 0,
  productId: ''
};