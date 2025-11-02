import { Category } from './category';
import { Comment } from './comment';
import { Repost } from './repost';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  createdAt: string;
  commentCount: number;
  repostCount: number;
  reactionCount: number;
  category?: Category;
  categoryId: number;
  imageUrl?: string;
  comments?: Comment[];
  reposts?: Repost[];
}
