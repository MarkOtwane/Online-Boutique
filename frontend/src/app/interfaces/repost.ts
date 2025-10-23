export interface Repost {
  id: number;
  productId: number;
  userId: number;
  content?: string;
  createdAt: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
  };
}