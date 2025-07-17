import { CategoryModel, initialCategory } from './category.model';
import { ProductExpirationModel } from './product-expiration.model';
import { ProductBarcodeModel } from './product-barcode.model';
import { ProductPriceModel } from './product-price.model';

export interface ProductModel {
  id: string;
  name: string;
  desi?: number;
  imageUrl?: string;
  itemRef: number;
  code: string;
  status: boolean;
  categoryId?: string;
  category?: CategoryModel;
  barcodes?: ProductBarcodeModel[];
  expirations?: ProductExpirationModel[];
  prices?:ProductPriceModel[];
  stock?: number;
}

export const initialProduct: ProductModel = {
  id: '',
  name: '',
  desi: 0,
  imageUrl: '',
  itemRef: 0,
  code: '',
  status: true,
  categoryId: '',
  category: initialCategory,
  barcodes: [],
  expirations: [],
  prices: [],
  stock: 0
};