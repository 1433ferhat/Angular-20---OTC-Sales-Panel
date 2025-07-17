export interface PaginateModel<T> {
  count: number;
  hasNext: boolean;
  hasPrevious: boolean;
  index: number;
  pages: number;
  size: number;
  items: T[];
}