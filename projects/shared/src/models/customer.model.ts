import { PriceType } from '../enums/price-type.enum';

export interface CustomerModel {
  id: string;
  name: string;
  phone: string;
  email: string;
  taxOffice?: string;
  taxNo?: string;
  tcNo?: string;
  isEInvoice: boolean;
  priceType: PriceType;
  isActive?: boolean;
  createdDate?: Date;
  updatedDate?: Date;
}