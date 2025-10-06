import { Category } from '../category.ts';

export interface Product {
  id: number;
  name: string;
  price: number;
  createdAt: string;
  categoryId: number;
  category?: Category;
}