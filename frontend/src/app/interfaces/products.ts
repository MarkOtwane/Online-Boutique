import { Category } from './category';

export interface Product {
  id: number;
  name: string;
  price: number;
  createdAt: string;
  category?: Category;
  categoryId: number;
  imageUrl?: string; // Add imageUrl
}
