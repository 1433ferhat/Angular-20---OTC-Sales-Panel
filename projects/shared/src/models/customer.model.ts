export interface CustomerModel {
  id: string;
  name: string;
  phone: string;
  email: string;
  eInvoice: boolean;
  taxOffice: string;
  taxNo: string;
  isEInvoice: string;
  tcNo: string;
}

export class InitialCustomer {
  id = '';
  name = '';
  phone = '';
  email = '';
}
