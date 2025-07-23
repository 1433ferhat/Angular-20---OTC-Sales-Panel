import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { CustomerModel } from '@shared/models/customer.model'; // kendi yolunu düzelt

@Component({
  selector: 'app-customer-selection',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <h1 mat-dialog-title>Müşteri Seçimi</h1>
    <div mat-dialog-content>
      <p>
        Test: Seçili müşteri = {{ data.selectedCustomer.firstName || 'Yok' }}
      </p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Kapat</button>
    </div>
  `,
})
export default class CustomerSelection {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { selectedCustomer: CustomerModel },
    private dialogRef: MatDialogRef<CustomerSelection>
  ) {}

  close() {
    this.dialogRef.close();
  }
}
