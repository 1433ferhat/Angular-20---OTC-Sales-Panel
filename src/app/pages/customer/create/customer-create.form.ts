import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomerModel } from '@shared/models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerCreateForm {
  createForm(data: Partial<CustomerModel> = {}): FormGroup {
    const group: Record<string, FormControl> = {};
    const keys = [
      'firstName',
      'lastName',
      'phone',
      'email',
      'type',
      'tcNo',
      'companyName',
      'taxNumber',
      'isCorporate',
      'isEInvoice',
    ] as const;

    for (const key of keys) {
      group[key] = new FormControl(data[key] ?? null);
    }

    group['firstName'].addValidators(Validators.required);
    group['lastName'].addValidators(Validators.required);
    group['phone'].addValidators(Validators.required);
    group['email'].addValidators([Validators.required, Validators.email]);

    return new FormGroup(group);
  }
  isFormValidCustom(data: CustomerModel): boolean {
    if (!data) return false;
    // Eğer kurumsal müşteri ise: companyName zorunlu, taxNumber 10 haneli
    if (data.isCorporate) {
      if (data.isEInvoice && data.taxNumber?.toString()?.length !== 10)
        return false;
      if (
        !data.isEInvoice &&
        (!data.companyName || data.tcNo?.toString()?.length !== 11)
      )
        return false;
    }

    return true;
  }
}
