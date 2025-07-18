// src/app/services/product.service.ts
import { Injectable, inject, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })

export class ProductService {
  private http = inject(HttpClient);
}
