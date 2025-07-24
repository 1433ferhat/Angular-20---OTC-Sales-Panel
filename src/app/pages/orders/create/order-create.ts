import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import Layout from '../../../layout/layout';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductModel } from '@shared/models/product.model';
import BarcodeScanner from '../../../components/barcode-scanner/barcode-scanner';
import { OrderStore } from '@shared/stores/order.store';

@Component({
  imports: [BarcodeScanner,],
  templateUrl: './order-create.html',
  styleUrl: './order-create.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrderCreate {
 
}
