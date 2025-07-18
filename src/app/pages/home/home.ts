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
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import BarcodeScanner from '../../components/barcode-scanner/barcode-scanner';
import ProductGrid from '../../components/product-grid/product-grid';
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
    MatSnackBarModule,
    BarcodeScanner,
    ProductGrid,
  ],
})
export default class Home implements OnInit {
  @ViewChild('barcodeInput') barcodeInput!: ElementRef<HTMLInputElement>;

  private layout = inject(Layout);

  // Signals
  selectedCategory = signal<string>('all');

  // Computed
  filteredProducts = computed(() => {
    const category = this.selectedCategory();
    const products = this.layout.products();
    if (category === 'all') return products;
    return products.filter((product) => product.categoryId === category);
  });

  ngOnInit() {
    setTimeout(() => {
      this.barcodeInput?.nativeElement.focus();
    }, 100);
  }

  onProductFound(product: ProductModel) {
    this.layout.addToCart(product);
  }

  onProductSelected(product: ProductModel) {
    this.layout.addToCart(product);
  }

  selectCategory(categoryId: string) {
    this.selectedCategory.set(categoryId);
  }
}
