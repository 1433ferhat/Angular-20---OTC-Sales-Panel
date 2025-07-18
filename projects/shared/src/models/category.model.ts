export interface CategoryModel {
  id: string;
  name: string;
  parentId?: string | null;
  parentCategory?: CategoryModel | null;
  subCategories?: CategoryModel[];
  products?: any[]; // İstersen ProductModel ile değiştir
  externalId?: number | null;
  url?: string | null;
  order?: number;
}



export const initialCategory: CategoryModel = {
  id: '',
  name: '',
  parentId: null,
  parentCategory: null,
  subCategories: [],
  products: [],
  externalId: null,
  url: null,
  order: 0,
};
