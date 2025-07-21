// src/app/pages/home/home.ts - Temizlenmiş versiyon
import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import Layout from '../../layout/layout';
import { ProductModel } from '@shared/models/product.model';
import BarcodeScanner from '../../components/barcode-scanner/barcode-scanner';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    BarcodeScanner,
  ],
})
export default class Home {
  private layout = inject(Layout);
  private snackBar = inject(MatSnackBar);

  onProductFound(product: ProductModel) {
    this.layout.addToCart(product);
    this.snackBar.open(`${product.name} sepete eklendi`, 'Tamam', { duration: 2000 });
  }
}