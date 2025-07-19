export interface CustomerModel {
  id: string;
  name: string;
  phone: string;
  email: string;
  taxOffice: string;
  taxNo: string;
  isEInvoice: boolean;
  tcNo: string;
}

export class InitialCustomer {
  id = '';
  name = '';
  phone = '';
  email = '';
}
