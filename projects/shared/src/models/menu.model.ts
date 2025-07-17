export interface MenuModel {
  id: string;
  title: string;
  icon?: string;
  route?: string;
  children?: MenuModel[];
  isExpanded?: boolean;
}