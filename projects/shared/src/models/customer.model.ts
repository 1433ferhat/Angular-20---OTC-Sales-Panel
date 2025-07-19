import { PriceType } from '@shared/enums/price-type.enum';

export interface CustomerModel {
  id: string;
  name: string;
  phone: string;
  email: string;
  taxOffice?: string;
  taxNo?: string;
  tcNo?: string;
  isEInvoice: boolean;
  priceType: PriceType; // ✅ Müşterinin fiyat tipi
}

export class InitialCustomer {
  id = '';
  name = '';
  phone = '';
  email = '';
  taxOffice = '';
  taxNo = '';
  tcNo = '';
  isEInvoice = true;
  priceType = PriceType.Undefined;
}