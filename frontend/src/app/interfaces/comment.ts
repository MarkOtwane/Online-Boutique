export interface Comment {
   id: number;
   productId: number;
   userId: number;
   content: string;
   createdAt: string;
   updatedAt?: string;
   isAdminResponse?: boolean;
   isOfficialResponse?: boolean;
   user: {
     id: number;
     email: string;
     role: string;
   };
   replies?: Comment[];
   parentId?: number; // For nested replies
 }

export interface CreateCommentRequest {
  productId: number;
  content: string;
  parentId?: number;
}

export interface UpdateCommentRequest {
  content: string;
}
