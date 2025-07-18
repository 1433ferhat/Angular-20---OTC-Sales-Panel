// projects/shared/src/stores/category.store.ts
import { Injectable, signal, computed, inject, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CategoryModel } from '../models/category.model';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryStore {
  private http = inject(HttpClient);

  // Signals
  private _categories = signal<CategoryModel[]>([]);
  private _selectedCategory = signal<string | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Computed signals
  categories = computed(() => this._categories());
  selectedCategory = computed(() => this._selectedCategory());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Resource for categories (Angular 20 approach)
  categoriesResource = resource({
    loader: () =>
      lastValueFrom(this.http.get<CategoryModel[]>('api/categories/getall')),
  });

  constructor() {
    this.loadCategories();
  }

  // Actions
  loadCategories() {
    this._loading.set(true);
    this._error.set(null);

    this.categoriesResource.reload();

    this.categoriesResource.value().subscribe({
      next: (categories) => {
        this._categories.set(categories || []);
        this._loading.set(false);
      },
      error: (error) => {
        this._error.set('Kategoriler yüklenirken hata oluştu');
        this._loading.set(false);
        console.error('Category loading error:', error);
      },
    });
  }

  setSelectedCategory(categoryId: string | null) {
    this._selectedCategory.set(categoryId);
  }

  getCategoryById(id: string): CategoryModel | undefined {
    return this._categories().find((c) => c.id === id);
  }

  getCategoryByCode(code: string): CategoryModel | undefined {
    return this._categories().find((c) => c.code === code);
  }

  searchCategories(query: string): CategoryModel[] {
    const searchTerm = query.toLowerCase();
    return this._categories().filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm) ||
        c.code.toLowerCase().includes(searchTerm)
    );
  }

  updateCategory(category: CategoryModel) {
    const categories = this._categories();
    const index = categories.findIndex((c) => c.id === category.id);

    if (index !== -1) {
      const updatedCategories = [...categories];
      updatedCategories[index] = category;
      this._categories.set(updatedCategories);
    }
  }

  // Hierarchy helpers
  getParentCategories(): CategoryModel[] {
    return this._categories().filter((c) => !c.parentId);
  }

  getChildCategories(parentId: string): CategoryModel[] {
    return this._categories().filter((c) => c.parentId === parentId);
  }

  getCategoryHierarchy(): CategoryModel[] {
    const categories = this._categories();
    const parentCategories = categories.filter((c) => !c.parentId);

    return parentCategories.map((parent) => ({
      ...parent,
      children: categories.filter((c) => c.parentId === parent.id),
    }));
  }
}
