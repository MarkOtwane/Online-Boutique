import { CartItem } from './cart';

export interface Order {
  id: number;
  userId: number;
  total: number;
  paymentStatus: string;
  paymentMethod?: string;
  phoneNumber?: string;
  transactionId?: string;
  checkoutRequestId?: string;
  paymentAmount?: number;
  paymentDate?: string;
  createdAt: string;
  updatedAt?: string;
  orderItems: CartItem[];
  user?: { email: string }; // For admin view
}
