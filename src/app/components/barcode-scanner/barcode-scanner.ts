import {
  Component,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProductModel } from '@shared/models/product.model';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.html',
  styleUrl: './barcode-scanner.scss',
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
export default class BarcodeScanner {
  @ViewChild('barcodeInput') barcodeInput!: ElementRef<HTMLInputElement>;
  @Output() productFound = new EventEmitter<ProductModel>();

  barcode = signal<string>('');
  searchResults = signal<ProductModel[]>([]);

  // Mock products - gerçek uygulamada service'den gelecek
  products: ProductModel[] = [
    {
      id: 1,
      name: 'Vitamin D3 2000 IU',
      barcode: '8690131001',
      category: 'vitamin',
      price: 45.5,
      brand: 'Solgar',
      stock: 25,
    },
    {
      id: 2,
      name: 'Omega-3 Fish Oil',
      barcode: '8690131002',
      category: 'vitamin',
      price: 89.9,
      brand: 'Pharma Nord',
      stock: 15,
    },
    {
      id: 3,
      name: 'Hyaluronic Acid Serum',
      barcode: '8690131003',
      category: 'skincare',
      price: 125.0,
      brand: 'The Ordinary',
      stock: 8,
    },
    {
      id: 4,
      name: 'Probiyotik 30 Kapsül',
      barcode: '8690131004',
      category: 'supplement',
      price: 67.75,
      brand: 'Culturelle',
      stock: 12,
    },
  ];

  ngAfterViewInit() {
    setTimeout(() => {
      this.barcodeInput?.nativeElement.focus();
    }, 100);
  }

  searchProduct() {
    const barcodeValue = this.barcode().trim();
    if (!barcodeValue) return;

    const results = this.products.filter(
      (product) =>
        product.barcode.includes(barcodeValue) ||
        product.name.toLowerCase().includes(barcodeValue.toLowerCase())
    );

    this.searchResults.set(results);

    if (results.length === 1) {
      this.selectProduct(results[0]);
    }
  }

  selectProduct(product: ProductModel) {
    this.productFound.emit(product);
    this.barcode.set('');
    this.searchResults.set([]);
    this.barcodeInput?.nativeElement.focus();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchProduct();
    }
  }
}
