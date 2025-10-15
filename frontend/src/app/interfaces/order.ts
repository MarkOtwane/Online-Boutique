import { CartItem } from './cart';

export interface Order {
  id: number;
  userId: number;
  total: number;
  createdAt: string;
  orderItems: CartItem[];
  user?: { email: string }; // For admin view
}
