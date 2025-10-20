import { Category } from './category';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  createdAt: string;
  category?: Category;
  categoryId: number;
  imageUrl?: string;
}
