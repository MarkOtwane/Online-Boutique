export interface Comment {
  id: number;
  productId: number;
  userId: number;
  content: string;
  parentId?: number;
  isAdminResponse: boolean;
  isOfficialResponse: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
  replies: Comment[];
}
