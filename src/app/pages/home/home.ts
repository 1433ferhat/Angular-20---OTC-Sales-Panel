// src/app/pages/home/home.ts - Düzeltilmiş
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal,
  computed,
  inject,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import Layout from '../../layout/layout';
import { ProductModel } from '@shared/models/product.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
})
export default class Home implements OnInit {
  @ViewChild('barcodeInput') barcodeInput!: ElementRef<HTMLInputElement>;

  private layout = inject(Layout);
  private snackBar = inject(MatSnackBar);

  barcodeValue = signal('');
  private scanBuffer = '';
  private lastScanTime = 0;

  products = computed(() => this.layout.products());

  ngOnInit() {
    setTimeout(() => {
      this.barcodeInput?.nativeElement.focus();
    }, 100);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchProduct();
      return;
    }

    if (/^[a-zA-Z0-9]$/.test(event.key)) {
      const currentTime = Date.now();
      
      if (currentTime - this.lastScanTime > 100) {
        this.scanBuffer = '';
      }
      
      this.scanBuffer += event.key;
      this.lastScanTime = currentTime;
      this.barcodeValue.set(this.scanBuffer);
      
      if (this.barcodeInput?.nativeElement) {
        this.barcodeInput.nativeElement.value = this.scanBuffer;
        this.barcodeInput.nativeElement.focus();
      }
      
      if (this.scanBuffer.length >= 8) {
        setTimeout(() => this.searchProduct(), 50);
      }
    }
  }

  searchProduct() {
    const barcode = this.barcodeValue().trim();
    if (!barcode) return;

    const products = this.products();
    const foundProduct = products.find(p => 
      p.barcodes?.some(b => b.value === barcode) ||
      p.code === barcode ||
      p.name?.toLowerCase().includes(barcode.toLowerCase())
    );

    if (foundProduct) {
      this.layout.addToCart(foundProduct);
      this.snackBar.open(`${foundProduct.name} sepete eklendi`, 'Tamam', { duration: 2000 });
      this.clearInput();
    } else {
      this.snackBar.open(`Ürün bulunamadı: ${barcode}`, 'Tamam', { duration: 3000 });
    }
  }

  clearInput() {
    this.barcodeValue.set('');
    this.scanBuffer = '';
    if (this.barcodeInput?.nativeElement) {
      this.barcodeInput.nativeElement.value = '';
      this.barcodeInput.nativeElement.focus();
    }
  }
}