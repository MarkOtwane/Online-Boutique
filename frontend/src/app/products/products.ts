import { Category } from '../interfaces/category';

export interface Product {
  id: number;
  name: string;
  price: number;
  createdAt: string;
  categoryId: number;
  category?: Category;
}
