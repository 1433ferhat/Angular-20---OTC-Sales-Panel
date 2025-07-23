import { PriceType } from '../enums/price-type.enum';

export interface CustomerModel {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  companyName?: string;
  taxNumber?: string;
  tcNo?: string;
  type: PriceType;
  isEInvoice: boolean;
  isCorporate?: boolean;
  createdDate?: Date;
  updatedDate?: Date;
  deletedDate?: Date;
}
export const initialCustomer: CustomerModel = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  companyName: undefined,
  taxNumber: undefined,
  tcNo: undefined,
  type: PriceType.ETIC,
  isCorporate: false,
  isEInvoice: false,
};
