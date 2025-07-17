import { ProductModel } from './product.model';


export interface ProductBarcodeModel {
    id: string;
    value: string;
    productId: string;
    product?: ProductModel;
}

export const initialProductBarcode: ProductBarcodeModel = {
  id: '',
  value: '',
  productId: ''
};