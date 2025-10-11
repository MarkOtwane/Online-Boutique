import { Category } from '../interfaces/category.ts';

export interface Product {
  id: number;
  name: string;
  price: number;
  createdAt: string;
  categoryId: number;
  category?: Category;
}
