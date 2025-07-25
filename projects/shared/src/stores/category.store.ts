// projects/shared/src/stores/category.store.ts
import { Injectable, signal, computed, inject, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CategoryModel } from '../models/category.model';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryStore {
  private http = inject(HttpClient);

  // Signals
  private _selectedCategory = signal<string | null>(null);

  // Resource for categories (Angular 20 approach)
  categoriesResource = resource({
    loader: () => lastValueFrom(this.http.get<CategoryModel[]>('api/categories/getall'))
  });

  // Computed signals
  categories = computed(() => this.categoriesResource.value() || []);
  selectedCategory = computed(() => this._selectedCategory());
  loading = computed(() => this.categoriesResource.isLoading());
  error = computed(() => this.categoriesResource.error());

  setSelectedCategory(categoryId: string | null) {
    this._selectedCategory.set(categoryId);
  }

  getCategoryById(id: string): CategoryModel | undefined {
    return this.categories().find(c => c.id === id);
  }

  searchCategories(query: string): CategoryModel[] {
    const searchTerm = query.toLowerCase();
    return this.categories().filter(c => 
      c.name.toLowerCase().includes(searchTerm)
    );
  }

  updateCategory(category: CategoryModel) {
    // API çağrısı yapıp sonra reload
    this.http.put(`api/categories/${category.id}`, category).subscribe({
      next: () => this.categoriesResource.reload(),
      error: (error) => console.error('Category update error:', error)
    });
  }

  // Hierarchy helpers
  getParentCategories(): CategoryModel[] {
    return this.categories().filter(c => !c.parentId);
  }

  getChildCategories(parentId: string): CategoryModel[] {
    return this.categories().filter(c => c.parentId === parentId);
  }

  getCategoryHierarchy(): CategoryModel[] {
    const categories = this.categories();
    const parentCategories = categories.filter(c => !c.parentId);
    
    return parentCategories.map(parent => ({
      ...parent,
      children: categories.filter(c => c.parentId === parent.id)
    }));
  }
}