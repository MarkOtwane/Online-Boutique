import { CartItem } from './cart-item';

export interface Order {
  id: number;
  userId: number;
  total: number;
  createdAt: string;
  orderItems: CartItem[];
  user?: { email: string }; // For admin view
}
