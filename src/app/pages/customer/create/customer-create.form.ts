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

    // Zorunlu alanlar için validator'ları ekle
    group['firstName'].addValidators(Validators.required);
    group['lastName'].addValidators(Validators.required);
    group['phone'].addValidators(Validators.required);
    group['email'].addValidators([Validators.required, Validators.email]);
    group['type'].addValidators(Validators.required); // Bu eksikti
    group['isCorporate'].addValidators(Validators.required); // Bu da eklenebilir

    return new FormGroup(group);
  }

  isFormValidCustom(data: CustomerModel): boolean {
    if (!data) return false;
    
    // Temel alanların kontrolü
    if (!data.firstName || !data.lastName || !data.phone || !data.email || data.type === null || data.type === undefined) {
      return false;
    }

    // Eğer kurumsal müşteri ise
    if (data.isCorporate) {
      if (!data.companyName) return false;
      
      if (data.isEInvoice) {
        // E-Fatura mükellefi ise vergi numarası zorunlu
        if (!data.taxNumber || data.taxNumber.toString().length !== 10) {
          return false;
        }
      } else {
        // E-Fatura değilse TC kimlik numarası zorunlu
        if (!data.tcNo || data.tcNo.toString().length !== 11) {
          return false;
        }
      }
    } else {
      // Bireysel müşteri ise TC kimlik numarası zorunlu
      if (!data.tcNo || data.tcNo.toString().length !== 11) {
        return false;
      }
    }

    return true;
  }
}